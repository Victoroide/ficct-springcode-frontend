/**
 * Simple Code Generator - Generador de código SpringBoot simplificado y funcional
 */

import type { GeneratedFile, CodeGenerationResult, SpringBootProjectConfig } from '../types/codeGeneration';

export class SimpleCodeGenerator {
  private config: SpringBootProjectConfig;
  private nodes: any[];
  private edges: any[];

  constructor(config: SpringBootProjectConfig, nodes: any[], edges: any[]) {
    this.config = config;
    this.nodes = nodes;
    this.edges = edges;
  }

  /**
   * Generar código completo del proyecto
   */
  async generateCode(): Promise<CodeGenerationResult> {
    try {
      
      const files: GeneratedFile[] = [];
      const cleanProjectName = this.config.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
      
      // 1. Generar archivos de configuración del proyecto
      files.push(this.generatePomXml());
      files.push(this.generateApplicationProperties());
      files.push(this.generateApplicationMain(cleanProjectName));
      files.push(this.generateOpenAPIConfig(cleanProjectName));
      files.push(this.generateHealthController(cleanProjectName));
      files.push(this.generateReadme());
      
      // 2. Generar archivos Java para cada clase UML
      const classNodes = this.nodes.filter(node => 
        node.data && (node.data.nodeType === 'class' || !node.data.nodeType)
      );
      
      // CRITICAL FIX: Find interface nodes (targets of REALIZATION relationships)
      const interfaceNodeIds = new Set<string>();
      this.edges.filter(e => e.type === 'umlRelationship' && e.data?.relationshipType === 'REALIZATION')
        .forEach(e => interfaceNodeIds.add(e.target));
      
      const interfaceNodes = this.nodes.filter(node => 
        interfaceNodeIds.has(node.id) || node.data?.nodeType === 'interface'
      );
      
      // Collect class data for Postman collection (including attributes)
      const classData: Array<{ name: string; attributes: any[] }> = [];
      
      // Generate interfaces first (so classes can implement them)
      interfaceNodes.forEach(node => {
        const interfaceName = this.formatClassName(node.data.label || 'Interface');
        files.push(this.generateInterface(interfaceName, node.data));
      });
      
      classNodes.forEach(node => {
        const className = this.formatClassName(node.data.label || 'Entity');
        const attributes = node.data.properties || node.data.attributes || [];
        classData.push({ name: className, attributes });
        
        // Generar archivos para cada clase (CRITICAL FIX: Pass node.id for relationship processing)
        files.push(this.generateEntity(className, node.data, node.id));
        files.push(this.generateDTO(className, node.data));
        files.push(this.generateRepository(className));
        files.push(this.generateService(className, node.data));
        files.push(this.generateController(className));
      });

      // 3. Generate Postman collection with real attributes
      files.push(this.generatePostmanCollection(cleanProjectName, classData));

      // 4. Organize all files by package structure (AFTER all files are generated)
      this.organizeFilesByPackage(files);

      return {
        success: true,
        files,
        projectStructure: {
          rootDir: 'src',
          sourceDir: 'src/main/java',
          testDir: 'src/test/java',
          resourcesDir: 'src/main/resources',
          directories: []
        }
      };

    } catch (error) {
      console.error('Error generando código:', error);
      return {
        success: false,
        files: [],
        errorMessage: error instanceof Error ? error.message : 'Error desconocido',
        projectStructure: { rootDir: '', sourceDir: '', testDir: '', resourcesDir: '', directories: [] }
      };
    }
  }

  /**
   * Generar pom.xml
   */
  private generatePomXml(): GeneratedFile {
    const cleanProjectName = this.config.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.18</version>
        <relativePath/>
    </parent>
    
    <groupId>${this.config.groupId}</groupId>
    <artifactId>${cleanProjectName}</artifactId>
    <version>${this.config.version}</version>
    <name>${this.config.name}</name>
    <description>${this.config.description}</description>
    
    <properties>
        <java.version>11</java.version>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <!-- SpringDoc OpenAPI (stable version for Spring Boot 2.7.x) -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-ui</artifactId>
            <version>1.6.15</version>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>

            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <repositories>
        <repository>
            <id>central</id>
            <url>https://repo.maven.apache.org/maven2</url>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </repository>
    </repositories>
    
    <pluginRepositories>
        <pluginRepository>
            <id>central</id>
            <url>https://repo.maven.apache.org/maven2</url>
        </pluginRepository>
    </pluginRepositories>
    
    <build>
        <plugins>
            <!-- Maven Compiler Plugin with Lombok annotation processing -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.10.1</version>
                <configuration>
                    <source>11</source>
                    <target>11</target>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                            <version>1.18.30</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
            
            <!-- Spring Boot Maven Plugin -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <mainClass>${this.config.groupId}.${cleanProjectName}.${this.formatClassName(cleanProjectName)}Application</mainClass>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`;

    return {
      path: 'pom.xml',
      content,
      language: 'xml'
    };
  }

  /**
   * Generar application.properties
   */
  private generateApplicationProperties(): GeneratedFile {
    const content = `# Spring Boot Configuration
spring.application.name=${this.config.name.toLowerCase().replace(/\s+/g, '-')}

# PostgreSQL Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/springboot_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true

# Server Configuration
server.port=8080

# SpringDoc OpenAPI Configuration
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.enabled=true
springdoc.swagger-ui.operationsSorter=method
springdoc.swagger-ui.tagsSorter=alpha

# Logging
logging.level.org.springframework.web=INFO
logging.level.org.hibernate=INFO`;

    return {
      path: 'application.properties',
      content,
      language: 'properties'
    };
  }

  /**
   * Generar clase Application principal
   */
  private generateApplicationMain(cleanProjectName: string): GeneratedFile {
    const className = this.formatClassName(cleanProjectName) + 'Application';
    const packageName = `${this.config.groupId}.${cleanProjectName}`;
    
    const content = `package ${packageName};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"${packageName}", "${packageName}.config"})
public class ${className} {
    public static void main(String[] args) {
        SpringApplication.run(${className}.class, args);
    }
}`;

    return {
      path: `${className}.java`,
      content,
      language: 'other'
    };
  }

  /**
   * Generate OpenAPI Configuration Class
   * 
   * Provides professional API documentation configuration for SpringDoc OpenAPI.
   * Ensures Swagger UI loads correctly with proper metadata and structure.
   */
  private generateOpenAPIConfig(cleanProjectName: string): GeneratedFile {
    const className = 'OpenAPIConfiguration';
    const packageName = `${this.config.groupId}.${cleanProjectName}.config`;
    
    const content = `package ${packageName};

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfiguration {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                    .title("${this.config.name} REST API")
                    .version("${this.config.version}")
                    .description("RESTful API generated from UML class diagram. This API provides CRUD operations for all entities defined in the UML model.")
                    .contact(new Contact()
                        .name("SpringCode Generator")
                        .email("support@springcode.example.com")
                        .url("https://springcode.example.com"))
                    .license(new License()
                        .name("MIT License")
                        .url("https://opensource.org/licenses/MIT")));
    }
}`;

    return {
      path: `${className}.java`,
      content,
      language: 'other'
    };
  }

  /**
   * Generate Health Check Controller
   * 
   * Provides a simple health endpoint for monitoring application status.
   * Accessible at /api/health for quick verification that the API is running.
   */
  private generateHealthController(cleanProjectName: string): GeneratedFile {
    const className = 'HealthController';
    const packageName = `${this.config.groupId}.${cleanProjectName}.controller`;
    
    const content = `package ${packageName};

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health Check", description = "Application health monitoring endpoints")
public class HealthController {
    
