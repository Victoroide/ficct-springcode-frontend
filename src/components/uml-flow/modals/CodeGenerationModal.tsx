/**
 * CodeGenerationModal.tsx
 * Professional Code Generation Modal - Restored Original Functionality
 */

import React, { useState } from 'react';
import { X, Code, Download, Copy, Zap } from 'lucide-react';
import { GenerationWizard } from '../../generation/GenerationWizard';
import type { UMLNode, UMLEdge } from '../types';

interface CodeGenerationModalProps {
  isOpen: boolean;
  nodes: UMLNode[];
  edges: UMLEdge[];
  onClose: () => void;
}

const CodeGenerationModal: React.FC<CodeGenerationModalProps> = ({ 
  isOpen, 
  nodes, 
  edges, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Generar Código SpringBoot
              </h2>
              <p className="text-sm text-gray-500">
                Genera código completo desde tu diagrama UML ({nodes.length} clases)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <GenerationWizard 
            onComplete={(requestId) => {
              console.log('Generation completed:', requestId);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeGenerationModal;
