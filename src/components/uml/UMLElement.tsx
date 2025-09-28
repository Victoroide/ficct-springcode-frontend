// @ts-nocheck
import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Hash, Type, Code2 } from 'lucide-react';

interface UMLElementProps {
  element: any;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  zoom: number;
}

export function UMLElement({ 
  element, 
  isSelected, 
  onMouseDown, 
  onDoubleClick, 
  zoom 
}: UMLElementProps) {
  const [isEditing, setIsEditing] = useState(false);

  const getClassTypeColor = (classType: string) => {
    switch (classType) {
      case 'CLASS': return 'border-blue-300 bg-blue-50';
      case 'INTERFACE': return 'border-purple-300 bg-purple-50';
      case 'ABSTRACTCLASS': return 'border-orange-300 bg-orange-50';
      case 'ENUM': return 'border-green-300 bg-green-50';
      case 'RECORD': return 'border-pink-300 bg-pink-50';
      default: return 'border-slate-300 bg-white';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return '+';
      case 'private': return '-';
      case 'protected': return '#';
      default: return '~';
    }
  };

  const getTypeIcon = (classType: string) => {
    switch (classType) {
      case 'INTERFACE': return <Type className="h-3 w-3" />;
      case 'ENUM': return <Hash className="h-3 w-3" />;
      case 'RECORD': return <Code2 className="h-3 w-3" />;
      default: return null;
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    onDoubleClick();
  };

  const elementStyle = {
    left: element.positionX,
    top: element.positionY,
    width: element.width,
    minHeight: element.height,
    transform: `scale(${1 / zoom})`,
    transformOrigin: 'top left',
  };

  return (
    <div
      className={`absolute border-2 rounded-lg shadow-lg cursor-move transition-all duration-200 ${
        getClassTypeColor(element.classType)
      } ${
        isSelected 
          ? 'border-blue-500 shadow-blue-200 ring-2 ring-blue-200' 
          : 'hover:shadow-xl'
      }`}
      style={elementStyle}
      onMouseDown={onMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className="p-3">
        <div className="text-center border-b border-slate-200 pb-2 mb-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            {getTypeIcon(element.classType)}
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {element.classType === 'ABSTRACTCLASS' ? 'Abstract' : element.classType}
            </span>
          </div>
          <div className="font-bold text-slate-900 text-sm">
            {element.name}
          </div>
          {element.packageName && (
            <div className="text-xs text-slate-500">
              {element.packageName}
            </div>
          )}
        </div>

        {element.attributes && element.attributes.length > 0 && (
          <div className="border-b border-slate-200 pb-2 mb-2">
            {element.attributes.map((attr, index) => (
              <div key={index} className="text-xs text-slate-700 font-mono flex items-center">
                <span className="text-slate-500 mr-1">
                  {getVisibilityIcon(attr.visibility)}
                </span>
                <span className="truncate">
                  {attr.name}: {attr.type}
                </span>
                {attr.isStatic && <span className="ml-1 text-blue-600">S</span>}
                {attr.isFinal && <span className="ml-1 text-red-600">F</span>}
              </div>
            ))}
          </div>
        )}

        {element.methods && element.methods.length > 0 && (
          <div>
            {element.methods.map((method, index) => (
              <div key={index} className="text-xs text-slate-700 font-mono">
                <div className="flex items-center">
                  <span className="text-slate-500 mr-1">
                    {getVisibilityIcon(method.visibility)}
                  </span>
                  <span className="truncate">
                    {method.name}(): {method.returnType}
                  </span>
                  {method.isStatic && <span className="ml-1 text-blue-600">S</span>}
                  {method.isAbstract && <span className="ml-1 text-purple-600">A</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {(!element.attributes || element.attributes.length === 0) && 
         (!element.methods || element.methods.length === 0) && (
          <div className="text-xs text-slate-400 italic text-center py-2">
            Vacío
          </div>
        )}
      </div>

      {isSelected && (
        <>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-full"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-full"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-full"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-full"></div>
        </>
      )}

      {element.stereotypes && element.stereotypes.length > 0 && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">
            ≪{element.stereotypes.join(', ')}≫
          </div>
        </div>
      )}
    </div>
  );
}