    @GetMapping
    @Operation(summary = "Check application health", description = "Returns the current status and timestamp of the application")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", LocalDateTime.now().toString());
        status.put("application", "${this.config.name}");
        status.put("version", "${this.config.version}");
        return ResponseEntity.ok(status);
    }
}`;

    return {
      path: `${className}.java`,
      content,
      language: 'other'
    };
  }

  /**
   * Generate JPA Entity Class
   * 
   * CRITICAL FIX: Filters out system-generated fields (id, createdAt, updatedAt) from user attributes
   * to prevent duplicate field declarations. These fields are automatically added to every entity.
   * 
   * CRITICAL FIX 2: Processes UML relationships (umlRelationship edges) to generate JPA annotations
   * based on multiplicity (* = many, 1 = one). Generates @ManyToOne on "many" side and @OneToMany on "one" side.
   * 
   * Generated structure:
   * - @Id field: Long id (auto-generated, ALWAYS present)
   * - User attributes: from UML diagram (FILTERED to exclude id, createdAt, updatedAt)
   * - Relationship fields: from UML edges with proper JPA annotations
   * - Timestamps: createdAt, updatedAt (auto-generated, ALWAYS present)
   * 
   * @param className The name of the Java class (e.g., "Pet", "Owner")
   * @param nodeData UML node data containing attributes array
   * @returns GeneratedFile object with Entity source code
   */
  private generateEntity(className: string, nodeData: any, currentNodeId: string): GeneratedFile {
    const cleanProjectName = this.config.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    const packageName = `${this.config.groupId}.${cleanProjectName}.entity`;
    
    // CRITICAL FIX: Filter out system-generated fields (id, createdAt, updatedAt)
    // These are added automatically and must not be duplicated
    const allAttributes = nodeData.properties || nodeData.attributes || [];
    const attributes = allAttributes.filter((attr: any) => {
      const name = attr.name?.toLowerCase();
      return name !== 'id' && name !== 'createdat' && name !== 'updatedat';
    });
    
    // Obtener todas las relaciones entre atributos
    const relationshipMap = this.findAttributeRelationships();
    
    // CRITICAL FIX: Obtener relaciones UML normales (umlRelationship edges)
    const umlRelationships = this.findUMLRelationships(currentNodeId, className);
    
    // Importaciones adicionales necesarias para las relaciones
    const additionalImports = new Set<string>();
    
    // Generar atributos con relaciones
    const attributeEntries = attributes.map((attr: any) => {
      // Verificar si este atributo tiene una relación
      const relationship = relationshipMap.get(attr.id);
      
      if (relationship) {
        // Encontramos una relación para este atributo
        const { direction, relationshipType, sourceNodeId, targetNodeId } = relationship;
        
        // Encontrar la clase relacionada
        const relatedNodeId = direction === 'source' ? targetNodeId : sourceNodeId;
        const relatedNode = this.nodes.find(n => n.id === relatedNodeId);
        
        if (!relatedNode) {
          // Si no se encuentra el nodo relacionado, usar un atributo normal
          return `    @Column(name = "${attr.name}")
    private ${this.mapType(attr.type)} ${this.validateJavaName(attr.name)};`;
        }
        
        // Obtener el nombre de la clase relacionada
        const relatedClassName = this.formatClassName(relatedNode.data.label || 'Entity');
        
        // Añadir las importaciones necesarias
        additionalImports.add(`import ${packageName.replace(/\.entity$/, '')}.entity.${relatedClassName};`);
        
        // Determinar qué tipo de relación JPA es según el tipo UML
        let relationType;
        let relationAnnotation;
        
        if (relationshipType === 'ASSOCIATION') {
          // Relación simple uno a uno
          relationType = '@OneToOne';
          relationAnnotation = `    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "${attr.name}")`;
          additionalImports.add('import javax.persistence.FetchType;');
          additionalImports.add('import javax.persistence.JoinColumn;');
        } else if (relationshipType === 'AGGREGATION') {
          // Relación uno a muchos
          relationType = '@OneToMany';
          relationAnnotation = `    @OneToMany(mappedBy = "${className.toLowerCase()}", cascade = CascadeType.ALL, orphanRemoval = true)`;
          additionalImports.add('import javax.persistence.CascadeType;');
          additionalImports.add('import java.util.List;');
          additionalImports.add('import java.util.ArrayList;');
          
          // Para colecciones, cambiamos el tipo
          return `${relationAnnotation}
    private List<${relatedClassName}> ${this.validateJavaName(attr.name)} = new ArrayList<>();`;
        } else if (relationshipType === 'COMPOSITION') {
          // Relación uno a muchos con composición fuerte
          relationType = '@OneToMany';
          relationAnnotation = `    @OneToMany(mappedBy = "${className.toLowerCase()}", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)`;
          additionalImports.add('import javax.persistence.CascadeType;');
          additionalImports.add('import javax.persistence.FetchType;');
          additionalImports.add('import java.util.List;');
          additionalImports.add('import java.util.ArrayList;');
          
          // Para colecciones, cambiamos el tipo
          return `${relationAnnotation}
    private List<${relatedClassName}> ${this.validateJavaName(attr.name)} = new ArrayList<>();`;
        } else if (relationshipType === 'DEPENDENCY') {
          // Relación muchos a uno
          relationType = '@ManyToOne';
          relationAnnotation = `    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "${attr.name}", referencedColumnName = "id")`;
          additionalImports.add('import javax.persistence.FetchType;');
          additionalImports.add('import javax.persistence.JoinColumn;');
        } else {
          // Relación por defecto, sin especificar
          return `    @Column(name = "${attr.name}")
    // Posible relación no implementada: ${relationshipType}
    private ${this.mapType(attr.type)} ${this.validateJavaName(attr.name)};`;
        }
        
        // Devolver atributo con anotaciones de relación
        return `${relationAnnotation}
    private ${relatedClassName} ${this.validateJavaName(attr.name)};`;
      } else {
        // Atributo normal sin relación
        return `    @Column(name = "${attr.name}")
    private ${this.mapType(attr.type)} ${this.validateJavaName(attr.name)};`;
      }
    });
    
    // Generar el contenido completo con las importaciones adicionales
    const importsSection = [
      'import javax.persistence.*;',
      'import lombok.Data;',
      'import lombok.NoArgsConstructor;',
      'import lombok.AllArgsConstructor;',
      'import java.time.LocalDateTime;',
      ...Array.from(additionalImports).sort()
    ].join('\n');
    
    // CRITICAL FIX: Agregar campos de relaciones UML
    const relationshipFields: string[] = [];
    
    for (const rel of umlRelationships) {
      const { targetClassName, fieldName, annotation, fieldType, imports } = rel;
      
      // Add imports
      imports.forEach(imp => additionalImports.add(imp));
      
      // Add field
      relationshipFields.push(`${annotation}
    private ${fieldType} ${fieldName};`);
    }
    
    // CRITICAL FIX: Check for INHERITANCE and REALIZATION relationships
    const superclass = this.findSuperclass(currentNodeId);
    const interfaces = this.findImplementedInterfaces(currentNodeId);
    const isAbstract = this.isInheritanceRoot(currentNodeId);
    
    // Add superclass import if present
    if (superclass) {
      additionalImports.add(`import ${packageName}.${superclass};`);
    }
    
    // Add interface imports
    interfaces.forEach(interfaceName => {
      additionalImports.add(`import ${packageName}.${interfaceName};`);
    });
    
    // Regenerate imports after adding relationship imports
    const finalImportsSection = [
      'import javax.persistence.*;',
      'import lombok.Data;',
      'import lombok.NoArgsConstructor;',
      'import lombok.AllArgsConstructor;',
      'import java.time.LocalDateTime;',
      ...Array.from(additionalImports).sort()
    ].join('\n');
    
    // Build class declaration
    const abstractModifier = isAbstract ? 'abstract ' : '';
    const extendsClause = superclass ? ` extends ${superclass}` : '';
    const implementsClause = interfaces.length > 0 ? ` implements ${interfaces.join(', ')}` : '';
    
    // Build inheritance annotation (only for root classes)
    const inheritanceAnnotation = isAbstract ? `@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype")
