// @ts-nocheck
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  MousePointer, 
  Square, 
  Circle, 
  Diamond, 
  ArrowRight, 
  Move, 
  Type,
  Hash,
  Code2,
  Shapes,
  Link
} from 'lucide-react';

interface UMLToolboxProps {
  selectedTool: string;
  onToolSelect: (tool: string) => void;
}

export function UMLToolbox({ selectedTool, onToolSelect }: UMLToolboxProps) {
  const tools = [
    {
      id: 'pointer',
      icon: <MousePointer className="h-4 w-4" />,
      label: 'Seleccionar',
      shortcut: 'V'
    },
    {
      id: 'pan',
      icon: <Move className="h-4 w-4" />,
      label: 'Mover vista',
      shortcut: 'H'
    },
    {
      id: 'class',
      icon: <Square className="h-4 w-4" />,
      label: 'Clase',
      shortcut: 'C'
    },
    {
      id: 'interface',
      icon: <Type className="h-4 w-4" />,
      label: 'Interfaz',
      shortcut: 'I'
    },
    {
      id: 'abstractclass',
      icon: <Shapes className="h-4 w-4" />,
      label: 'Clase Abstracta',
      shortcut: 'A'
    },
    {
      id: 'enum',
      icon: <Hash className="h-4 w-4" />,
      label: 'Enumeración',
      shortcut: 'E'
    },
    {
      id: 'record',
      icon: <Code2 className="h-4 w-4" />,
      label: 'Record',
      shortcut: 'R'
    },
    {
      id: 'association',
      icon: <ArrowRight className="h-4 w-4" />,
      label: 'Asociación',
      shortcut: 'S'
    },
    {
      id: 'inheritance',
      icon: <Link className="h-4 w-4" />,
      label: 'Herencia',
      shortcut: 'L'
    }
  ];

  return (
    <div className="flex flex-col gap-1">
      {tools.map(tool => (
        <Button
          key={tool.id}
          variant={selectedTool === tool.id ? "default" : "ghost"}
          size="sm"
          className={`w-12 h-12 p-0 ${
            selectedTool === tool.id 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'hover:bg-slate-100'
          }`}
          onClick={() => onToolSelect(tool.id)}
          title={`${tool.label} (${tool.shortcut})`}
        >
          {tool.icon}
        </Button>
      ))}
    </div>
  );
}
