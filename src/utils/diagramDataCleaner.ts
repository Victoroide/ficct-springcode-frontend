/**
 * Diagram Data Cleaner Utility
 * Removes duplicates and invalid data before saving to backend
 */

import type { Node, Edge } from 'reactflow';

export interface CleanedDiagramData {
  nodes: Node[];
  edges: Edge[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Clean diagram data by removing duplicates and fixing inconsistencies
 */
export function cleanDiagramData(nodes: Node[], edges: Edge[]): CleanedDiagramData {
  console.log('[DiagramCleaner] Starting cleanup, input nodes:', nodes.length);
  
  // STEP 1: Remove duplicate nodes (keep last version by ID)
  const nodeMap = new Map<string, Node>();
  
  for (const node of nodes) {
    if (node && node.id) {
      nodeMap.set(node.id, node);
    }
  }
  
  const uniqueNodes = Array.from(nodeMap.values());
  
  // STEP 1.5: CRITICAL - Filter out invalid nodes (Unnamed Class, missing labels)
  const validNodes = uniqueNodes.filter(node => {
    // Check for missing label
    const label = node.data?.label;
    
    if (!label || label.trim() === '') {
      console.warn('[DiagramCleaner] REMOVING node without label:', node.id);
      return false;
    }
    
    // Check for "Unnamed Class"
    if (label === 'Unnamed Class') {
      console.warn('[DiagramCleaner] REMOVING "Unnamed Class" node:', node.id);
      return false;
    }
    
    // Check for missing data
    if (!node.data) {
      console.warn('[DiagramCleaner] REMOVING node without data:', node.id);
      return false;
    }
    
    return true;
  });
  
  console.log('[DiagramCleaner] Filtered out', uniqueNodes.length - validNodes.length, 'invalid nodes');
  console.log('[DiagramCleaner] Valid nodes remaining:', validNodes.length);
  
  // STEP 2: Get valid node IDs (from validNodes, not uniqueNodes!)
  const validNodeIds = new Set(validNodes.map(n => n.id));
  
  // STEP 3: Filter edges to only reference existing nodes
  const validEdges = edges.filter(edge => {
    return edge && 
           edge.id && 
           edge.source && 
           edge.target &&
           validNodeIds.has(edge.source) && 
           validNodeIds.has(edge.target);
  });
  
  // STEP 4: Remove duplicate edges (same source and target)
  const edgeMap = new Map<string, Edge>();
  
  for (const edge of validEdges) {
    const edgeKey = `${edge.source}-${edge.target}`;
    edgeMap.set(edgeKey, edge);
  }
  
  const uniqueEdges = Array.from(edgeMap.values());
  
  // STEP 5: Ensure attribute and method IDs are present (use validNodes!)
  const cleanedNodes = validNodes.map(node => {
    const cleanedNode = { ...node };
    
    if (cleanedNode.data) {
      cleanedNode.data = { ...cleanedNode.data };
      
      // Clean attributes
      if (Array.isArray(cleanedNode.data.attributes)) {
        cleanedNode.data.attributes = cleanedNode.data.attributes.map((attr, idx) => ({
          ...attr,
          id: attr.id || `attr-${cleanedNode.id}-${idx + 1}`
        }));
      }
      
      // Clean methods
      if (Array.isArray(cleanedNode.data.methods)) {
        cleanedNode.data.methods = cleanedNode.data.methods.map((method, idx) => ({
          ...method,
          id: method.id || `method-${cleanedNode.id}-${idx + 1}`
        }));
      }
    }
    
    return cleanedNode;
  });
  
  return {
    nodes: cleanedNodes,
    edges: uniqueEdges
  };
}

/**
 * Validate diagram data for issues
 */
export function validateDiagramData(nodes: Node[], edges: Edge[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for null/undefined nodes
  const validNodes = nodes.filter(n => n && n.id);
  if (validNodes.length < nodes.length) {
    warnings.push(`${nodes.length - validNodes.length} invalid nodes removed`);
  }
  
  // Check for duplicate node IDs
  const nodeIds = validNodes.map(n => n.id);
  const duplicateIds = nodeIds.filter((id, idx) => 
    nodeIds.indexOf(id) !== idx
  );
  
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate node IDs found: ${[...new Set(duplicateIds)].join(', ')}`);
  }
  
  // Check for valid node IDs set
  const validNodeIds = new Set(nodeIds);
  
  // Check for null/undefined edges
  const validEdges = edges.filter(e => e && e.id && e.source && e.target);
  if (validEdges.length < edges.length) {
    warnings.push(`${edges.length - validEdges.length} invalid edges removed`);
  }
  
  // Check for orphaned edges
  const orphanedEdges = validEdges.filter(edge => 
    !validNodeIds.has(edge.source) || 
    !validNodeIds.has(edge.target)
  );
  
  if (orphanedEdges.length > 0) {
    errors.push(`${orphanedEdges.length} orphaned edges found (reference non-existent nodes)`);
  }
  
  // Check for duplicate edges
  const edgeKeys = validEdges.map(e => `${e.source}-${e.target}`);
  const duplicateEdges = edgeKeys.filter((key, idx) => 
    edgeKeys.indexOf(key) !== idx
  );
  
  if (duplicateEdges.length > 0) {
    warnings.push(`${duplicateEdges.length} duplicate edges found`);
  }
  
  // Check for missing attribute IDs
  const nodesWithoutAttrIds = validNodes.filter(node =>
    node.data?.attributes?.some(attr => !attr.id)
  );
  
  if (nodesWithoutAttrIds.length > 0) {
    warnings.push(`${nodesWithoutAttrIds.length} nodes have attributes without IDs`);
  }
  
  // Check for missing method IDs
  const nodesWithoutMethodIds = validNodes.filter(node =>
    node.data?.methods?.some(method => !method.id)
  );
  
  if (nodesWithoutMethodIds.length > 0) {
    warnings.push(`${nodesWithoutMethodIds.length} nodes have methods without IDs`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Clean and validate diagram data before saving
 * Logs validation results and returns cleaned data
 */
export function cleanAndValidateDiagramData(
  nodes: Node[], 
  edges: Edge[]
): CleanedDiagramData {
  // First validate to see what's wrong
  const validation = validateDiagramData(nodes, edges);
  
  if (!validation.valid || validation.warnings.length > 0) {
    if (validation.errors.length > 0) {
      console.error('[DiagramCleaner] Validation errors:', validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.warn('[DiagramCleaner] Validation warnings:', validation.warnings);
    }
  }
  
  // Clean the data
  const cleaned = cleanDiagramData(nodes, edges);
  
  // Validate cleaned data
  const revalidation = validateDiagramData(cleaned.nodes, cleaned.edges);
  
  if (!revalidation.valid) {
    console.error('[DiagramCleaner] Still invalid after cleaning:', revalidation.errors);
  }
  
  return cleaned;
}

/**
 * Merge new nodes with existing nodes by ID (prevents duplicates)
 */
export function mergeNodesByID(existingNodes: Node[], newNodes: Node[]): Node[] {
  const nodeMap = new Map<string, Node>();
  
  // Add existing nodes first
  for (const node of existingNodes) {
    if (node && node.id) {
      nodeMap.set(node.id, node);
    }
  }
  
  // Merge or add new nodes
  for (const node of newNodes) {
    if (node && node.id) {
      nodeMap.set(node.id, node);
    }
  }
  
  return Array.from(nodeMap.values());
}

/**
 * Merge new edges with existing edges by source-target pair
 */
export function mergeEdgesByID(existingEdges: Edge[], newEdges: Edge[]): Edge[] {
  const edgeMap = new Map<string, Edge>();
  
  // Add existing edges first
  for (const edge of existingEdges) {
    if (edge && edge.id) {
      edgeMap.set(edge.id, edge);
    }
  }
  
  // Merge or add new edges
  for (const edge of newEdges) {
    if (edge && edge.id) {
      edgeMap.set(edge.id, edge);
    }
  }
  
  return Array.from(edgeMap.values());
}
