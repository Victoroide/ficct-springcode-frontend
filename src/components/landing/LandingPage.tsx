import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { anonymousApiClient } from '@/services/anonymousApiClient';
import { anonymousSessionService } from '@/services/anonymousSessionService';
import { Palette, Code, Users, Zap, Download, Share2 } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [recentDiagrams, setRecentDiagrams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar diagramas recientes al montar el componente
  useEffect(() => {
    const fetchRecentDiagrams = async () => {
      setIsLoading(true);
      try {
        const response = await anonymousApiClient.get('/diagrams/');
        
        if (import.meta.env.DEV) {
          console.log('💾 Respuesta de diagramas recientes:', response);
        }
        
        if (response.success && response.data) {
          // Manejar diferentes formatos de respuesta y corregir errores TypeScript
          let diagrams: any[] = [];
          const data = response.data as any;
          
          if (Array.isArray(data)) {
            diagrams = data;
          } else if (typeof data === 'object' && data !== null) {
            diagrams = data.results || data.items || data.diagrams || [];
          }
            
          setRecentDiagrams(diagrams);
        }
      } catch (error) {
        console.error('Error fetching recent diagrams:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentDiagrams();
  }, []);

  const createNewDiagram = async () => {
    setIsCreating(true);
    try {
      // Ensure we have a session
      const session = anonymousSessionService.getOrCreateSession();
      
      // 🔧 CRITICAL FIX: Asegurar valores no-undefined en el payload
      const title = 'Untitled UML Diagram';
      const diagramType = 'CLASS'; // Backend expects uppercase
      
      // Create a new diagram con valores verificados
      const response = await anonymousApiClient.post('/diagrams/', {
        title: title,
        diagram_type: diagramType,
        diagram_data: {
          nodes: [],
          edges: []
        },
        is_public: true,
        session_id: session.sessionId || anonymousSessionService.getSessionId() // Fallback si session.sessionId es undefined
      });

      if (response.success && response.data) {
        // 🔧 CRITICAL FIX: Extracción robusta de diagram ID
        const diagramData = response.data as any;
        
        // Logging detallado de la respuesta de API para debugging
        if (import.meta.env.DEV) {
          console.log('💾 Respuesta de API diagrams:', response.data);
        }
        
        // Extraer ID con fallbacks y validación
        let diagramId = diagramData.id || diagramData.uuid;
        
        // Si aún no hay ID, buscar en otras propiedades comunes
        if (!diagramId && typeof diagramData === 'object') {
          diagramId = diagramData.uuid || diagramData.diagram_id || diagramData._id;
          
          // Si es un array, podría ser el primer objeto
          if (!diagramId && Array.isArray(diagramData) && diagramData.length > 0) {
            const firstItem = diagramData[0];
            diagramId = firstItem?.id || firstItem?.uuid;
          }
        }
        
        // Verificar explícitamente que tengamos un ID válido
        if (diagramId && diagramId !== 'undefined' && diagramId !== 'null') {
          if (import.meta.env.DEV) {
            console.log('💾 Usando diagram ID válido:', diagramId);
          }
          anonymousSessionService.addDiagramToSession(diagramId);
          navigate(`/editor/${diagramId}`);
          return;
        } else {
          console.error('No valid ID in API response:', diagramData);
        }
      } 
      
      // Si llegamos aquí, hubo un error o no se encontró un ID válido
      console.error('Failed to create diagram or extract valid ID:', response.error || 'No valid ID');
      
      // Fallback a un UUID compatible generado localmente
      const localId = `00000000-0000-4000-a000-000000000001`;
      console.log('🔧 Usando ID fallback:', localId);
      navigate(`/editor/${localId}`);
    } catch (error) {
      console.error('Error creating diagram:', error);
      // Fallback to a UUID-compatible diagram ID
      const localId = `00000000-0000-4000-a000-000000000001`;
      navigate(`/editor/${localId}`);
    } finally {
      setIsCreating(false);
    }
  };

  const session = anonymousSessionService.getCurrentSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Palette className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              UML Collaborative Tool
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create, collaborate, and generate code from UML diagrams instantly. 
            No registration required - just start diagramming!
          </p>
          {session && (
            <div className="mt-4">
              <Badge variant="outline" className="text-sm">
                Welcome, {session.nickname}! 🎨
              </Badge>
            </div>
          )}
        </div>

        {/* Main Action */}
        <div className="max-w-md mx-auto mb-12">
          <Card className="shadow-lg border-2 border-blue-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-700">Start Creating</CardTitle>
              <CardDescription>
                Begin your UML diagram journey right now
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={createNewDiagram} 
                disabled={isCreating}
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Palette className="mr-2 h-5 w-5" />
                    Create New UML Diagram
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/browse')}
                className="w-full h-12 text-lg"
              >
                <Share2 className="mr-2 h-5 w-5" />
                Browse Public Diagrams
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Diagrams Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isLoading ? 'Cargando diagramas recientes...' : 'Diagramas recientes'}
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : recentDiagrams.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentDiagrams.map((diagram: any) => (
                <Card 
                  key={diagram.id || diagram.uuid || Math.random().toString()} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/editor/${diagram.id || diagram.uuid}`)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md truncate">
                      {diagram.title || 'Untitled Diagram'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(diagram.created_at || diagram.updated_at || Date.now()).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div>
                        <span className="mr-2">
                          {diagram.diagram_type || 'CLASS'}
                        </span>
                        {diagram.is_public && (
                          <Badge variant="outline" className="text-xs">
                            Public
                          </Badge>
                        )}
                      </div>
                      <div>
                        {diagram.content?.nodes?.length || diagram.diagram_data?.nodes?.length || 0} nodes
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No hay diagramas recientes. ¡Crea uno nuevo!</p>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Real-time Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Work together with multiple users simultaneously. See changes in real-time with integrated chat.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Code className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Code Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Instantly generate Spring Boot Java code from your UML class diagrams with full JPA annotations.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="h-8 w-8 text-yellow-600 mb-2" />
              <CardTitle className="text-lg">No Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Jump right in! No sign-ups, no passwords. Your anonymous session keeps track of your work.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Download className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Export & Share</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Export diagrams as images or share collaboration links with anyone instantly.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Palette className="h-8 w-8 text-pink-600 mb-2" />
              <CardTitle className="text-lg">Professional UML</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create class diagrams with attributes, methods, and relationships using standard UML notation.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Share2 className="h-8 w-8 text-indigo-600 mb-2" />
              <CardTitle className="text-lg">Instant Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Share your diagram URL and others can join the collaboration session immediately.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Guide */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">How It Works</CardTitle>
            <CardDescription className="text-center">
              Get started in 3 simple steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold mb-2">Create Diagram</h3>
                <p className="text-sm text-gray-600">
                  Click "Create New UML Diagram" to start with a blank canvas
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold mb-2">Design & Collaborate</h3>
                <p className="text-sm text-gray-600">
                  Add classes, relationships, and invite others by sharing the URL
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold mb-2">Generate Code</h3>
                <p className="text-sm text-gray-600">
                  Export your design as Spring Boot code or share the diagram
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500">
            Built for developers, by developers. Open source and free to use.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
