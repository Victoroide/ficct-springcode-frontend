// @ts-nocheck - Complex generation component
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight, 
  ArrowLeft, 
  Package, 
  Settings, 
  Zap,
  CheckCircle,
  Network
} from 'lucide-react';
import { useListDiagramsQuery } from '@/store/api/umlApi';
import { useCreateRequestMutation } from '@/store/api/generationApi';

interface GenerationWizardProps {
  onComplete: (requestId: string) => void;
}

export function GenerationWizard({ onComplete }: GenerationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    project: '',
    diagram: '',
    generationType: 'FULL_PROJECT',
    generationConfig: {
      javaVersion: '17',
      springBootVersion: '3.1.x',
      packageName: 'com.example.demo',
      groupId: 'com.example',
      artifactId: 'demo-project',
      projectName: 'Demo Project',
      projectDescription: '',
      dependencies: ['spring-boot-starter-web', 'spring-boot-starter-data-jpa'],
      databaseType: 'H2',
      buildTool: 'Maven',
      packaging: 'jar',
      enableSecurity: false,
      enableSwagger: true,
      enableActuator: true,
      enableTestContainers: false
    },
    selectedClasses: []
  });

  const { data: diagramsData } = useListDiagramsQuery({ pagesize: 50 });
  const [createRequest] = useCreateRequestMutation();

  const diagrams = diagramsData?.results || [];

  const steps = [
    { id: 'diagram', title: 'Diagrama UML', icon: <Network className="h-4 w-4" /> },
    { id: 'config', title: 'Configuración', icon: <Settings className="h-4 w-4" /> },
    { id: 'dependencies', title: 'Dependencias', icon: <Package className="h-4 w-4" /> },
    { id: 'review', title: 'Revisar', icon: <CheckCircle className="h-4 w-4" /> }
  ];

  const availableDependencies = [
    { id: 'spring-boot-starter-web', name: 'Spring Web', description: 'RESTful web services' },
    { id: 'spring-boot-starter-data-jpa', name: 'Spring Data JPA', description: 'Persistence with JPA' },
    { id: 'spring-boot-starter-security', name: 'Spring Security', description: 'Authentication & authorization' },
    { id: 'spring-boot-starter-validation', name: 'Validation', description: 'Bean validation' },
    { id: 'spring-boot-starter-test', name: 'Spring Boot Test', description: 'Testing framework' },
    { id: 'spring-boot-starter-actuator', name: 'Spring Actuator', description: 'Production monitoring' },
    { id: 'springdoc-openapi-starter-webmvc-ui', name: 'OpenAPI (Swagger)', description: 'API documentation' },
    { id: 'spring-boot-starter-cache', name: 'Spring Cache', description: 'Caching abstraction' },
    { id: 'spring-boot-starter-mail', name: 'Spring Mail', description: 'Email support' }
  ];

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const request = await createRequest(formData).unwrap();
      onComplete(request.id);
    } catch (error) {
      console.error('Error creating generation request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateConfig = (updates) => {
    setFormData(prev => ({
      ...prev,
      generationConfig: { ...prev.generationConfig, ...updates }
    }));
  };

  const toggleDependency = (depId) => {
    const current = formData.generationConfig.dependencies;
    const updated = current.includes(depId)
      ? current.filter(id => id !== depId)
      : [...current, depId];
    
    updateConfig({ dependencies: updated });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
              <h3 className="text-md font-medium text-blue-800 mb-2 flex items-center gap-2">
                <Network className="h-5 w-5" />
                Selecciona un diagrama UML para generar código
              </h3>
              <p className="text-sm text-blue-600">
                El generador de código analizará el diagrama UML y creará un proyecto SpringBoot 
                con todas las clases, relaciones y atributos definidos en tu diagrama.  
              </p>
            </div>
            
            <div>
              <Label htmlFor="diagram-select" className="text-lg font-medium">Seleccionar Diagrama UML</Label>
              
              {diagrams.length === 0 ? (
                <div className="mt-4 border border-dashed border-slate-300 rounded-md p-6 text-center">
                  <Network className="mx-auto h-12 w-12 text-slate-400" />
                  <h4 className="mt-2 text-lg font-medium">No hay diagramas disponibles</h4>
                  <p className="mt-1 text-slate-500 text-sm max-w-md mx-auto">
                    Primero debes crear un diagrama UML en la sección de Diagramas UML.  
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/dashboard/uml'}>
                    Ir a crear diagrama UML
                  </Button>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-3">
                  {diagrams.map(diagram => (
                    <div 
                      key={diagram.id}
                      onClick={() => updateFormData({ diagram: diagram.id })}
                      className={`p-4 border rounded-md flex items-center gap-3 cursor-pointer transition-all ${
                        formData.diagram === diagram.id 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className={`p-2 rounded-md ${
                        formData.diagram === diagram.id 
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-slate-100 text-slate-600'
                        }`}>
                        <Network className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          formData.diagram === diagram.id ? 'text-blue-700' : ''
                        }`}>{diagram.name}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-3">
                          <span>{diagram.elements?.length || 0} clases</span>
                          <span>{diagram.relationships?.length || 0} relaciones</span>
                          <span>Creado el {new Date(diagram.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {formData.diagram === diagram.id && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="generation-type">Tipo de Generación</Label>
              <Select value={formData.generationType} onValueChange={(value) => updateFormData({ generationType: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_PROJECT">Proyecto Completo</SelectItem>
                  <SelectItem value="ENTITIES_ONLY">Solo Entidades</SelectItem>
                  <SelectItem value="REPOSITORIES_ONLY">Solo Repositorios</SelectItem>
                  <SelectItem value="SERVICES_ONLY">Solo Servicios</SelectItem>
                  <SelectItem value="CONTROLLERS_ONLY">Solo Controladores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project-name">Nombre del Proyecto</Label>
                <Input
                  id="project-name"
                  value={formData.generationConfig.projectName}
                  onChange={(e) => updateConfig({ projectName: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="artifact-id">Artifact ID</Label>
                <Input
                  id="artifact-id"
                  value={formData.generationConfig.artifactId}
                  onChange={(e) => updateConfig({ artifactId: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="group-id">Group ID</Label>
                <Input
                  id="group-id"
                  value={formData.generationConfig.groupId}
                  onChange={(e) => updateConfig({ groupId: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="package-name">Paquete Base</Label>
                <Input
                  id="package-name"
                  value={formData.generationConfig.packageName}
                  onChange={(e) => updateConfig({ packageName: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="java-version">Versión de Java</Label>
                <Select value={formData.generationConfig.javaVersion} onValueChange={(value) => updateConfig({ javaVersion: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">Java 8</SelectItem>
                    <SelectItem value="11">Java 11</SelectItem>
                    <SelectItem value="17">Java 17</SelectItem>
                    <SelectItem value="21">Java 21</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="spring-version">Spring Boot</Label>
                <Select value={formData.generationConfig.springBootVersion} onValueChange={(value) => updateConfig({ springBootVersion: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2.7.x">Spring Boot 2.7.x</SelectItem>
                    <SelectItem value="3.0.x">Spring Boot 3.0.x</SelectItem>
                    <SelectItem value="3.1.x">Spring Boot 3.1.x</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="build-tool">Herramienta de Build</Label>
                <Select value={formData.generationConfig.buildTool} onValueChange={(value) => updateConfig({ buildTool: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maven">Maven</SelectItem>
                    <SelectItem value="Gradle">Gradle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="database">Base de Datos</Label>
                <Select value={formData.generationConfig.databaseType} onValueChange={(value) => updateConfig({ databaseType: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="H2">H2 (Memoria)</SelectItem>
                    <SelectItem value="MySQL">MySQL</SelectItem>
                    <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                    <SelectItem value="MongoDB">MongoDB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción del Proyecto</Label>
              <textarea
                id="description"
                value={formData.generationConfig.projectDescription}
                onChange={(e) => updateConfig({ projectDescription: e.target.value })}
                className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                rows={3}
                placeholder="Descripción opcional del proyecto..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Dependencias de Spring Boot</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableDependencies.map(dep => (
                  <div key={dep.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Checkbox
                      checked={formData.generationConfig.dependencies.includes(dep.id)}
                      onCheckedChange={() => toggleDependency(dep.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{dep.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{dep.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-4">Características Adicionales</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.generationConfig.enableSecurity}
                    onCheckedChange={(checked) => updateConfig({ enableSecurity: checked })}
                  />
                  <Label>Habilitar Spring Security</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.generationConfig.enableSwagger}
                    onCheckedChange={(checked) => updateConfig({ enableSwagger: checked })}
                  />
                  <Label>Incluir documentación Swagger</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.generationConfig.enableActuator}
                    onCheckedChange={(checked) => updateConfig({ enableActuator: checked })}
                  />
                  <Label>Spring Boot Actuator</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.generationConfig.enableTestContainers}
                    onCheckedChange={(checked) => updateConfig({ enableTestContainers: checked })}
                  />
                  <Label>TestContainers para pruebas</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: {
        // Encontrar el diagrama seleccionado
        const selectedDiagram = diagrams.find(d => d.id === formData.diagram);
        
        return (
          <div className="space-y-6">
            {/* Sección de diagrama UML */}
            <Card>
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-blue-600" />
                  Diagrama UML Seleccionado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {selectedDiagram ? (
                  <div>
                    <h3 className="text-lg font-medium">{selectedDiagram.name}</h3>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <Badge variant="outline" className="px-2 py-1">
                        {selectedDiagram.elements?.length || 0} Clases
                      </Badge>
                      <Badge variant="outline" className="px-2 py-1">
                        {selectedDiagram.relationships?.length || 0} Relaciones
                      </Badge>
                      <span className="text-slate-500">
                        Creado el {new Date(selectedDiagram.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <span className="text-slate-500 text-sm">Tipo de generación:</span>
                      <Badge className="ml-2">
                        {{
                          'FULL_PROJECT': 'Proyecto Completo',
                          'ENTITIES_ONLY': 'Solo Entidades',
                          'REPOSITORIES_ONLY': 'Solo Repositorios',
                          'SERVICES_ONLY': 'Solo Servicios',
                          'CONTROLLERS_ONLY': 'Solo Controladores',
                        }[formData.generationType] || formData.generationType}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-red-600">
                    No se ha seleccionado un diagrama UML.
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Sección de configuración */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slate-600" />
                  Configuración del Proyecto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Proyecto:</span>
                    <div className="font-medium">{formData.generationConfig.projectName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Artifact ID:</span>
                    <div className="font-medium">{formData.generationConfig.artifactId}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Java:</span>
                    <div className="font-medium">Java {formData.generationConfig.javaVersion}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Spring Boot:</span>
                    <div className="font-medium">{formData.generationConfig.springBootVersion}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Build:</span>
                    <div className="font-medium">{formData.generationConfig.buildTool}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Base de Datos:</span>
                    <div className="font-medium">{formData.generationConfig.databaseType}</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Dependencias seleccionadas:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.generationConfig.dependencies.map(dep => (
                      <Badge key={dep} variant="outline" className="text-xs">
                        {availableDependencies.find(d => d.id === dep)?.name || dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                index <= currentStep
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-slate-300 text-slate-400 dark:border-slate-600'
              }`}>
                {index < currentStep ? <CheckCircle className="h-4 w-4" /> : step.icon}
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${
                  index <= currentStep ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-px mx-4 ${
                  index < currentStep ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} disabled={!formData.diagram}>
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting || !formData.diagram}>
                {isSubmitting ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-pulse" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generar Código
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
