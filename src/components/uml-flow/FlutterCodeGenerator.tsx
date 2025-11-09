/**
 * FlutterCodeGenerator.tsx
 * Component for generating Flutter code from UML diagram
 * Follows the same pattern as CodeGenerator.tsx (Spring Boot)
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { 
  FlutterProjectConfig,
  NavigationType,
  StateManagementType,
  ThemeType
} from '@/types/flutterGeneration';
import { FlutterGeneratorService } from '@/services/flutterGeneratorService';
import { DownloadService } from '@/services/downloadService';
import { toast } from '@/components/ui/toast-service';
import { Download, FileText, Smartphone, Code, Palette } from 'lucide-react';

interface FlutterCodeGeneratorProps {
  nodes: any[];
  edges: any[];
  isOpen: boolean;
  onClose: () => void;
}

const FlutterCodeGenerator: React.FC<FlutterCodeGeneratorProps> = ({ 
  nodes, 
  edges, 
  isOpen, 
  onClose 
}) => {
  const [currentStep, setCurrentStep] = useState<'config' | 'preview'>('config');
  const [generatedFiles, setGeneratedFiles] = useState<Map<string, string>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('');
  
  const [config, setConfig] = useState<FlutterProjectConfig>({
    projectName: 'flutter_app',
    packageName: 'com.example.flutter_app',
    description: 'Generated Flutter app from UML diagram',
    version: '1.0.0',
    author: 'Anonymous',
    
    theme: {
      themeMode: 'material3',
      primaryColor: '#2196F3',
      secondaryColor: '#FF9800',
      useDarkMode: false,
    },
    
    navigation: {
      type: 'drawer',
      showAppBar: true,
    },
    
    stateManagement: 'provider',
    
    apiConfig: {
      baseUrl: 'http://192.168.0.5:8080/api/v1',  // Change to your PC's IP address
      timeout: 60000,  // 60 seconds timeout
    },
    
    features: {
      enableOfflineMode: false,
      enablePagination: true,
      itemsPerPage: 20,
      enableSearch: false,
      enableFilters: false,
    }
  });
  
  const handleConfigChange = (key: keyof FlutterProjectConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const handleNestedConfigChange = (
    parent: keyof FlutterProjectConfig,
    key: string,
    value: any
  ) => {
    setConfig({
      ...config,
      [parent]: {
        ...(config[parent] as any),
        [key]: value
      }
    });
  };
  
  const validateConfig = (): boolean => {
    // Validate project name (snake_case)
    if (!/^[a-z0-9_]+$/.test(config.projectName)) {
      toast({
        title: 'Invalid Project Name',
        description: 'Project name must be lowercase with underscores only (snake_case)',
        variant: 'error'
      });
      return false;
    }
    
    // Validate package name
    if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(config.packageName)) {
      toast({
        title: 'Invalid Package Name',
        description: 'Package name must follow format: com.example.app',
        variant: 'error'
      });
      return false;
    }
    
    // Validate colors
    if (!/^#[0-9A-F]{6}$/i.test(config.theme.primaryColor)) {
      toast({
        title: 'Invalid Primary Color',
        description: 'Color must be in hex format: #RRGGBB',
        variant: 'error'
      });
      return false;
    }
    
    return true;
  };
  
  const generateCode = async () => {
    if (nodes.length === 0) {
      toast({
        title: 'No Diagrams',
        description: 'Create at least one class in the UML diagram before generating code.',
        variant: 'info'
      });
      return;
    }
    
    if (!validateConfig()) {
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const generator = new FlutterGeneratorService(nodes, edges, config);
      const files = generator.generateFlutterProject();
      
      setGeneratedFiles(files);
      setCurrentStep('preview');
      
      // Set first file as selected
      if (files.size > 0) {
        setSelectedFile(Array.from(files.keys())[0]);
      }
      
      toast({
        title: 'Code Generated Successfully',
        description: `${files.size} files generated. Review and download.`,
        variant: 'success'
      });
      
    } catch (error) {
      console.error('Error generating Flutter code:', error);
      toast({
        title: 'Generation Error',
        description: error instanceof Error ? error.message : 'Failed to generate code',
        variant: 'error'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownload = async () => {
    try {
      await DownloadService.downloadFlutterProject(generatedFiles, config.projectName);
      
      toast({
        title: 'Download Complete',
        description: `${config.projectName}.zip downloaded successfully`,
        variant: 'success'
      });
      
    } catch (error) {
      console.error('Error downloading:', error);
      toast({
        title: 'Download Error',
        description: 'Failed to download project',
        variant: 'error'
      });
    }
  };
  
  const handleClose = () => {
    setCurrentStep('config');
    setGeneratedFiles(new Map());
    setSelectedFile('');
    onClose();
  };
  
  const renderConfigStep = () => (
    <div className="space-y-6">
      <Tabs defaultValue="project" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="project">Project</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="state">State</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>
        
        {/* Project Info Tab */}
        <TabsContent value="project" className="space-y-4">
          <div>
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={config.projectName}
              onChange={(e) => handleConfigChange('projectName', e.target.value)}
              placeholder="flutter_app"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use snake_case (lowercase with underscores)
            </p>
          </div>
          
          <div>
            <Label htmlFor="packageName">Package Name</Label>
            <Input
              id="packageName"
              value={config.packageName}
              onChange={(e) => handleConfigChange('packageName', e.target.value)}
              placeholder="com.example.flutter_app"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: com.company.app
            </p>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={config.description}
              onChange={(e) => handleConfigChange('description', e.target.value)}
              placeholder="My Flutter app"
            />
          </div>
          
          <div>
            <Label htmlFor="baseUrl">Backend API URL</Label>
            <Input
              id="baseUrl"
              value={config.apiConfig.baseUrl}
              onChange={(e) => handleNestedConfigChange('apiConfig', 'baseUrl', e.target.value)}
              placeholder="http://192.168.0.5:8080/api/v1"
            />
            <p className="text-xs text-gray-500 mt-1">
              📱 <strong>Dispositivo físico:</strong> Usa la IP de tu PC (ej: 192.168.0.5)<br/>
              💻 <strong>Emulador Android:</strong> Usa 10.0.2.2<br/>
              🍎 <strong>Simulador iOS:</strong> Usa localhost<br/>
              ⚠️ Incluir /api/v1 si tu backend lo requiere
            </p>
          </div>
          
          <div>
            <Label htmlFor="timeout">Request Timeout (ms)</Label>
            <Input
              id="timeout"
              type="number"
              value={config.apiConfig.timeout}
              onChange={(e) => handleNestedConfigChange('apiConfig', 'timeout', parseInt(e.target.value))}
              placeholder="60000"
              min={5000}
              max={300000}
            />
            <p className="text-xs text-gray-500 mt-1">
              Tiempo máximo de espera para las peticiones (60000ms = 1 minuto)
            </p>
          </div>
        </TabsContent>
        
        {/* Theme Tab */}
        <TabsContent value="theme" className="space-y-4">
          <div>
            <Label htmlFor="themeMode">Theme Mode</Label>
            <select
              id="themeMode"
              value={config.theme.themeMode}
              onChange={(e) => handleNestedConfigChange('theme', 'themeMode', e.target.value as ThemeType)}
              className="w-full p-2 border rounded"
            >
              <option value="material3">Material 3</option>
              <option value="cupertino">Cupertino (iOS)</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={config.theme.primaryColor}
                onChange={(e) => handleNestedConfigChange('theme', 'primaryColor', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={config.theme.primaryColor}
                onChange={(e) => handleNestedConfigChange('theme', 'primaryColor', e.target.value)}
                placeholder="#2196F3"
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                type="color"
                value={config.theme.secondaryColor}
                onChange={(e) => handleNestedConfigChange('theme', 'secondaryColor', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={config.theme.secondaryColor}
                onChange={(e) => handleNestedConfigChange('theme', 'secondaryColor', e.target.value)}
                placeholder="#FF9800"
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="darkMode"
              checked={config.theme.useDarkMode}
              onCheckedChange={(checked) => handleNestedConfigChange('theme', 'useDarkMode', checked)}
            />
            <Label htmlFor="darkMode">Enable Dark Mode</Label>
          </div>
        </TabsContent>
        
        {/* Navigation Tab */}
        <TabsContent value="navigation" className="space-y-4">
          <div>
            <Label htmlFor="navType">Navigation Type</Label>
            <select
              id="navType"
              value={config.navigation.type}
              onChange={(e) => handleNestedConfigChange('navigation', 'type', e.target.value as NavigationType)}
              className="w-full p-2 border rounded"
            >
              <option value="drawer">Drawer (Side Menu)</option>
              <option value="bottomNav">Bottom Navigation Bar</option>
              <option value="tabs">Tabs</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="showAppBar"
              checked={config.navigation.showAppBar}
              onCheckedChange={(checked) => handleNestedConfigChange('navigation', 'showAppBar', checked)}
            />
            <Label htmlFor="showAppBar">Show App Bar</Label>
          </div>
        </TabsContent>
        
        {/* State Management Tab */}
        <TabsContent value="state" className="space-y-4">
          <div>
            <Label htmlFor="stateManagement">State Management</Label>
            <select
              id="stateManagement"
              value={config.stateManagement}
              onChange={(e) => handleConfigChange('stateManagement', e.target.value as StateManagementType)}
              className="w-full p-2 border rounded"
            >
              <option value="provider">Provider (Recommended)</option>
              <option value="riverpod">Riverpod</option>
              <option value="bloc">BLoC</option>
              <option value="getx">GetX</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Provider is recommended for simplicity
            </p>
          </div>
        </TabsContent>
        
        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="pagination"
              checked={config.features.enablePagination}
              onCheckedChange={(checked) => handleNestedConfigChange('features', 'enablePagination', checked)}
            />
            <Label htmlFor="pagination">Enable Pagination</Label>
          </div>
          
          {config.features.enablePagination && (
            <div>
              <Label htmlFor="itemsPerPage">Items Per Page</Label>
              <Input
                id="itemsPerPage"
                type="number"
                value={config.features.itemsPerPage}
                onChange={(e) => handleNestedConfigChange('features', 'itemsPerPage', parseInt(e.target.value))}
                min={1}
                max={100}
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch
              id="search"
              checked={config.features.enableSearch}
              onCheckedChange={(checked) => handleNestedConfigChange('features', 'enableSearch', checked)}
            />
            <Label htmlFor="search">Enable Search</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="filters"
              checked={config.features.enableFilters}
              onCheckedChange={(checked) => handleNestedConfigChange('features', 'enableFilters', checked)}
            />
            <Label htmlFor="filters">Enable Filters</Label>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
  
  const renderPreviewStep = () => {
    const fileEntries = Array.from(generatedFiles.entries());
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4" style={{ height: '500px' }}>
          {/* File Tree */}
          <div className="col-span-1 border rounded p-4 overflow-auto">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Files ({fileEntries.length})
            </h3>
            <div className="space-y-1">
              {fileEntries.map(([filename]) => (
                <button
                  key={filename}
                  onClick={() => setSelectedFile(filename)}
                  className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-100 ${
                    selectedFile === filename ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  {filename}
                </button>
              ))}
            </div>
          </div>
          
          {/* Code Viewer */}
          <div className="col-span-2 border rounded p-4 overflow-auto">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Code className="w-4 h-4" />
              {selectedFile || 'Select a file'}
            </h3>
            {selectedFile && (
              <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto">
                <code>{generatedFiles.get(selectedFile)}</code>
              </pre>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">
            <strong>{fileEntries.length}</strong> files generated
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentStep('config')}>
              Back to Config
            </Button>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download ZIP
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            {currentStep === 'config' ? 'Configure Flutter Project' : 'Preview Generated Code'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'config' 
              ? 'Configure your Flutter project settings and generate code from UML diagram'
              : 'Review generated files and download project'
            }
          </DialogDescription>
        </DialogHeader>
        
        {currentStep === 'config' && renderConfigStep()}
        {currentStep === 'preview' && renderPreviewStep()}
        
        {currentStep === 'config' && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={generateCode} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate Code'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FlutterCodeGenerator;
