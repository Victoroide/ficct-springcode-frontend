/**
 * SpringBoot Code Generation Service
 */

import { 
  ProgrammingLanguage, 
  JavaClassType,
  UML_TO_JAVA_TYPE_MAPPING,
  mapPrimitiveType
} from '../types/codeGeneration';
import type { 
  SpringBootProjectConfig,
  CodeGenerationResult,
  JavaClassDescriptor,
  JavaFieldDescriptor,
  JavaMethodDescriptor,
  GeneratedFile,
  ProjectStructure
} from '../types/codeGeneration';
import { 
  UMLNodeType, 
  UMLRelationshipType 
} from '../components/uml-flow/types';
import type { 
  UMLNodeData, 
  UMLAttribute, 
  UMLMethod
} from '../components/uml-flow/types';

/**
 * Service for generating SpringBoot code from UML diagrams
 */
export class CodeGenerationService {
  // Map to store UML node data by ID
  private nodesMap: Map<string, any> = new Map();
  // Map to store relationships by ID
  private edgesMap: Map<string, any> = new Map();
  // Project configuration
  private config: SpringBootProjectConfig;
  
  /**
   * Constructor
   * @param projectConfig SpringBoot project configuration
   */
  constructor(projectConfig: SpringBootProjectConfig) {
    this.config = projectConfig;
  }
  
  /**
   * Generate SpringBoot project from UML diagram
   * @param nodes UML nodes
   * @param edges UML relationships
   * @returns Code generation result
   */
  public generateCode(nodes: any[], edges: any[]): CodeGenerationResult {
    try {
      // Clear existing maps
      this.nodesMap.clear();
      this.edgesMap.clear();
      
      // Populate maps
      nodes.forEach(node => {
        this.nodesMap.set(node.id, node);
      });
      
      edges.forEach(edge => {
        this.edgesMap.set(edge.id, edge);
      });
      
      // Generate Java classes
      const javaClasses = this.generateJavaClasses();
      
      // Generate project structure
      const projectStructure = this.generateProjectStructure();
      
      // Generate files
      const files: GeneratedFile[] = [
        ...this.generateProjectFiles(),
        ...this.generateJavaFiles(javaClasses),
      ];
      
      return {
        success: true,
        files,
        projectStructure,
      };
      
    } catch (error) {
      console.error('Error generating code:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        files: [],
        projectStructure: this.generateEmptyProjectStructure(),
      };
    }
  }
  
  /**
   * Generate Java classes from UML nodes
   * @returns Array of Java class descriptors
   */
  private generateJavaClasses(): JavaClassDescriptor[] {
    const javaClasses: JavaClassDescriptor[] = [];
    
    this.nodesMap.forEach((node, nodeId) => {
      const nodeData = node.data as UMLNodeData;
      
      // Skip non-class nodes
      if (!nodeData) return;
      
      const className = this.formatClassName(nodeData.label || 'UnnamedClass');
      
      // Generate Entity (from UML Class)
      if (nodeData.nodeType === 'class') {
        javaClasses.push(this.generateEntity(className, nodeData, nodeId));
        javaClasses.push(this.generateDTO(className, nodeData));
        javaClasses.push(this.generateMapper(className)); // Add MapStruct mapper
        javaClasses.push(this.generateRepository(className));
        javaClasses.push(this.generateService(className));
        javaClasses.push(this.generateController(className));
      }
      
      // Generate Interface Repository (from UML Interface)
      else if (nodeData.nodeType === 'interface') {
        javaClasses.push(this.generateInterface(className, nodeData));
      }
      
      // Generate Enum (from UML Enum)
      else if (nodeData.nodeType === 'enum') {
        javaClasses.push(this.generateEnum(className, nodeData));
      }
    });
    
    // Process relationships
    
    return javaClasses;
  }
  
  /**
   * Generate Entity class with proper package and path
   */
  private generateEntity(className: string, nodeData: UMLNodeData, nodeId: string): JavaClassDescriptor {
    const basePackage = `${this.config.groupId}.${this.config.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}`;
    
    return {
      name: className,
      packageName: `${basePackage}.entity`,
      type: JavaClassType.ENTITY,
      fields: this.generateEntityFields(nodeData, nodeId),
      methods: this.generateEntityMethods(className),
      imports: [],
      annotations: ['@Entity', `@Table(name = "${this.toSnakeCase(className)}s")`],
      isAbstract: false,
      visibility: 'public',
      implements: [],
      documentation: `/**\n * ${className} Entity\n * Generated from UML diagram\n */`
    };
  }

  
  /**
   * Generate DTO class
   */
  private generateDTO(className: string, nodeData: UMLNodeData): JavaClassDescriptor {
    const dtoFields = (nodeData.attributes || []).map(attr => ({
      name: attr.name,
      type: mapPrimitiveType(attr.type),
      visibility: 'private' as const,
      isStatic: false,
      isFinal: false,
      annotations: ['@NotNull', '@Schema(description = "' + attr.name + '")'],
      documentation: `/** ${attr.name} */`
    }));
    
    return {
      name: `${className}DTO`,
      packageName: `${this.config.groupId}.dto`,
      type: JavaClassType.DTO,
      fields: dtoFields,
      methods: this.generateDTOMethods(dtoFields),
      imports: [],
      annotations: ['@Data', '@NoArgsConstructor', '@AllArgsConstructor', '@Schema(description = "' + className + ' DTO")'],
      isAbstract: false,
      visibility: 'public',
      implements: [],
      documentation: `/**\n * ${className} Data Transfer Object\n * Generated from UML diagram\n */`
    };
  }
  
