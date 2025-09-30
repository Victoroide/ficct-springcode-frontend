/**
 * CodeGenerator.tsx
 * Component for generating SpringBoot code from UML diagram
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AVAILABLE_DEPENDENCIES,
  ProgrammingLanguage
} from '@/types/codeGeneration';
import type { 
  SpringBootProjectConfig,
  CodeGenerationResult
} from '@/types/codeGeneration';
import { SimpleCodeGenerator } from '@/services/simpleCodeGenerator';
import { downloadService } from '@/services/downloadService';
import { toast } from '@/components/ui/toast-service';
import { Download, FileText, Package, Code, Database } from 'lucide-react';

interface CodeGeneratorProps {
  nodes: any[];
  edges: any[];
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ nodes, edges }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [generationResult, setGenerationResult] = useState<CodeGenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [config, setConfig] = useState<SpringBootProjectConfig>({
    name: 'SpringBoot UML Project',
    description: 'Generated from UML diagram',
    groupId: 'com.example',
    artifactId: 'uml-project',
    version: '0.0.1-SNAPSHOT',
    javaVersion: '17',
    packaging: 'jar',
    dependencies: [
      AVAILABLE_DEPENDENCIES.find(d => d.id === 'web')!,
      AVAILABLE_DEPENDENCIES.find(d => d.id === 'data-jpa')!,
      AVAILABLE_DEPENDENCIES.find(d => d.id === 'h2')!,
    ],
    language: ProgrammingLanguage.JAVA,
    generateSampleData: true
  });
  
  const handleConfigChange = (key: keyof SpringBootProjectConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };
  
  const handleDependencyToggle = (dependency: any) => {
    const dependencies = [...config.dependencies];
    const index = dependencies.findIndex(d => d.id === dependency.id);
    
    if (index >= 0) {
      // Remove if not required
      if (!dependency.required) {
        dependencies.splice(index, 1);
      }
    } else {
      // Add
      dependencies.push(dependency);
    }
    
    setConfig({ ...config, dependencies });
  };
  
  const generateCode = async () => {
    if (nodes.length === 0) {
      toast({
        title: 'Sin diagramas',
        description: 'Crea al menos una clase en el diagrama UML antes de generar código.',
        variant: 'info'
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      
      const generator = new SimpleCodeGenerator(config, nodes, edges);
      const result = await generator.generateCode();
      
      setGenerationResult(result);
      
      toast({
        title: result.success ? 'Código generado' : 'Error en generación',
        description: result.success 
          ? `Se generaron ${result.files.length} archivos correctamente.`
          : result.errorMessage || 'Error en la generación de código.',
        variant: result.success ? 'success' : 'error'
      });
      
    } catch (error) {
      console.error('Error generating code:', error);
      
      toast({
        title: 'Error de generación',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'error'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const downloadCode = async () => {
    if (!generationResult || !generationResult.success) {
      toast({
        title: 'Error',
        description: 'No hay código generado para descargar.',
        variant: 'error'
      });
      return;
    }
    
    try {
      await downloadService.downloadProject(generationResult, config.name);
      
      toast({
        title: '📦 Descarga ZIP exitosa',
        description: `Proyecto ${config.name}.zip descargado con estructura Maven completa.`,
        variant: 'success'
      });
      
    } catch (error) {
      console.error('Error downloading project:', error);
      toast({
        title: 'Error de descarga',
        description: 'No se pudo descargar el proyecto.',
        variant: 'error'
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={() => setIsOpen(true)} 
          className="bg-green-600 hover:bg-green-700 text-white"
          title="Generate SpringBoot Code - Generate Java code from your UML diagram"
        >
          <Download className="h-4 w-4 mr-2" />
          Generar Código
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generador de Código SpringBoot</DialogTitle>
          <DialogDescription>
            Configura las opciones para generar el código de tu diagrama UML
          </DialogDescription>
        </DialogHeader>
        
        {!generationResult ? (
          <Tabs defaultValue="project" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="project">Proyecto</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencias</TabsTrigger>
              <TabsTrigger value="options">Opciones</TabsTrigger>
            </TabsList>
          
            <TabsContent value="project" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Proyecto</Label>
                  <Input 
                    id="name" 
                    value={config.name} 
                    onChange={(e) => handleConfigChange('name', e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="artifactId">Artifact ID</Label>
                  <Input 
                    id="artifactId" 
                    value={config.artifactId} 
                    onChange={(e) => handleConfigChange('artifactId', e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="groupId">Group ID</Label>
                  <Input 
                    id="groupId" 
                    value={config.groupId} 
                    onChange={(e) => handleConfigChange('groupId', e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="version">Versión</Label>
                  <Input 
                    id="version" 
                    value={config.version} 
                    onChange={(e) => handleConfigChange('version', e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="javaVersion">Versión de Java</Label>
                  <select 
                    id="javaVersion" 
                    className="w-full p-2 border rounded" 
                    value={config.javaVersion} 
                    onChange={(e) => handleConfigChange('javaVersion', e.target.value as any)}
                  >
                    <option value="8">Java 8</option>
                    <option value="11">Java 11</option>
                    <option value="17">Java 17</option>
                    <option value="21">Java 21</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="packaging">Packaging</Label>
                  <select 
                    id="packaging" 
                    className="w-full p-2 border rounded" 
                    value={config.packaging} 
                    onChange={(e) => handleConfigChange('packaging', e.target.value as any)}
                  >
                    <option value="jar">JAR</option>
                    <option value="war">WAR</option>
                  </select>
                </div>
                
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input 
                    id="description" 
                    value={config.description} 
                    onChange={(e) => handleConfigChange('description', e.target.value)} 
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="dependencies">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Selecciona las dependencias de Spring Boot para tu proyecto.
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_DEPENDENCIES.map((dep) => {
                    const isSelected = config.dependencies.some(d => d.id === dep.id);
                    const isRequired = dep.required;
                    
                    return (
                      <div 
                        key={dep.id} 
                        className={`
                          p-3 border rounded 
                          ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} 
                          ${isRequired ? 'opacity-70' : ''}
                        `}
                      >
                        <div className="flex items-start">
                          <Checkbox 
                            id={`dep-${dep.id}`} 
                            checked={isSelected}
                            disabled={isRequired}
                            onCheckedChange={() => handleDependencyToggle(dep)}
                            className="mt-1"
                          />
                          <div className="ml-2">
                            <Label 
                              htmlFor={`dep-${dep.id}`}
                              className="font-medium block"
                            >
                              {dep.name}
                              {isRequired && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                  Requerido
                                </span>
                              )}
                            </Label>
                            <span className="text-xs text-gray-500 block mt-1">
                              {dep.description}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="options">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="sampleData" 
                    checked={config.generateSampleData}
                    onCheckedChange={(checked) => handleConfigChange('generateSampleData', checked)}
                  />
                  <div>
                    <Label htmlFor="sampleData" className="font-medium">
                      Generar datos de ejemplo
                    </Label>
                    <p className="text-sm text-gray-500">
                      Genera datos de ejemplo para probar la aplicación.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Lenguaje</Label>
                  <select 
                    id="language" 
                    className="w-full p-2 border rounded" 
                    value={config.language} 
                    onChange={(e) => handleConfigChange('language', e.target.value as ProgrammingLanguage)}
                  >
                    <option value={ProgrammingLanguage.JAVA}>Java</option>
                    <option value={ProgrammingLanguage.KOTLIN}>Kotlin</option>
                  </select>
                  <p className="text-sm text-gray-500">
                    El soporte para Kotlin está en desarrollo.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Resultado de la generación</h3>
            
            {generationResult.success ? (
              <div className="space-y-4">
                {/* Success message with stats */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Package className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-800">Proyecto generado exitosamente</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-green-600 mr-1" />
                      <span>{generationResult.files.length} archivos</span>
                    </div>
                    <div className="flex items-center">
                      <Code className="h-4 w-4 text-green-600 mr-1" />
                      <span>{downloadService.getProjectStats(generationResult).totalLines} líneas</span>
                    </div>
                  </div>
                </div>
                
                {/* Architecture Overview */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-3 font-medium flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Arquitectura generada
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(downloadService.getProjectStats(generationResult).filesByType).map(([type, count]) => (
                        <div key={type} className="flex justify-between">
                          <span className="capitalize">{type}:</span>
                          <span className="font-medium">{count} archivo{count !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Files List */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-3 font-medium">
                    Archivos generados
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <ul className="divide-y">
                      {generationResult.files.map((file, index) => {
                        const lines = file.content.split('\n').length;
                        return (
                          <li key={index} className="p-3 hover:bg-gray-50 cursor-pointer" title={`Ver contenido de ${file.path}`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-sm">{file.path.split('/').pop()}</div>
                                <div className="text-xs text-gray-500">{file.path}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {file.language}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {lines} línea{lines !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
                
                {/* Quick Setup Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Instrucciones de configuración</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>1. Descarga el proyecto usando el botón "Descargar código"</p>
                    <p>2. Extrae los archivos en tu IDE favorito</p>
                    <p>3. Ejecuta: <code className="bg-white px-1 rounded">mvn spring-boot:run</code></p>
                    <p>4. Visita: <code className="bg-white px-1 rounded">http://localhost:8080/swagger-ui.html</code></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Error en la generación</h4>
                <p className="text-red-700">{generationResult.errorMessage}</p>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter className="flex justify-end gap-2">
          {!generationResult ? (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={generateCode} 
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? 'Generando...' : 'Generar Código'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setGenerationResult(null)}>
                Volver a configuración
              </Button>
              <Button 
                onClick={downloadCode} 
                disabled={!generationResult.success}
                className="bg-green-600 hover:bg-green-700"
              >
                Descargar código
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CodeGenerator;