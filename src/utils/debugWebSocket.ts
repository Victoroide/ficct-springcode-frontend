/**
 * Utilidades de debug para WebSocket
 * Para testing manual en DevTools Console
 */

import { umlCollaborationService } from '@/services/umlCollaborationService';
import { diagramService } from '@/services/diagramService';
import { anonymousSessionService } from '@/services/anonymousSessionService';

// Exponer servicios globalmente para debugging
declare global {
  interface Window {
    UMLDebug: {
      collaboration: typeof umlCollaborationService;
      diagram: typeof diagramService;
      session: typeof anonymousSessionService;
      validateUUID: (id: string) => boolean;
      testWebSocket: (diagramId?: string) => Promise<void>;
      testDiagramSave: () => Promise<void>;
      checkBackendHealth: () => Promise<void>;
      generateTestDiagram: () => any;
    };
  }
}

export function initializeDebugTools() {
  if (typeof window !== 'undefined') {
    window.UMLDebug = {
      collaboration: umlCollaborationService,
      diagram: diagramService,
      session: anonymousSessionService,

      // Validar UUID
      validateUUID(id: string) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const isValid = uuidRegex.test(id);
        console.log(`🔍 ID ${id} es un UUID válido: ${isValid}`);
        return isValid;
      },

      // Test WebSocket connection
      async testWebSocket(diagramId = 'test-diagram') {
        console.log('🧪 Testing WebSocket connection to:', diagramId);
        
        try {
          const events = {
            onConnectionStatus: (connected: boolean) => console.log('🌐 Connection:', connected),
            onUserJoined: (user: any) => console.log('👋 User joined:', user),
            onDiagramUpdate: (data: any) => console.log('🔄 Diagram update:', data),
          };
          
          const result = await umlCollaborationService.initializeDiagram(diagramId, events);
          console.log('✅ WebSocket test result:', result);
          
          // Test sending a message
          setTimeout(() => {
            if (umlCollaborationService.isConnected()) {
              umlCollaborationService.sendChatMessage('Test message from debug');
              console.log('💬 Test chat message sent');
            }
          }, 2000);
          
        } catch (error) {
          console.error('❌ WebSocket test failed:', error);
        }
      },

      // Test diagram save
      async testDiagramSave() {
        console.log('🧪 Testing diagram save...');
        
        const testDiagram = this.generateTestDiagram();
        
        try {
          const result = await diagramService.createDiagram({
            title: 'Test Diagram',
            content: testDiagram,
            diagram_type: 'CLASS',
          });
          
          console.log('✅ Diagram save test successful:', result);
          return result;
        } catch (error) {
          console.error('❌ Diagram save test failed:', error);
          throw error;
        }
      },

      // Check backend health
      async checkBackendHealth() {
        console.log('🧪 Checking backend health...');
        
        try {
          const isHealthy = await diagramService.checkHealth();
          console.log(isHealthy ? '✅ Backend is healthy' : '❌ Backend is not responding');
          
          // Test session
          const session = anonymousSessionService.getOrCreateSession();
          console.log('👤 Current session:', session);
          
          return { backend: isHealthy, session };
        } catch (error) {
          console.error('❌ Health check failed:', error);
          throw error;
        }
      },

      // Generate test diagram data
      generateTestDiagram() {
        return {
          nodes: [
            {
              id: 'node-1',
              type: 'classNode',
              position: { x: 100, y: 100 },
              data: {
                label: 'TestClass',
                attributes: ['id: string', 'name: string'],
                methods: ['constructor()', 'getName(): string']
              }
            },
            {
              id: 'node-2',
              type: 'classNode',
              position: { x: 300, y: 200 },
              data: {
                label: 'AnotherClass',
                attributes: ['value: number'],
                methods: ['getValue(): number']
              }
            }
          ],
          edges: [
            {
              id: 'edge-1',
              source: 'node-1',
              target: 'node-2',
              type: 'default',
              data: { relationshipType: 'ASSOCIATION' }
            }
          ]
        };
      }
    };

    console.log('🔧 UML Debug tools initialized!');
    console.log('Available commands:');
    console.log('  UMLDebug.testWebSocket() - Test WebSocket connection');
    console.log('  UMLDebug.testDiagramSave() - Test diagram saving');
    console.log('  UMLDebug.checkBackendHealth() - Check backend health');
    console.log('  UMLDebug.validateUUID("id") - Check if string is valid UUID');
    console.log('  UMLDebug.collaboration - Access collaboration service');
    console.log('  UMLDebug.diagram - Access diagram service');
    console.log('  UMLDebug.session - Access session service');
  }
}

// Initialize debug tools in development
if (import.meta.env.DEV) {
  initializeDebugTools();
}
