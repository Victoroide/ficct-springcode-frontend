/**
 * Flutter Generator Service - Client-side Flutter project generation
 * Generates complete Flutter CRUD application from UML diagram
 * Similar to simpleCodeGenerator.ts but for Dart/Flutter
 */

import type { 
  FlutterProjectConfig, 
  FlutterGenerationResult,
  UMLToDartTypeMap 
} from '../types/flutterGeneration';

// ============================================================================
// MAIN GENERATOR CLASS
// ============================================================================

export class FlutterGeneratorService {
  private config: FlutterProjectConfig;
  private nodes: any[];
  private edges: any[];

  constructor(
    nodes: any[],
    edges: any[],
    config: FlutterProjectConfig
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.config = config;
  }

  /**
   * Generate complete Flutter project
   * Returns Map<filename, content>
   */
  generateFlutterProject(): Map<string, string> {
    const files = new Map<string, string>();

    // 1. Generate Dart models
    this.generateModels(files);

    // 2. Generate providers (state management)
    this.generateProviders(files);

    // 3. Generate CRUD forms
    this.generateForms(files);

    // 4. Generate list screens
    this.generateListScreens(files);

    // 5. Generate API service
    this.generateApiService(files);

    // 6. Generate navigation
    this.generateNavigation(files);

    // 7. Generate main.dart
    this.generateMain(files);

    // 8. Generate pubspec.yaml
    this.generatePubspec(files);

    // 9. Generate README.md
    this.generateReadme(files);

    // 10. Generate update scripts for API URL
    this.generateUpdateScripts(files);

    return files;
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Sanitize class name - remove spaces and make PascalCase
   */
  private sanitizeClassName(name: string): string {
    // Remove spaces and convert to PascalCase
    return name
      .split(/[\s_-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Sanitize file name - convert to snake_case and remove spaces
   */
  private sanitizeFileName(name: string): string {
    // First remove ALL spaces, then convert to snake_case
    const noSpaces = name.replace(/\s+/g, '');
    return this.toSnakeCase(noSpaces);
  }

  private isMany(multiplicity: string | undefined): boolean {
    if (!multiplicity) return false;
    const m = multiplicity.toLowerCase().trim();
    return m === '*' || m === '0..*' || m === '1..*' || m.includes('*') || m.includes('many');
  }

  private findFKRelationshipsForDTO(currentNodeId: string): Array<{
    fieldName: string;
    relatedClassName: string;
    isRequired: boolean;
  }> {
    const fkRelationships: Array<{
      fieldName: string;
      relatedClassName: string;
      isRequired: boolean;
    }> = [];

    const outgoingEdges = this.edges.filter(edge => 
      edge.type === 'umlRelationship' &&
      edge.source === currentNodeId &&
      edge.data?.relationshipType
    );

    const incomingEdges = this.edges.filter(edge => 
      edge.type === 'umlRelationship' &&
      edge.target === currentNodeId &&
      edge.data?.relationshipType
    );

    for (const edge of outgoingEdges) {
      const relationshipType = edge.data.relationshipType;
      const sourceMultiplicity = edge.data.sourceMultiplicity;
      const targetMultiplicity = edge.data.targetMultiplicity;

      const normalizedRelType = relationshipType?.toUpperCase() || '';

      if (['INHERITANCE', 'REALIZATION', 'DEPENDENCY'].includes(normalizedRelType)) {
        continue;
      }

      const targetIsMany = this.isMany(targetMultiplicity);
      const sourceIsMany = this.isMany(sourceMultiplicity);

      if (targetIsMany) {
        continue;
      }

      if (!sourceIsMany && !targetIsMany) {
        const reverseEdge = this.edges.find(e => 
          e.type === 'umlRelationship' &&
          e.source === edge.target &&
          e.target === currentNodeId &&
          e.data?.relationshipType?.toUpperCase() === normalizedRelType
        );

        if (reverseEdge) {
          const currentEdgeIndex = this.edges.indexOf(edge);
          const reverseEdgeIndex = this.edges.indexOf(reverseEdge);

          if (currentEdgeIndex > reverseEdgeIndex) {
            continue;
          }
        }
      }

      const targetNode = this.nodes.find(n => n.id === edge.target);
      if (!targetNode) continue;

      const relatedClassName = this.sanitizeClassName(targetNode.data.label || 'Related');
      const fieldName = relatedClassName.charAt(0).toLowerCase() + relatedClassName.slice(1) + 'Id';

      fkRelationships.push({
        fieldName,
        relatedClassName,
        isRequired: false
      });
    }

    for (const edge of incomingEdges) {
      const relationshipType = edge.data.relationshipType;
      const sourceMultiplicity = edge.data.sourceMultiplicity;
      const targetMultiplicity = edge.data.targetMultiplicity;

      const normalizedRelType = relationshipType?.toUpperCase() || '';

      if (['INHERITANCE', 'REALIZATION', 'DEPENDENCY'].includes(normalizedRelType)) {
        continue;
      }

      const sourceIsMany = this.isMany(sourceMultiplicity);
      const targetIsMany = this.isMany(targetMultiplicity);

      if (!sourceIsMany && targetIsMany) {
        const sourceNode = this.nodes.find(n => n.id === edge.source);
        if (!sourceNode) continue;

        const relatedClassName = this.sanitizeClassName(sourceNode.data.label || 'Related');
        const fieldName = relatedClassName.charAt(0).toLowerCase() + relatedClassName.slice(1) + 'Id';

        fkRelationships.push({
          fieldName,
          relatedClassName,
          isRequired: false
        });
      }
    }

    return fkRelationships;
  }

  // ==========================================================================
  // MODELS GENERATION
  // ==========================================================================

  private generateModels(files: Map<string, string>): void {
    this.nodes.forEach(node => {
      if (node.data?.nodeType === 'class') {
        const className = this.sanitizeClassName(node.data.label);
        const fileName = this.sanitizeFileName(node.data.label);
        const content = this.generateDartModel(node, node.id);
        files.set(`lib/models/${fileName}.dart`, content);
      }
    });
  }

  private generateDartModel(node: any, nodeId: string): string {
    const className = this.sanitizeClassName(node.data.label);
    const fileName = this.sanitizeFileName(node.data.label);
    const allAttributes = node.data.attributes || [];
    const methods = node.data.methods || [];

    const fkRelationships = this.findFKRelationshipsForDTO(nodeId);
    
    const fkFieldNames = new Set<string>();
    fkRelationships.forEach(fk => {
      fkFieldNames.add(fk.fieldName.toLowerCase());
      fkFieldNames.add(fk.fieldName.toLowerCase().replace(/_/g, ''));
    });
    
    let attributes = allAttributes.filter((attr: any) => {
      const name = attr.name?.toLowerCase();
      
      if (name === 'id') {
        return false;
      }
      
      const attrNameNormalized = name.replace(/_/g, '');
      const isDuplicateFK = Array.from(fkFieldNames).some(fkName => 
        fkName === name || fkName === attrNameNormalized
      );
      
      if (isDuplicateFK) {
        console.log(`[Flutter] ${className} - SKIPPING attribute "${attr.name}" (will be added from relationship FK)`);
        return false;
      }
      
      return true;
    });

    attributes = [
      { name: 'id', type: 'Integer', visibility: 'public', isFinal: false },
      ...attributes
    ];

    fkRelationships.forEach(fk => {
      attributes.push({
        name: fk.fieldName,
        type: 'Integer',
        visibility: 'public',
        isFinal: false
      });
    });

    let code = `import 'package:json_annotation/json_annotation.dart';\n\n`;
    code += `part '${fileName}.g.dart';\n\n`;
    code += `@JsonSerializable(explicitToJson: true)\n`;
    code += `class ${className} {\n`;

    // Generate attributes (never use private prefix in Dart models)
    attributes.forEach((attr: any) => {
      const dartType = this.mapUMLTypeToDart(attr.type);
      const nullable = attr.isFinal ? '' : '?';
      
      // Add JsonKey annotation with fromJson/toJson converters for safe type casting
      const jsonName = attr.name;
      let jsonKeyAnnotation = `  @JsonKey(name: '${jsonName}'`;
      
      // Add custom converters for type safety
      if (dartType === 'int') {
        jsonKeyAnnotation += `, fromJson: _toInt, toJson: _fromInt`;
      } else if (dartType === 'double') {
        jsonKeyAnnotation += `, fromJson: _toDouble, toJson: _fromDouble`;
      } else if (dartType === 'bool') {
        jsonKeyAnnotation += `, fromJson: _toBool, toJson: _fromBool`;
      } else if (dartType === 'String') {
        jsonKeyAnnotation += `, fromJson: _toString, toJson: _fromString`;
      }
      
      jsonKeyAnnotation += `)\n`;
      code += jsonKeyAnnotation;
      code += `  final ${dartType}${nullable} ${attr.name};\n`;
    });

    code += `\n`;

    // Generate constructor (never use private prefix)
    code += `  ${className}({\n`;
    attributes.forEach((attr: any, index: number) => {
      const required = attr.isFinal ? 'required ' : '';
      code += `    ${required}this.${attr.name}`;
      if (index < attributes.length - 1) code += ',';
      code += '\n';
    });
    code += `  });\n\n`;

    // Generate JSON serialization methods
    code += `  factory ${className}.fromJson(Map<String, dynamic> json) =>\n`;
    code += `      _$${className}FromJson(json);\n\n`;
    code += `  Map<String, dynamic> toJson() => _$${className}ToJson(this);\n\n`;

    // Add static helper methods for type conversion
    code += `  // Helper methods for safe type conversion\n`;
    code += `  static int? _toInt(dynamic value) {\n`;
    code += `    if (value == null) return null;\n`;
    code += `    if (value is int) return value;\n`;
    code += `    if (value is String) return int.tryParse(value);\n`;
    code += `    if (value is double) return value.toInt();\n`;
    code += `    return null;\n`;
    code += `  }\n\n`;
    
    code += `  static int? _fromInt(int? value) => value;\n\n`;
    
    code += `  static double? _toDouble(dynamic value) {\n`;
    code += `    if (value == null) return null;\n`;
    code += `    if (value is double) return value;\n`;
    code += `    if (value is int) return value.toDouble();\n`;
    code += `    if (value is String) return double.tryParse(value);\n`;
    code += `    return null;\n`;
    code += `  }\n\n`;
    
    code += `  static double? _fromDouble(double? value) => value;\n\n`;
    
    code += `  static bool? _toBool(dynamic value) {\n`;
    code += `    if (value == null) return null;\n`;
    code += `    if (value is bool) return value;\n`;
    code += `    if (value is int) return value != 0;\n`;
    code += `    if (value is String) {\n`;
    code += `      final lower = value.toLowerCase();\n`;
    code += `      if (lower == 'true' || lower == '1') return true;\n`;
    code += `      if (lower == 'false' || lower == '0') return false;\n`;
    code += `    }\n`;
    code += `    return null;\n`;
    code += `  }\n\n`;
    
    code += `  static bool? _fromBool(bool? value) => value;\n\n`;
    
    code += `  static String? _toString(dynamic value) {\n`;
    code += `    if (value == null) return null;\n`;
    code += `    return value.toString();\n`;
    code += `  }\n\n`;
    
    code += `  static String? _fromString(String? value) => value;\n`;

    code += `}\n`;

    return code;
  }

  // ==========================================================================
  // PROVIDERS GENERATION
  // ==========================================================================

  private generateProviders(files: Map<string, string>): void {
    this.nodes.forEach(node => {
      if (node.data?.nodeType === 'class') {
        const fileName = this.sanitizeFileName(node.data.label);
        const content = this.generateProvider(node);
        files.set(`lib/providers/${fileName}_provider.dart`, content);
      }
    });
  }

  private generateProvider(node: any): string {
    const className = this.sanitizeClassName(node.data.label);
    const fileName = this.sanitizeFileName(node.data.label);
    const providerName = `${className}Provider`;

    let code = `import 'package:flutter/foundation.dart';\n`;
    code += `import '../models/${fileName}.dart';\n`;
    code += `import '../services/api_service.dart';\n\n`;

    code += `class ${providerName} with ChangeNotifier {\n`;
    code += `  final ApiService _apiService = ApiService();\n`;
    code += `  List<${className}> _items = [];\n`;
    code += `  bool _isLoading = false;\n`;
    code += `  String? _error;\n\n`;

    // Getters
    code += `  List<${className}> get items => _items;\n`;
    code += `  bool get isLoading => _isLoading;\n`;
    code += `  String? get error => _error;\n`;
    code += `  String? get errorMessage => _error; // Alias for error\n\n`;

    // Fetch all
    code += `  Future<void> fetchItems() async {\n`;
    code += `    _isLoading = true;\n`;
    code += `    _error = null;\n`;
    code += `    notifyListeners();\n\n`;
    code += `    try {\n`;
    code += `      final response = await _apiService.get('/${this.getEndpoint(className)}');\n`;
    code += `      if (response is List) {\n`;
    code += `        _items = response\n`;
    code += `            .map((json) => ${className}.fromJson(json as Map<String, dynamic>))\n`;
    code += `            .toList();\n`;
    code += `      } else {\n`;
    code += `        _items = [];\n`;
    code += `      }\n`;
    code += `      _error = null;\n`;
    code += `    } catch (e) {\n`;
    code += `      print('Error fetching items: \$e');\n`;
    code += `      _error = e.toString();\n`;
    code += `      _items = [];\n`;
    code += `    } finally {\n`;
    code += `      _isLoading = false;\n`;
    code += `      notifyListeners();\n`;
    code += `    }\n`;
    code += `  }\n\n`;

    // Create
    code += `  Future<void> createItem(${className} item) async {\n`;
    code += `    try {\n`;
    code += `      await _apiService.post('/${this.getEndpoint(className)}', item.toJson());\n`;
    code += `      await fetchItems();\n`;
    code += `    } catch (e) {\n`;
    code += `      _error = e.toString();\n`;
    code += `      notifyListeners();\n`;
    code += `    }\n`;
    code += `  }\n\n`;

    // Update
    code += `  Future<void> updateItem(dynamic id, ${className} item) async {\n`;
    code += `    try {\n`;
    code += `      final itemId = id is int ? id : int.tryParse(id.toString());\n`;
    code += `      if (itemId == null) throw Exception('Invalid ID for update');\n`;
    code += `      await _apiService.put('/${this.getEndpoint(className)}/\$itemId', item.toJson());\n`;
    code += `      await fetchItems();\n`;
    code += `    } catch (e) {\n`;
    code += `      _error = e.toString();\n`;
    code += `      notifyListeners();\n`;
    code += `    }\n`;
    code += `  }\n\n`;

    // Delete
    code += `  Future<void> deleteItem(dynamic id) async {\n`;
    code += `    try {\n`;
    code += `      final itemId = id is int ? id : int.tryParse(id.toString());\n`;
    code += `      if (itemId == null) throw Exception('Invalid ID for delete');\n`;
    code += `      await _apiService.delete('/${this.getEndpoint(className)}/\$itemId');\n`;
    code += `      await fetchItems();\n`;
    code += `    } catch (e) {\n`;
    code += `      _error = e.toString();\n`;
    code += `      notifyListeners();\n`;
    code += `    }\n`;
    code += `  }\n`;

    code += `}\n`;

    return code;
  }

  // ==========================================================================
  // FORMS GENERATION
  // ==========================================================================

  private generateForms(files: Map<string, string>): void {
    this.nodes.forEach(node => {
      if (node.data?.nodeType === 'class') {
        const fileName = this.sanitizeFileName(node.data.label);
        const content = this.generateFormScreen(node, node.id);
        files.set(`lib/screens/${fileName}_form.dart`, content);
      }
    });
  }

  private generateFormScreen(node: any, nodeId: string): string {
    const className = this.sanitizeClassName(node.data.label);
    const fileName = this.sanitizeFileName(node.data.label);
    const allAttributes = node.data.attributes || [];
    const screenName = `${className}FormScreen`;

    const fkRelationships = this.findFKRelationshipsForDTO(nodeId);
    
    const fkFieldNames = new Set<string>();
    fkRelationships.forEach(fk => {
      fkFieldNames.add(fk.fieldName.toLowerCase());
      fkFieldNames.add(fk.fieldName.toLowerCase().replace(/_/g, ''));
    });
    
    const attributes = allAttributes.filter((attr: any) => {
      const name = attr.name?.toLowerCase();
      
      if (name === 'id') {
        return false;
      }
      
      const attrNameNormalized = name.replace(/_/g, '');
      const isDuplicateFK = Array.from(fkFieldNames).some(fkName => 
        fkName === name || fkName === attrNameNormalized
      );
      
      if (isDuplicateFK) {
        console.log(`[Flutter Form] ${className} - SKIPPING attribute "${attr.name}" (will use relationship FK field)`);
        return false;
      }
      
      return true;
    });

    const fkAttributes = fkRelationships.map(fk => ({
      name: fk.fieldName,
      type: 'Integer',
      visibility: 'public',
      isFinal: false
    }));

    const allFormAttributes = [...attributes, ...fkAttributes];

    const foreignKeys = fkAttributes.filter((attr: any) => {
      const relatedEntity = this.extractRelatedEntityName(attr.name);
      return this.entityExists(relatedEntity);
    });

    let code = `import 'package:flutter/material.dart';\n`;
    code += `import 'package:provider/provider.dart';\n`;
    code += `import 'dart:convert';\n`;
    code += `import '../models/${fileName}.dart';\n`;
    code += `import '../providers/${fileName}_provider.dart';\n`;
    
    // Import providers for foreign key entities (only if they exist)
    foreignKeys.forEach((fk: any) => {
      const relatedEntity = this.extractRelatedEntityName(fk.name);
      const actualEntityName = this.findActualEntityName(relatedEntity);
      if (actualEntityName) {
        const relatedFileName = this.sanitizeFileName(actualEntityName);
        code += `import '../providers/${relatedFileName}_provider.dart';\n`;
      }
    });
    
    code += `\n`;

    code += `class ${screenName} extends StatefulWidget {\n`;
    code += `  final ${className}? item;\n\n`;
    code += `  const ${screenName}({Key? key, this.item}) : super(key: key);\n\n`;
    code += `  @override\n`;
    code += `  State<${screenName}> createState() => _${screenName}State();\n`;
    code += `}\n\n`;

    code += `class _${screenName}State extends State<${screenName}> {\n`;
    code += `  final _formKey = GlobalKey<FormState>();\n`;

    // Controllers for each attribute
    allFormAttributes.forEach((attr: any) => {
      if (attr.type !== 'Boolean') {
        code += `  final _${attr.name}Controller = TextEditingController();\n`;
      }
    });

    // Boolean variables
    allFormAttributes.forEach((attr: any) => {
      if (attr.type === 'Boolean') {
        code += `  bool _${attr.name} = false;\n`;
      }
    });
    
    // Selected items for foreign keys (to display full object data)
    foreignKeys.forEach((fk: any) => {
      code += `  Map<String, dynamic>? _selected${this.capitalizeFirst(fk.name)}Data;\n`;
    });

    code += `\n  @override\n`;
    code += `  void initState() {\n`;
    code += `    super.initState();\n`;
    
    // Load foreign key data
    foreignKeys.forEach((fk: any) => {
      const relatedEntity = this.extractRelatedEntityName(fk.name);
      const actualEntityName = this.findActualEntityName(relatedEntity);
      if (actualEntityName) {
        const relatedClassName = this.sanitizeClassName(actualEntityName);
        code += `    Future.microtask(() => context.read<${relatedClassName}Provider>().fetchItems());\n`;
      }
    });
    
    code += `    if (widget.item != null) {\n`;
    allFormAttributes.forEach((attr: any) => {
      if (attr.type === 'Boolean') {
        code += `      _${attr.name} = widget.item!.${attr.name} ?? false;\n`;
      } else {
        code += `      _${attr.name}Controller.text = widget.item!.${attr.name}?.toString() ?? '';\n`;
      }
    });
    code += `    }\n`;
    code += `  }\n\n`;

    code += `  @override\n`;
    code += `  Widget build(BuildContext context) {\n`;
    code += `    return Scaffold(\n`;
    code += `      appBar: AppBar(\n`;
    code += `        title: Text(widget.item == null ? 'Create ${className}' : 'Edit ${className}'),\n`;
    code += `      ),\n`;
    code += `      body: Padding(\n`;
    code += `        padding: const EdgeInsets.all(16.0),\n`;
    code += `        child: Form(\n`;
    code += `          key: _formKey,\n`;
    code += `          child: ListView(\n`;
    code += `            children: [\n`;

    // Generate form fields
    allFormAttributes.forEach((attr: any) => {
      // Check if this is a foreign key field AND the related entity exists
      const isForeignKey = attr.name !== 'id' && 
                          attr.name.toLowerCase().endsWith('id');
      const relatedEntity = isForeignKey ? this.extractRelatedEntityName(attr.name) : '';
      const actualEntityName = isForeignKey ? this.findActualEntityName(relatedEntity) : null;
      const entityExists = actualEntityName !== null;
      
      if (attr.type === 'Boolean') {
        code += `              SwitchListTile(\n`;
        code += `                title: Text('${this.capitalizeFirst(attr.name)}'),\n`;
        code += `                value: _${attr.name},\n`;
        code += `                onChanged: (value) {\n`;
        code += `                  setState(() => _${attr.name} = value);\n`;
        code += `                },\n`;
        code += `              ),\n`;
      } else if (isForeignKey && entityExists && actualEntityName) {
        // Generate selector button with modal for foreign keys (only if entity exists)
        const relatedClassName = this.sanitizeClassName(actualEntityName);
        const relatedFileName = this.sanitizeFileName(actualEntityName);
        
        code += `              // Foreign key selector for ${attr.name}\n`;
        code += `              Padding(\n`;
        code += `                padding: const EdgeInsets.symmetric(vertical: 8.0),\n`;
        code += `                child: Column(\n`;
        code += `                  crossAxisAlignment: CrossAxisAlignment.start,\n`;
        code += `                  children: [\n`;
        code += `                    Text(\n`;
        code += `                      '${this.capitalizeFirst(attr.name)}',\n`;
        code += `                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),\n`;
        code += `                    ),\n`;
        code += `                    const SizedBox(height: 4),\n`;
        code += `                    InkWell(\n`;
        code += `                      onTap: () => _select${this.capitalizeFirst(attr.name)}(context),\n`;
        code += `                      child: Container(\n`;
        code += `                        padding: const EdgeInsets.all(12),\n`;
        code += `                        decoration: BoxDecoration(\n`;
        code += `                          border: Border.all(color: Colors.grey),\n`;
        code += `                          borderRadius: BorderRadius.circular(4),\n`;
        code += `                        ),\n`;
        code += `                        child: Row(\n`;
        code += `                          children: [\n`;
        code += `                            Expanded(\n`;
        code += `                              child: Text(\n`;
        code += `                                _selected${this.capitalizeFirst(attr.name)}Data != null\n`;
        code += `                                    ? 'ID: \${_${attr.name}Controller.text} - \${_selected${this.capitalizeFirst(attr.name)}Data.toString()}'\n`;
        code += `                                    : _${attr.name}Controller.text.isEmpty\n`;
        code += `                                        ? 'Select ${relatedClassName}'\n`;
        code += `                                        : 'ID: \${_${attr.name}Controller.text}',\n`;
        code += `                                style: TextStyle(\n`;
        code += `                                  color: _${attr.name}Controller.text.isEmpty ? Colors.grey : Colors.black,\n`;
        code += `                                ),\n`;
        code += `                              ),\n`;
        code += `                            ),\n`;
        code += `                            const Icon(Icons.arrow_drop_down),\n`;
        code += `                          ],\n`;
        code += `                        ),\n`;
        code += `                      ),\n`;
        code += `                    ),\n`;
        code += `                    if (_${attr.name}Controller.text.isEmpty)\n`;
        code += `                      Padding(\n`;
        code += `                        padding: const EdgeInsets.only(left: 12, top: 4),\n`;
        code += `                        child: Text(\n`;
        code += `                          'Please select a ${relatedClassName}',\n`;
        code += `                          style: TextStyle(color: Colors.red[700], fontSize: 12),\n`;
        code += `                        ),\n`;
        code += `                      ),\n`;
        code += `                  ],\n`;
        code += `                ),\n`;
        code += `              ),\n`;
      } else {
        code += `              TextFormField(\n`;
        code += `                controller: _${attr.name}Controller,\n`;
        code += `                decoration: InputDecoration(labelText: '${this.capitalizeFirst(attr.name)}'),\n`;
        code += `                validator: (value) {\n`;
        code += `                  if (value == null || value.isEmpty) {\n`;
        code += `                    return 'Please enter ${attr.name}';\n`;
        code += `                  }\n`;
        code += `                  return null;\n`;
        code += `                },\n`;
        code += `              ),\n`;
      }
    });

    code += `              const SizedBox(height: 20),\n`;
    code += `              ElevatedButton(\n`;
    code += `                onPressed: _saveItem,\n`;
    code += `                child: Text(widget.item == null ? 'Create' : 'Update'),\n`;
    code += `              ),\n`;
    code += `            ],\n`;
    code += `          ),\n`;
    code += `        ),\n`;
    code += `      ),\n`;
    code += `    );\n`;
    code += `  }\n\n`;

    // Save method
    code += `  void _saveItem() async {\n`;
    code += `    if (_formKey.currentState!.validate()) {\n`;
    code += `      final provider = context.read<${className}Provider>();\n`;
    code += `      final item = ${className}(\n`;
    allFormAttributes.forEach((attr: any, index: number) => {
      if (attr.type === 'Boolean') {
        code += `        ${attr.name}: _${attr.name}`;
      } else if (attr.type === 'Integer' || attr.type === 'int') {
        code += `        ${attr.name}: int.tryParse(_${attr.name}Controller.text)`;
      } else if (attr.type === 'Double' || attr.type === 'double') {
        code += `        ${attr.name}: double.tryParse(_${attr.name}Controller.text)`;
      } else {
        code += `        ${attr.name}: _${attr.name}Controller.text`;
      }
      if (index < allFormAttributes.length - 1) code += ',';
      code += '\n';
    });
    code += `      );\n\n`;
    code += `      if (widget.item == null) {\n`;
    code += `        await provider.createItem(item);\n`;
    code += `      } else {\n`;
    code += `        if (widget.item!.id != null) {\n`;
    code += `          await provider.updateItem(widget.item!.id!, item);\n`;
    code += `        }\n`;
    code += `      }\n\n`;
    code += `      if (context.mounted) {\n`;
    code += `        Navigator.pop(context);\n`;
    code += `      }\n`;
    code += `    }\n`;
    code += `  }\n\n`;

    // Generate selector methods for foreign keys
    foreignKeys.forEach((fk: any) => {
      const relatedEntity = this.extractRelatedEntityName(fk.name);
      const actualEntityName = this.findActualEntityName(relatedEntity);
      if (!actualEntityName) return; // Skip if entity doesn't exist
      
      const relatedClassName = this.sanitizeClassName(actualEntityName);
      
      code += `  // Selector method for ${fk.name}\n`;
      code += `  void _select${this.capitalizeFirst(fk.name)}(BuildContext context) async {\n`;
      code += `    final provider = context.read<${relatedClassName}Provider>();\n`;
      code += `    \n`;
      code += `    await showDialog(\n`;
      code += `      context: context,\n`;
      code += `      builder: (context) => AlertDialog(\n`;
      code += `        title: const Text('Select ${relatedClassName}'),\n`;
      code += `        content: SizedBox(\n`;
      code += `          width: double.maxFinite,\n`;
      code += `          height: 400,\n`;
      code += `          child: Consumer<${relatedClassName}Provider>(\n`;
      code += `            builder: (context, provider, child) {\n`;
      code += `              if (provider?.isLoading ?? false) {\n`;
      code += `                return const Center(child: CircularProgressIndicator());\n`;
      code += `              }\n`;
      code += `              \n`;
      code += `              if (provider?.errorMessage != null) {\n`;
      code += `                return Center(\n`;
      code += `                  child: Text('Error: \${provider?.errorMessage ?? "Unknown error"}'),\n`;
      code += `                );\n`;
      code += `              }\n`;
      code += `              \n`;
      code += `              if (provider?.items.isEmpty ?? true) {\n`;
      code += `                return const Center(\n`;
      code += `                  child: Text('No ${relatedClassName} available'),\n`;
      code += `                );\n`;
      code += `              }\n`;
      code += `              \n`;
      code += `              return ListView.builder(\n`;
      code += `                itemCount: provider?.items.length ?? 0,\n`;
      code += `                itemBuilder: (context, index) {\n`;
      code += `                  final item = provider!.items[index];\n`;
      code += `                  final jsonData = item.toJson();\n`;
      code += `                  final prettyJson = const JsonEncoder.withIndent('  ').convert(jsonData);\n`;
      code += `                  \n`;
      code += `                  return Card(\n`;
      code += `                    margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),\n`;
      code += `                    child: ListTile(\n`;
      code += `                      title: Text('ID: \${item.id ?? "N/A"}'),\n`;
      code += `                      subtitle: Padding(\n`;
      code += `                        padding: const EdgeInsets.only(top: 8),\n`;
      code += `                        child: Text(\n`;
      code += `                          prettyJson,\n`;
      code += `                          style: const TextStyle(\n`;
      code += `                            fontFamily: 'monospace',\n`;
      code += `                            fontSize: 11,\n`;
      code += `                          ),\n`;
      code += `                        ),\n`;
      code += `                      ),\n`;
      code += `                      onTap: () {\n`;
      code += `                        setState(() {\n`;
      code += `                          _${fk.name}Controller.text = item.id?.toString() ?? '';\n`;
      code += `                          _selected${this.capitalizeFirst(fk.name)}Data = jsonData;\n`;
      code += `                        });\n`;
      code += `                        Navigator.pop(context);\n`;
      code += `                      },\n`;
      code += `                    ),\n`;
      code += `                  );\n`;
      code += `                },\n`;
      code += `              );\n`;
      code += `            },\n`;
      code += `          ),\n`;
      code += `        ),\n`;
      code += `        actions: [\n`;
      code += `          TextButton(\n`;
      code += `            onPressed: () => Navigator.pop(context),\n`;
      code += `            child: const Text('Cancel'),\n`;
      code += `          ),\n`;
      code += `        ],\n`;
      code += `      ),\n`;
      code += `    );\n`;
      code += `  }\n\n`;
    });

    code += `}\n`;

    return code;
  }

  // ==========================================================================
  // LIST SCREENS GENERATION
  // ==========================================================================

  private generateListScreens(files: Map<string, string>): void {
    this.nodes.forEach(node => {
      if (node.data?.nodeType === 'class') {
        const fileName = this.sanitizeFileName(node.data.label);
        const content = this.generateListScreen(node);
        files.set(`lib/screens/${fileName}_list.dart`, content);
      }
    });
  }

  private generateListScreen(node: any): string {
    const className = this.sanitizeClassName(node.data.label);
    const fileName = this.sanitizeFileName(node.data.label);
    const screenName = `${className}ListScreen`;

    let code = `import 'package:flutter/material.dart';\n`;
    code += `import 'package:provider/provider.dart';\n`;
    code += `import '../models/${fileName}.dart';\n`;
    code += `import '../providers/${fileName}_provider.dart';\n`;
    code += `import '${fileName}_form.dart';\n`;
    
    // Add AppDrawer import if drawer navigation
    if (this.config.navigation.type === 'drawer') {
      code += `import '../widgets/app_drawer.dart';\n`;
    }
    
    code += `\n`;

    code += `class ${screenName} extends StatefulWidget {\n`;
    code += `  const ${screenName}({Key? key}) : super(key: key);\n\n`;
    code += `  @override\n`;
    code += `  State<${screenName}> createState() => _${screenName}State();\n`;
    code += `}\n\n`;

    code += `class _${screenName}State extends State<${screenName}> {\n`;
    code += `  @override\n`;
    code += `  void initState() {\n`;
    code += `    super.initState();\n`;
    code += `    Future.microtask(\n`;
    code += `      () => context.read<${className}Provider>().fetchItems(),\n`;
    code += `    );\n`;
    code += `  }\n\n`;

    code += `  @override\n`;
    code += `  Widget build(BuildContext context) {\n`;
    code += `    return Scaffold(\n`;
    code += `      appBar: AppBar(\n`;
    code += `        title: const Text('${className} List'),\n`;
    code += `      ),\n`;
    
    // Add drawer if navigation type is drawer
    if (this.config.navigation.type === 'drawer') {
      code += `      drawer: const AppDrawer(),\n`;
    }
    
    code += `      body: Consumer<${className}Provider>(\n`;
    code += `        builder: (context, provider, child) {\n`;
    code += `          if (provider.isLoading) {\n`;
    code += `            return const Center(\n`;
    code += `              child: Column(\n`;
    code += `                mainAxisAlignment: MainAxisAlignment.center,\n`;
    code += `                children: [\n`;
    code += `                  CircularProgressIndicator(),\n`;
    code += `                  SizedBox(height: 16),\n`;
    code += `                  Text('Loading...'),\n`;
    code += `                ],\n`;
    code += `              ),\n`;
    code += `            );\n`;
    code += `          }\n\n`;
    code += `          if (provider.error != null) {\n`;
    code += `            return Center(\n`;
    code += `              child: Column(\n`;
    code += `                mainAxisAlignment: MainAxisAlignment.center,\n`;
    code += `                children: [\n`;
    code += `                  const Icon(Icons.error_outline, size: 64, color: Colors.red),\n`;
    code += `                  const SizedBox(height: 16),\n`;
    code += `                  Text(\n`;
    code += `                    'Error: \${provider.error}',\n`;
    code += `                    textAlign: TextAlign.center,\n`;
    code += `                    style: const TextStyle(color: Colors.red),\n`;
    code += `                  ),\n`;
    code += `                  const SizedBox(height: 16),\n`;
    code += `                  ElevatedButton.icon(\n`;
    code += `                    onPressed: () => provider.fetchItems(),\n`;
    code += `                    icon: const Icon(Icons.refresh),\n`;
    code += `                    label: const Text('Retry'),\n`;
    code += `                  ),\n`;
    code += `                ],\n`;
    code += `              ),\n`;
    code += `            );\n`;
    code += `          }\n\n`;
    code += `          if (provider.items.isEmpty) {\n`;
    code += `            return Center(\n`;
    code += `              child: Column(\n`;
    code += `                mainAxisAlignment: MainAxisAlignment.center,\n`;
    code += `                children: [\n`;
    code += `                  const Icon(Icons.inbox, size: 64, color: Colors.grey),\n`;
    code += `                  const SizedBox(height: 16),\n`;
    code += `                  const Text(\n`;
    code += `                    'No items found',\n`;
    code += `                    style: TextStyle(fontSize: 18, color: Colors.grey),\n`;
    code += `                  ),\n`;
    code += `                  const SizedBox(height: 8),\n`;
    code += `                  const Text(\n`;
    code += `                    'Tap + to add a new item',\n`;
    code += `                    style: TextStyle(color: Colors.grey),\n`;
    code += `                  ),\n`;
    code += `                ],\n`;
    code += `              ),\n`;
    code += `            );\n`;
    code += `          }\n\n`;
    code += `          return RefreshIndicator(\n`;
    code += `            onRefresh: provider.fetchItems,\n`;
    code += `            child: ListView.builder(\n`;
    code += `              itemCount: provider.items.length,\n`;
    code += `              itemBuilder: (context, index) {\n`;
    code += `                final item = provider.items[index];\n`;
    code += `                return Card(\n`;
    code += `                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),\n`;
    code += `                  child: ListTile(\n`;
    code += `                    title: Text(item.toString()),\n`;
    code += `                    trailing: Row(\n`;
    code += `                      mainAxisSize: MainAxisSize.min,\n`;
    code += `                      children: [\n`;
    code += `                        IconButton(\n`;
    code += `                          icon: const Icon(Icons.edit),\n`;
    code += `                          onPressed: () => _editItem(item),\n`;
    code += `                        ),\n`;
    code += `                        IconButton(\n`;
    code += `                          icon: const Icon(Icons.delete),\n`;
    code += `                          onPressed: () => _deleteItem(item),\n`;
    code += `                        ),\n`;
    code += `                      ],\n`;
    code += `                    ),\n`;
    code += `                  ),\n`;
    code += `                );\n`;
    code += `              },\n`;
    code += `            ),\n`;
    code += `          );\n`;
    code += `        },\n`;
    code += `      ),\n`;
    code += `      floatingActionButton: FloatingActionButton(\n`;
    code += `        onPressed: _createItem,\n`;
    code += `        child: const Icon(Icons.add),\n`;
    code += `      ),\n`;
    code += `    );\n`;
    code += `  }\n\n`;

    code += `  void _createItem() {\n`;
    code += `    Navigator.push(\n`;
    code += `      context,\n`;
    code += `      MaterialPageRoute(builder: (context) => const ${className}FormScreen()),\n`;
    code += `    );\n`;
    code += `  }\n\n`;

    code += `  void _editItem(${className} item) {\n`;
    code += `    Navigator.push(\n`;
    code += `      context,\n`;
    code += `      MaterialPageRoute(builder: (context) => ${className}FormScreen(item: item)),\n`;
    code += `    );\n`;
    code += `  }\n\n`;

    code += `  void _deleteItem(${className} item) async {\n`;
    code += `    final confirmed = await showDialog<bool>(\n`;
    code += `      context: context,\n`;
    code += `      builder: (context) => AlertDialog(\n`;
    code += `        title: const Text('Confirm Delete'),\n`;
    code += `        content: const Text('Are you sure you want to delete this item?'),\n`;
    code += `        actions: [\n`;
    code += `          TextButton(\n`;
    code += `            onPressed: () => Navigator.pop(context, false),\n`;
    code += `            child: const Text('Cancel'),\n`;
    code += `          ),\n`;
    code += `          TextButton(\n`;
    code += `            onPressed: () => Navigator.pop(context, true),\n`;
    code += `            child: const Text('Delete', style: TextStyle(color: Colors.red)),\n`;
    code += `          ),\n`;
    code += `        ],\n`;
    code += `      ),\n`;
    code += `    );\n\n`;
    code += `    if (confirmed == true && item.id != null) {\n`;
    code += `      final provider = context.read<${className}Provider>();\n`;
    code += `      await provider.deleteItem(item.id!);\n`;
    code += `    }\n`;
    code += `  }\n`;

    code += `}\n`;

    return code;
  }

  // ==========================================================================
  // API SERVICE GENERATION
  // ==========================================================================

  private generateApiService(files: Map<string, string>): void {
    let code = `import 'dart:convert';\n`;
    code += `import 'package:http/http.dart' as http;\n\n`;

    code += `class ApiService {\n`;
    code += `  static const String baseUrl = '${this.config.apiConfig.baseUrl}';\n`;
    code += `  static const int timeout = ${this.config.apiConfig.timeout};\n\n`;

    // GET
    code += `  Future<dynamic> get(String endpoint) async {\n`;
    code += `    try {\n`;
    code += `      // Remove leading slash from endpoint if baseUrl ends with slash\n`;
    code += `      final cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;\n`;
    code += `      final cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : '\$baseUrl/';\n`;
    code += `      final uri = Uri.parse('\$cleanBaseUrl\$cleanEndpoint');\n`;
    code += `      print('GET request to: \$uri');\n`;
    code += `      final response = await http.get(uri).timeout(\n`;
    code += `        Duration(milliseconds: timeout),\n`;
    code += `        onTimeout: () {\n`;
    code += `          throw Exception('Connection timeout - Backend not responding');\n`;
    code += `        },\n`;
    code += `      );\n\n`;
    code += `      print('Response status: \${response.statusCode}');\n`;
    code += `      if (response.statusCode == 200) {\n`;
    code += `        return json.decode(response.body);\n`;
    code += `      } else {\n`;
    code += `        throw Exception('Error \${response.statusCode}: \${response.body}');\n`;
    code += `      }\n`;
    code += `    } catch (e) {\n`;
    code += `      print('GET Error: \$e');\n`;
    code += `      rethrow;\n`;
    code += `    }\n`;
    code += `  }\n\n`;

    // POST
    code += `  Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {\n`;
    code += `    try {\n`;
    code += `      // Remove leading slash from endpoint if baseUrl ends with slash\n`;
    code += `      final cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;\n`;
    code += `      final cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : '\$baseUrl/';\n`;
    code += `      final uri = Uri.parse('\$cleanBaseUrl\$cleanEndpoint');\n`;
    code += `      print('POST request to: \$uri');\n`;
    code += `      final response = await http.post(\n`;
    code += `        uri,\n`;
    code += `        headers: {'Content-Type': 'application/json'},\n`;
    code += `        body: json.encode(data),\n`;
    code += `      ).timeout(\n`;
    code += `        Duration(milliseconds: timeout),\n`;
    code += `        onTimeout: () {\n`;
    code += `          throw Exception('Connection timeout - Backend not responding');\n`;
    code += `        },\n`;
    code += `      );\n\n`;
    code += `      print('Response status: \${response.statusCode}');\n`;
    code += `      if (response.statusCode == 200 || response.statusCode == 201) {\n`;
    code += `        return json.decode(response.body);\n`;
    code += `      } else {\n`;
    code += `        throw Exception('Error \${response.statusCode}: \${response.body}');\n`;
    code += `      }\n`;
    code += `    } catch (e) {\n`;
    code += `      print('POST Error: \$e');\n`;
    code += `      rethrow;\n`;
    code += `    }\n`;
    code += `  }\n\n`;

    // PUT
    code += `  Future<dynamic> put(String endpoint, Map<String, dynamic> data) async {\n`;
    code += `    try {\n`;
    code += `      // Remove leading slash from endpoint if baseUrl ends with slash\n`;
    code += `      final cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;\n`;
    code += `      final cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : '\$baseUrl/';\n`;
    code += `      final uri = Uri.parse('\$cleanBaseUrl\$cleanEndpoint');\n`;
    code += `      print('PUT request to: \$uri');\n`;
    code += `      final response = await http.put(\n`;
    code += `        uri,\n`;
    code += `        headers: {'Content-Type': 'application/json'},\n`;
    code += `        body: json.encode(data),\n`;
    code += `      ).timeout(\n`;
    code += `        Duration(milliseconds: timeout),\n`;
    code += `        onTimeout: () {\n`;
    code += `          throw Exception('Connection timeout - Backend not responding');\n`;
    code += `        },\n`;
    code += `      );\n\n`;
    code += `      print('Response status: \${response.statusCode}');\n`;
    code += `      if (response.statusCode == 200) {\n`;
    code += `        return json.decode(response.body);\n`;
    code += `      } else {\n`;
    code += `        throw Exception('Error \${response.statusCode}: \${response.body}');\n`;
    code += `      }\n`;
    code += `    } catch (e) {\n`;
    code += `      print('PUT Error: \$e');\n`;
    code += `      rethrow;\n`;
    code += `    }\n`;
    code += `  }\n\n`;

    // DELETE
    code += `  Future<void> delete(String endpoint) async {\n`;
    code += `    try {\n`;
    code += `      // Remove leading slash from endpoint if baseUrl ends with slash\n`;
    code += `      final cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;\n`;
    code += `      final cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : '\$baseUrl/';\n`;
    code += `      final uri = Uri.parse('\$cleanBaseUrl\$cleanEndpoint');\n`;
    code += `      print('DELETE request to: \$uri');\n`;
    code += `      final response = await http.delete(uri).timeout(\n`;
    code += `        Duration(milliseconds: timeout),\n`;
    code += `        onTimeout: () {\n`;
    code += `          throw Exception('Connection timeout - Backend not responding');\n`;
    code += `        },\n`;
    code += `      );\n\n`;
    code += `      print('Response status: \${response.statusCode}');\n`;
    code += `      if (response.statusCode != 200 && response.statusCode != 204) {\n`;
    code += `        throw Exception('Error \${response.statusCode}: \${response.body}');\n`;
    code += `      }\n`;
    code += `    } catch (e) {\n`;
    code += `      print('DELETE Error: \$e');\n`;
    code += `      rethrow;\n`;
    code += `    }\n`;
    code += `  }\n`;

    code += `}\n`;

    files.set('lib/services/api_service.dart', code);
  }

  // ==========================================================================
  // NAVIGATION GENERATION
  // ==========================================================================

  private generateNavigation(files: Map<string, string>): void {
    const navType = this.config.navigation.type;

    if (navType === 'drawer') {
      files.set('lib/widgets/app_drawer.dart', this.generateDrawerNavigation());
    } else if (navType === 'bottomNav') {
      // Bottom navigation is integrated in main.dart
    }
  }

  private generateDrawerNavigation(): string {
    let code = `import 'package:flutter/material.dart';\n`;
    this.nodes.forEach(node => {
      if (node.data?.nodeType === 'class') {
        const fileName = this.sanitizeFileName(node.data.label);
        code += `import '../screens/${fileName}_list.dart';\n`;
      }
    });
    code += `\n`;

    code += `class AppDrawer extends StatelessWidget {\n`;
    code += `  const AppDrawer({Key? key}) : super(key: key);\n\n`;
    code += `  @override\n`;
    code += `  Widget build(BuildContext context) {\n`;
    code += `    return Drawer(\n`;
    code += `      child: ListView(\n`;
    code += `        children: [\n`;
    code += `          DrawerHeader(\n`;
    code += `            decoration: BoxDecoration(\n`;
    code += `              color: Theme.of(context).primaryColor,\n`;
    code += `            ),\n`;
    code += `            child: const Text(\n`;
    code += `              '${this.config.projectName}',\n`;
    code += `              style: TextStyle(color: Colors.white, fontSize: 24),\n`;
    code += `            ),\n`;
    code += `          ),\n`;

    // Generate menu items for each class
    this.nodes.forEach(node => {
      if (node.data?.nodeType === 'class') {
        const className = this.sanitizeClassName(node.data.label);
        code += `          ListTile(\n`;
        code += `            leading: const Icon(Icons.list),\n`;
        code += `            title: Text('${className}s'),\n`;
        code += `            onTap: () {\n`;
        code += `              Navigator.pushReplacement(\n`;
        code += `                context,\n`;
        code += `                MaterialPageRoute(builder: (context) => const ${className}ListScreen()),\n`;
        code += `              );\n`;
        code += `            },\n`;
        code += `          ),\n`;
      }
    });

    code += `        ],\n`;
    code += `      ),\n`;
    code += `    );\n`;
    code += `  }\n`;
    code += `}\n`;

    return code;
  }

  // ==========================================================================
  // MAIN.DART GENERATION
  // ==========================================================================

  private generateMain(files: Map<string, string>): void {
    let code = `import 'package:flutter/material.dart';\n`;
    code += `import 'package:provider/provider.dart';\n`;

    // Import providers
    this.nodes.forEach(node => {
      if (node.data?.nodeType === 'class') {
        const fileName = this.sanitizeFileName(node.data.label);
        code += `import 'providers/${fileName}_provider.dart';\n`;
      }
    });

    // Import first screen
    const firstNode = this.nodes.find(n => n.data?.nodeType === 'class');
    if (firstNode) {
      const fileName = this.sanitizeFileName(firstNode.data.label);
      code += `import 'screens/${fileName}_list.dart';\n`;
    }

    if (this.config.navigation.type === 'drawer') {
      code += `import 'widgets/app_drawer.dart';\n`;
    }

    code += `\nvoid main() {\n`;
    code += `  runApp(const MyApp());\n`;
    code += `}\n\n`;

    code += `class MyApp extends StatelessWidget {\n`;
    code += `  const MyApp({Key? key}) : super(key: key);\n\n`;
    code += `  @override\n`;
    code += `  Widget build(BuildContext context) {\n`;
    code += `    return MultiProvider(\n`;
    code += `      providers: [\n`;

    // Register all providers
    this.nodes.forEach(node => {
      if (node.data?.nodeType === 'class') {
        const className = this.sanitizeClassName(node.data.label);
        code += `        ChangeNotifierProvider(create: (_) => ${className}Provider()),\n`;
      }
    });

    code += `      ],\n`;
    code += `      child: MaterialApp(\n`;
    code += `        title: '${this.config.description}',\n`;
    code += `        theme: ThemeData(\n`;
    code += `          primarySwatch: Colors.blue,\n`;
    code += `          useMaterial3: ${this.config.theme.themeMode === 'material3'},\n`;
    code += `        ),\n`;

    if (firstNode) {
      const firstClassName = this.sanitizeClassName(firstNode.data.label);
      code += `        home: const ${firstClassName}ListScreen(),\n`;
    }

    code += `      ),\n`;
    code += `    );\n`;
    code += `  }\n`;
    code += `}\n`;

    files.set('lib/main.dart', code);
  }

  // ==========================================================================
  // PUBSPEC.YAML GENERATION
  // ==========================================================================

  private generatePubspec(files: Map<string, string>): void {
    let code = `name: ${this.config.projectName}\n`;
    code += `description: ${this.config.description}\n`;
    code += `version: ${this.config.version}\n\n`;
    code += `environment:\n`;
    code += `  sdk: '>=3.0.0 <4.0.0'\n\n`;
    code += `dependencies:\n`;
    code += `  flutter:\n`;
    code += `    sdk: flutter\n`;
    code += `  http: ^1.1.0\n`;
    code += `  json_annotation: ^4.8.0\n`;
    code += `  intl: ^0.18.0\n`;

    // State management dependency
    if (this.config.stateManagement === 'provider') {
      code += `  provider: ^6.1.0\n`;
    } else if (this.config.stateManagement === 'riverpod') {
      code += `  flutter_riverpod: ^2.4.0\n`;
    } else if (this.config.stateManagement === 'bloc') {
      code += `  flutter_bloc: ^8.1.0\n`;
    } else if (this.config.stateManagement === 'getx') {
      code += `  get: ^4.6.5\n`;
    }

    code += `\ndev_dependencies:\n`;
    code += `  flutter_test:\n`;
    code += `    sdk: flutter\n`;
    code += `  build_runner: ^2.4.0\n`;
    code += `  json_serializable: ^6.7.0\n\n`;
    code += `flutter:\n`;
    code += `  uses-material-design: true\n`;

    files.set('pubspec.yaml', code);
  }

  // ==========================================================================
  // README GENERATION
  // ==========================================================================

  private generateReadme(files: Map<string, string>): void {
    let code = `# ${this.config.projectName}\n\n`;
    code += `${this.config.description}\n\n`;
    code += `## 📱 Technology Stack\n\n`;
    code += `- **Framework:** Flutter ${this.config.theme.themeMode === 'cupertino' ? '(iOS Style)' : '(Material 3)'}\n`;
    code += `- **State Management:** ${this.config.stateManagement}\n`;
    code += `- **Navigation:** ${this.config.navigation.type}\n`;
    code += `- **Backend API:** ${this.config.apiConfig.baseUrl}\n\n`;
    code += `---\n\n`;
    
    code += `## 🚀 Setup and Execution - STEP BY STEP GUIDE\n\n`;
    
    code += `### Prerequisites\n\n`;
    code += `Before starting, verify you have installed:\n\n`;
    code += `- **Flutter SDK 3.0+**\n`;
    code += `  \`\`\`bash\n  flutter --version\n  \`\`\`\n\n`;
    code += `- **Android Studio / VS Code** with Flutter extension\n\n`;
    code += `- **Physical Device or Emulator**\n`;
    code += `  \`\`\`bash\n  flutter devices\n  \`\`\`\n\n`;
    code += `- **Backend Running** (Spring Boot server must be running on port 8080)\n\n`;
    code += `---\n\n`;
    
    code += `## STEP 1: Download and Extract Project\n\n`;
    code += `1. Download the ZIP file\n`;
    code += `2. Extract to a folder (avoid paths with spaces)\n`;
    code += `3. Open terminal in project folder\n\n`;
    code += `\`\`\`bash\ncd path/to/${this.config.projectName}\n\`\`\`\n\n`;
    code += `---\n\n`;
    
    code += `## STEP 2: Install Dependencies\n\n`;
    code += `Run Flutter pub get to download all required packages:\n\n`;
    code += `\`\`\`bash\nflutter pub get\n\`\`\`\n\n`;
    code += `**Expected output:**\n`;
    code += `\`\`\`\nRunning "flutter pub get" in ${this.config.projectName}...\nResolving dependencies... \nGot dependencies!\n\`\`\`\n\n`;
    code += `**Common errors:**\n`;
    code += `- ❌ **"Flutter SDK not found"** → Install Flutter: https://flutter.dev/docs/get-started/install\n`;
    code += `- ❌ **"Pub get failed"** → Run \`flutter clean\` then retry\n\n`;
    code += `---\n\n`;
    
    code += `## STEP 3: Generate JSON Serialization Code\n\n`;
    code += `The project uses \`json_serializable\` for automatic JSON parsing. Generate the required code:\n\n`;
    code += `\`\`\`bash\nflutter pub run build_runner build --delete-conflicting-outputs\n\`\`\`\n\n`;
    code += `**Expected output:**\n`;
    code += `\`\`\`\n[INFO] Generating build script...\n[INFO] Succeeded after 5.2s with 42 outputs\n\`\`\`\n\n`;
    code += `**Common errors:**\n`;
    code += `- ❌ **"Conflicting outputs"** → Already handled with \`--delete-conflicting-outputs\` flag\n`;
    code += `- ❌ **"build_runner not found"** → Run \`flutter pub get\` first\n\n`;
    code += `---\n\n`;
    
    code += `## STEP 4: Initialize Flutter Project Structure\n\n`;
    code += `This generated project needs Flutter to create platform-specific files (Android/iOS):\n\n`;
    code += `\`\`\`bash\nflutter create .\n\`\`\`\n\n`;
    code += `⚠️ **IMPORTANT:** When prompted "Overwrite files?", select:\n`;
    code += `- ❌ **NO** for: \`lib/\`, \`pubspec.yaml\`, \`README.md\`\n`;
    code += `- ✅ **YES** for: \`android/\`, \`ios/\`, \`web/\`\n\n`;
    code += `**Or use this command to avoid prompts:**\n`;
    code += `\`\`\`bash\nflutter create --org com.example .\n\`\`\`\n\n`;
    code += `---\n\n`;
    
    code += `## STEP 5: Configure Backend API URL ⚠️ CRITICAL\n\n`;
    code += `The app needs to connect to your Spring Boot backend. The IP address changes depending on your network.\n\n`;
    
    code += `### Option A: Quick Manual Update (Recommended for Demos)\n\n`;
    code += `1. **Find your PC's IP address:**\n\n`;
    code += `   **Windows:**\n`;
    code += `   \`\`\`bash\n   ipconfig\n   \`\`\`\n`;
    code += `   Look for "IPv4 Address" in your active network adapter (e.g., \`192.168.0.5\`)\n\n`;
    code += `   **Linux/Mac:**\n`;
    code += `   \`\`\`bash\n   ifconfig | grep "inet " | grep -v 127.0.0.1\n   \`\`\`\n\n`;
    code += `2. **Open \`lib/services/api_service.dart\`**\n\n`;
    code += `3. **Find the line:**\n`;
    code += `   \`\`\`dart\n   static const String baseUrl = '${this.config.apiConfig.baseUrl}';\n   \`\`\`\n\n`;
    code += `4. **Replace with YOUR PC's IP:**\n`;
    code += `   \`\`\`dart\n   static const String baseUrl = 'http://YOUR_IP_HERE:8080/api/v1';\n   \`\`\`\n\n`;
    code += `   Example:\n`;
    code += `   \`\`\`dart\n   static const String baseUrl = 'http://192.168.1.100:8080/api/v1';\n   \`\`\`\n\n`;
    
    code += `### Option B: Automated Script (Windows) ⚡\n\n`;
    code += `Create a file \`update_api_url.bat\` in project root:\n\n`;
    code += `\`\`\`batch\n`;
    code += `@echo off\n`;
    code += `echo Detecting your PC IP address...\n`;
    code += `for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4.*192.168"') do (\n`;
    code += `    set IP=%%a\n`;
    code += `    goto :found\n`;
    code += `)\n`;
    code += `:found\n`;
    code += `set IP=%IP: =%\n`;
    code += `echo Detected IP: %IP%\n\n`;
    code += `echo Updating API URL in api_service.dart...\n`;
    code += `powershell -Command "(Get-Content lib\\\\services\\\\api_service.dart) -replace 'http://[0-9.]+:8080', 'http://%IP%:8080' | Set-Content lib\\\\services\\\\api_service.dart"\n\n`;
    code += `echo.\n`;
    code += `echo ✅ API URL updated to: http://%IP%:8080/api/v1\n`;
    code += `echo.\n`;
    code += `echo Next steps:\n`;
    code += `echo 1. Make sure backend is running: http://%IP%:8080\n`;
    code += `echo 2. Run: flutter run\n`;
    code += `pause\n`;
    code += `\`\`\`\n\n`;
    code += `Then run:\n`;
    code += `\`\`\`bash\nupdate_api_url.bat\n\`\`\`\n\n`;
    
    code += `### Option C: Automated Script (Linux/Mac) ⚡\n\n`;
    code += `Create a file \`update_api_url.sh\`:\n\n`;
    code += `\`\`\`bash\n`;
    code += `#!/bin/bash\n`;
    code += `echo "Detecting your PC IP address..."\n`;
    code += `IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)\n\n`;
    code += `if [ -z "$IP" ]; then\n`;
    code += `    echo "❌ Could not detect IP address"\n`;
    code += `    echo "Please run 'ifconfig' manually and update lib/services/api_service.dart"\n`;
    code += `    exit 1\n`;
    code += `fi\n\n`;
    code += `echo "Detected IP: $IP"\n`;
    code += `echo "Updating API URL in api_service.dart..."\n\n`;
    code += `sed -i.bak "s|baseUrl = 'http://[0-9.]*:8080|baseUrl = 'http://$IP:8080|g" lib/services/api_service.dart\n\n`;
    code += `echo ""\n`;
    code += `echo "✅ API URL updated to: http://$IP:8080/api/v1"\n`;
    code += `echo ""\n`;
    code += `echo "Next steps:"\n`;
    code += `echo "1. Make sure backend is running: http://$IP:8080"\n`;
    code += `echo "2. Run: flutter run"\n`;
    code += `\`\`\`\n\n`;
    code += `Make executable and run:\n`;
    code += `\`\`\`bash\nchmod +x update_api_url.sh\n./update_api_url.sh\n\`\`\`\n\n`;
    
    code += `### 📍 Different URLs for Different Platforms\n\n`;
    code += `- **Physical Android Device (USB):** Use PC's IP (e.g., \`http://192.168.0.5:8080\`)\n`;
    code += `- **Android Emulator:** Use \`http://10.0.2.2:8080\` (emulator's special IP)\n`;
    code += `- **iOS Simulator:** Use \`http://localhost:8080\`\n`;
    code += `- **Web Browser:** Use \`http://localhost:8080\`\n\n`;
    code += `⚠️ **For presentations/demos:** Run the script BEFORE each demo to update IP for current network!\n\n`;
    code += `---\n\n`;
    
    code += `## STEP 6: Run the Application\n\n`;
    
    code += `### Using Physical Device (Recommended)\n\n`;
    code += `1. **Enable USB Debugging on Android:**\n`;
    code += `   - Settings → About Phone → Tap "Build Number" 7 times\n`;
    code += `   - Settings → Developer Options → Enable "USB Debugging"\n\n`;
    code += `2. **Connect device via USB**\n\n`;
    code += `3. **Verify device is detected:**\n`;
    code += `   \`\`\`bash\n   flutter devices\n   \`\`\`\n\n`;
    code += `4. **Run the app:**\n`;
    code += `   \`\`\`bash\n   flutter run\n   \`\`\`\n\n`;
    
    code += `### Using Emulator\n\n`;
    code += `1. Start Android emulator from Android Studio\n\n`;
    code += `2. Run:\n`;
    code += `   \`\`\`bash\n   flutter run\n   \`\`\`\n\n`;
    
    code += `**Common errors:**\n\n`;
    code += `❌ **"No devices found"**\n`;
    code += `- Solution: Connect device or start emulator, then run \`flutter devices\`\n\n`;
    code += `❌ **"Build failed - SDK not found"**\n`;
    code += `- Solution: Set Android SDK path in Android Studio settings\n\n`;
    code += `❌ **"Connection refused" / "SocketException"**\n`;
    code += `- Solution 1: Verify backend is running: \`curl http://YOUR_IP:8080/api/health\`\n`;
    code += `- Solution 2: Check IP in \`lib/services/api_service.dart\` matches PC's current IP\n`;
    code += `- Solution 3: Ensure phone and PC on SAME WiFi network\n`;
    code += `- Solution 4: Check firewall allows port 8080\n\n`;
    code += `❌ **"TimeoutException"**\n`;
    code += `- Solution: Backend is too slow or unreachable. Check backend logs.\n\n`;
    code += `---\n\n`;
    
    code += `## STEP 7: Verify Application is Working\n\n`;
    code += `### 1. Check Backend Connection\n\n`;
    code += `The app should show a loading spinner and then display data.\n\n`;
    code += `**If you see "Connection Error":**\n`;
    code += `- Verify backend: \`curl http://YOUR_IP:8080/api/health\`\n`;
    code += `- Check IP in \`api_service.dart\`\n`;
    code += `- Ensure same WiFi network\n\n`;
    code += `### 2. Test CRUD Operations\n\n`;
    code += `Try creating, editing, and deleting items to verify full functionality.\n\n`;
    code += `### 3. Check Logs\n\n`;
    code += `If something fails:\n`;
    code += `\`\`\`bash\nflutter logs\n\`\`\`\n\n`;
    code += `Look for:\n`;
    code += `- \`SocketException\` → Network issue (wrong IP or backend not running)\n`;
    code += `- \`FormatException\` → Backend returning wrong data format\n`;
    code += `- \`TimeoutException\` → Backend unreachable\n\n`;
    code += `---\n\n`;
    
    code += `## 📖 Quick Start (For Experienced Users)\n\n`;
    code += `\`\`\`bash\n`;
    code += `# 1. Install dependencies\n`;
    code += `flutter pub get\n\n`;
    code += `# 2. Generate JSON serialization\n`;
    code += `flutter pub run build_runner build --delete-conflicting-outputs\n\n`;
    code += `# 3. Initialize project structure\n`;
    code += `flutter create .\n\n`;
    code += `# 4. Update API URL (Windows)\n`;
    code += `update_api_url.bat\n\n`;
    code += `# OR manually edit lib/services/api_service.dart\n\n`;
    code += `# 5. Run on device\n`;
    code += `flutter run\n`;
    code += `\`\`\`\n\n`;
    code += `---\n\n`;
    
    code += `## 🏗️ Project Structure\n\n`;
    code += `\`\`\`\n`;
    code += `lib/\n`;
    code += `├── models/          # Data models with JSON serialization\n`;
    code += `├── providers/       # State management (${this.config.stateManagement})\n`;
    code += `├── screens/         # UI screens (List and Form screens)\n`;
    code += `├── services/        # API service (HTTP client)\n`;
    code += `├── widgets/         # Navigation (${this.config.navigation.type})\n`;
    code += `└── main.dart        # Entry point\n`;
    code += `\`\`\`\n\n`;
    code += `---\n\n`;
    
    code += `## 🔧 Configuration Files\n\n`;
    code += `### API Configuration\n\n`;
    code += `File: \`lib/services/api_service.dart\`\n\n`;
    code += `\`\`\`dart\n`;
    code += `static const String baseUrl = 'http://YOUR_IP:8080/api/v1';\n`;
    code += `static const Duration timeout = Duration(seconds: ${this.config.apiConfig.timeout / 1000});\n`;
    code += `\`\`\`\n\n`;
    code += `---\n\n`;
    
    code += `## 🎨 Theme Configuration\n\n`;
    code += `- **Primary Color:** ${this.config.theme.primaryColor}\n`;
    code += `- **Secondary Color:** ${this.config.theme.secondaryColor}\n`;
    code += `- **Theme Mode:** ${this.config.theme.themeMode}\n`;
    code += `- **Dark Mode:** ${this.config.theme.useDarkMode ? 'Enabled' : 'Disabled'}\n\n`;
    code += `To customize, edit \`lib/main.dart\`\n\n`;
    code += `---\n\n`;
    
    code += `## 📱 Testing on Different Networks (IMPORTANT FOR DEMOS)\n\n`;
    code += `**Problem:** IP address changes when you change WiFi networks (home → office → presentation venue).\n\n`;
    code += `**Solution:** Before each demo/presentation:\n\n`;
    code += `### Method 1: Automated Script (Fastest) ⚡\n\n`;
    code += `Run the script before EVERY demo:\n\n`;
    code += `**Windows:**\n`;
    code += `\`\`\`bash\nupdate_api_url.bat\n\`\`\`\n\n`;
    code += `**Linux/Mac:**\n`;
    code += `\`\`\`bash\n./update_api_url.sh\n\`\`\`\n\n`;
    code += `Then hot restart app:\n`;
    code += `- Press \`R\` (capital R) in terminal running \`flutter run\`, or\n`;
    code += `- Stop and run \`flutter run\` again\n\n`;
    
    code += `### Method 2: Manual Update\n\n`;
    code += `1. Get current IP:\n`;
    code += `   \`\`\`bash\n   ipconfig  # Windows\n   ifconfig  # Linux/Mac\n   \`\`\`\n\n`;
    code += `2. Edit \`lib/services/api_service.dart\`:\n`;
    code += `   \`\`\`dart\n   static const String baseUrl = 'http://NEW_IP:8080/api/v1';\n   \`\`\`\n\n`;
    code += `3. Hot restart app (press \`R\` in terminal)\n\n`;
    code += `⚠️ **Note:** Hot reload (\`r\`) won't work for URL changes, you MUST hot restart (\`R\`)!\n\n`;
    code += `---\n\n`;
    
    code += `## 🐛 Troubleshooting\n\n`;
    
    code += `### Backend Connection Issues\n\n`;
    code += `**Symptom:** "Connection refused" or "Network unreachable"\n\n`;
    code += `**Solutions:**\n\n`;
    code += `1. **Verify backend is running:**\n`;
    code += `   \`\`\`bash\n   curl http://YOUR_IP:8080/api/health\n   \`\`\`\n`;
    code += `   Should return: \`{"status":"UP"}\`\n\n`;
    code += `2. **Check IP is correct:**\n`;
    code += `   - Get PC IP: \`ipconfig\` (Windows) or \`ifconfig\` (Linux/Mac)\n`;
    code += `   - Open \`lib/services/api_service.dart\`\n`;
    code += `   - Verify \`baseUrl\` matches PC's current IP\n\n`;
    code += `3. **Verify same WiFi network:**\n`;
    code += `   - Phone and PC MUST be on the same network\n`;
    code += `   - Check WiFi name on both devices\n\n`;
    code += `4. **Check Windows Firewall:**\n`;
    code += `   \`\`\`bash\n   netsh advfirewall firewall add rule name="Spring Boot" dir=in action=allow protocol=TCP localport=8080\n   \`\`\`\n\n`;
    
    code += `### Build Issues\n\n`;
    code += `**Symptom:** "Build failed" or compilation errors\n\n`;
    code += `**Solution:**\n`;
    code += `\`\`\`bash\n`;
    code += `flutter clean\n`;
    code += `flutter pub get\n`;
    code += `flutter pub run build_runner build --delete-conflicting-outputs\n`;
    code += `flutter run\n`;
    code += `\\\`\\\`\\\`\n\n`;
    
    code += `### Hot Reload Not Working\n\n`;
    code += `API URL changes require **hot restart** (\\\`R\\\`), not hot reload (\\\`r\\\`):\n\n`;
    code += `- Press \`R\` (capital R) in terminal, or\n`;
    code += `- Stop app and run \`flutter run\` again\n\n`;
    
    code += `### JSON Serialization Errors\n\n`;
    code += `**Symptom:** "Missing part directive" or "undefined_function"\n\n`;
    code += `**Solution:**\n`;
    code += `\`\`\`bash\n`;
    code += `flutter pub run build_runner build --delete-conflicting-outputs\n`;
    code += `\`\`\`\n\n`;
    code += `---\n\n`;
    
    code += `## 📦 Generated Features\n\n`;
    code += `${this.config.features.enablePagination ? '✅ Pagination enabled' : '❌ Pagination disabled'}\n`;
    code += `${this.config.features.enableSearch ? '✅ Search enabled' : '❌ Search disabled'}\n`;
    code += `${this.config.features.enableFilters ? '✅ Filters enabled' : '❌ Filters disabled'}\n`;
    code += `${this.config.features.enableOfflineMode ? '✅ Offline mode enabled' : '❌ Offline mode disabled'}\n\n`;
    code += `- ✅ CRUD operations for all entities\n`;
    code += `- ✅ Form validation\n`;
    code += `- ✅ Foreign key selectors with modal dialogs\n`;
    code += `- ✅ ${this.config.navigation.type === 'drawer' ? 'Drawer' : 'Bottom'} navigation\n`;
    code += `- ✅ ${this.capitalizeFirst(this.config.stateManagement)} state management\n`;
    code += `- ✅ JSON serialization with build_runner\n`;
    code += `- ✅ Error handling and loading states\n\n`;
    code += `---\n\n`;
    
    code += `## 🚀 Next Steps\n\n`;
    code += `1. Customize theme colors in \`lib/main.dart\`\n`;
    code += `2. Add custom business logic in providers\n`;
    code += `3. Enhance UI in screen files\n`;
    code += `4. Add more validations in forms\n`;
    code += `5. Implement authentication (if needed)\n`;
    code += `6. Add unit tests\n`;
    code += `7. Configure app icon and splash screen\n\n`;
    code += `---\n\n`;
    
    code += `## 📄 License\n\n`;
    code += `Generated by UML to Flutter Code Generator\n`;

    files.set('README.md', code);
  }

  // ==========================================================================
  // UPDATE SCRIPTS GENERATION
  // ==========================================================================

  private generateUpdateScripts(files: Map<string, string>): void {
    // Generate Windows batch script
    const windowsScript = `@echo off
echo ========================================
echo   Flutter API URL Auto-Update Script
echo ========================================
echo.
echo Detecting your PC IP address...
echo.

REM Find IPv4 address starting with 192.168
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4.*192.168"') do (
    set IP=%%a
    goto :found
)

REM If not found, try 10.0 range
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4.*10.0"') do (
    set IP=%%a
    goto :found
)

REM If not found, try 172.16-31 range
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4.*172"') do (
    set IP=%%a
    goto :found
)

echo ❌ ERROR: Could not detect IP address
echo.
echo Please run 'ipconfig' manually and look for your IPv4 Address
echo Then update lib\\services\\api_service.dart manually
echo.
pause
exit /b 1

:found
REM Remove leading/trailing spaces
set IP=%IP: =%

echo ✅ Detected IP: %IP%
echo.
echo Updating API URL in lib/services/api_service.dart...
echo.

REM Update the baseUrl in api_service.dart
powershell -Command "(Get-Content lib\\services\\api_service.dart) -replace 'http://[0-9.]+:8080', 'http://%IP%:8080' | Set-Content lib\\services\\api_service.dart"

echo.
echo ========================================
echo ✅ SUCCESS!
echo ========================================
echo.
echo API URL updated to: http://%IP%:8080/api/v1
echo.
echo Next steps:
echo   1. Make sure your Spring Boot backend is running
echo   2. Verify backend is accessible: curl http://%IP%:8080/api/health
echo   3. If app is already running, press 'R' (hot restart)
echo   4. If not running yet: flutter run
echo.
pause
`;

    // Generate Linux/Mac bash script
    const unixScript = `#!/bin/bash

echo "========================================"
echo "  Flutter API URL Auto-Update Script"
echo "========================================"
echo ""
echo "Detecting your PC IP address..."
echo ""

# Try to detect IP address (prioritize 192.168.x.x)
IP=$(ifconfig 2>/dev/null | grep "inet " | grep -v 127.0.0.1 | grep "192.168" | awk '{print $2}' | head -n 1)

# If not found, try ip command (Linux)
if [ -z "$IP" ]; then
    IP=$(ip addr show 2>/dev/null | grep "inet " | grep -v 127.0.0.1 | grep "192.168" | awk '{print $2}' | cut -d'/' -f1 | head -n 1)
fi

# If still not found, try any non-localhost IP
if [ -z "$IP" ]; then
    IP=$(ifconfig 2>/dev/null | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
fi

if [ -z "$IP" ]; then
    IP=$(ip addr show 2>/dev/null | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d'/' -f1 | head -n 1)
fi

# Check if IP was found
if [ -z "$IP" ]; then
    echo "❌ ERROR: Could not detect IP address"
    echo ""
    echo "Please run 'ifconfig' or 'ip addr' manually and look for your IP"
    echo "Then update lib/services/api_service.dart manually"
    echo ""
    exit 1
fi

echo "✅ Detected IP: $IP"
echo ""
echo "Updating API URL in lib/services/api_service.dart..."
echo ""

# Backup original file
cp lib/services/api_service.dart lib/services/api_service.dart.bak

# Update the baseUrl in api_service.dart
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS uses BSD sed
    sed -i '' "s|baseUrl = 'http://[0-9.]*:8080|baseUrl = 'http://$IP:8080|g" lib/services/api_service.dart
else
    # Linux uses GNU sed
    sed -i "s|baseUrl = 'http://[0-9.]*:8080|baseUrl = 'http://$IP:8080|g" lib/services/api_service.dart
fi

echo ""
echo "========================================"
echo "✅ SUCCESS!"
echo "========================================"
echo ""
echo "API URL updated to: http://$IP:8080/api/v1"
echo ""
echo "Next steps:"
echo "  1. Make sure your Spring Boot backend is running"
echo "  2. Verify backend is accessible: curl http://$IP:8080/api/health"
echo "  3. If app is already running, press 'R' (hot restart)"
echo "  4. If not running yet: flutter run"
echo ""
`;

    files.set('update_api_url.bat', windowsScript);
    files.set('update_api_url.sh', unixScript);
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  private mapUMLTypeToDart(umlType: string): string {
    const typeMap: Record<string, string> = {
      'String': 'String',
      'string': 'String',
      'Integer': 'int',
      'int': 'int',
      'Long': 'int',
      'long': 'int',
      'Double': 'double',
      'double': 'double',
      'Float': 'double',
      'float': 'double',
      'Boolean': 'bool',
      'boolean': 'bool',
      'bool': 'bool',
      'Date': 'DateTime',
      'LocalDate': 'DateTime',
      'LocalDateTime': 'DateTime',
      'BigDecimal': 'double',
    };

    return typeMap[umlType] || 'String';
  }

  private toSnakeCase(str: string): string {
    return str
      .replace(/\s+/g, '_')  // Replace spaces with underscores first
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
      .replace(/_+/g, '_');  // Replace multiple underscores with single
  }

  private getEndpoint(className: string): string {
    // Spring Boot generates endpoints in lowercase without separators and always adds 's' at the end
    // Examples: 
    // - "Shopping Cart" → "shoppingcarts"
    // - "OrderDetails" → "orderdetailss" (double s)
    // - "Orders" → "orderss" (double s)
    // - "User" → "users"
    return className
      .replace(/\s+/g, '')        // Remove all spaces: "Shopping Cart" → "ShoppingCart"
      .toLowerCase()              // Convert to lowercase: "ShoppingCart" → "shoppingcart"
      + 's';                      // Always add 's' at the end
  }

  private extractRelatedEntityName(fieldName: string): string {
    // Extract entity name from foreign key field name
    // Examples:
    // - "customerId" → "Customer"
    // - "userId" → "User"
    // - "orderId" → "Order"
    // - "shoppingCartId" → "ShoppingCart"
    
    // Remove 'Id' suffix (case insensitive)
    let entityName = fieldName.replace(/Id$/i, '');
    
    // Capitalize first letter
    return this.capitalizeFirst(entityName);
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Check if an entity exists in the diagram
   * Also checks plural/singular variations
   */
  private entityExists(entityName: string): boolean {
    const sanitizedName = this.sanitizeClassName(entityName);
    const lowerName = sanitizedName.toLowerCase();
    
    return this.nodes.some(node => {
      const nodeName = this.sanitizeClassName(node.data.label);
      const lowerNodeName = nodeName.toLowerCase();
      
      // Exact match
      if (lowerNodeName === lowerName) return true;
      
      // Check plural: "Order" vs "Orders"
      if (lowerNodeName === lowerName + 's') return true;
      if (lowerNodeName + 's' === lowerName) return true;
      
      // Check "ies" ending: "Category" vs "Categories"
      if (lowerNodeName === lowerName.replace(/y$/, 'ies')) return true;
      if (lowerNodeName.replace(/y$/, 'ies') === lowerName) return true;
      
      return false;
    });
  }
  
  /**
   * Find the actual entity name in the diagram (handles plural/singular)
   */
  private findActualEntityName(entityName: string): string | null {
    const sanitizedName = this.sanitizeClassName(entityName);
    const lowerName = sanitizedName.toLowerCase();
    
    const foundNode = this.nodes.find(node => {
      const nodeName = this.sanitizeClassName(node.data.label);
      const lowerNodeName = nodeName.toLowerCase();
      
      // Exact match
      if (lowerNodeName === lowerName) return true;
      
      // Check plural: "Order" vs "Orders"
      if (lowerNodeName === lowerName + 's') return true;
      if (lowerNodeName + 's' === lowerName) return true;
      
      // Check "ies" ending: "Category" vs "Categories"
      if (lowerNodeName === lowerName.replace(/y$/, 'ies')) return true;
      if (lowerNodeName.replace(/y$/, 'ies') === lowerName) return true;
      
      return false;
    });
    
    return foundNode ? this.sanitizeClassName(foundNode.data.label) : null;
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE CREATOR
// ============================================================================

export const generateFlutterProject = (
  nodes: any[],
  edges: any[],
  config: FlutterProjectConfig
): Map<string, string> => {
  const generator = new FlutterGeneratorService(nodes, edges, config);
  return generator.generateFlutterProject();
};
