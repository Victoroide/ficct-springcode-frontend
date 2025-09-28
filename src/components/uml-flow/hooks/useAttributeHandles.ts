/**
 * useAttributeHandles.ts
 * Hook para gestionar los handles de atributos en los nodos UML
 */

import { useCallback } from 'react';
import { Node } from 'reactflow';
import { AttributeField } from '../types/relationships';
import { generateId } from '../types';

interface UseAttributeHandlesParams {
  nodes: Node[];
  setNodes: (nodes: Node[]) => void;
}

export default function useAttributeHandles({ nodes, setNodes }: UseAttributeHandlesParams) {
  
  /**
   * Crear un handle de atributo para permitir conexiones desde/hacia atributos específicos
   */
  const createAttributeHandles = useCallback((
    classNodeId: string, 
    attributes: AttributeField[]
  ) => {
    // Encontrar el nodo de clase para obtener su posición
    const classNode = nodes.find(node => node.id === classNodeId);
    if (!classNode) return;
    
    // Eliminar cualquier handle existente para este nodo
    setNodes(nodes => nodes.filter(n => 
      n.type !== 'attributeHandle' || 
      n.data?.classNodeId !== classNodeId
    ));
    
    // Calcular posiciones para cada atributo
    const attributeHandles = attributes.flatMap(attr => {
      const baseY = classNode.position.y + 60; // Estimar posición base después del encabezado
      const attrIndex = attributes.findIndex(a => a.id === attr.id);
      const verticalOffset = 24 * (attrIndex + 1); // 24px por atributo
      
      // Crear dos handles - uno a la izquierda y otro a la derecha
      return [
        {
          id: `attr-handle-${attr.id}-left`,
          type: 'attributeHandle',
          position: {
            x: classNode.position.x - 15, // 15px a la izquierda del nodo
            y: baseY + verticalOffset
          },
          data: {
            classNodeId,
            attributeId: attr.id,
            attributeName: attr.name,
            attributeType: attr.type,
            side: 'left',
            parentY: baseY + verticalOffset
          },
          // Hacer el nodo invisible en el flujo principal
          style: { 
            opacity: 0,
            pointerEvents: 'all',
            width: 16,
            height: 16
          }
        },
        {
          id: `attr-handle-${attr.id}-right`,
          type: 'attributeHandle',
          position: {
            x: classNode.position.x + (classNode.width || 180) + 15, // 15px a la derecha del nodo
            y: baseY + verticalOffset
          },
          data: {
            classNodeId,
            attributeId: attr.id,
            attributeName: attr.name,
            attributeType: attr.type,
            side: 'right',
            parentY: baseY + verticalOffset
          },
          // Hacer el nodo invisible en el flujo principal
          style: { 
            opacity: 0,
            pointerEvents: 'all',
            width: 16,
            height: 16
          }
        }
      ];
    });
    
    // Agregar los handles al diagrama
    setNodes(currentNodes => [...currentNodes, ...attributeHandles]);
  }, [nodes, setNodes]);
  
  /**
   * Conectar dos atributos con una relación
   */
  const connectAttributes = useCallback((
    sourceNodeId: string,
    sourceAttributeId: string,
    targetNodeId: string,
    targetAttributeId: string,
    relationshipType: string,
    sourceSide: 'left' | 'right',
    targetSide: 'left' | 'right'
  ) => {
    // Crear una nueva relación entre atributos
    const newEdge = {
      id: `edge-${generateId()}`,
      source: `attr-handle-${sourceAttributeId}-${sourceSide}`,
      target: `attr-handle-${targetAttributeId}-${targetSide}`,
      type: 'attributeRelationship',
      data: {
        relationshipType,
        sourceNodeId,
        targetNodeId,
        sourceAttributeId,
        targetAttributeId,
        sourceMultiplicity: '',
        targetMultiplicity: '',
        sourcePosition: sourceSide,
        targetPosition: targetSide
      }
    };
    
    return newEdge;
  }, []);
  
  /**
   * Actualizar posiciones de handles cuando se mueve un nodo
   */
  const updateAttributeHandlePositions = useCallback((nodeId: string, newPosition: { x: number, y: number }) => {
    // Encontrar el nodo de clase
    const classNode = nodes.find(node => node.id === nodeId);
    if (!classNode) return;
    
    // Encontrar los handles asociados a este nodo
    setNodes(currentNodes => 
      currentNodes.map(node => {
        if (node.type === 'attributeHandle' && node.data?.classNodeId === nodeId) {
          // Determinar la posición basada en el lado
          const side = node.data.side;
          const x = side === 'left' 
            ? newPosition.x - 15 
            : newPosition.x + (classNode.width || 180) + 15;
          
          // Calcular offset vertical relativo
          const yOffset = node.position.y - classNode.position.y;
          
          return {
            ...node,
            position: {
              x,
              y: newPosition.y + yOffset
            }
          };
        }
        return node;
      })
    );
  }, [nodes, setNodes]);
  
  return {
    createAttributeHandles,
    connectAttributes,
    updateAttributeHandlePositions
  };
}
