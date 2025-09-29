// @ts-nocheck - Complex generation component
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Download, 
  Archive, 
  Trash2, 
  Filter, 
  SortAsc, 
  SortDesc,
  Package,
  Calendar,
  FileText,
  ExternalLink
} from 'lucide-react';
import { 
  useListProjectsQuery, 
  useArchiveProjectMutation, 
  useDeleteProjectMutation,
  useDownloadProjectQuery
} from '@/store/api/generationApi';

interface ProjectManagerProps {
  projects: any[];
  onSelectProject: (project: any) => void;
}

export function ProjectManager({ projects, onSelectProject }: ProjectManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');

  const [archiveProject] = useArchiveProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.packageName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && !project.isArchived) ||
                         (filterStatus === 'archived' && project.isArchived);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      return (new Date(aValue).getTime() - new Date(bValue).getTime()) * multiplier;
    }
    
    return aValue < bValue ? -1 * multiplier : aValue > bValue ? 1 * multiplier : 0;
  });

  const handleArchive = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await archiveProject(projectId).unwrap();
    } catch (error) {
      console.error('Error archiving project:', error);
    }
  };

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) {
      try {
        await deleteProject(projectId).unwrap();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleDownload = async (project: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.downloadUrl) {
      window.open(project.downloadUrl, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="createdAt">Fecha de creación</option>
            <option value="name">Nombre</option>
            <option value="fileSize">Tamaño</option>
            <option value="downloadCount">Descargas</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="archived">Archivados</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                {searchTerm ? 'Sin resultados' : 'Sin proyectos'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-center">
                {searchTerm 
                  ? 'No se encontraron proyectos que coincidan con tu búsqueda.'
                  : 'Aún no has generado ningún proyecto SpringBoot.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map(project => (
            <Card 
              key={project.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectProject(project)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      project.isArchived 
                        ? 'bg-slate-100 dark:bg-slate-700' 
                        : 'bg-green-100 dark:bg-green-900'
                    }`}>
                      <Package className={`h-4 w-4 ${
                        project.isArchived 
                          ? 'text-slate-500' 
                          : 'text-green-600 dark:text-green-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {project.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {project.packageName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {project.isArchived && (
                      <Badge variant="outline" className="text-xs">
                        <Archive className="h-3 w-3 mr-1" />
                        Archivado
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(project.fileSize)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>{project.fileCount} archivos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    <span>{project.downloadCount} descargas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    <span>{project.generationType}</span>
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {project.technologies?.slice(0, 3).map((tech, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies?.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.technologies.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-1">
                    {project.downloadUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDownload(project, e)}
                        title="Descargar proyecto"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {!project.isArchived && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleArchive(project.id, e)}
                        title="Archivar proyecto"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(project.id, e)}
                      title="Eliminar proyecto"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredProjects.length > 0 && (
        <div className="flex justify-center">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Mostrando {filteredProjects.length} de {projects.length} proyectos
          </div>
        </div>
      )}
    </div>
  );
}
