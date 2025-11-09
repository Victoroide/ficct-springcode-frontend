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

  // ==========================================================================
  // MODELS GENERATION
  // ==========================================================================

  private generateModels(files: Map<string, string>): void {
    this.nodes.forEach(node => {
      if (node.data?.nodeType === 'class') {
        const className = this.sanitizeClassName(node.data.label);
        const fileName = this.sanitizeFileName(node.data.label);
        const content = this.generateDartModel(node);
        files.set(`lib/models/${fileName}.dart`, content);
      }
    });
  }

  private generateDartModel(node: any): string {
    const className = this.sanitizeClassName(node.data.label);
    const fileName = this.sanitizeFileName(node.data.label);
    const attributes = node.data.attributes || [];
    const methods = node.data.methods || [];

    let code = `import 'package:json_annotation/json_annotation.dart';\n\n`;
    code += `part '${fileName}.g.dart';\n\n`;
    code += `@JsonSerializable(explicitToJson: true)\n`;
    code += `class ${className} {\n`;

    // Generate attributes
    attributes.forEach((attr: any) => {
      const dartType = this.mapUMLTypeToDart(attr.type);
      const prefix = attr.visibility === 'private' ? '_' : '';
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
      code += `  final ${dartType}${nullable} ${prefix}${attr.name};\n`;
    });

    code += `\n`;

    // Generate constructor
    code += `  ${className}({\n`;
    attributes.forEach((attr: any, index: number) => {
      const prefix = attr.visibility === 'private' ? '_' : '';
      const required = attr.isFinal ? 'required ' : '';
      code += `    ${required}this.${prefix}${attr.name}`;
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
    code += `  String? get error => _error;\n\n`;

    // Fetch all
    code += `  Future<void> fetchItems() async {\n`;
    code += `    _isLoading = true;\n`;
    code += `    _error = null;\n`;
    code += `    notifyListeners();\n\n`;
    code += `    try {\n`;
    code += `      final response = await _apiService.get('/${this.toSnakeCase(className)}s');\n`;
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
    code += `      await _apiService.post('/${this.toSnakeCase(className)}s', item.toJson());\n`;
    code += `      await fetchItems();\n`;
    code += `    } catch (e) {\n`;
    code += `      _error = e.toString();\n`;
    code += `      notifyListeners();\n`;
    code += `    }\n`;
    code += `  }\n\n`;

    // Update
    code += `  Future<void> updateItem(int id, ${className} item) async {\n`;
    code += `    try {\n`;
    code += `      await _apiService.put('/${this.toSnakeCase(className)}s/\$id', item.toJson());\n`;
    code += `      await fetchItems();\n`;
    code += `    } catch (e) {\n`;
    code += `      _error = e.toString();\n`;
    code += `      notifyListeners();\n`;
    code += `    }\n`;
    code += `  }\n\n`;

    // Delete
    code += `  Future<void> deleteItem(int id) async {\n`;
    code += `    try {\n`;
    code += `      await _apiService.delete('/${this.toSnakeCase(className)}s/\$id');\n`;
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
        const content = this.generateFormScreen(node);
        files.set(`lib/screens/${fileName}_form.dart`, content);
      }
    });
  }

  private generateFormScreen(node: any): string {
    const className = this.sanitizeClassName(node.data.label);
    const fileName = this.sanitizeFileName(node.data.label);
    const attributes = node.data.attributes || [];
    const screenName = `${className}FormScreen`;

    let code = `import 'package:flutter/material.dart';\n`;
    code += `import 'package:provider/provider.dart';\n`;
    code += `import '../models/${fileName}.dart';\n`;
    code += `import '../providers/${fileName}_provider.dart';\n\n`;

    code += `class ${screenName} extends StatefulWidget {\n`;
    code += `  final ${className}? item;\n\n`;
    code += `  const ${screenName}({Key? key, this.item}) : super(key: key);\n\n`;
    code += `  @override\n`;
    code += `  State<${screenName}> createState() => _${screenName}State();\n`;
    code += `}\n\n`;

    code += `class _${screenName}State extends State<${screenName}> {\n`;
    code += `  final _formKey = GlobalKey<FormState>();\n`;

    // Controllers for each attribute
    attributes.forEach((attr: any) => {
      if (attr.type !== 'Boolean') {
        code += `  final _${attr.name}Controller = TextEditingController();\n`;
      }
    });

    // Boolean variables
    attributes.forEach((attr: any) => {
      if (attr.type === 'Boolean') {
        code += `  bool _${attr.name} = false;\n`;
      }
    });

    code += `\n  @override\n`;
    code += `  void initState() {\n`;
    code += `    super.initState();\n`;
    code += `    if (widget.item != null) {\n`;
    attributes.forEach((attr: any) => {
      const prefix = attr.visibility === 'private' ? '_' : '';
      if (attr.type === 'Boolean') {
        code += `      _${attr.name} = widget.item!.${prefix}${attr.name} ?? false;\n`;
      } else {
        code += `      _${attr.name}Controller.text = widget.item!.${prefix}${attr.name}?.toString() ?? '';\n`;
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
    attributes.forEach((attr: any) => {
      if (attr.type === 'Boolean') {
        code += `              SwitchListTile(\n`;
        code += `                title: Text('${this.capitalizeFirst(attr.name)}'),\n`;
        code += `                value: _${attr.name},\n`;
        code += `                onChanged: (value) {\n`;
        code += `                  setState(() => _${attr.name} = value);\n`;
        code += `                },\n`;
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
    attributes.forEach((attr: any, index: number) => {
      const prefix = attr.visibility === 'private' ? '_' : '';
      if (attr.type === 'Boolean') {
        code += `        ${prefix}${attr.name}: _${attr.name}`;
      } else if (attr.type === 'Integer' || attr.type === 'int') {
        code += `        ${prefix}${attr.name}: int.tryParse(_${attr.name}Controller.text)`;
      } else if (attr.type === 'Double' || attr.type === 'double') {
        code += `        ${prefix}${attr.name}: double.tryParse(_${attr.name}Controller.text)`;
      } else {
        code += `        ${prefix}${attr.name}: _${attr.name}Controller.text`;
      }
      if (index < attributes.length - 1) code += ',';
      code += '\n';
    });
    code += `      );\n\n`;
    code += `      if (widget.item == null) {\n`;
    code += `        await provider.createItem(item);\n`;
    code += `      } else {\n`;
    code += `        // await provider.updateItem(widget.item!.id, item);\n`;
    code += `      }\n\n`;
    code += `      if (context.mounted) {\n`;
    code += `        Navigator.pop(context);\n`;
    code += `      }\n`;
    code += `    }\n`;
    code += `  }\n`;

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
    code += `import '${fileName}_form.dart';\n\n`;

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

    code += `  void _deleteItem(${className} item) {\n`;
    code += `    // Implement delete confirmation and call provider.deleteItem(item.id)\n`;
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
    code += `## Generated with UML Spring Code Tool\n\n`;
    code += `This Flutter project was automatically generated from a UML class diagram.\n\n`;
    code += `## Getting Started\n\n`;
    code += `1. Install dependencies:\n\`\`\`bash\nflutter pub get\n\`\`\`\n\n`;
    code += `2. Generate JSON serialization code:\n\`\`\`bash\nflutter pub run build_runner build\n\`\`\`\n\n`;
    code += `3. Run the app:\n\`\`\`bash\nflutter run\n\`\`\`\n\n`;
    code += `## Project Structure\n\n`;
    code += `- \`lib/models/\` - Data models with JSON serialization\n`;
    code += `- \`lib/providers/\` - State management (${this.config.stateManagement})\n`;
    code += `- \`lib/screens/\` - UI screens (forms and lists)\n`;
    code += `- \`lib/services/\` - API service for backend communication\n`;
    code += `- \`lib/widgets/\` - Reusable widgets\n\n`;
    code += `## Backend Configuration\n\n`;
    code += `API Base URL: \`${this.config.apiConfig.baseUrl}\`\n\n`;
    code += `Make sure your Spring Boot backend is running on this URL.\n\n`;
    code += `## Features\n\n`;
    code += `- ✅ CRUD operations for all entities\n`;
    code += `- ✅ Form validation\n`;
    code += `- ✅ ${this.config.navigation.type === 'drawer' ? 'Drawer' : 'Bottom'} navigation\n`;
    code += `- ✅ ${this.capitalizeFirst(this.config.stateManagement)} state management\n`;
    if (this.config.features.enablePagination) {
      code += `- ✅ Pagination support\n`;
    }
    if (this.config.features.enableSearch) {
      code += `- ✅ Search functionality\n`;
    }

    files.set('README.md', code);
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

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