  /**
   * Generate MapStruct Mapper interface
   */
  private generateMapper(className: string): JavaClassDescriptor {
    return {
      name: `${className}Mapper`,
      packageName: `${this.config.groupId}.mapper`,
      type: JavaClassType.REPOSITORY, // Reuse interface type
      fields: [],
      methods: [
        {
          name: 'toDTO',
          returnType: `${className}DTO`,
          visibility: 'public',
          isStatic: false,
          isAbstract: true,
          parameters: [
            {
              name: 'entity',
              type: className,
              annotations: []
            }
          ],
          annotations: [],
          documentation: `/** Convert Entity to DTO */`
        },
        {
          name: 'toEntity',
          returnType: className,
          visibility: 'public',
          isStatic: false,
          isAbstract: true,
          parameters: [
            {
              name: 'dto',
              type: `${className}DTO`,
              annotations: []
            }
          ],
          annotations: [],
          documentation: `/** Convert DTO to Entity */`
        },
        {
          name: 'updateEntityFromDTO',
          returnType: 'void',
          visibility: 'public',
          isStatic: false,
          isAbstract: true,
          parameters: [
            {
              name: 'dto',
              type: `${className}DTO`,
              annotations: []
            },
            {
              name: 'entity',
              type: className,
              annotations: ['@MappingTarget']
            }
          ],
          annotations: [],
          documentation: `/** Update existing entity from DTO */`
        }
      ],
      imports: [],
      annotations: [
        '@Mapper(componentModel = "spring")',
        '@DecoratedWith(value = ' + className + 'MapperDecorator.class)'
      ],
      isAbstract: false,
      visibility: 'public',
      implements: [],
      documentation: `/**\n * MapStruct Mapper for ${className}\n * Generated from UML diagram\n */`
    };
  }
  
  /**
   * Generate Repository interface
   */
  private generateRepository(className: string): JavaClassDescriptor {
    return {
      name: `${className}Repository`,
      packageName: `${this.config.groupId}.repository`,
      type: JavaClassType.REPOSITORY,
      fields: [],
      methods: this.generateRepositoryMethods(className),
      imports: [],
      annotations: ['@Repository'],
      extends: `JpaRepository<${className}, Long>`,
      isAbstract: false,
      visibility: 'public',
      implements: [],
      documentation: `/**\n * ${className} Repository\n * Generated from UML diagram\n */`
    };
  }
  
  /**
   * Generate Service class
   */
  private generateService(className: string): JavaClassDescriptor {
    return {
      name: `${className}Service`,
      packageName: `${this.config.groupId}.service`,
      type: JavaClassType.SERVICE,
      fields: [
        {
          name: `${this.getFieldNameFromClassName(className)}Repository`,
          type: `${className}Repository`,
          visibility: 'private',
          isStatic: false,
          isFinal: true,
          annotations: []
        }
      ],
      methods: this.generateServiceMethods(className),
      imports: [],
      annotations: ['@Service', '@Transactional'],
      isAbstract: false,
      visibility: 'public',
      implements: [],
      documentation: `/**\n * ${className} Service\n * Generated from UML diagram\n */`
    };
  }
  
  /**
   * Generate Controller class
   */
  private generateController(className: string): JavaClassDescriptor {
    return {
      name: `${className}Controller`,
      packageName: `${this.config.groupId}.controller`,
      type: JavaClassType.CONTROLLER,
      fields: [
        {
          name: `${this.getFieldNameFromClassName(className)}Service`,
          type: `${className}Service`,
          visibility: 'private',
          isStatic: false,
          isFinal: true,
          annotations: []
        }
      ],
      methods: this.generateControllerMethods(className),
      imports: [],
      annotations: [
        '@RestController', 
        `@RequestMapping("/api/${this.toKebabCase(className)}")`,
        '@Validated',
        '@Tag(name = "' + className + '", description = "' + className + ' management endpoints")'
      ],
      isAbstract: false,
      visibility: 'public',
      implements: [],
      documentation: `/**\n * ${className} REST Controller\n * Generated from UML diagram\n */`
    };
  }
  
  /**
   * Generate Interface
   */
  private generateInterface(className: string, nodeData: UMLNodeData): JavaClassDescriptor {
    return {
      name: className,
      packageName: `${this.config.groupId}.service`,
      type: JavaClassType.REPOSITORY,
      fields: [],
      methods: this.generateJavaMethods(nodeData),
      imports: [],
      annotations: [],
      isAbstract: false,
      visibility: 'public',
      implements: [],
      documentation: `/**\n * ${className} Interface\n * Generated from UML diagram\n */`
    };
  }
  