` : '';
    
    // Build discriminator annotation (for subclasses)
    const discriminatorAnnotation = superclass ? `@DiscriminatorValue("${className.toUpperCase()}")
` : '';
    
    const content = `package ${packageName};

${finalImportsSection}

@Entity
@Table(name = "${className.toLowerCase()}s")
${inheritanceAnnotation}${discriminatorAnnotation}@Data
@NoArgsConstructor
@AllArgsConstructor
public ${abstractModifier}class ${className}${extendsClause}${implementsClause} {
    ${superclass ? '// Inherits id from ' + superclass : `
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;`}
${attributeEntries.length > 0 ? '\n\n' + attributeEntries.join('\n\n') : ''}
${relationshipFields.length > 0 ? '\n\n' + relationshipFields.join('\n\n') : ''}
    ${superclass ? '// Inherits timestamps from ' + superclass : `
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();`}
}`;

    return {
      path: `${className}.java`,
      content,
      language: 'other'
    };
  }

  /**
   * Generate Java Interface
   * 
   * UML REALIZATION: Interfaces define contracts without implementation.
   * They are NOT JPA entities, just Java interfaces.
   * 
   * @param interfaceName The name of the interface (e.g., "Payable", "Auditable")
   * @param nodeData UML node data containing methods
   * @returns GeneratedFile object with Interface source code
   */
  private generateInterface(interfaceName: string, nodeData: any): GeneratedFile {
    const cleanProjectName = this.config.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    const packageName = `${this.config.groupId}.${cleanProjectName}.entity`;
    
    // Get methods from node data
    const methods = nodeData.methods || [];
    
    // Generate method signatures (no implementation)
    const methodSignatures = methods.map((method: any) => {
      const methodName = this.validateJavaName(method.name || 'method');
      const returnType = this.mapType(method.returnType || 'void');
      const params = method.parameters || [];
      const paramStr = params.map((p: any) => 
        `${this.mapType(p.type)} ${this.validateJavaName(p.name)}`
      ).join(', ');
      
      return `    ${returnType} ${methodName}(${paramStr});`;
    }).join('\n\n');
    
    const content = `package ${packageName};

/**
 * ${interfaceName} Interface
 * Generated from UML REALIZATION relationship
 */
public interface ${interfaceName} {
${methodSignatures || '    // No methods defined'}
}`;

    return {
      path: `${interfaceName}.java`,
      content,
      language: 'other'
    };
  }

  /**
   * Generate DTO (Data Transfer Object) Class
   * 
   * CRITICAL FIX: Filters out system-generated fields (id, createdAt, updatedAt) from user attributes.
   * The 'id' field is hard-coded in the template and must not be duplicated.
   * Timestamps are NOT included in DTOs (they're auto-managed by the backend).
   * 
   * Generated structure:
   * - id field: Long id (hard-coded, ALWAYS present)
   * - User attributes: from UML diagram (FILTERED to exclude id, createdAt, updatedAt)
   * - Validation annotations: @NotNull, @NotBlank based on field type
   * - OpenAPI docs: @Schema annotations for Swagger UI
   * 
   * @param className The name of the Java class (e.g., "Pet", "Owner")
   * @param nodeData UML node data containing attributes array
   * @returns GeneratedFile object with DTO source code
   */
  private generateDTO(className: string, nodeData: any): GeneratedFile {
    const cleanProjectName = this.config.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    const packageName = `${this.config.groupId}.${cleanProjectName}.dto`;
    
    // CRITICAL FIX: Filter out system-generated fields (id, createdAt, updatedAt)
    // The 'id' field is already hard-coded in the template
    const allAttributes = nodeData.properties || nodeData.attributes || [];
    const attributes = allAttributes.filter((attr: any) => {
      const name = attr.name?.toLowerCase();
      return name !== 'id' && name !== 'createdat' && name !== 'updatedat';
    });
    
    const content = `package ${packageName};

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.NotBlank;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "${className} Data Transfer Object")
public class ${className}DTO {
    
    @Schema(description = "ID of the ${className.toLowerCase()}", example = "1")
    private Long id;
${attributes.length > 0 ? '\n\n' + attributes.map((attr: any) => `    @NotNull(message = "${attr.name} cannot be null")
    @Schema(description = "${attr.name} of the ${className.toLowerCase()}", required = true)
    private ${this.mapType(attr.type)} ${this.validateJavaName(attr.name)};`).join('\n\n') : ''}
}`;

    return {
      path: `${className}DTO.java`,
      content,
      language: 'other'
    };
  }

  /**
   * Generar Repository
   */
  private generateRepository(className: string): GeneratedFile {
    const cleanProjectName = this.config.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    const packageName = `${this.config.groupId}.${cleanProjectName}.repository`;
    const entityPackage = `${this.config.groupId}.${cleanProjectName}.entity`;
    
    const content = `package ${packageName};

import ${entityPackage}.${className};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ${className}Repository extends JpaRepository<${className}, Long> {
    
    // JPA Query Methods - Spring Data JPA generará automáticamente
    List<${className}> findByCreatedAtNotNull();
    
    Optional<${className}> findFirstByOrderByIdDesc();
    
    Long countByIdNotNull();
}`;

    return {
      path: `${className}Repository.java`,
      content,
      language: 'other'
    };
  }

  /**
   * Generate Service Class with CRUD operations and Entity-DTO mapping
   * 
   * CRITICAL FIX: Filters out system-generated fields (id, createdAt, updatedAt) from attribute mappings.
   * These fields have hard-coded setter calls and must not be duplicated in the iteration loops.
   * 
   * Mapping structure:
   * - Entity to DTO: dto.setId() hard-coded + user attributes iteration
   * - DTO to Entity (update): user attributes iteration only (ID doesn't change)
   * - DTO to Entity (create): entity.setId() conditional + user attributes iteration
   * 
   * @param className The name of the Java class (e.g., "Pet", "Owner")
   * @param nodeData UML node data containing attributes array
   * @returns GeneratedFile object with Service source code
   */
  private generateService(className: string, nodeData: any): GeneratedFile {
    const cleanProjectName = this.config.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    const packageName = `${this.config.groupId}.${cleanProjectName}.service`;
    const entityPackage = `${this.config.groupId}.${cleanProjectName}.entity`;
    const dtoPackage = `${this.config.groupId}.${cleanProjectName}.dto`;
    const repoPackage = `${this.config.groupId}.${cleanProjectName}.repository`;
    
    // CRITICAL FIX: Filter out system-generated fields (id, createdAt, updatedAt)
    // These have hard-coded mappings and must not be duplicated
    const allAttributes = nodeData.properties || nodeData.attributes || [];
    const attributes = allAttributes.filter((attr: any) => {
      const name = attr.name?.toLowerCase();
      return name !== 'id' && name !== 'createdat' && name !== 'updatedat';
    });
    
    // Generate getter/setter mappings for DTO conversion
    const dtoMappings = attributes.map((attr: any) => {
        const validName = this.validateJavaName(attr.name);
        const capitalizedName = validName.charAt(0).toUpperCase() + validName.slice(1);
        return `        dto.set${capitalizedName}(entity.get${capitalizedName}());`;
    }).join('\n');
    
    const entityMappings = attributes.map((attr: any) => {
        const validName = this.validateJavaName(attr.name);
        const capitalizedName = validName.charAt(0).toUpperCase() + validName.slice(1);
        return `        if (dto.get${capitalizedName}() != null) {
            entity.set${capitalizedName}(dto.get${capitalizedName}());
        }`;
    }).join('\n');
    
    const entityFromDtoMappings = attributes.map((attr: any) => {
        const validName = this.validateJavaName(attr.name);
        const capitalizedName = validName.charAt(0).toUpperCase() + validName.slice(1);
        return `        entity.set${capitalizedName}(dto.get${capitalizedName}());`;
    }).join('\n');
    
    const content = `package ${packageName};

