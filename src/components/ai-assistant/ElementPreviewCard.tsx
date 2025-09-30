/**
 * Element Preview Card Component
 * Displays preview of AI-generated UML elements with detailed information
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Box, 
  Circle, 
  Square, 
  GitBranch,
  ArrowRight,
  Lock,
  Unlock,
  Hash,
  Eye,
  EyeOff
} from 'lucide-react';

interface ElementPreviewCardProps {
  element: any;
  index: number;
}

const ElementPreviewCard: React.FC<ElementPreviewCardProps> = ({ element, index }) => {
  // Handle both new format (element.type === 'node') and legacy format
  const isNode = element.type === 'node' || element.element_type === 'class';
  const nodeData = element.type === 'node' ? element.data?.data : element.element_data;
  const position = element.type === 'node' ? element.data?.position : element.position;
  const elementType = element.type === 'node' ? element.data?.type : element.element_type;

  // Visibility icon helper
  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Unlock className="w-3 h-3 text-green-600" />;
      case 'private': return <Lock className="w-3 h-3 text-red-600" />;
      case 'protected': return <Eye className="w-3 h-3 text-yellow-600" />;
      case 'package': return <Hash className="w-3 h-3 text-blue-600" />;
      default: return <EyeOff className="w-3 h-3 text-gray-400" />;
    }
  };

  if (isNode) {
    const label = nodeData?.label || nodeData?.name || 'Unnamed';
    const attributes = nodeData?.attributes || [];
    const methods = nodeData?.methods || [];
    const isAbstract = nodeData?.isAbstract || false;

    return (
      <Card className="bg-white border-blue-200 hover:border-blue-400 transition-all">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                {elementType === 'interface' ? (
                  <Circle className="w-5 h-5 text-blue-600" />
                ) : elementType === 'enum' ? (
                  <Square className="w-5 h-5 text-purple-600" />
                ) : (
                  <Box className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{label}</h4>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    {elementType || 'class'}
                  </Badge>
                  {isAbstract && (
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                      Abstract
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
              #{index + 1}
            </Badge>
          </div>

          {/* Attributes */}
          {attributes.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Atributos ({attributes.length})</p>
              <div className="space-y-1">
                {attributes.slice(0, 3).map((attr: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs bg-gray-50 rounded px-2 py-1">
                    {getVisibilityIcon(attr.visibility)}
                    <span className="font-mono text-gray-800">
                      {attr.name}: <span className="text-blue-600">{attr.type}</span>
                    </span>
                    {attr.isStatic && (
                      <Badge variant="outline" className="text-xs bg-gray-100">static</Badge>
                    )}
                  </div>
                ))}
                {attributes.length > 3 && (
                  <p className="text-xs text-gray-500 pl-2">
                    +{attributes.length - 3} más...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Methods */}
          {methods.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-600 mb-2">Métodos ({methods.length})</p>
              <div className="space-y-1">
                {methods.slice(0, 2).map((method: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs bg-gray-50 rounded px-2 py-1">
                    {getVisibilityIcon(method.visibility)}
                    <span className="font-mono text-gray-800">
                      {method.name}(): <span className="text-green-600">{method.returnType}</span>
                    </span>
                  </div>
                ))}
                {methods.length > 2 && (
                  <p className="text-xs text-gray-500 pl-2">
                    +{methods.length - 2} más...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Position Info */}
          {position && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Posición: ({Math.round(position.x)}, {Math.round(position.y)})
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Handle edge/relationship preview
  if (element.element_type === 'relationship' || element.type === 'edge') {
    // NEW FORMAT: Backend sends complete edge data structure
    const edgeData = element.type === 'edge' ? element.data : null;
    const relType = edgeData?.data?.relationshipType || element.element_data?.type || element.data?.relationshipType || 'ASSOCIATION';
    const source = edgeData?.source || element.element_data?.source || element.source || 'Unknown';
    const target = edgeData?.target || element.element_data?.target || element.target || 'Unknown';
    const sourceMultiplicity = edgeData?.data?.sourceMultiplicity || element.element_data?.sourceMultiplicity || element.data?.sourceMultiplicity;
    const targetMultiplicity = edgeData?.data?.targetMultiplicity || element.element_data?.targetMultiplicity || element.data?.targetMultiplicity;
    const label = edgeData?.data?.label || element.element_data?.label || element.data?.label;

    return (
      <Card className="bg-white border-green-200 hover:border-green-400 transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <GitBranch className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Relación</h4>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 mt-1">
                  {relType}
                </Badge>
              </div>
            </div>
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
              #{index + 1}
            </Badge>
          </div>

          {/* Label (if exists) */}
          {label && (
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-600">Etiqueta</p>
              <p className="text-sm text-gray-800">{label}</p>
            </div>
          )}

          {/* Relationship Visualization */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="text-center flex-1">
              <p className="text-sm font-medium text-gray-900 break-words">{source}</p>
              {sourceMultiplicity && (
                <p className="text-xs text-gray-600 mt-1">{sourceMultiplicity}</p>
              )}
            </div>
            <div className="flex flex-col items-center mx-2">
              <ArrowRight className="w-5 h-5 text-gray-400" />
              {relType && (
                <p className="text-xs text-gray-500 mt-1">{relType}</p>
              )}
            </div>
            <div className="text-center flex-1">
              <p className="text-sm font-medium text-gray-900 break-words">{target}</p>
              {targetMultiplicity && (
                <p className="text-xs text-gray-600 mt-1">{targetMultiplicity}</p>
              )}
            </div>
          </div>
          
          {/* ID Information (for debugging) */}
          {edgeData?.id && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">ID: {edgeData.id}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Fallback for unknown element types
  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-4">
        <p className="text-sm text-gray-600">Elemento desconocido</p>
        <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-x-auto">
          {JSON.stringify(element, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
};

export default ElementPreviewCard;