  /**
   * Generate Enum
   */
  private generateEnum(className: string, nodeData: UMLNodeData): JavaClassDescriptor {
    return {
      name: className,
      packageName: `${this.config.groupId}.enums`,
      type: JavaClassType.ENUM,
      fields: (nodeData.enumValues || []).map(enumVal => ({
        name: enumVal.name.toUpperCase(),
        type: '',
        visibility: 'public' as const,
        isStatic: false,
        isFinal: false,
        annotations: [],
        defaultValue: enumVal.value ? `("${enumVal.value}")` : undefined
      })),
      methods: [],
      imports: [],
      annotations: [],
      isAbstract: false,
      visibility: 'public',
      implements: [],
      documentation: `/**\n * ${className} Enum\n * Generated from UML diagram\n */`
    };
  }
  
  /**
   * Generate Entity methods (constructors, getters, setters)
   */
  private generateEntityMethods(nodeData: UMLNodeData): JavaMethodDescriptor[] {
    const methods: JavaMethodDescriptor[] = [];
    
    // Add default constructor
    methods.push({
      name: this.formatClassName(nodeData.label || 'Entity'),
      returnType: '',
      visibility: 'public',
      isStatic: false,
      isAbstract: false,
      parameters: [],
      annotations: [],
      body: '    // Default constructor',
      documentation: '/** Default constructor */'
    });
    
    return [...methods, ...this.generateJavaMethods(nodeData)];
  }
  
  /**
   * Generate DTO methods (mainly getters/setters from Lombok)
   */
  private generateDTOMethods(fields: any[]): JavaMethodDescriptor[] {
    // Lombok @Data will generate getters, setters, toString, equals, hashCode
    // So we don't need to explicitly generate methods
    return [];
  }
  
  /**
   * Generate Repository methods (Only JPA method signatures, no custom queries)
   */
  private generateRepositoryMethods(className: string): JavaMethodDescriptor[] {
    const methods: JavaMethodDescriptor[] = [];
    
    // JPA will automatically implement these based on method names
    // No custom SQL queries needed - pure ORM approach
    methods.push({
      name: `findByName`,
      returnType: `Optional<${className}>`,
      visibility: 'public',
      isStatic: false,
      isAbstract: true,
      parameters: [
        {
          name: 'name',
          type: 'String',
          annotations: []
        }
      ],
      annotations: [],
      documentation: `/** Find ${className} by name - JPA auto-implementation */`
    });

    methods.push({
      name: `findByActive`,
      returnType: `List<${className}>`,
      visibility: 'public',
      isStatic: false,
      isAbstract: true,
      parameters: [
        {
          name: 'active',
          type: 'Boolean',
          annotations: []
        }
      ],
      annotations: [],
      documentation: `/** Find active ${className}s - JPA auto-implementation */`
    });

    methods.push({
      name: `countByActive`,
      returnType: `Long`,
      visibility: 'public',
      isStatic: false,
      isAbstract: true,
      parameters: [
        {
          name: 'active',
          type: 'Boolean',
          annotations: []
        }
      ],
      annotations: [],
      documentation: `/** Count active ${className}s - JPA auto-implementation */`
    });
    
    return methods;
  }
  
  /**
   * Generate Service methods (CRUD operations)
   */
  private generateServiceMethods(className: string): JavaMethodDescriptor[] {
    const methods: JavaMethodDescriptor[] = [];
    const fieldName = this.getFieldNameFromClassName(className);
    
    // Create
    methods.push({
      name: `create${className}`,
      returnType: `${className}DTO`,
      visibility: 'public',
      isStatic: false,
      isAbstract: false,
      parameters: [
        {
          name: `${fieldName}DTO`,
          type: `${className}DTO`,
          annotations: ['@Valid']
        }
      ],
      annotations: [],
      body: `    // Convert DTO to Entity using MapStruct mapper
    ${className} ${fieldName} = ${fieldName}Mapper.toEntity(${fieldName}DTO);
    
    // Save entity using JPA repository
    ${className} saved${className} = ${fieldName}Repository.save(${fieldName});
    
    // Convert back to DTO and return
    return ${fieldName}Mapper.toDTO(saved${className});`,
      documentation: `/** Create a new ${className} using JPA ORM */`
    });
    
    // Read
    methods.push({
      name: `get${className}ById`,
      returnType: `${className}DTO`,
      visibility: 'public',
      isStatic: false,
      isAbstract: false,
      parameters: [
        {
          name: 'id',
          type: 'Long',
          annotations: []
        }
      ],
      annotations: [],
      body: `    // Find entity by ID using JPA repository
    ${className} ${fieldName} = ${fieldName}Repository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("${className} not found with id: " + id));
    
    // Convert to DTO using MapStruct and return
    return ${fieldName}Mapper.toDTO(${fieldName});`,
      documentation: `/** Get ${className} by ID */`
    });
    
    // Update
    methods.push({
      name: `update${className}`,
      returnType: `${className}DTO`,
      visibility: 'public',
      isStatic: false,
      isAbstract: false,
      parameters: [
        {
          name: 'id',
          type: 'Long',
          annotations: []
        },
        {
          name: `${fieldName}DTO`,
          type: `${className}DTO`,
          annotations: ['@Valid']
        }
      ],
      annotations: [],
      body: `    // Find existing entity using JPA repository
    ${className} existing${className} = ${fieldName}Repository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("${className} not found with id: " + id));
    
    // Update entity fields using MapStruct partial mapping
    ${fieldName}Mapper.updateEntityFromDTO(${fieldName}DTO, existing${className});
    
    // Save updated entity using JPA repository
    ${className} updated${className} = ${fieldName}Repository.save(existing${className});
    
    // Convert to DTO and return
    return ${fieldName}Mapper.toDTO(updated${className});`,
      documentation: `/** Update ${className} */`
    });
    
    // Delete
    methods.push({
      name: `delete${className}`,
      returnType: 'void',
      visibility: 'public',
      isStatic: false,
      isAbstract: false,
      parameters: [
        {
          name: 'id',
          type: 'Long',
          annotations: []
        }
      ],
      annotations: [],
      body: `    // Check if entity exists using JPA repository
    if (!${fieldName}Repository.existsById(id)) {
        throw new EntityNotFoundException("${className} not found with id: " + id);
    }
    
    // Delete entity using JPA repository
    ${fieldName}Repository.deleteById(id);`,
      documentation: `/** Delete ${className} by ID */`
    });
    
    // List All
    methods.push({
      name: `getAll${className}s`,
      returnType: `List<${className}DTO>`,
      visibility: 'public',
      isStatic: false,
      isAbstract: false,
      parameters: [],
      annotations: [],
      body: `    // Get all entities using JPA repository
    List<${className}> ${fieldName}s = ${fieldName}Repository.findAll();
    
    // Convert list to DTOs using MapStruct mapper
    return ${fieldName}s.stream()
        .map(${fieldName}Mapper::toDTO)
        .collect(Collectors.toList());`,
      documentation: `/** Get all ${className}s */`
    });
    
    return methods;
  }
  
