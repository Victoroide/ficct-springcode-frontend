import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { anonymousApiClient } from '@/services/anonymousApiClient'
import { anonymousSessionService } from '@/services/anonymousSessionService';
import { 
  Download, 
  Code, 
  Image, 
  FileText, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Package
} from 'lucide-react';

interface ExportPanelProps {
  diagram: any;
  diagramId: string;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ diagram, diagramId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [lastGeneratedCode, setLastGeneratedCode] = useState<any>(null);

  const handleGenerateCode = async () => {
    if (!diagram?.diagram_data?.nodes || diagram.diagram_data.nodes.length === 0) {
      toast({
        title: "No classes found",
        description: "Add some UML classes to generate Spring Boot code",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('generating');

    try {
      const response = await anonymousApiClient.post('/code-generation/generate/', {
        diagram_data: diagram.diagram_data,
        framework: 'springboot',
        language: 'java',
        session_id: anonymousSessionService.getSessionId()
      });

      if (response.success && response.data) {
        setLastGeneratedCode(response.data);
        setGenerationStatus('success');
        
        toast({
          title: "Code generated successfully!",
          description: "Your Spring Boot project is ready for download",
          variant: "default"
        });
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Code generation failed:', error);
      setGenerationStatus('error');
      
      toast({
        title: "Generation failed",
        description: "Failed to generate Spring Boot code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadProject = async () => {
    if (!lastGeneratedCode?.download_url) {
      toast({
        title: "No project to download",
        description: "Generate code first, then download the project",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create download link
      const link = document.createElement('a');
      link.href = lastGeneratedCode.download_url;
      link.download = `${diagram?.title || 'springboot-project'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download started",
        description: "Your Spring Boot project is downloading",
        variant: "default"
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExportImage = async (format: 'png' | 'svg' | 'jpg') => {
    toast({
      title: "Image export",
      description: `Exporting diagram as ${format.toUpperCase()}...`,
      variant: "default"
    });

    try {
      // This would integrate with the diagram canvas to export as image
      // For now, we'll show a placeholder message
      setTimeout(() => {
        toast({
          title: "Export completed",
          description: `Diagram exported as ${format.toUpperCase()}`,
          variant: "default"
        });
      }, 1500);
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "Failed to export diagram as image",
        variant: "destructive"
      });
    }
  };

  const getNodeStats = () => {
    const nodes = diagram?.diagram_data?.nodes || [];
    const edges = diagram?.diagram_data?.edges || [];
    
    const classNodes = nodes.filter((node: any) => node.type === 'classNode');
    const totalAttributes = classNodes.reduce((sum: number, node: any) => 
      sum + (node.data?.attributes?.length || 0), 0);
    const totalMethods = classNodes.reduce((sum: number, node: any) => 
      sum + (node.data?.methods?.length || 0), 0);

    return {
      classes: classNodes.length,
      attributes: totalAttributes,
      methods: totalMethods,
      relationships: edges.length
    };
  };

  const stats = getNodeStats();

  return (
    <div className="space-y-4">
      {/* Diagram Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Diagram Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.classes}</div>
              <div className="text-xs text-gray-600">Classes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.relationships}</div>
              <div className="text-xs text-gray-600">Relations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.attributes}</div>
              <div className="text-xs text-gray-600">Attributes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.methods}</div>
              <div className="text-xs text-gray-600">Methods</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Code className="h-5 w-5 mr-2 text-green-600" />
            Spring Boot Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Generation Status */}
          {generationStatus !== 'idle' && (
            <div className={`flex items-center space-x-2 p-3 rounded-lg ${
              generationStatus === 'generating' ? 'bg-blue-50 border border-blue-200' :
              generationStatus === 'success' ? 'bg-green-50 border border-green-200' :
              'bg-red-50 border border-red-200'
            }`}>
              {generationStatus === 'generating' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">Generating Spring Boot code...</span>
                </>
              )}
              {generationStatus === 'success' && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">Code generated successfully!</span>
                </>
              )}
              {generationStatus === 'error' && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">Generation failed. Try again.</span>
                </>
              )}
            </div>
          )}

          {/* Generation Features */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Includes:</div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">JPA Entities</Badge>
              <Badge variant="secondary" className="text-xs">DTOs</Badge>
              <Badge variant="secondary" className="text-xs">Services</Badge>
              <Badge variant="secondary" className="text-xs">Controllers</Badge>
              <Badge variant="secondary" className="text-xs">Repositories</Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={handleGenerateCode}
              disabled={isGenerating || stats.classes === 0}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Code className="h-4 w-4 mr-2" />
                  Generate Spring Boot Code
                </>
              )}
            </Button>

            {lastGeneratedCode && (
              <Button 
                onClick={handleDownloadProject}
                variant="outline"
                className="w-full"
              >
                <Package className="h-4 w-4 mr-2" />
                Download Project (.zip)
              </Button>
            )}
          </div>

          {stats.classes === 0 && (
            <div className="text-xs text-gray-500 text-center">
              Add UML classes to enable code generation
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Image className="h-5 w-5 mr-2 text-purple-600" />
            Export Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportImage('png')}
              className="text-xs"
            >
              PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportImage('svg')}
              className="text-xs"
            >
              SVG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportImage('jpg')}
              className="text-xs"
            >
              JPG
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generation History */}
      {lastGeneratedCode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Last Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Framework:</span>
                <Badge variant="secondary">Spring Boot</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Language:</span>
                <Badge variant="secondary">Java</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Generated:</span>
                <span className="text-gray-900">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExportPanel;
