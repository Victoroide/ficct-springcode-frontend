/**
 * AI Assistant Usage Examples
 * Complete examples showing how to integrate the AI Assistant in different scenarios
 */

import React, { useState } from 'react';
import type { Node, Edge } from 'reactflow';

// Import the AI Assistant components
import { AIAssistant } from '@/components/ai-assistant';
import UMLFlowEditorWithAI from '@/components/uml-flow/UMLFlowEditorWithAI';
import ResponsiveAIAssistant from '@/components/ai-assistant/ResponsiveAIAssistant';

// Example 1: Basic AI Assistant integration in existing UML editor
export const BasicAIAssistantExample: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleFeatureNavigation = (feature: string) => {
    console.log('User wants to navigate to:', feature);
    // Implement navigation logic here
    // Examples:
    // - "código" → Open code generation modal
    // - "exportar" → Open export panel
    // - "colaborar" → Start collaboration
  };

  return (
    <div className="w-full h-screen relative">
      {/* Your existing UML editor */}
      <div className="w-full h-full">
        {/* Your UML editor component here */}
      </div>

      {/* Add AI Assistant overlay */}
      <AIAssistant
        diagramId="example-diagram-123"
        diagramNodes={nodes}
        diagramEdges={edges}
        currentAction="Creating UML class diagram"
        hasUnsavedChanges={hasUnsavedChanges}
        isCollaborating={isCollaborating}
        onFeatureNavigation={handleFeatureNavigation}
      />
    </div>
  );
};

// Example 2: Using the enhanced UML editor wrapper
export const EnhancedUMLEditorExample: React.FC = () => {
  const [initialNodes] = useState<Node[]>([
    {
      id: '1',
      type: 'class',
      position: { x: 100, y: 100 },
      data: {
        label: 'User',
        attributes: [
          { name: 'id', type: 'Long', visibility: 'private' },
          { name: 'name', type: 'String', visibility: 'private' },
          { name: 'email', type: 'String', visibility: 'private' }
        ],
        methods: [
          { name: 'getId', returnType: 'Long', visibility: 'public' },
          { name: 'getName', returnType: 'String', visibility: 'public' }
        ]
      }
    }
  ]);

  const [initialEdges] = useState<Edge[]>([]);

  const handleNodesChange = (nodes: Node[]) => {
    console.log('Nodes updated:', nodes.length);
    // Handle nodes change
  };

  const handleEdgesChange = (edges: Edge[]) => {
    console.log('Edges updated:', edges.length);
    // Handle edges change
  };

  const handleSave = () => {
    console.log('Saving diagram...');
    // Implement save logic
  };

  return (
    <UMLFlowEditorWithAI
      diagramId="enhanced-diagram-456"
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onSave={handleSave}
      className="w-full h-screen"
      isCollaborating={false}
      hasUnsavedChanges={false}
    />
  );
};

// Example 3: Responsive AI Assistant for mobile-first applications
export const ResponsiveAIAssistantExample: React.FC = () => {
  const [diagramData, setDiagramData] = useState({
    nodes: [],
    edges: [],
    hasUnsavedChanges: false
  });

  return (
    <div className="w-full h-screen">
      {/* Your mobile-optimized UML editor */}
      <div className="w-full h-full bg-gray-50">
        {/* Mobile UML editor content */}
        <div className="p-4">
          <h1 className="text-lg font-bold">Mobile UML Editor</h1>
          {/* Editor canvas */}
        </div>
      </div>

      {/* Responsive AI Assistant - adapts to screen size */}
      <ResponsiveAIAssistant
        diagramId="mobile-diagram-789"
        diagramNodes={diagramData.nodes}
        diagramEdges={diagramData.edges}
        currentAction="Mobile diagram editing"
        hasUnsavedChanges={diagramData.hasUnsavedChanges}
        isCollaborating={false}
        onFeatureNavigation={(feature) => {
          console.log('Mobile navigation to:', feature);
          // Implement mobile-specific navigation
        }}
      />
    </div>
  );
};

// Example 4: AI Assistant with custom context and advanced features
export const AdvancedAIAssistantExample: React.FC = () => {
  const [diagramContext, setDiagramContext] = useState({
    diagramId: 'advanced-diagram',
    nodes: [
      // Complex diagram with multiple classes
    ],
    edges: [
      // Multiple relationships
    ],
    currentAction: 'Designing complex system architecture',
    collaborators: ['user1', 'user2'],
    lastModified: new Date(),
    complexity: 'high'
  });

  const handleAIFeatureNavigation = (feature: string) => {
    switch (feature.toLowerCase()) {
      case 'generar código':
      case 'código springboot':
        // Open code generation wizard
        console.log('Opening SpringBoot code generator...');
        break;
        
      case 'análisis de diagrama':
        // Show detailed analysis
        console.log('Opening diagram analysis panel...');
        break;
        
      case 'mejores prácticas':
        // Show best practices guide
        console.log('Opening UML best practices guide...');
        break;
        
      case 'colaboración':
        // Start collaboration session
        console.log('Starting collaboration session...');
        break;
        
      default:
        console.log('Unknown feature navigation:', feature);
    }
  };

  return (
    <div className="w-full h-screen flex">
      {/* Main editor area */}
      <div className="flex-1 relative">
        {/* Complex UML editor */}
        
        {/* AI Assistant with advanced context */}
        <AIAssistant
          diagramId={diagramContext.diagramId}
          diagramNodes={diagramContext.nodes}
          diagramEdges={diagramContext.edges}
          currentAction={diagramContext.currentAction}
          hasUnsavedChanges={true}
          isCollaborating={diagramContext.collaborators.length > 1}
          onFeatureNavigation={handleAIFeatureNavigation}
          className="z-50"
        />
      </div>
      
      {/* Side panels */}
      <div className="w-80 bg-gray-100 border-l">
        <div className="p-4">
          <h3 className="font-semibold mb-2">Diagram Status</h3>
          <div className="space-y-2 text-sm">
            <div>Nodes: {diagramContext.nodes.length}</div>
            <div>Edges: {diagramContext.edges.length}</div>
            <div>Complexity: {diagramContext.complexity}</div>
            <div>Collaborators: {diagramContext.collaborators.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example 5: Integration with existing page/route structure
export const PageIntegrationExample: React.FC = () => {
  // This example shows how to integrate with existing routing
  // and page structures in a larger application
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-16 bg-blue-600 text-white flex items-center px-6">
        <h1 className="text-xl font-bold">UML Design Studio</h1>
        <div className="ml-auto flex items-center gap-4">
          <span>AI Assistant Available</span>
        </div>
      </header>
      
      {/* Main content area */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-50 border-r">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Project Explorer</h3>
            {/* Project navigation */}
          </div>
        </aside>
        
        {/* Editor area with integrated AI Assistant */}
        <main className="flex-1 relative">
          <UMLFlowEditorWithAI
            diagramId="project-diagram-001"
            initialNodes={[]}
            initialEdges={[]}
            onNodesChange={(nodes) => console.log('Nodes:', nodes.length)}
            onEdgesChange={(edges) => console.log('Edges:', edges.length)}
            onSave={() => console.log('Saving...')}
            isCollaborating={false}
            hasUnsavedChanges={false}
            className="w-full h-full"
          />
        </main>
      </div>
    </div>
  );
};

// Export all examples for easy import
export default {
  BasicAIAssistantExample,
  EnhancedUMLEditorExample,
  ResponsiveAIAssistantExample,
  AdvancedAIAssistantExample,
  PageIntegrationExample
};