  /**
   * Generate Controller methods (REST endpoints)
   */
  private generateControllerMethods(className: string): JavaMethodDescriptor[] {
    const methods: JavaMethodDescriptor[] = [];
    const fieldName = this.getFieldNameFromClassName(className);
    
    // POST - Create
    methods.push({
      name: `create${className}`,
      returnType: `ResponseEntity<${className}DTO>`,
      visibility: 'public',
      isStatic: false,
      isAbstract: false,
      parameters: [
        {
          name: `${fieldName}DTO`,
          type: `${className}DTO`,
          annotations: ['@Valid', '@RequestBody']
        }
      ],
      annotations: [
        '@PostMapping',
        '@Operation(summary = "Create a new ' + className + '")',
        '@ApiResponses(value = {',
        '    @ApiResponse(responseCode = "201", description = "' + className + ' created successfully"),',
        '    @ApiResponse(responseCode = "400", description = "Invalid input")',
        '})'
      ],
      body: `    ${className}DTO created${className} = ${fieldName}Service.create${className}(${fieldName}DTO);
    return ResponseEntity.status(HttpStatus.CREATED).body(created${className});`,
      documentation: `/** Create a new ${className} */`
    });
    
    // GET - Read One
    methods.push({
      name: `get${className}ById`,
      returnType: `ResponseEntity<${className}DTO>`,
      visibility: 'public',
      isStatic: false,
      isAbstract: false,
      parameters: [
        {
          name: 'id',
          type: 'Long',
          annotations: ['@PathVariable']
        }
      ],
      annotations: [
        '@GetMapping("/{id}")',
        '@Operation(summary = "Get ' + className + ' by ID")'
      ],
      body: `    ${className}DTO ${fieldName} = ${fieldName}Service.get${className}ById(id);
    return ResponseEntity.ok(${fieldName});`,
      documentation: `/** Get ${className} by ID */`
    });
    
    // GET - Read All
    methods.push({
      name: `getAll${className}s`,
      returnType: `ResponseEntity<List<${className}DTO>>`,
      visibility: 'public',
      isStatic: false,
      isAbstract: false,
      parameters: [],
      annotations: [
        '@GetMapping',
        '@Operation(summary = "Get all ' + className + 's")'
      ],
      body: `    List<${className}DTO> ${fieldName}s = ${fieldName}Service.getAll${className}s();
    return ResponseEntity.ok(${fieldName}s);`,
      documentation: `/** Get all ${className}s */`
    });
    
    // PUT - Update
    methods.push({
      name: `update${className}`,
      returnType: `ResponseEntity<${className}DTO>`,
      visibility: 'public',
      isStatic: false,
      isAbstract: false,
      parameters: [
        {
          name: 'id',
          type: 'Long',
          annotations: ['@PathVariable']
        },
        {
          name: `${fieldName}DTO`,
          type: `${className}DTO`,
          annotations: ['@Valid', '@RequestBody']
        }
      ],
      annotations: [
        '@PutMapping("/{id}")',
        '@Operation(summary = "Update ' + className + '")'
      ],
      body: `    ${className}DTO updated${className} = ${fieldName}Service.update${className}(id, ${fieldName}DTO);
    return ResponseEntity.ok(updated${className});`,
      documentation: `/** Update ${className} */`
    });
    
    // DELETE
    methods.push({
      name: `delete${className}`,
      returnType: `ResponseEntity<Void>`,
      visibility: 'public',
      isStatic: false,
      isAbstract: false,
      parameters: [
        {
          name: 'id',
          type: 'Long',
          annotations: ['@PathVariable']
        }
      ],
      annotations: [
        '@DeleteMapping("/{id}")',
        '@Operation(summary = "Delete ' + className + '")'
      ],
      body: `    ${fieldName}Service.delete${className}(id);
    return ResponseEntity.noContent().build();`,
      documentation: `/** Delete ${className} */`
    });
    
    return methods;
  }
  