import ${entityPackage}.${className};
import ${dtoPackage}.${className}DTO;
import ${repoPackage}.${className}Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
public class ${className}Service {
    
    @Autowired
    private ${className}Repository ${className.toLowerCase()}Repository;
    
    public List<${className}DTO> findAll() {
        return ${className.toLowerCase()}Repository.findAll()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public Optional<${className}DTO> findById(Long id) {
        return ${className.toLowerCase()}Repository.findById(id)
            .map(this::convertToDTO);
    }
    
    public ${className}DTO save(${className}DTO ${className.toLowerCase()}DTO) {
        ${className} entity = convertToEntity(${className.toLowerCase()}DTO);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        
        ${className} savedEntity = ${className.toLowerCase()}Repository.save(entity);
        return convertToDTO(savedEntity);
    }
    
    public ${className}DTO update(Long id, ${className}DTO ${className.toLowerCase()}DTO) {
        Optional<${className}> existingEntity = ${className.toLowerCase()}Repository.findById(id);
        if (existingEntity.isPresent()) {
            ${className} entity = existingEntity.get();
            updateEntityFromDTO(entity, ${className.toLowerCase()}DTO);
            entity.setUpdatedAt(LocalDateTime.now());
            ${className} savedEntity = ${className.toLowerCase()}Repository.save(entity);
            return convertToDTO(savedEntity);
        }
        throw new RuntimeException("${className} not found with id: " + id);
    }
    
    public void deleteById(Long id) {
        ${className.toLowerCase()}Repository.deleteById(id);
    }
    
    // Métodos de conversión
    private ${className}DTO convertToDTO(${className} entity) {
        ${className}DTO dto = new ${className}DTO();
        dto.setId(entity.getId());
${dtoMappings.length > 0 ? dtoMappings : '        // No additional fields to map'}
        return dto;
    }
    
    private void updateEntityFromDTO(${className} entity, ${className}DTO dto) {
${entityMappings.length > 0 ? entityMappings : '        // No additional fields to update'}
    }
    
    private ${className} convertToEntity(${className}DTO dto) {
        ${className} entity = new ${className}();
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
${entityFromDtoMappings.length > 0 ? entityFromDtoMappings : '        // No additional fields to map'}
        return entity;
    }
}`;

    return {
      path: `${className}Service.java`,
      content,
      language: 'other'
    };
  }

  /**
   * Generar Controller
   */
  private generateController(className: string): GeneratedFile {
    const cleanProjectName = this.config.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    const packageName = `${this.config.groupId}.${cleanProjectName}.controller`;
    const dtoPackage = `${this.config.groupId}.${cleanProjectName}.dto`;
    const servicePackage = `${this.config.groupId}.${cleanProjectName}.service`;
    
    const content = `package ${packageName};

import ${dtoPackage}.${className}DTO;
import ${servicePackage}.${className}Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;
import java.util.Optional;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/api/v1/${className.toLowerCase()}s")
@Tag(name = "${className} Management", description = "${className} Management API")
@CrossOrigin(origins = "*")
public class ${className}Controller {
    
    @Autowired
    private ${className}Service ${className.toLowerCase()}Service;
    
    @GetMapping
    @Operation(summary = "Get all ${className.toLowerCase()}s", description = "Returns a list of all ${className.toLowerCase()}s")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved list",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ${className}DTO.class)))
    })
    public ResponseEntity<List<${className}DTO>> findAll() {
        List<${className}DTO> ${className.toLowerCase()}s = ${className.toLowerCase()}Service.findAll();
        return ResponseEntity.ok(${className.toLowerCase()}s);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get ${className.toLowerCase()} by ID", description = "Returns a ${className.toLowerCase()} by id")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved entity",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ${className}DTO.class))),
        @ApiResponse(responseCode = "404", description = "Entity not found")
    })
    public ResponseEntity<${className}DTO> findById(@PathVariable Long id) {
        Optional<${className}DTO> ${className.toLowerCase()} = ${className.toLowerCase()}Service.findById(id);
        return ${className.toLowerCase()}.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @Operation(summary = "Create a new ${className.toLowerCase()}", description = "Creates a new ${className.toLowerCase()} entity")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Entity created successfully",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ${className}DTO.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<${className}DTO> create(@Valid @RequestBody ${className}DTO ${className.toLowerCase()}DTO) {
        ${className}DTO created${className} = ${className.toLowerCase()}Service.save(${className.toLowerCase()}DTO);
        return ResponseEntity.ok(created${className});
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update ${className.toLowerCase()} by ID", description = "Updates an existing ${className.toLowerCase()} entity")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Entity updated successfully",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ${className}DTO.class))),
        @ApiResponse(responseCode = "404", description = "Entity not found"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<${className}DTO> update(@PathVariable Long id, 
                                                @Valid @RequestBody ${className}DTO ${className.toLowerCase()}DTO) {
        try {
            ${className}DTO updated${className} = ${className.toLowerCase()}Service.update(id, ${className.toLowerCase()}DTO);
            return ResponseEntity.ok(updated${className});
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete ${className.toLowerCase()} by ID", description = "Deletes an existing ${className.toLowerCase()} entity")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Entity deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Entity not found")
    })
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ${className.toLowerCase()}Service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}`;

    return {
      path: `${className}Controller.java`,
      content,
      language: 'other'
    };
  }

  /**
   * Generate comprehensive README with API testing instructions
   */
  private generateReadme(): GeneratedFile {
    const content = `# ${this.config.name}

${this.config.description}

## Technology Stack

- **Spring Boot 2.7.18** - Application framework
- **Java 11** - Programming language
- **Spring Data JPA** - Database ORM
- **PostgreSQL** - Relational database
- **Lombok** - Boilerplate reduction
- **SpringDoc OpenAPI 1.6.15** - API documentation
- **Maven** - Dependency management

## Project Structure

