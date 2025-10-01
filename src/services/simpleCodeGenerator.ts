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
      // Collect class names for Postman collection
      const classNames: string[] = [];
      
      classNodes.forEach(node => {
        const className = this.formatClassName(node.data.label || 'Entity');
        classNames.push(className);
        
        // Generar archivos para cada clase
        files.push(this.generateEntity(className, node.data));
        files.push(this.generateDTO(className, node.data));
        files.push(this.generateRepository(className));
        files.push(this.generateService(className, node.data));
        files.push(this.generateController(className));
      });

      // 3. Generate Postman collection
      files.push(this.generatePostmanCollection(cleanProjectName, classNames));

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
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
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
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </pluginRepository>
    </pluginRepositories>
    
    <build>
        <plugins>
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

# Database Configuration (H2 in-memory)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# H2 Console (for development)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

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
   * Generated structure:
   * - @Id field: Long id (auto-generated, ALWAYS present)
   * - User attributes: from UML diagram (FILTERED to exclude id, createdAt, updatedAt)
   * - Timestamps: createdAt, updatedAt (auto-generated, ALWAYS present)
   * 
   * @param className The name of the Java class (e.g., "Pet", "Owner")
   * @param nodeData UML node data containing attributes array
   * @returns GeneratedFile object with Entity source code
   */
  private generateEntity(className: string, nodeData: any): GeneratedFile {
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
    
    const content = `package ${packageName};

${importsSection}

@Entity
@Table(name = "${className.toLowerCase()}s")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ${className} {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
${attributeEntries.length > 0 ? '\n\n' + attributeEntries.join('\n\n') : ''}
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}`;

    return {
      path: `${className}.java`,
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
- **H2 Database** - In-memory database
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

## Setup and Execution

### Prerequisites
- Java 11+
- Maven 3.6+

### Build the project
\`\`\`bash
mvn clean install
\`\`\`

### Run the application
\`\`\`bash
mvn spring-boot:run
\`\`\`

The application will start on port **8080**.

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

### H2 Console
- **URL**: http://localhost:8080/h2-console
- **JDBC URL**: \`jdbc:h2:mem:testdb\`
- **Username**: \`sa\`
- **Password**: (empty)

The H2 console allows you to:
- Execute SQL queries directly
- View table structures
- Inspect data in real-time
- Debug database issues

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
   * Generate Postman Collection v2.1
   * 
   * Creates a complete Postman collection with all API endpoints for easy testing.
   * Includes environment variables, request examples, and proper folder structure.
   */
  private generatePostmanCollection(cleanProjectName: string, classNames: string[]): GeneratedFile {
    const collectionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Build request items for each entity
    const entityFolders = classNames.map(className => {
      const entityName = className.toLowerCase();
      const pluralName = `${entityName}s`;
      
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
                raw: JSON.stringify({
                  // Example body - user should customize
                }, null, 2)
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
                raw: JSON.stringify({
                  id: 1
                  // Add other fields as needed
                }, null, 2)
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

  // Métodos auxiliares
  private formatClassName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1)
      .replace(/[^a-zA-Z0-9]/g, '');
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