  /**
   * Generate Java fields from UML attributes
   */
  private generateJavaFields(nodeData: UMLNodeData, nodeId: string): JavaFieldDescriptor[] {
    const fields: JavaFieldDescriptor[] = [];
    
    // Add ID field for entities
    if (nodeData.nodeType === UMLNodeType.CLASS) {
      fields.push({
        name: 'id',
        type: 'Long',
        visibility: 'private',
        isStatic: false,
        isFinal: false,
        annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'],
        documentation: '/** Primary key */'
      });
    }
    
    // Process attributes
    (nodeData.attributes || []).forEach(attr => {
      fields.push({
        name: attr.name,
        type: mapPrimitiveType(attr.type),
        visibility: this.mapUMLVisibilityToJava(attr.visibility),
        isStatic: !!attr.isStatic,
        isFinal: !!attr.isFinal,
        annotations: [],
        defaultValue: attr.defaultValue,
        documentation: attr.name ? `/** ${attr.name} */` : undefined
      });
    });
    
    return fields;
  }
  
  /**
   * Generate Java methods from UML methods
   */
  private generateJavaMethods(nodeData: UMLNodeData): JavaMethodDescriptor[] {
    const methods: JavaMethodDescriptor[] = [];
    
    (nodeData.methods || []).forEach(method => {
      const javaMethod: JavaMethodDescriptor = {
        name: method.name,
        returnType: mapPrimitiveType(method.returnType || 'void'),
        visibility: this.mapUMLVisibilityToJava(method.visibility),
        isStatic: !!method.isStatic,
        isAbstract: !!method.isAbstract,
        parameters: this.generateParameters(method),
        annotations: [],
        body: method.isAbstract ? undefined : '  // TODO: Implement method\n  return null;',
        documentation: method.name ? `/**\n   * ${method.name}\n   */` : undefined
      };
      
      methods.push(javaMethod);
    });
    
    return methods;
  }
  
  /**
   * Generate method parameters
   */
  private generateParameters(method: UMLMethod): any[] {
    return (method.parameters || []).map(param => ({
      name: param.name,
      type: mapPrimitiveType(param.type),
      annotations: [],
      defaultValue: param.defaultValue
    }));
  }
  
  /**
   * Process relationships between classes
   */
  private processRelationships(javaClasses: JavaClassDescriptor[]): void {
    const classMap = new Map<string, JavaClassDescriptor>();
    javaClasses.forEach(cls => {
      classMap.set(cls.name, cls);
    });
    
    this.edgesMap.forEach(edge => {
      if (!edge.data || !edge.source || !edge.target) return;
      
      const sourceNode = this.nodesMap.get(edge.source);
      const targetNode = this.nodesMap.get(edge.target);
      
      if (!sourceNode || !targetNode) return;
      
      const sourceClassName = this.formatClassName(sourceNode.data.label);
      const targetClassName = this.formatClassName(targetNode.data.label);
      
      const sourceClass = classMap.get(sourceClassName);
      const targetClass = classMap.get(targetClassName);
      
      if (!sourceClass || !targetClass) return;
      
      switch (edge.data.relationshipType) {
        case UMLRelationshipType.INHERITANCE:
          // Target class extends source class
          targetClass.extends = sourceClassName;
          // Add import
          targetClass.imports.push(`${sourceClass.packageName}.${sourceClassName}`);
          break;
          
        case UMLRelationshipType.IMPLEMENTATION:
          // Target class implements source interface
          if (!targetClass.implements) targetClass.implements = [];
          targetClass.implements.push(sourceClassName);
          // Add import
          targetClass.imports.push(`${sourceClass.packageName}.${sourceClassName}`);
          break;
          
        case UMLRelationshipType.ASSOCIATION:
        case UMLRelationshipType.AGGREGATION:
        case UMLRelationshipType.COMPOSITION:
          // Add field to source class
          const fieldName = this.getFieldNameFromClassName(targetClassName);
          const isToMany = this.isToManyRelationship(edge.data);
          
          const fieldType = isToMany ? `List<${targetClassName}>` : targetClassName;
          
          // Add the field
          sourceClass.fields.push({
            name: fieldName,
            type: fieldType,
            visibility: 'private',
            isStatic: false,
            isFinal: false,
            annotations: this.getRelationshipAnnotations(edge.data, isToMany),
            relation: {
              type: edge.data.relationshipType,
              targetClass: targetClassName,
              multiplicity: isToMany ? '0..*' : '0..1'
            }
          });
          
          // Add imports
          if (isToMany) {
            sourceClass.imports.push('java.util.List');
            sourceClass.imports.push('java.util.ArrayList');
          }
          sourceClass.imports.push(`${targetClass.packageName}.${targetClassName}`);
          
          break;
      }
    });
  }
  
  /**
   * Checks if relationship is to-many based on multiplicity
   */
  private isToManyRelationship(data: any): boolean {
    const multiplicity = data.targetMultiplicity;
    return multiplicity && (
      multiplicity === '*' || 
      multiplicity === '0..*' || 
      multiplicity === '1..*' ||
      multiplicity === 'many'
    );
  }
  