\`\`\`
src/
├── main/
│   ├── java/
│   │   └── ${this.config.groupId.replace(/\./g, '/')}/
│   │       ├── entity/      # JPA Entities
│   │       ├── dto/         # Data Transfer Objects
│   │       ├── repository/  # JPA Repositories
│   │       ├── service/     # Business Logic
│   │       ├── controller/  # REST Controllers
│   │       └── config/      # Configuration Classes
│   └── resources/
│       └── application.properties
└── test/
\`\`\`

## 🚀 Setup and Execution - STEP BY STEP GUIDE

### Prerequisites

Before starting, ensure you have:
- ✅ **Java 11 or higher** - [Download here](https://adoptium.net/)
- ✅ **Maven 3.6+** - [Download here](https://maven.apache.org/download.cgi)
- ✅ **PostgreSQL 12+** - [Download here](https://www.postgresql.org/download/)

Verify installations:
\`\`\`bash
java -version      # Should show Java 11+
mvn -version       # Should show Maven 3.6+
psql --version     # Should show PostgreSQL 12+
\`\`\`

---

## 📦 STEP 1: Download and Extract Project

1. **Download** the generated \`${this.config.name}.zip\` file
2. **Extract** the ZIP to your desired location
3. **Navigate** to the project folder:
   \`\`\`bash
   cd ${this.config.name.toLowerCase().replace(/\s+/g, '-')}
   \`\`\`

---

## 🗄️ STEP 2: PostgreSQL Database Setup

**⚠️ CRITICAL:** You MUST create the database and configure credentials BEFORE running the backend, otherwise you'll get connection errors.

### Option A: Using pgAdmin (Recommended for Windows Users)

1. **Open pgAdmin** (installed with PostgreSQL)
2. **Connect to PostgreSQL Server**:
   - Right-click on "PostgreSQL 12" (or your version)
   - Enter your PostgreSQL master password (set during installation)
3. **Create Database**:
   - Right-click on "Databases"
   - Select "Create" → "Database..."
   - Database name: \`springboot_db\`
   - Owner: \`postgres\`
   - Click "Save"
4. **Verify**: You should see \`springboot_db\` in the database list

### Option B: Using Command Line (psql)

**Windows:**
\`\`\`bash
# Open Command Prompt or PowerShell
# Navigate to PostgreSQL bin directory (example):
cd "C:\\Program Files\\PostgreSQL\\14\\bin"

# Connect to PostgreSQL
psql -U postgres

# Enter your PostgreSQL password when prompted
# Then create the database:
CREATE DATABASE springboot_db;

# Verify creation:
\\l

# Exit:
\\q
\`\`\`

**Linux/Mac:**
\`\`\`bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE springboot_db;

# Verify
\\l

# Exit
\\q
\`\`\`

### Option C: Using Docker (For Advanced Users)

\`\`\`bash
# Run PostgreSQL in Docker with database pre-created
docker run --name postgres-springboot \\
  -e POSTGRES_PASSWORD=postgres \\
  -e POSTGRES_DB=springboot_db \\
  -p 5432:5432 \\
  -d postgres:14

# Verify container is running
docker ps

# To stop: docker stop postgres-springboot
# To start: docker start postgres-springboot
\`\`\`

---

## ⚙️ STEP 3: Configure Database Credentials

**⚠️ IMPORTANT:** The default configuration assumes:
- Username: \`postgres\`
- Password: \`postgres\`
- Database: \`springboot_db\`
- Host: \`localhost\`
- Port: \`5432\`

**If your PostgreSQL has DIFFERENT credentials:**

1. Open \`src/main/resources/application.properties\`
2. Update these lines with YOUR actual credentials:
   \`\`\`properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/springboot_db
   spring.datasource.username=postgres          # ← Change if different
   spring.datasource.password=postgres          # ← Change if different
   \`\`\`

**Common mistakes:**
- ❌ Using wrong password (most common error!)
- ❌ Database name doesn't match (case-sensitive on Linux)
- ❌ PostgreSQL not running on port 5432
- ❌ Firewall blocking port 5432

---

## 🏗️ STEP 4: Build the Project

\`\`\`bash
mvn clean install
\`\`\`

**Expected output:**
\`\`\`
[INFO] BUILD SUCCESS
[INFO] Total time: XX.XXX s
\`\`\`

**If build fails:**
- Check Java version: \`java -version\`
- Check Maven version: \`mvn -version\`
- Delete \`target/\` folder and try again

---

## ▶️ STEP 5: Run the Application

\`\`\`bash
mvn spring-boot:run
\`\`\`

**Expected output:**
\`\`\`
  .   ____          _            __ _ _
 /\\\\ / ___'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\
( ( )\\___ | '_ | '_| | '_ \\/ _\` | \\ \\ \\ \\
 \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v2.7.18)

...
Started Application in X.XXX seconds
\`\`\`

**✅ Success indicators:**
- No red ERROR messages
- Message: "Started Application in X seconds"
- Port 8080 is active
- Database tables automatically created

**❌ Common errors and solutions:**

1. **"Connection refused" or "password authentication failed"**
   - ✔️ Check PostgreSQL is running
   - ✔️ Verify username/password in \`application.properties\`
   - ✔️ Ensure database \`springboot_db\` exists

2. **"Port 8080 already in use"**
   - ✔️ Kill process using port 8080
   - ✔️ Or change port in \`application.properties\`: \`server.port=8081\`

3. **"Could not find or load main class"**
   - ✔️ Run \`mvn clean install\` again
   - ✔️ Check Java version matches project requirements

---

## ✅ STEP 6: Verify Backend is Working

### Check 1: Health Endpoint
\`\`\`bash
curl http://localhost:8080/api/health
\`\`\`
**Expected response:**
\`\`\`json
{
  "status": "UP",
  "timestamp": "2025-11-10T...",
  "application": "${this.config.name}",
  "version": "${this.config.version}"
}
\`\`\`

### Check 2: Swagger UI
Open browser: **http://localhost:8080/swagger-ui/index.html**

You should see:
- ✅ Interactive API documentation
- ✅ List of all endpoints
- ✅ Ability to test endpoints

### Check 3: Database Tables
Connect to PostgreSQL and verify tables were created:

**Using pgAdmin:**
1. Expand: Databases → springboot_db → Schemas → public → Tables
2. You should see all your entity tables

**Using psql:**
\`\`\`bash
psql -U postgres -d springboot_db
\\dt
\`\`\`

---

## 🎯 Quick Start Summary

\`\`\`bash
# 1. Create database (one-time setup)
psql -U postgres -c "CREATE DATABASE springboot_db;"

# 2. Verify application.properties has correct credentials

# 3. Build and run
mvn clean install
mvn spring-boot:run

# 4. Test
curl http://localhost:8080/api/health
\`\`\`

---

## Testing the API

### Using Swagger UI (Recommended)

1. Start the application: \`mvn spring-boot:run\`
2. Open your browser: **http://localhost:8080/swagger-ui/index.html**
3. Explore all available endpoints with interactive documentation
4. Execute test requests directly from the browser
5. View request/response schemas and examples

**Swagger UI Features:**
- Interactive API documentation
- Try out endpoints with real requests
- View response codes and schemas
- See example request bodies
- Test authentication (if configured)

### Using Postman

1. Import the collection: **File → Import → Select \`${this.config.name.toLowerCase().replace(/\s+/g, '')}.postman_collection.json\`**
2. Set the environment variable:
   - Variable: \`baseUrl\`
   - Value: \`http://localhost:8080\`
3. Execute requests from the collection organized by entity

**Postman Collection includes:**
- All CRUD operations for each entity
- Health check endpoint
- Pre-configured request headers
- Example request bodies
- Environment variable support

### Using curl

#### Health Check
\`\`\`bash
curl -X GET http://localhost:8080/api/health
\`\`\`

#### Get all entities (example)
\`\`\`bash
curl -X GET http://localhost:8080/api/v1/{entity}s -H "Content-Type: application/json"
\`\`\`

#### Create entity (example)
\`\`\`bash
curl -X POST http://localhost:8080/api/v1/{entity}s \\
  -H "Content-Type: application/json" \\
  -d '{"field": "value"}'
\`\`\`

## API Endpoints

### Health Check
- \`GET /api/health\` - Application health status

### Entity Endpoints
All entities follow standard REST patterns:

- \`GET /api/v1/{entity}s\` - List all
- \`GET /api/v1/{entity}s/{id}\` - Get by ID
- \`POST /api/v1/{entity}s\` - Create new
- \`PUT /api/v1/{entity}s/{id}\` - Update existing
- \`DELETE /api/v1/{entity}s/{id}\` - Delete by ID

## Database Access

### PostgreSQL Connection
You can connect to the database using any PostgreSQL client:

**Connection Details:**
- **Host**: localhost
- **Port**: 5432
- **Database**: springboot_db
- **Username**: postgres
- **Password**: postgres

**Using psql:**
\`\`\`bash
psql -U postgres -d springboot_db
\`\`\`

**Common SQL Commands:**
\`\`\`sql
-- List all tables
\\dt

-- Describe a table structure
\\d table_name

-- Query data
SELECT * FROM users;

-- Check table count
SELECT COUNT(*) FROM users;
\`\`\`

**GUI Tools (recommended):**
- **pgAdmin**: https://www.pgadmin.org/
- **DBeaver**: https://dbeaver.io/
- **DataGrip**: https://www.jetbrains.com/datagrip/

## OpenAPI Specification

- **JSON Format**: http://localhost:8080/api-docs
- **Swagger UI**: http://localhost:8080/swagger-ui/index.html

## Generated by

This project was automatically generated using the **UML SpringCode Generator**.  
Generation date: ${new Date().toLocaleString()}

---

## Quick Start Guide

1. **Compile**: \`mvn clean install\`
2. **Run**: \`mvn spring-boot:run\`
3. **Test**: Open http://localhost:8080/swagger-ui/index.html
4. **Import Postman**: Load the included \`.postman_collection.json\` file
5. **Explore**: Try the health check at http://localhost:8080/api/health

✅ **Ready to use!** All endpoints are functional and documented.`;

    return {
      path: 'README.md',
      content,
      language: 'md'
    };
  }

  /**
   * Generate Postman Collection v2.1 with REAL entity attributes
   * 
   * Creates a complete Postman collection with all API endpoints for easy testing.
   * NOW includes real request bodies based on UML diagram attributes.
   */
  private generatePostmanCollection(
    cleanProjectName: string, 
    classData: Array<{ name: string; attributes: any[] }>
  ): GeneratedFile {
    const collectionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Build request items for each entity with REAL attributes
    const entityFolders = classData.map(({ name: className, attributes }) => {
      const entityName = className.toLowerCase();
      const pluralName = `${entityName}s`;
      
      // Filter system fields (id, createdAt, updatedAt)
      const userAttributes = attributes.filter((attr: any) => {
        const name = attr.name?.toLowerCase();
        return name !== 'id' && name !== 'createdat' && name !== 'updatedat';
      });
      
      // Generate example body for POST (without id)
      const createBody: any = {};
      userAttributes.forEach((attr: any) => {
        const attrName = this.validateJavaName(attr.name || 'field');
        createBody[attrName] = this.getExampleValue(attr.type || 'String');
      });
      
      // Generate example body for PUT (with id)
      const updateBody: any = { id: 1 };
      userAttributes.forEach((attr: any) => {
        const attrName = this.validateJavaName(attr.name || 'field');
        updateBody[attrName] = this.getExampleValue(attr.type || 'String');
      });
      
      return {
        name: `${className} Management`,
        item: [
          {
            name: `Get All ${pluralName}`,
            request: {
              method: 'GET',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json'
                }
              ],
              url: {
                raw: `{{baseUrl}}/api/v1/${pluralName}`,
                host: ['{{baseUrl}}'],
                path: ['api', 'v1', pluralName]
              },
              description: `Retrieves all ${pluralName} from the database`
            }
          },
          {
            name: `Get ${className} by ID`,
            request: {
              method: 'GET',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json'
                }
              ],
              url: {
                raw: `{{baseUrl}}/api/v1/${pluralName}/1`,
                host: ['{{baseUrl}}'],
                path: ['api', 'v1', pluralName, '1']
              },
              description: `Retrieves a specific ${entityName} by ID`
            }
          },
          {
            name: `Create ${className}`,
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify(createBody, null, 2)
              },
              url: {
                raw: `{{baseUrl}}/api/v1/${pluralName}`,
                host: ['{{baseUrl}}'],
                path: ['api', 'v1', pluralName]
              },
              description: `Creates a new ${entityName} entity`
            }
          },
          {
            name: `Update ${className}`,
            request: {
              method: 'PUT',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify(updateBody, null, 2)
              },
              url: {
                raw: `{{baseUrl}}/api/v1/${pluralName}/1`,
                host: ['{{baseUrl}}'],
                path: ['api', 'v1', pluralName, '1']
              },
              description: `Updates an existing ${entityName} entity`
            }
          },
          {
            name: `Delete ${className}`,
            request: {
              method: 'DELETE',
              header: [],
              url: {
                raw: `{{baseUrl}}/api/v1/${pluralName}/1`,
                host: ['{{baseUrl}}'],
                path: ['api', 'v1', pluralName, '1']
              },
              description: `Deletes a ${entityName} entity by ID`
            }
          }
        ]
      };
    });

    // Add Health Check folder
    const healthFolder = {
      name: 'Health Check',
      item: [
        {
          name: 'Check API Health',
          request: {
            method: 'GET',
            header: [],
            url: {
              raw: `{{baseUrl}}/api/health`,
              host: ['{{baseUrl}}'],
              path: ['api', 'health']
            },
            description: 'Checks if the API is running and returns status information'
          }
        }
      ]
    };

    const collection = {
      info: {
        _postman_id: collectionId,
        name: `${this.config.name} API`,
        description: `${this.config.description}\n\nGenerated REST API from UML class diagram.\n\n**Base URL:** http://localhost:8080\n**Swagger UI:** http://localhost:8080/swagger-ui/index.html`,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [healthFolder, ...entityFolders],
      variable: [
        {
          key: 'baseUrl',
          value: 'http://localhost:8080',
          type: 'string'
        }
      ]
    };

    const content = JSON.stringify(collection, null, 2);
    
    return {
      path: `${cleanProjectName}.postman_collection.json`,
      content,
      language: 'other'
    };
  }


  private formatClassName(name: string): string {
    let formattedName = name.charAt(0).toUpperCase() + name.slice(1)
      .replace(/[^a-zA-Z0-9]/g, '');
    
    // Spring Framework reserved annotation names that cause ambiguity
    const springConflictingNames = [
      'Service',
      'Component', 
      'Repository',
      'Controller',
      'Configuration',
      'Bean',
      'Autowired',
      'Qualifier',
      'Value',
      'Scope'
    ];
    
    // If class name conflicts with Spring annotations, append "Entity" suffix
    if (springConflictingNames.includes(formattedName)) {
      formattedName = `${formattedName}Entity`;
      console.warn(`⚠️ Class name "${name}" conflicts with Spring annotation. Renamed to "${formattedName}"`);
    }
    
    return formattedName;
  }

  /**
   * Validar y sanear nombre de variable Java
   */
  private validateJavaName(name: string): string {
    if (!name) return 'attribute';
    
    // Si el nombre comienza con un número, añadir prefijo
    if (/^[0-9]/.test(name)) {
      name = 'attr_' + name;
    }
    
    // Reemplazar caracteres inválidos
    name = name.replace(/[^a-zA-Z0-9_]/g, '_');
    
    // Comprobar palabras reservadas de Java
    const javaReservedWords = [
      'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
      'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'false', 'final', 'finally',
      'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long',
      'native', 'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'short', 'static',
      'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true',
      'try', 'void', 'volatile', 'while'
    ];
    
    if (javaReservedWords.includes(name.toLowerCase())) {
      name = name + '_var';
    }
    
    return name;
  }

  /**
   * Mapear tipo de dato UML a tipo Java
   */
  private mapType(type: string): string {
    if (!type) return 'String';
    
    const lowercaseType = type.toLowerCase();
    
    const typeMap: Record<string, string> = {
      'string': 'String',
      'integer': 'Integer',
      'int': 'Integer',
      'long': 'Long',
      'float': 'Float',
      'double': 'Double',
      'boolean': 'Boolean',
      'date': 'java.util.Date',
      'datetime': 'java.time.LocalDateTime',
      'localdate': 'java.time.LocalDate',
      'localdatetime': 'java.time.LocalDateTime',
      'bigdecimal': 'java.math.BigDecimal',
    };
    
    return typeMap[lowercaseType] || type;
  }

  /**
   * Generate example values for Postman collection based on Java types
   * 
   * Provides realistic example data for API testing in Postman.
   */
  private getExampleValue(type: string): any {
    if (!type) return 'Example String';
    
    const lowercaseType = type.toLowerCase();
    
    // Map types to example values
    const exampleMap: Record<string, any> = {
      'string': 'Example String',
      'integer': 1,
      'int': 1,
      'long': 100,
      'float': 10.5,
      'double': 99.99,
      'boolean': true,
      'date': '2025-01-01',
      'datetime': '2025-01-01T12:00:00',
      'localdate': '2025-01-01',
      'localdatetime': '2025-01-01T12:00:00',
      'bigdecimal': 99.99,
    };
    
    return exampleMap[lowercaseType] || 'Example Value';
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * UML 2.5 INHERITANCE AND REALIZATION HELPERS
   * ═══════════════════════════════════════════════════════════════════
   */

  /**
   * Find superclass for a given node (if it has INHERITANCE relationship)
   * Returns superclass name or null
   */
  private findSuperclass(nodeId: string): string | null {
    const inheritanceEdge = this.edges.find(edge => 
      edge.type === 'umlRelationship' &&
      edge.data?.relationshipType === 'INHERITANCE' &&
      edge.source === nodeId
    );
    
    if (!inheritanceEdge) return null;
    
    const superNode = this.nodes.find(n => n.id === inheritanceEdge.target);
    return superNode ? this.formatClassName(superNode.data.label || 'SuperClass') : null;
  }

  /**
   * Find all interfaces that a class implements (REALIZATION relationships)
   * Returns array of interface names
   */
  private findImplementedInterfaces(nodeId: string): string[] {
    const realizationEdges = this.edges.filter(edge => 
      edge.type === 'umlRelationship' &&
      edge.data?.relationshipType === 'REALIZATION' &&
      edge.source === nodeId
    );
    
    return realizationEdges.map(edge => {
      const interfaceNode = this.nodes.find(n => n.id === edge.target);
      return interfaceNode ? this.formatClassName(interfaceNode.data.label || 'Interface') : null;
    }).filter(name => name !== null) as string[];
  }

  /**
   * Check if a node is a superclass (target of INHERITANCE)
   * If so, it should be abstract and have @Inheritance annotation
   */
  private isInheritanceRoot(nodeId: string): boolean {
    return this.edges.some(edge => 
      edge.type === 'umlRelationship' &&
      edge.data?.relationshipType === 'INHERITANCE' &&
      edge.target === nodeId
    );
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * UML 2.5 MULTIPLICITY HELPER METHODS
   * ═══════════════════════════════════════════════════════════════════
   */

  /**
   * Parse multiplicity string to determine if it represents "many"
   * Supports: *, 0..*, 1..*, n..m (where m > 1)
   */
  private isMany(multiplicity: string | undefined): boolean {
    if (!multiplicity) return false;
    
    const mult = multiplicity.trim();
    
    // Direct many indicators
    if (mult === '*' || mult === '0..*' || mult === '1..*') return true;
    
    // Range notation (e.g., 2..5, 1..n)
    if (mult.includes('..')) {
      const parts = mult.split('..');
      const upper = parts[1];
      
      // Unbounded upper (n, *, etc.)
      if (upper === '*' || upper === 'n') return true;
      
      // Numeric upper > 1
      const upperNum = parseInt(upper);
      if (!isNaN(upperNum) && upperNum > 1) return true;
    }
    
    return false;
  }

  /**
   * Determine if multiplicity requires non-null (mandatory relationship)
   * 1, 1..*, 1..n → required (nullable = false)
   * 0..1, 0..*, * → optional (nullable = true)
   */
  private isRequired(multiplicity: string | undefined): boolean {
    if (!multiplicity) return false;
    
    const mult = multiplicity.trim();
    
    // Starts with 1 (except just '1' which we check separately)
    if (mult === '1') return true;
    if (mult.startsWith('1..')) return true;
    
    return false;
  }

  /**
   * Determine cardinality between two entities based on multiplicities
   * Returns: 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany'
   */
  private determineCardinality(sourceMult: string | undefined, targetMult: string | undefined): string {
    const sourceIsMany = this.isMany(sourceMult);
    const targetIsMany = this.isMany(targetMult);
    
    if (sourceIsMany && targetIsMany) {
      return 'ManyToMany';
    } else if (sourceIsMany && !targetIsMany) {
      return 'ManyToOne';
    } else if (!sourceIsMany && targetIsMany) {
      return 'OneToMany';
    } else {
      return 'OneToOne';
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * UML 2.5 RELATIONSHIP PROCESSING - ALL 7 TYPES
   * ═══════════════════════════════════════════════════════════════════
   * 
   * CRITICAL FIX: Comprehensive implementation of all UML 2.5 relationship types:
   * 1. ASSOCIATION - Basic bidirectional reference with multiplicity
   * 2. AGGREGATION - Weak containment (no cascade delete)
   * 3. COMPOSITION - Strong containment (cascade ALL + orphanRemoval)
   * 4. INHERITANCE - Class extends superclass (handled separately)
   * 5. REALIZATION - Class implements interface (handled separately)
   * 6. DEPENDENCY - Constructor injection, no JPA annotation
   * 7. Multiplicity - Determines OneToOne/OneToMany/ManyToOne/ManyToMany
   * 
   * @param currentNodeId ID del nodo actual (entidad)
   * @param currentClassName Nombre de la clase actual
   * @returns Array de objetos con información de campo de relación
   */
  private findUMLRelationships(currentNodeId: string, currentClassName: string): Array<{
    targetClassName: string;
    fieldName: string;
    annotation: string;
    fieldType: string;
    imports: string[];
  }> {
    const relationships: Array<{
      targetClassName: string;
      fieldName: string;
      annotation: string;
      fieldType: string;
      imports: string[];
    }> = [];
    
    const cleanProjectName = this.config.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    const packageName = `${this.config.groupId}.${cleanProjectName}.entity`;
    
    // Filter UML relationship edges for current node
    const umlEdges = this.edges.filter(edge => 
      edge.type === 'umlRelationship' && 
      edge.data &&
      (edge.source === currentNodeId || edge.target === currentNodeId)
    );
    
    for (const edge of umlEdges) {
      const { relationshipType, sourceMultiplicity, targetMultiplicity } = edge.data;
      
      // Skip INHERITANCE and REALIZATION (handled separately)
      if (relationshipType === 'INHERITANCE' || relationshipType === 'REALIZATION') {
        continue;
      }
      
      // Determine if current node is source or target
      const isSource = edge.source === currentNodeId;
      const relatedNodeId = isSource ? edge.target : edge.source;
      const relatedNode = this.nodes.find(n => n.id === relatedNodeId);
      
      if (!relatedNode) {
        console.warn(`[CodeGenerator] Related node not found: ${relatedNodeId}`);
        continue;
      }
      
      const relatedClassName = this.formatClassName(relatedNode.data.label || 'Entity');
      const fieldNameBase = relatedClassName.charAt(0).toLowerCase() + relatedClassName.slice(1);
      
      let annotation = '';
      let fieldType = '';
      let fieldName = '';
      const imports: string[] = [];
      
      // Get multiplicities from current perspective
      const currentMultiplicity = isSource ? sourceMultiplicity : targetMultiplicity;
      const relatedMultiplicity = isSource ? targetMultiplicity : sourceMultiplicity;
      
      // Determine cardinality using helper method
      const cardinality = this.determineCardinality(currentMultiplicity, relatedMultiplicity);
      
      // Determine nullable based on multiplicity
      const nullable = !this.isRequired(currentMultiplicity);
      const nullableStr = nullable ? ', nullable = true' : '';
      
      // ═══════════════════════════════════════════════════════════════
      // HANDLE EACH RELATIONSHIP TYPE
      // ═══════════════════════════════════════════════════════════════
      
      if (relationshipType === 'DEPENDENCY') {
        // ────────────────────────────────────────────────────────────
        // DEPENDENCY: Constructor injection, NO JPA annotation
        // ────────────────────────────────────────────────────────────
        // Dependencies are NOT persisted relationships
        // Generate private final field for dependency injection
        annotation = `    // Dependency injection (not persisted)
    private final ${relatedClassName} ${fieldNameBase};`;
        fieldType = relatedClassName;
        fieldName = fieldNameBase;
        imports.push(`import ${packageName}.${relatedClassName};`);
        
      } else if (relationshipType === 'ASSOCIATION') {
        // ────────────────────────────────────────────────────────────
        // ASSOCIATION: Standard bidirectional reference
        // ────────────────────────────────────────────────────────────
        if (cardinality === 'ManyToOne') {
          annotation = `    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "${fieldNameBase}_id"${nullableStr})`;
          fieldType = relatedClassName;
          fieldName = fieldNameBase;
          imports.push('import javax.persistence.ManyToOne;', 'import javax.persistence.FetchType;', 'import javax.persistence.JoinColumn;');
        } else if (cardinality === 'OneToMany') {
          annotation = `    @OneToMany(mappedBy = "${currentClassName.toLowerCase()}")`;
          fieldType = `List<${relatedClassName}>`;
          fieldName = fieldNameBase + 's';
          imports.push('import javax.persistence.OneToMany;', 'import java.util.List;', 'import java.util.ArrayList;');
        } else if (cardinality === 'ManyToMany') {
          if (isSource) {
            annotation = `    @ManyToMany
    @JoinTable(name = "${currentClassName.toLowerCase()}_${relatedClassName.toLowerCase()}",
        joinColumns = @JoinColumn(name = "${currentClassName.toLowerCase()}_id"),
        inverseJoinColumns = @JoinColumn(name = "${relatedClassName.toLowerCase()}_id"))`;
            imports.push('import javax.persistence.ManyToMany;', 'import javax.persistence.JoinTable;', 'import javax.persistence.JoinColumn;');
          } else {
            annotation = `    @ManyToMany(mappedBy = "${fieldNameBase}s")`;
            imports.push('import javax.persistence.ManyToMany;');
          }
          fieldType = `Set<${relatedClassName}>`;
          fieldName = fieldNameBase + 's';
          imports.push('import java.util.Set;', 'import java.util.HashSet;');
        } else { // OneToOne
          if (isSource) {
            annotation = `    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "${fieldNameBase}_id"${nullableStr})`;
            imports.push('import javax.persistence.JoinColumn;');
          } else {
            annotation = `    @OneToOne(mappedBy = "${currentClassName.toLowerCase()}")`;
          }
          fieldType = relatedClassName;
          fieldName = fieldNameBase;
          imports.push('import javax.persistence.OneToOne;', 'import javax.persistence.FetchType;');
        }
        imports.push(`import ${packageName}.${relatedClassName};`);
        
      } else if (relationshipType === 'AGGREGATION') {
        // ────────────────────────────────────────────────────────────
        // AGGREGATION: Weak containment, NO cascade delete
        // ────────────────────────────────────────────────────────────
        if (cardinality === 'ManyToOne') {
          annotation = `    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "${fieldNameBase}_id"${nullableStr})`;
          fieldType = relatedClassName;
          fieldName = fieldNameBase;
          imports.push('import javax.persistence.ManyToOne;', 'import javax.persistence.FetchType;', 'import javax.persistence.JoinColumn;');
        } else if (cardinality === 'OneToMany') {
          // NO CASCADE for aggregation (weak ownership)
          annotation = `    @OneToMany(mappedBy = "${currentClassName.toLowerCase()}")`;
          fieldType = `List<${relatedClassName}>`;
          fieldName = fieldNameBase + 's';
          imports.push('import javax.persistence.OneToMany;', 'import java.util.List;', 'import java.util.ArrayList;');
        } else { // OneToOne or ManyToMany
          annotation = `    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "${fieldNameBase}_id"${nullableStr})`;
          fieldType = relatedClassName;
          fieldName = fieldNameBase;
          imports.push('import javax.persistence.OneToOne;', 'import javax.persistence.FetchType;', 'import javax.persistence.JoinColumn;');
        }
        imports.push(`import ${packageName}.${relatedClassName};`);
        
      } else if (relationshipType === 'COMPOSITION') {
        // ────────────────────────────────────────────────────────────
        // COMPOSITION: Strong containment, CASCADE ALL + orphanRemoval
        // ────────────────────────────────────────────────────────────
        if (cardinality === 'ManyToOne') {
          // Part side of composition (required, cannot be null)
          annotation = `    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "${fieldNameBase}_id", nullable = false)`;
          fieldType = relatedClassName;
          fieldName = fieldNameBase;
          imports.push('import javax.persistence.ManyToOne;', 'import javax.persistence.FetchType;', 'import javax.persistence.JoinColumn;');
        } else if (cardinality === 'OneToMany') {
          // Owner side of composition (cascade ALL + orphanRemoval)
          annotation = `    @OneToMany(mappedBy = "${currentClassName.toLowerCase()}", cascade = CascadeType.ALL, orphanRemoval = true)`;
          fieldType = `List<${relatedClassName}>`;
          fieldName = fieldNameBase + 's';
          imports.push('import javax.persistence.OneToMany;', 'import javax.persistence.CascadeType;', 'import java.util.List;', 'import java.util.ArrayList;');
        } else { // OneToOne
          annotation = `    @OneToOne(mappedBy = "${currentClassName.toLowerCase()}", cascade = CascadeType.ALL, orphanRemoval = true)`;
          fieldType = relatedClassName;
          fieldName = fieldNameBase;
          imports.push('import javax.persistence.OneToOne;', 'import javax.persistence.CascadeType;');
        }
        imports.push(`import ${packageName}.${relatedClassName};`);
      }
      
      if (annotation && fieldType && fieldName) {
        relationships.push({
          targetClassName: relatedClassName,
          fieldName: this.validateJavaName(fieldName),
          annotation,
          fieldType,
          imports
        });
      }
    }
    
    return relationships;
  }

  /**
   * Encuentra las relaciones entre atributos de diferentes clases
   * @returns Un mapa de relaciones entre atributos donde la clave es attributeId y el valor es la relación completa
   */
  private findAttributeRelationships(): Map<string, any> {
    // Crear un mapa para almacenar las relaciones por attributeId
    const relationshipMap = new Map<string, any>();
    
    // Filtrar solo las relaciones de tipo attributeRelationship
    const attributeEdges = this.edges.filter(edge => 
      edge.type === 'attributeRelationship' && 
      edge.data && 
      edge.data.sourceAttributeId && 
      edge.data.targetAttributeId
    );
    
    // Para cada relación, guardarla en el mapa indexada por los IDs de atributos
    attributeEdges.forEach(edge => {
      const { sourceNodeId, sourceAttributeId, targetNodeId, targetAttributeId, relationshipType } = edge.data;
      
      // Guardar la relación indexada por el ID del atributo origen
      relationshipMap.set(sourceAttributeId, {
        ...edge.data,
        sourceNodeId,
        sourceAttributeId,
        targetNodeId, 
        targetAttributeId,
        relationshipType,
        direction: 'source'
      });
      
      // Guardar la relación indexada por el ID del atributo destino
      relationshipMap.set(targetAttributeId, {
        ...edge.data,
        sourceNodeId,
        sourceAttributeId,
        targetNodeId,
        targetAttributeId,
        relationshipType,
        direction: 'target'
      });
    });
    
    return relationshipMap;
  }

  /**
   * Organiza los archivos por estructura de paquetes
   * Asegura que cada archivo Java se coloque en el directorio correcto según su paquete
   */
  private organizeFilesByPackage(files: GeneratedFile[]): void {
    const cleanProjectName = this.config.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    const basePackage = `${this.config.groupId}.${cleanProjectName}`;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Si es un archivo Java, extraemos su paquete
      if (file.content && file.content.startsWith('package ')) {
        const packageDeclarationEnd = file.content.indexOf(';');
        if (packageDeclarationEnd > 0) {
          const packagePath = file.content.substring(8, packageDeclarationEnd).trim();
          
          // Convertimos el paquete en ruta de directorio
          const packageDir = packagePath.replace(/\./g, '/');
          
          // Revisamos si la ruta actual incluye ya un directorio o no
          if (!file.path.includes('/')) {
            // Solo tiene nombre de archivo, añadimos la ruta de paquete
            files[i] = {
              ...file,
              path: `${packageDir}/${file.path}`
            };
          }
        }
      }
    }
  }
}
