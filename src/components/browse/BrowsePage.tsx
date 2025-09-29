import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area'; // Component not available
import { anonymousApiClient } from '@/services/anonymousApiClient';
import { anonymousSessionService } from '@/services/anonymousSessionService';
import { 
  ArrowLeft, 
  Search, 
  Eye, 
  Users, 
  Clock, 
  Palette,
  Filter,
  RefreshCw
} from 'lucide-react';

interface PublicDiagram {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  diagram_data: {
    nodes: any[];
    edges: any[];
  };
  collaborators_count?: number;
  is_public: boolean;
}

const BrowsePage: React.FC = () => {
  const navigate = useNavigate();
  const [diagrams, setDiagrams] = useState<PublicDiagram[]>([]);
  const [filteredDiagrams, setFilteredDiagrams] = useState<PublicDiagram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');

  useEffect(() => {
    loadPublicDiagrams();
  }, []);

  useEffect(() => {
    filterAndSortDiagrams();
  }, [diagrams, searchQuery, sortBy]);

  const loadPublicDiagrams = async () => {
    setIsLoading(true);
    try {
      const response = await anonymousApiClient.get('/diagrams/public/');
      
      if (response.success && response.data) {
        // Type assertion for API response
        const data = response.data as any;
        setDiagrams(data.results || data || []);
      } else {
        // Fallback with sample data if API fails
        setDiagrams(generateSampleDiagrams());
      }
    } catch (error) {
      console.error('Failed to load public diagrams:', error);
      // Show sample diagrams as fallback
      setDiagrams(generateSampleDiagrams());
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleDiagrams = (): PublicDiagram[] => {
    return [
      {
        id: 'sample-1',
        title: 'E-commerce System',
        description: 'Complete UML design for an online shopping platform',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        diagram_data: {
          nodes: Array.from({ length: 8 }, (_, i) => ({ id: `node-${i}`, type: 'classNode' })),
          edges: Array.from({ length: 6 }, (_, i) => ({ id: `edge-${i}` }))
        },
        collaborators_count: 3,
        is_public: true
      },
      {
        id: 'sample-2',
        title: 'Library Management',
        description: 'UML diagram for a digital library system',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        diagram_data: {
          nodes: Array.from({ length: 5 }, (_, i) => ({ id: `node-${i}`, type: 'classNode' })),
          edges: Array.from({ length: 4 }, (_, i) => ({ id: `edge-${i}` }))
        },
        collaborators_count: 1,
        is_public: true
      },
      {
        id: 'sample-3',
        title: 'Banking System',
        description: 'Core banking operations UML design',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        diagram_data: {
          nodes: Array.from({ length: 12 }, (_, i) => ({ id: `node-${i}`, type: 'classNode' })),
          edges: Array.from({ length: 10 }, (_, i) => ({ id: `edge-${i}` }))
        },
        collaborators_count: 5,
        is_public: true
      }
    ];
  };

  const filterAndSortDiagrams = () => {
    const filtered = diagrams.filter(diagram =>
      diagram.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (diagram.description && diagram.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Sort diagrams
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    setFilteredDiagrams(filtered);
  };

  const handleViewDiagram = (diagramId: string) => {
    navigate(`/editor/${diagramId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getComplexityBadge = (nodeCount: number) => {
    if (nodeCount <= 3) return { label: 'Simple', color: 'bg-green-100 text-green-800' };
    if (nodeCount <= 8) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Complex', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Public Diagrams</h1>
            </div>
            <Button variant="outline" onClick={loadPublicDiagrams} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <p className="text-gray-600">
            Explore and collaborate on public UML diagrams created by the community
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search diagrams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="created">Recently Created</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
            <p className="text-gray-600">Loading public diagrams...</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {filteredDiagrams.length} diagram{filteredDiagrams.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Diagrams Grid */}
            {filteredDiagrams.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No diagrams found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? 'Try adjusting your search terms' : 'No public diagrams available yet'}
                  </p>
                  <Button onClick={() => navigate('/')}>
                    Create the First Diagram
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDiagrams.map((diagram) => {
                  const complexity = getComplexityBadge(diagram.diagram_data.nodes.length);
                  
                  return (
                    <Card key={diagram.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg line-clamp-2">{diagram.title}</CardTitle>
                          <Badge className={`text-xs ${complexity.color}`}>
                            {complexity.label}
                          </Badge>
                        </div>
                        {diagram.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{diagram.description}</p>
                        )}
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Palette className="h-4 w-4" />
                              <span>{diagram.diagram_data.nodes.length} classes</span>
                            </div>
                            {diagram.collaborators_count !== undefined && (
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{diagram.collaborators_count}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Last Updated */}
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>Updated {formatDate(diagram.updated_at)}</span>
                        </div>

                        {/* Action Button */}
                        <Button 
                          onClick={() => handleViewDiagram(diagram.id)}
                          className="w-full"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View & Collaborate
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