  /**
   * Get appropriate JPA annotations for relationship
   */
  private getRelationshipAnnotations(data: any, isToMany: boolean): string[] {
    const annotations: string[] = [];
    
    switch (data.relationshipType) {
      case UMLRelationshipType.ASSOCIATION:
        annotations.push(isToMany ? '@OneToMany' : '@ManyToOne');
        break;
      case UMLRelationshipType.AGGREGATION:
        annotations.push(isToMany ? '@OneToMany' : '@ManyToOne');
        break;
      case UMLRelationshipType.COMPOSITION:
        annotations.push(isToMany ? '@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)' : '@OneToOne(cascade = CascadeType.ALL)');
        break;
    }
    
    return annotations;
  }
  
  /**
   * Add class-specific annotations
   */
  private addClassAnnotations(classDescriptor: JavaClassDescriptor): void {
    switch (classDescriptor.type) {
      case JavaClassType.ENTITY:
        classDescriptor.annotations.push('@Entity');
        classDescriptor.annotations.push('@Table(name = "' + this.toSnakeCase(classDescriptor.name) + '")');
        break;
      case JavaClassType.REPOSITORY:
        classDescriptor.annotations.push('@Repository');
        classDescriptor.extends = `JpaRepository<${classDescriptor.name.replace('Repository', '')}, Long>`;
        break;
      case JavaClassType.SERVICE:
        classDescriptor.annotations.push('@Service');
        break;
      case JavaClassType.CONTROLLER:
        classDescriptor.annotations.push('@RestController');
        classDescriptor.annotations.push('@RequestMapping("/api/' + this.toKebabCase(classDescriptor.name.replace('Controller', '')) + '")');
        break;
      case JavaClassType.CONFIG:
        classDescriptor.annotations.push('@Configuration');
        break;
    }
  }
  
  /**
   * Add necessary imports based on class type and content
   */
  private addImports(classDescriptor: JavaClassDescriptor): void {
    // Add common imports based on class type
    switch (classDescriptor.type) {
      case JavaClassType.ENTITY:
        classDescriptor.imports.push('javax.persistence.Entity');
        classDescriptor.imports.push('javax.persistence.Table');
        classDescriptor.imports.push('javax.persistence.Id');
        classDescriptor.imports.push('javax.persistence.GeneratedValue');
        classDescriptor.imports.push('javax.persistence.GenerationType');
        break;
      case JavaClassType.REPOSITORY:
        classDescriptor.imports.push('org.springframework.data.jpa.repository.JpaRepository');
        classDescriptor.imports.push('org.springframework.stereotype.Repository');
        // Add import for entity
        const entityName = classDescriptor.name.replace('Repository', '');
        classDescriptor.imports.push(`${this.config.groupId}.entity.${entityName}`);
        break;
      case JavaClassType.SERVICE:
        classDescriptor.imports.push('org.springframework.stereotype.Service');
        break;
      case JavaClassType.CONTROLLER:
        classDescriptor.imports.push('org.springframework.web.bind.annotation.RestController');
        classDescriptor.imports.push('org.springframework.web.bind.annotation.RequestMapping');
        break;
      case JavaClassType.CONFIG:
        classDescriptor.imports.push('org.springframework.context.annotation.Configuration');
        break;
    }
    
    // Add JPA relationship imports if needed
    if (classDescriptor.fields.some(f => f.annotations.some(a => 
        a.includes('@OneToMany') || 
        a.includes('@ManyToOne') || 
        a.includes('@OneToOne')))) {
      classDescriptor.imports.push('javax.persistence.OneToMany');
      classDescriptor.imports.push('javax.persistence.ManyToOne');
      classDescriptor.imports.push('javax.persistence.OneToOne');
      classDescriptor.imports.push('javax.persistence.CascadeType');
    }
    
    // Remove duplicates
    classDescriptor.imports = [...new Set(classDescriptor.imports)];
  }
  
  // Helper utility methods would be here...
  
  /**
   * Format class name to PascalCase
   */
  private formatClassName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
  
  /**
   * Get field name from class name (camelCase)
   */
  private getFieldNameFromClassName(className: string): string {
    return className.charAt(0).toLowerCase() + className.slice(1);
  }
  
  /**
   * Map UML node type to Java package name
   */
  private formatPackageName(nodeType: UMLNodeType): string {
    switch (nodeType) {
      case UMLNodeType.CLASS:
        return 'entity';
      case UMLNodeType.INTERFACE:
        return 'repository';
      case UMLNodeType.ENUM:
        return 'enums';
      case UMLNodeType.ABSTRACT_CLASS:
        return 'model';
      default:
        return 'model';
    }
  }
  
  /**
   * Map UML node type to Java class type
   */
  private mapUMLNodeTypeToJavaClassType(nodeType: UMLNodeType): JavaClassType {
    switch (nodeType) {
      case UMLNodeType.CLASS:
        return JavaClassType.ENTITY;
      case UMLNodeType.INTERFACE:
        return JavaClassType.REPOSITORY;
      case UMLNodeType.ENUM:
        return JavaClassType.ENUM;
      case UMLNodeType.ABSTRACT_CLASS:
        return JavaClassType.ENTITY;
      default:
        return JavaClassType.ENTITY;
    }
  }
  
