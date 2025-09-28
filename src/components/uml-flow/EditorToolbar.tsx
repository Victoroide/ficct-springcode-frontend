/**
 * EditorToolbar.tsx
 * Toolbar component for the UML Flow Editor
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  PointerIcon, 
  BoxIcon, 
  SquareIcon, 
  CircleIcon, 
  HashIcon, 
  FileCodeIcon,
  MoveIcon,
  LinkIcon,
  GridIcon, 
  MapIcon,
  TrashIcon,
  SaveIcon,
  PanelRightIcon,
  UsersIcon,
  UserMinusIcon
} from 'lucide-react';

interface EditorToolbarProps {
  mode: 'select' | 'class' | 'interface' | 'abstract' | 'enum' | 'record' | 'pan';
  setMode: (mode: 'select' | 'class' | 'interface' | 'abstract' | 'enum' | 'record' | 'pan') => void;
  onShowMiniMapToggle: () => void;
  showMiniMap: boolean;
  onShowGridToggle: () => void;
  showGrid: boolean;
  onDelete: () => void;
  canDelete: boolean;
  onShowSidebarToggle: () => void;
  showSidebar: boolean;
  isCollaborating: boolean;
  onStartCollaboration: () => void;
  onStopCollaboration: () => void;
  onSave?: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  mode,
  setMode,
  onShowMiniMapToggle,
  showMiniMap,
  onShowGridToggle,
  showGrid,
  onDelete,
  canDelete,
  onShowSidebarToggle,
  showSidebar,
  isCollaborating,
  onStartCollaboration,
  onStopCollaboration,
  onSave
}) => {
  return (
    <div className="p-2 bg-white border-b flex items-center gap-1 overflow-x-auto">
      <TooltipProvider delayDuration={300}>
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-md mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={mode === 'select' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('select')}
                className="h-8 w-8 p-0"
              >
                <PointerIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Select Tool (V)</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={mode === 'pan' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('pan')}
                className="h-8 w-8 p-0"
              >
                <MoveIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pan Tool (H)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-md mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={mode === 'class' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('class')}
                className="h-8 w-8 p-0"
              >
                <BoxIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add Class</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={mode === 'interface' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('interface')}
                className="h-8 w-8 p-0"
              >
                <CircleIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add Interface</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={mode === 'abstract' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('abstract')}
                className="h-8 w-8 p-0"
              >
                <SquareIcon className="h-4 w-4" style={{ strokeDasharray: '4,2' }} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add Abstract Class</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={mode === 'enum' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('enum')}
                className="h-8 w-8 p-0"
              >
                <HashIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add Enumeration</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={mode === 'record' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('record')}
                className="h-8 w-8 p-0"
              >
                <FileCodeIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add Record</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-md mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={showGrid ? 'default' : 'ghost'}
                size="sm"
                onClick={onShowGridToggle}
                className="h-8 w-8 p-0"
              >
                <GridIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Grid</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={showMiniMap ? 'default' : 'ghost'}
                size="sm"
                onClick={onShowMiniMapToggle}
                className="h-8 w-8 p-0"
              >
                <MapIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Mini Map</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={showSidebar ? 'default' : 'ghost'}
                size="sm"
                onClick={onShowSidebarToggle}
                className="h-8 w-8 p-0"
              >
                <PanelRightIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Sidebar</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-md mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost"
                size="sm"
                onClick={onDelete}
                disabled={!canDelete}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 disabled:text-gray-300"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Selected (Del)</p>
            </TooltipContent>
          </Tooltip>
          
          {onSave && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={onSave}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <SaveIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save Diagram (Ctrl+S)</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-md">
          {isCollaborating ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={onStopCollaboration}
                  className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
                >
                  <UserMinusIcon className="h-4 w-4" />
                  <span className="text-xs whitespace-nowrap">Terminar Colaboración</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Dejar sesión colaborativa</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={onStartCollaboration}
                  className="h-8 px-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-1"
                >
                  <UsersIcon className="h-4 w-4" />
                  <span className="text-xs whitespace-nowrap">Iniciar Colaboración</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Iniciar sesión colaborativa en tiempo real</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Current Mode Indicator */}
        <div className="ml-auto px-3 py-1 text-xs text-slate-600 bg-slate-50 rounded-md border border-slate-200 flex items-center">
          <span>Modo: </span>
          <span className="font-semibold ml-1">
            {mode === 'select' ? 'Seleccionar' :
             mode === 'pan' ? 'Mover Canvas' :
             mode === 'class' ? 'Añadir Clase' :
             mode === 'interface' ? 'Añadir Interfaz' :
             mode === 'abstract' ? 'Añadir Clase Abstracta' :
             mode === 'enum' ? 'Añadir Enumeración' :
             'Añadir Record'}
          </span>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default EditorToolbar;
