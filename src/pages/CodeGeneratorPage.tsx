// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Code, 
  Download, 
  Play, 
  Pause, 
  RefreshCw,
  FileText,
  Settings,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Package
} from 'lucide-react';
import { GenerationWizard } from '@/components/generation/GenerationWizard';
import { ProjectManager } from '@/components/generation/ProjectManager';
import { ProgressTracker } from '@/components/generation/ProgressTracker';
import { useListRequestsQuery, useListProjectsQuery } from '@/store/api/generationApi';

export function CodeGeneratorPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(requestId ? 'progress' : 'wizard');
  const [selectedProject, setSelectedProject] = useState(null);

  const { data: requestsData, isLoading: requestsLoading } = useListRequestsQuery({ pagesize: 10 });
  const { data: projectsData, isLoading: projectsLoading } = useListProjectsQuery({ pagesize: 10 });

  const recentRequests = requestsData?.results || [];
  const recentProjects = projectsData?.results || [];

  useEffect(() => {
    // Si hay un ID de solicitud, mostramos el progreso
    if (requestId) {
      setActiveTab('progress');
    }
  }, [requestId]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Si estamos en una página de solicitud específica y cambiamos a wizard,
    // volvemos a la página principal del generador
    if (tab === 'wizard' && requestId) {
      navigate('/dashboard/code-generator');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <h1 className="text-xl font-semibold text-slate-900">
              Generador de Código SpringBoot
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {recentRequests.length} solicitudes activas
            </Badge>
            <Badge variant="outline" className="text-xs">
              {recentProjects.length} proyectos generados
            </Badge>
          </div>
        </div>

        <div className="flex gap-1 mt-4">
          <Button
            variant={activeTab === 'wizard' ? 'default' : 'ghost'}
            onClick={() => handleTabChange('wizard')}
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Generar Código desde UML
          </Button>
          <Button
            variant={activeTab === 'requests' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('requests')}
            size="sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            Solicitudes
          </Button>
          <Button
            variant={activeTab === 'projects' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('projects')}
            size="sm"
          >
            <Package className="h-4 w-4 mr-2" />
            Proyectos
          </Button>
          {requestId && requestId !== 'new' && (
            <Button
              variant={activeTab === 'progress' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('progress')}
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Progreso
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'wizard' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Generar Código SpringBoot desde Diagrama UML
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GenerationWizard onComplete={(requestId) => {
                navigate(`/dashboard/code-generator/request/${requestId}`);
                setActiveTab('progress');
              }} />
            </CardContent>
          </Card>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Solicitudes de Generación
              </h2>
              <Button onClick={() => handleTabChange('wizard')}>
                <Zap className="h-4 w-4 mr-2" />
                Generar Código desde UML
              </Button>
            </div>

            <div className="grid gap-4">
              {requestsLoading ? (
                <RequestsSkeleton />
              ) : recentRequests.length > 0 ? (
                recentRequests.map(request => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onClick={() => {
                      navigate(`/dashboard/code-generator/request/${request.id}`);
                      setActiveTab('progress');
                    }}
                  />
                ))
              ) : (
                <EmptyState
                  icon={<Clock className="h-12 w-12 text-slate-400" />}
                  title="Sin solicitudes"
                  description="Aún no has creado ninguna solicitud de generación de código."
                  action={
                    <Button onClick={() => handleTabChange('wizard')}>
                      Generar Código desde UML
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Proyectos Generados
              </h2>
              <ProjectManager 
                projects={recentProjects}
                onSelectProject={setSelectedProject}
              />
            </div>

            <div className="grid gap-4">
              {projectsLoading ? (
                <ProjectsSkeleton />
              ) : recentProjects.length > 0 ? (
                recentProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => setSelectedProject(project)}
                  />
                ))
              ) : (
                <EmptyState
                  icon={<Package className="h-12 w-12 text-slate-400" />}
                  title="Sin proyectos"
                  description="Aún no has generado ningún proyecto SpringBoot."
                  action={
                    <Button onClick={() => handleTabChange('wizard')}>
                      Generar Código desde UML
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'progress' && requestId && (
          <ProgressTracker requestId={requestId} />
        )}
      </div>
    </div>
  );
}

function RequestCard({ request, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'IN_PROGRESS': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'FAILED': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Code className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                {request.generationConfig?.artifactId || 'Proyecto sin nombre'}
              </h3>
              <p className="text-sm text-slate-500">
                {request.generationConfig?.groupId}
              </p>
            </div>
          </div>
          
          <Badge className={getStatusColor(request.status)}>
            {getStatusIcon(request.status)}
            <span className="ml-1">{request.status}</span>
          </Badge>
        </div>

        {request.status === 'IN_PROGRESS' && request.progress && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Progreso</span>
              <span className="text-slate-900">{request.progress}%</span>
            </div>
            <Progress value={request.progress} className="h-2" />
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>Creado: {new Date(request.createdAt).toLocaleDateString()}</span>
          <span>Tipo: {request.generationType}</span>
          <span>Clases: {request.selectedClasses?.length || 0}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project, onClick }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                {project.name}
              </h3>
              <p className="text-sm text-slate-500">
                {project.packageName}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {project.downloadUrl && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Badge variant="outline">
              {(project.fileSize / 1024 / 1024).toFixed(1)} MB
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>Generado: {new Date(project.createdAt).toLocaleDateString()}</span>
          <span>Archivos: {project.fileCount}</span>
          <span>Descargas: {project.downloadCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon, title, description, action }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        {icon}
        <h3 className="text-lg font-medium text-slate-900 mt-4 mb-2">
          {title}
        </h3>
        <p className="text-slate-500 text-center mb-6 max-w-md">
          {description}
        </p>
        {action}
      </CardContent>
    </Card>
  );
}

function RequestsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="w-48 h-4 bg-slate-200 rounded"></div>
                  <div className="w-32 h-3 bg-slate-200 rounded"></div>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="w-48 h-4 bg-slate-200 rounded"></div>
                    <div className="w-32 h-3 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-6 bg-slate-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
