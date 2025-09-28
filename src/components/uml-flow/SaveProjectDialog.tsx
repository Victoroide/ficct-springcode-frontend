/**
 * SaveProjectDialog.tsx - Dialog para guardar proyectos UML
 */
import React, { useState } from 'react';
import { Save, FolderPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast-service';
import { useCreateProjectMutation, useSaveDiagramToProjectMutation, useGetProjectsQuery } from '@/store/api/realStatsApi';

interface SaveProjectDialogProps {
  nodes: any[];
  edges: any[];
  diagramName?: string;
  onSaveSuccess?: (projectId: string) => void;
}

export const SaveProjectDialog: React.FC<SaveProjectDialogProps> = ({
  nodes,
  edges,
  diagramName = 'Untitled Diagram',
  onSaveSuccess
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [saveMode, setSaveMode] = useState<'new' | 'existing'>('new');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [diagramNameState, setDiagramNameState] = useState(diagramName);
  const [diagramDescription, setDiagramDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // RTK Query hooks
  const [createProject, { isLoading: isCreatingProject }] = useCreateProjectMutation();
  const [saveDiagram, { isLoading: isSavingDiagram }] = useSaveDiagramToProjectMutation();
  const { data: projectsData } = useGetProjectsQuery({ page_size: 50 });

  const isLoading = isCreatingProject || isSavingDiagram;

  const handleSave = async () => {
    try {
      let targetProjectId = selectedProjectId;

      // Create new project if needed
      if (saveMode === 'new') {
        if (!projectName.trim()) {
          toast({
            title: 'Error',
            description: 'El nombre del proyecto es obligatorio',
            variant: 'destructive'
          });
          return;
        }

        const newProject = await createProject({
          name: projectName.trim(),
          description: projectDescription.trim(),
        }).unwrap();

        targetProjectId = newProject.id;
        
        toast({
          title: 'Proyecto creado',
          description: `Proyecto "${newProject.name}" creado exitosamente`,
          variant: 'success'
        });
      } else if (!targetProjectId) {
        toast({
          title: 'Error',
          description: 'Selecciona un proyecto existente',
          variant: 'destructive'
        });
        return;
      }

      // Save diagram to project
      if (!diagramNameState.trim()) {
        toast({
          title: 'Error',
          description: 'El nombre del diagrama es obligatorio',
          variant: 'destructive'
        });
        return;
      }

      await saveDiagram({
        projectId: targetProjectId,
        diagramData: {
          name: diagramNameState.trim(),
          description: diagramDescription.trim(),
          nodes,
          edges,
          uml_type: 'class_diagram'
        }
      }).unwrap();

      toast({
        title: 'Diagrama guardado',
        description: `Diagrama "${diagramNameState}" guardado exitosamente`,
        variant: 'success'
      });

      setIsOpen(false);
      onSaveSuccess?.(targetProjectId);

      // Reset form
      setProjectName('');
      setProjectDescription('');
      setDiagramNameState(diagramName);
      setDiagramDescription('');
      setSelectedProjectId('');
      setSaveMode('new');

    } catch (error: any) {
      console.error('Error saving project:', error);
      toast({
        title: 'Error al guardar',
        description: error.data?.message || 'No se pudo guardar el proyecto',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Guardar Proyecto
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Guardar Proyecto UML
          </DialogTitle>
          <DialogDescription>
            Guarda tu diagrama UML en un proyecto para acceder a él más tarde y generar código.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Save Mode Selection */}
          <div className="space-y-2">
            <Label htmlFor="save-mode">Modo de guardado</Label>
            <Select value={saveMode} onValueChange={(value: 'new' | 'existing') => setSaveMode(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el modo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Crear nuevo proyecto</SelectItem>
                <SelectItem value="existing">Agregar a proyecto existente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Project Selection for Existing Projects */}
          {saveMode === 'existing' && (
            <div className="space-y-2">
              <Label htmlFor="existing-project">Proyecto existente</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projectsData?.results.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {projectsData?.results.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No tienes proyectos existentes. Crea un nuevo proyecto.
                </p>
              )}
            </div>
          )}

          {/* New Project Fields */}
          {saveMode === 'new' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Nombre del proyecto *</Label>
                  <Input
                    id="project-name"
                    placeholder="Mi Proyecto UML"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-description">Descripción del proyecto</Label>
                <Textarea
                  id="project-description"
                  placeholder="Descripción del proyecto (opcional)"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Diagram Details */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-4">Detalles del Diagrama</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diagram-name">Nombre del diagrama *</Label>
                <Input
                  id="diagram-name"
                  placeholder="Mi Diagrama UML"
                  value={diagramNameState}
                  onChange={(e) => setDiagramNameState(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="diagram-description">Descripción del diagrama</Label>
              <Textarea
                id="diagram-description"
                placeholder="Descripción del diagrama (opcional)"
                value={diagramDescription}
                onChange={(e) => setDiagramDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar Proyecto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveProjectDialog;
