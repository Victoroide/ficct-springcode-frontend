/**
 * Flutter Generation Types
 * Type definitions for Flutter project generation (client-side)
 */

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export type NavigationType = 'drawer' | 'bottomNav' | 'tabs';
export type StateManagementType = 'provider' | 'riverpod' | 'bloc' | 'getx';
export type ThemeType = 'material3' | 'cupertino';

export interface ThemeConfig {
  themeMode: ThemeType;
  primaryColor: string;      // #RRGGBB
  secondaryColor: string;    // #RRGGBB
  useDarkMode: boolean;
}

export interface ApiConfig {
  baseUrl: string;           // "http://10.0.2.2:8080" (Android) or "http://localhost:8080" (iOS/Web)
  timeout: number;           // milliseconds
}

export interface FeaturesConfig {
  enableOfflineMode: boolean;
  enablePagination: boolean;
  itemsPerPage: number;
  enableSearch: boolean;
  enableFilters: boolean;
}

export interface FlutterProjectConfig {
  projectName: string;       // snake_case: "erp_inventory"
  packageName: string;       // "com.example.erp_inventory"
  description: string;
  version: string;           // "1.0.0"
  author: string;
  
  theme: ThemeConfig;
  navigation: {
    type: NavigationType;
    showAppBar: boolean;
  };
  stateManagement: StateManagementType;
  apiConfig: ApiConfig;
  features: FeaturesConfig;
}

// ============================================================================
// GENERATED FILES TYPES
// ============================================================================

export interface GeneratedDartFile {
  path: string;              // "lib/models/user.dart"
  content: string;           // Dart code
  type: DartFileType;
}

export type DartFileType = 
  | 'model'
  | 'provider'
  | 'screen_list'
  | 'screen_form'
  | 'service'
  | 'widget'
  | 'main'
  | 'config';

// ============================================================================
// BACKEND API TYPES (matching BACKEND_API_REFERENCE.md)
// ============================================================================

export interface FlutterProjectBackend {
  id: string;                // UUID
  diagram_id: string;        // UUID
  session_id: string;
  project_name: string;
  package_name: string;
  config: {
    theme: ThemeType;
    primary_color: string;
    navigation_type: NavigationType;
    state_management: StateManagementType;
  };
  created_at: string;        // ISO8601
  last_generated: string;    // ISO8601
}

export interface CreateFlutterProjectRequest {
  diagram_id: string;
  session_id: string;
  project_name: string;
  package_name: string;
  config: {
    theme: ThemeType;
    primary_color: string;
    navigation_type: NavigationType;
    state_management: StateManagementType;
  };
}

// ============================================================================
// DART TYPE MAPPING
// ============================================================================

export type UMLToDartTypeMap = {
  'String': 'String';
  'Integer': 'int';
  'int': 'int';
  'Long': 'int';
  'Double': 'double';
  'Float': 'double';
  'Boolean': 'bool';
  'Date': 'DateTime';
  'LocalDate': 'DateTime';
  'LocalDateTime': 'DateTime';
  'BigDecimal': 'double';
  'List': 'List';
  'Set': 'Set';
  'Map': 'Map';
};

// ============================================================================
// GENERATION RESULT
// ============================================================================

export interface FlutterGenerationResult {
  files: Map<string, string>;  // filename -> content
  metadata: {
    totalFiles: number;
    totalLines: number;
    modelsCount: number;
    screensCount: number;
    generatedAt: string;
  };
}