  /**
   * Map UML visibility to Java visibility
   */
  private mapUMLVisibilityToJava(visibility: any): 'public' | 'protected' | 'private' {
    switch (visibility) {
      case 'PUBLIC':
      case 'public':
        return 'public';
      case 'PROTECTED':
      case 'protected':
        return 'protected';
      case 'PRIVATE':
      case 'private':
      default:
        return 'private';
    }
  }
  
  /**
   * Convert string to snake_case
   */
  private toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }
  
  /**
   * Convert string to kebab-case
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  }
  
  /**
   * Generate basic project structure
   */
  private generateProjectStructure(): ProjectStructure {
    const basePackagePath = this.config.groupId.replace(/\./g, '/');
    
    return {
      rootDir: this.config.artifactId,
      sourceDir: `src/main/java/${basePackagePath}`,
      testDir: `src/test/java/${basePackagePath}`,
      resourcesDir: 'src/main/resources',
      directories: [
        {
          path: `src/main/java/${basePackagePath}/entity`,
          name: 'entity',
          files: [],
        },
        {
          path: `src/main/java/${basePackagePath}/repository`,
          name: 'repository',
          files: [],
        },
        {
          path: `src/main/java/${basePackagePath}/service`,
          name: 'service',
          files: [],
        },
        {
          path: `src/main/java/${basePackagePath}/controller`,
          name: 'controller',
          files: [],
        },
        {
          path: `src/main/resources`,
          name: 'resources',
          files: ['application.properties'],
        },
      ]
    };
  }
  
  /**
   * Generate empty project structure
   */
  private generateEmptyProjectStructure(): ProjectStructure {
    return {
      rootDir: this.config.artifactId,
      sourceDir: 'src/main/java',
      testDir: 'src/test/java',
      resourcesDir: 'src/main/resources',
      directories: []
    };
  }
  
  /**
   * Generate basic project files (pom.xml, etc)
   */
  private generateProjectFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [
      {
        path: 'pom.xml',
        content: this.generatePomXml(),
        language: 'xml'
      },
      {
        path: 'src/main/resources/application.properties',
        content: this.generateApplicationProperties(),
        language: 'properties'
      },
      {
        path: 'README.md',
        content: this.generateReadme(),
        language: 'md'
      }
    ];
    
    // Add OpenAPI configuration if OpenAPI dependency is included
    if (this.config.dependencies.some(dep => dep.id === 'openapi')) {
      files.push({
        path: `src/main/java/${this.config.groupId.replace(/\./g, '/')}/config/OpenApiConfig.java`,
        content: this.generateOpenApiConfig(),
        language: ProgrammingLanguage.JAVA
      });
    }
    
    return files;
  }
  
  /**
   * Generate Java source files
   */
  private generateJavaFiles(javaClasses: JavaClassDescriptor[]): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    
    javaClasses.forEach(javaClass => {
      const packagePath = javaClass.packageName.replace(/\./g, '/');
      const filePath = `src/main/java/${packagePath}/${javaClass.name}.java`;
      
      files.push({
        path: filePath,
        content: this.generateJavaClassFile(javaClass),
        language: ProgrammingLanguage.JAVA
      });
    });
    
    return files;
  }
  
  /**
   * Generate pom.xml with complete dependencies
   */
  private generatePomXml(): string {
    const dependencies = this.config.dependencies.map(dep => {
      const groupId = dep.id === 'openapi' ? 'org.springdoc' : 'org.springframework.boot';
      const artifactId = dep.id === 'openapi' ? 'springdoc-openapi-ui' : `spring-boot-starter-${dep.id}`;
      const version = dep.id === 'openapi' ? '<version>1.6.15</version>' : '';
      
      return `        <dependency>
            <groupId>${groupId}</groupId>
            <artifactId>${artifactId}</artifactId>
            ${version}
        </dependency>`;
    }).join('\n');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.5</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>${this.config.groupId}</groupId>
    <artifactId>${this.config.artifactId}</artifactId>
    <version>${this.config.version}</version>
    <name>${this.config.name}</name>
    <description>${this.config.description}</description>
    <properties>
        <java.version>${this.config.javaVersion}</java.version>
        <maven.compiler.source>${this.config.javaVersion}</maven.compiler.source>
        <maven.compiler.target>${this.config.javaVersion}</maven.compiler.target>
    </properties>
    <dependencies>
${dependencies}
        
        <!-- Testing dependencies -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        
        <!-- MapStruct for DTO mapping -->
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>1.5.5.Final</version>
        </dependency>
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct-processor</artifactId>
            <version>1.5.5.Final</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>${this.config.javaVersion}</source>
                    <target>${this.config.javaVersion}</target>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.mapstruct</groupId>
                            <artifactId>mapstruct-processor</artifactId>
                            <version>1.5.5.Final</version>
                        </path>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                            <version>1.18.30</version>
                        </path>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok-mapstruct-binding</artifactId>
                            <version>0.2.0</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`;
  }
  
  /**
   * Generate application.properties
   */
  private generateApplicationProperties(): string {
    return `# Application Configuration
spring.application.name=${this.config.name}

# Database Configuration
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Server Configuration
server.port=8080
`;
  }
  
  /**
   * Generate README.md
   */
  private generateReadme(): string {
    return `# ${this.config.name}

${this.config.description}

## Project Structure

This project was generated using SpringCode UML Editor.

## Requirements

- Java ${this.config.javaVersion}
- Maven 3.x

## Running the Application

To run the application locally:

\`\`\`bash
mvn spring-boot:run
\`\`\`

## Building the Application

To build the application:

\`\`\`bash
mvn clean install
\`\`\`

## API Endpoints

Once the application is running, you can access the API at:

- \`http://localhost:8080/api/\`

## Database

This application uses an H2 in-memory database by default.
`;
  }
  
  /**
   * Generate OpenAPI configuration
   */
  private generateOpenApiConfig(): string {
    const className = this.formatClassName(this.config.name);
    
    return `package ${this.config.groupId}.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;

/**
 * OpenAPI 3.0 Configuration
 * Generated from UML diagram
 */
@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("${this.config.name} API")
                .description("${this.config.description}")
                .version("${this.config.version}")
                .contact(new Contact()
                    .name("Generated API")
                    .email("developer@example.com")
                    .url("https://example.com"))
                .license(new License()
                    .name("MIT License")
                    .url("https://opensource.org/licenses/MIT")))
            .servers(List.of(
                new Server()
                    .url("http://localhost:8080")
                    .description("Development server"),
                new Server()
                    .url("https://api.example.com")
                    .description("Production server")))
            .tags(List.of(${this.generateApiTags()}));
    }
}`;
  }
  
  /**
   * Generate API tags for OpenAPI
   */
  private generateApiTags(): string {
    const tags: string[] = [];
    
    this.nodesMap.forEach((node) => {
      const nodeData = node.data as UMLNodeData;
      if (nodeData && nodeData.nodeType === 'class') {
        const className = this.formatClassName(nodeData.label || 'Entity');
        tags.push(`
                new Tag()
                    .name("${className}")
                    .description("${className} management operations")`);
      }
    });
    
    return tags.join(',');
  }
  
  /**
   * Generate Java class file content
   */
  private generateJavaClassFile(javaClass: JavaClassDescriptor): string {
    let content = `package ${javaClass.packageName};\n\n`;
    
    // Add imports
    if (javaClass.imports.length > 0) {
      javaClass.imports.sort().forEach(imp => {
        content += `import ${imp};\n`;
      });
      content += '\n';
    }
    
    // Add class documentation
    if (javaClass.documentation) {
      content += `${javaClass.documentation}\n`;
    }
    
    // Add class annotations
    javaClass.annotations.forEach(annotation => {
      content += `${annotation}\n`;
    });
    
    // Class declaration
    content += `public ${javaClass.isAbstract ? 'abstract ' : ''}${this.getJavaTypeKeyword(javaClass.type)} ${javaClass.name}`;
    
    // Extends
    if (javaClass.extends) {
      content += ` extends ${javaClass.extends}`;
    }
    
    // Implements
    if (javaClass.implements && javaClass.implements.length > 0) {
      content += ` implements ${javaClass.implements.join(', ')}`;
    }
    
    content += ' {\n\n';
    
    // Fields
    javaClass.fields.forEach(field => {
      if (field.documentation) {
        content += `    ${field.documentation}\n`;
      }
      field.annotations.forEach(annotation => {
        content += `    ${annotation}\n`;
      });
      
      content += `    ${field.visibility}${field.isStatic ? ' static' : ''}${field.isFinal ? ' final' : ''} ${field.type} ${field.name}`;
      
      if (field.defaultValue) {
        content += ` = ${field.defaultValue}`;
      } else if (field.type === 'String') {
        content += ' = ""';
      } else if (field.type.includes('List')) {
        content += ` = new ArrayList<>()`;
      }
      
      content += ';\n\n';
    });
    
    // Methods
    javaClass.methods.forEach(method => {
      if (method.documentation) {
        content += `    ${method.documentation}\n`;
      }
      method.annotations.forEach(annotation => {
        content += `    ${annotation}\n`;
      });
      
      // Method signature
      content += `    ${method.visibility}${method.isStatic ? ' static' : ''}${method.isAbstract ? ' abstract' : ''} ${method.returnType} ${method.name}(`;
      
      // Parameters
      content += method.parameters.map(param => {
        const annotations = param.annotations.length > 0 ? param.annotations.join(' ') + ' ' : '';
        return `${annotations}${param.type} ${param.name}${param.defaultValue ? ' = ' + param.defaultValue : ''}`;
      }).join(', ');
      
      content += ')';
      
      // Throws
      if (method.throws && method.throws.length > 0) {
        content += ` throws ${method.throws.join(', ')}`;
      }
      
      // Method body or semicolon for abstract methods
      if (method.isAbstract) {
        content += ';\n\n';
      } else {
        content += ' {\n';
        if (method.body) {
          content += `    ${method.body}\n`;
        }
        content += '    }\n\n';
      }
    });
    
    content += '}\n';
    
    return content;
  }
  
  /**
   * Get Java keyword for class type
   */
  private getJavaTypeKeyword(type: JavaClassType): string {
    switch (type) {
      case JavaClassType.REPOSITORY:
        return 'interface';
      case JavaClassType.ENUM:
        return 'enum';
      default:
        return 'class';
    }
  }
}

// Export singleton instance
export const codeGenerationService = (config: SpringBootProjectConfig) => new CodeGenerationService(config);
