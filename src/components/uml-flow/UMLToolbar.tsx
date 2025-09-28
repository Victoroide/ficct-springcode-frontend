/**
 * UMLToolbar.tsx
 * Main toolbar for UML editor with all controls and actions
 */

import React, { useState } from 'react';
import { ArrowUpDown, Link2, Zap } from 'lucide-react';
import type { RelationshipType } from './types/relationships';
import { Button } from '@/components/ui/button';
import { 
  MousePointer, 
  Box, 
  Code, 
  FileCode, 
  Database,
  Move, 
  Link, 
  Grid, 
  MapPin, 
  Trash, 
  Save, 
  PanelRight, 
  Users, 
  UserMinus,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download
} from 'lucide-react';
import type { EditorMode } from './types';

interface UMLToolbarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onDelete: () => void;
  canDelete: boolean;
  onSave?: () => void;
  onToggleMinimap: () => void;
  onToggleGrid: () => void;
  onToggleSidebar: () => void;
  onStartCollaboration?: () => void;
  onStopCollaboration?: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onExportDiagram: () => void;
  isCollaborating: boolean;
  showMinimap: boolean;
  showGrid: boolean;
  showSidebar: boolean;
}

const UMLToolbar: React.FC<UMLToolbarProps> = ({
  mode,
  onModeChange,
  onDelete,
  canDelete,
  onSave,
  onToggleMinimap,
  onToggleGrid,
  onToggleSidebar,
  onStartCollaboration,
  onStopCollaboration,
  onZoomIn,
  onZoomOut,
  onFitView,
  onExportDiagram,
  isCollaborating,
  showMinimap,
  showGrid,
  showSidebar,
}) => {
  return (
    <div className="uml-toolbar bg-white border-b border-slate-200 p-2 flex items-center gap-1 overflow-x-auto">
      {/* Main section */}
      <div className="flex items-center gap-1 mr-3">
        <Button
          variant={mode === 'select' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('select')}
          title="Select Tool"
        >
          <MousePointer className="h-4 w-4" />
        </Button>
        
        <Button
          variant={mode === 'pan' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('pan')}
          title="Pan Tool"
        >
          <Move className="h-4 w-4" />
        </Button>
        
        <Button
          variant={mode === 'connect' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('connect')}
          title="Connect Tool"
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>
      
      {/* UML Elements section */}
      <div className="flex items-center gap-1 mr-3 border-l pl-2">
        <Button
          variant={mode === 'class' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('class')}
          title="Add Class"
        >
          <Box className="h-4 w-4 mr-1" />
          <span className="whitespace-nowrap">Class</span>
        </Button>
        
        <Button
          variant={mode === 'interface' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('interface')}
          title="Add Interface"
        >
          <Code className="h-4 w-4 mr-1" />
          <span className="whitespace-nowrap">Interface</span>
        </Button>
        
        <Button
          variant={mode === 'abstractClass' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('abstractClass')}
          title="Add Abstract Class"
        >
          <FileCode className="h-4 w-4 mr-1" />
          <span className="whitespace-nowrap">Abstract</span>
        </Button>
        
        <Button
          variant={mode === 'enum' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('enum')}
          title="Add Enum"
        >
          <Database className="h-4 w-4 mr-1" />
          <span className="whitespace-nowrap">Enum</span>
        </Button>
      </div>
      
      {/* View controls */}
      <div className="flex items-center gap-1 mr-3 border-l pl-2">
        <Button
          variant={showGrid ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleGrid}
          title="Toggle Grid"
        >
          <Grid className="h-4 w-4" />
        </Button>
        
        <Button
          variant={showMinimap ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleMinimap}
          title="Toggle Minimap"
        >
          <MapPin className="h-4 w-4" />
        </Button>
        
        <Button
          variant={showSidebar ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleSidebar}
          title="Toggle Properties Panel"
        >
          <PanelRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Zoom controls */}
      <div className="flex items-center gap-1 mr-3 border-l pl-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onFitView}
          title="Fit View"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Actions section */}
      <div className="flex items-center gap-1 mr-3 border-l pl-2">
        {canDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
            title="Delete Selected"
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onExportDiagram}
          title="Export Diagram"
        >
          <Download className="h-4 w-4" />
        </Button>
        
        {onSave && (
          <Button
            variant="default"
            size="sm"
            onClick={onSave}
            title="Save Diagram"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        )}
      </div>
      
      {/* Collaboration section */}
      {(onStartCollaboration || onStopCollaboration) && (
        <div className="flex items-center gap-1 ml-auto border-l pl-2">
          {isCollaborating ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onStopCollaboration}
              className="text-red-500 hover:text-red-700"
              title="Terminar colaboración"
            >
              <UserMinus className="h-4 w-4 mr-1" />
              Terminar Colaboración
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onStartCollaboration}
              className="text-green-600 hover:text-green-700"
              title="Iniciar colaboración"
            >
              <Users className="h-4 w-4 mr-1" />
              Colaborar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default UMLToolbar;
