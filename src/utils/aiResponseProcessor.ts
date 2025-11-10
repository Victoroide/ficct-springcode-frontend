/**
 * AI Response Processor - Defensive Architecture
 * 
 * Multi-layered validation and processing system for AI-generated diagram elements.
 * Prevents duplicates, validates data integrity, and provides graceful degradation.
 * 
 * PHILOSOPHY: Never trust external data sources completely.
 * Frontend is the last line of defense for user experience.
 */

import type { Node, Edge } from 'reactflow';

// ═══════════════════════════════════════════════════════════════════
// TYPES AND INTERFACES
// ═══════════════════════════════════════════════════════════════════

export interface AIResponseValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  validElements: AIElement[];
}

export interface AIElement {
  type: 'node' | 'edge';
  data: Node | Edge;
}

export interface ProcessingStats {
  nodesAdded: number;
  nodesUpdated: number;
  edgesAdded: number;
  duplicatesRemoved: number;
  warnings: string[];
  processingTime: number;
}

export interface DiagramState {
  nodes: Node[];
  edges: Edge[];
}

// ═══════════════════════════════════════════════════════════════════
// LAYER 1: RESPONSE VALIDATION AND SANITIZATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Validate AI response structure and content
 */
export function validateAIResponse(response: any): AIResponseValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validElements: AIElement[] = [];

  // Stage 1: Structure Validation
  if (!response) {
    errors.push('Response is null or undefined');
    return { valid: false, errors, warnings, validElements };
  }

  if (!response.elements && !response.elements_generated) {
    errors.push('Missing elements field in response');
  }

  const elements = response.elements || response.elements_generated || [];

  if (!Array.isArray(elements)) {
    errors.push('Elements must be an array');
    return { valid: false, errors, warnings, validElements };
  }

  // Stage 2: Elements Validation
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    
    console.log(`[AI Processor] Validating element ${i}:`, element);
    
    if (!element) {
      warnings.push(`Element at index ${i} is null or undefined`);
      continue;
    }

    const elementType = element.element_type || element.type;
    console.log(`[AI Processor] Element ${i} type:`, elementType);

    // Validate Node
    if (elementType === 'class' || elementType === 'node') {
      // Handle multiple possible data structures
      const nodeData = element.element_data || element.data;
      
      if (!nodeData) {
        warnings.push(`Node at index ${i} missing data field`);
        continue;
      }

      // Extract node ID from multiple possible locations
      const nodeId = nodeData.id || element.id;
      
      // Extract label from multiple possible locations (handle nested data.data structure)
      const nodeLabel = nodeData.data?.label || nodeData.label || nodeData.name || nodeData.data?.name;
      
      // Extract attributes from multiple possible locations
      const attributes = nodeData.data?.attributes || nodeData.attributes || [];
      
      // Extract methods from multiple possible locations
      const methods = nodeData.data?.methods || nodeData.methods || [];
      
      // Extract position
      const position = nodeData.position || nodeData.data?.position || { x: 0, y: 0 };
      
      // Extract additional properties
      const nodeType = nodeData.data?.nodeType || nodeData.nodeType || 'class';
      const isAbstract = nodeData.data?.isAbstract || nodeData.isAbstract || false;

      if (!nodeId) {
        warnings.push(`Node at index ${i} missing ID, skipping`);
        continue;
      }

      // CRITICAL: Reject nodes without valid labels instead of creating "Unnamed Class"
      if (!nodeLabel || nodeLabel.trim() === '' || nodeLabel === 'Unnamed Class') {
        console.error(`[AI Processor] REJECTING node "${nodeId}" - invalid label: "${nodeLabel}"`);
        console.error('[AI Processor] Rejected node data:', nodeData);
        console.trace('[AI Processor] Trace of rejected node creation');
        warnings.push(`Node "${nodeId}" has invalid label "${nodeLabel}", REJECTED (will not be added to diagram)`);
        continue; // Skip this node entirely
      }

      // Check for duplicate IDs within response
      if (nodeIds.has(nodeId)) {
        warnings.push(`Duplicate node ID "${nodeId}" in response, keeping last version`);
      }

      nodeIds.add(nodeId);

      // Build valid node element - CRITICAL: Use 'class' not 'umlClass'
      const validNode: Node = {
        id: nodeId,
        type: 'class',  // FIXED: Was 'umlClass', should be 'class'
        position: position,
        data: {
          label: nodeLabel, // No fallback - we already validated it's not empty
          attributes: Array.isArray(attributes) ? attributes : [],
          methods: Array.isArray(methods) ? methods : [],
          nodeType: nodeType as any,
          isAbstract: isAbstract
        }
      };

      console.log(`[AI Processor] ✓ Built valid node "${nodeLabel}" with ${attributes.length} attributes`);
      console.log('[AI Processor] Valid node:', validNode);

      validElements.push({ type: 'node', data: validNode });
    }
    
    // Validate Edge
    else if (elementType === 'relationship' || elementType === 'edge') {
      // Handle multiple possible data structures
      const edgeData = element.element_data || element.data;
      
      if (!edgeData) {
        warnings.push(`Edge at index ${i} missing data field`);
        continue;
      }

      // Extract edge properties from multiple possible locations
      const edgeId = edgeData.id || element.id;
      const source = edgeData.source || edgeData.from;
      const target = edgeData.target || edgeData.to;
      
      // Handle nested data.data structure for relationship properties
      const relationshipType = edgeData.data?.relationshipType || edgeData.relationshipType || edgeData.type || 'ASSOCIATION';
      const sourceMultiplicity = edgeData.data?.sourceMultiplicity || edgeData.sourceMultiplicity || '1';
      const targetMultiplicity = edgeData.data?.targetMultiplicity || edgeData.targetMultiplicity || '1';
      const label = edgeData.data?.label || edgeData.label || '';

      if (!edgeId) {
        warnings.push(`Edge at index ${i} missing ID, skipping`);
        continue;
      }

      if (!source || !target) {
        warnings.push(`Edge "${edgeId}" missing source or target, skipping`);
        continue;
      }

      // Check for duplicate edge IDs
      if (edgeIds.has(edgeId)) {
        warnings.push(`Duplicate edge ID "${edgeId}" in response, keeping last version`);
      }

      edgeIds.add(edgeId);

      // Build valid edge element
      const validEdge: Edge = {
        id: edgeId,
        source: source,
        target: target,
        type: 'umlRelationship',
        data: {
          relationshipType: relationshipType as any,
          sourceMultiplicity: sourceMultiplicity,
          targetMultiplicity: targetMultiplicity,
          label: label
        }
      };

      validElements.push({ type: 'edge', data: validEdge });
    }
    else {
      warnings.push(`Unknown element type at index ${i}: ${elementType}`);
    }
  }

  // Stage 3: Reference Integrity (will be checked later with existing nodes)
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    validElements
  };
}

// ═══════════════════════════════════════════════════════════════════
// LAYER 2: DUPLICATE DETECTION AND PREVENTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Create semantic signature for node to detect duplicates by content
 */
function createNodeSignature(node: Node): string {
  const label = node.data?.label || '';
  const attrNames = (node.data?.attributes || [])
    .map((a: any) => a.name)
    .sort()
    .join(',');
  
  return `${label.toLowerCase().trim()}:${attrNames}`;
}

/**
 * Detect semantic duplicates (same content, different IDs)
 */
export function detectSemanticDuplicates(nodes: Node[]): { unique: Node[]; duplicates: number } {
  const seen = new Map<string, Node>();
  const unique: Node[] = [];
  let duplicates = 0;

  for (const node of nodes) {
    const signature = createNodeSignature(node);
    
    if (!seen.has(signature)) {
      seen.set(signature, node);
      unique.push(node);
    } else {
      console.warn('[AI Processor] Semantic duplicate detected:', node.data?.label);
      duplicates++;
    }
  }

  return { unique, duplicates };
}

/**
 * Detect edge duplicates (same source-target-type)
 */
export function detectEdgeDuplicates(edges: Edge[]): { unique: Edge[]; duplicates: number } {
  const seen = new Map<string, Edge>();
  const unique: Edge[] = [];
  let duplicates = 0;

  for (const edge of edges) {
    const key = `${edge.source}-${edge.target}-${edge.data?.relationshipType || 'ASSOCIATION'}`;
    
    if (!seen.has(key)) {
      seen.set(key, edge);
      unique.push(edge);
    } else {
      console.warn('[AI Processor] Duplicate edge detected:', key);
      duplicates++;
    }
  }

  return { unique, duplicates };
}

/**
 * Merge new elements with existing diagram (IDEMPOTENT)
 */
export function mergeElements(
  currentNodes: Node[],
  currentEdges: Edge[],
  newElements: AIElement[]
): DiagramState {
  const nodeMap = new Map<string, Node>();
  const edgeMap = new Map<string, Edge>();

  // Add existing elements first
  for (const node of currentNodes) {
    nodeMap.set(node.id, node);
  }

  for (const edge of currentEdges) {
    edgeMap.set(edge.id, edge);
  }

  // Merge or add new elements
  for (const element of newElements) {
    if (element.type === 'node') {
      const node = element.data as Node;
      nodeMap.set(node.id, node);
    } else if (element.type === 'edge') {
      const edge = element.data as Edge;
      edgeMap.set(edge.id, edge);
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values())
  };
}

// ═══════════════════════════════════════════════════════════════════
// LAYER 3: DATA CLEANING AND SANITIZATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Generate unique ID
 */
function generateId(prefix: string = 'generated'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clean and sanitize node data
 * CRITICAL: This should only be called on nodes that have already passed validation
 */
export function cleanNode(node: Node): Node {
  // Validate node has a label - this should never happen if validation worked
  const label = node.data?.label;
  if (!label || label.trim() === '' || label === 'Unnamed Class') {
    console.error('[cleanNode] CRITICAL: Node without valid label reached cleaning stage!');
    console.error('[cleanNode] Node:', node);
    console.trace('[cleanNode] Trace of invalid node in cleaning');
    // Throw error instead of creating "Unnamed Class"
    throw new Error(`Invalid node without label reached cleaning stage: ${node.id}`);
  }

  return {
    ...node,
    id: node.id || generateId('node'),
    type: node.type || 'class', // Fixed: was 'umlClass', should be 'class'
    position: node.position || { x: 100, y: 100 },
    data: {
      ...node.data,
      label: label, // No fallback - we already validated it
      attributes: (node.data?.attributes || []).map((attr: any, idx: number) => ({
        id: attr.id || generateId(`attr-${node.id}-${idx}`),
        name: attr.name || 'unnamed',
        type: attr.type || 'String',
        visibility: attr.visibility || 'private',
        isStatic: attr.isStatic || false,
        isFinal: attr.isFinal || false
      })),
      methods: (node.data?.methods || []).map((method: any, idx: number) => ({
        id: method.id || generateId(`method-${node.id}-${idx}`),
        name: method.name || 'unnamed',
        returnType: method.returnType || 'void',
        visibility: method.visibility || 'public',
        parameters: method.parameters || [],
        isStatic: method.isStatic || false,
        isAbstract: method.isAbstract || false
      }))
    }
  };
}

/**
 * Clean and sanitize edge data
 */
export function cleanEdge(edge: Edge): Edge {
  return {
    ...edge,
    id: edge.id || generateId('edge'),
    type: edge.type || 'umlRelationship',
    source: edge.source,
    target: edge.target,
    data: {
      ...edge.data,
      relationshipType: edge.data?.relationshipType || 'ASSOCIATION',
      sourceMultiplicity: edge.data?.sourceMultiplicity || '1',
      targetMultiplicity: edge.data?.targetMultiplicity || '1',
      label: edge.data?.label || ''
    }
  };
}

/**
 * Clean all elements
 */
export function cleanElements(elements: AIElement[]): AIElement[] {
  return elements.map(element => {
    if (element.type === 'node') {
      return { type: 'node', data: cleanNode(element.data as Node) };
    } else if (element.type === 'edge') {
      return { type: 'edge', data: cleanEdge(element.data as Edge) };
    }
    return element;
  });
}

// ═══════════════════════════════════════════════════════════════════
// LAYER 4: REFERENCE INTEGRITY VALIDATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Validate and clean reference integrity
 */
export function validateReferenceIntegrity(diagram: DiagramState): DiagramState {
  const nodeIds = new Set(diagram.nodes.map(n => n.id));
  const validEdges: Edge[] = [];
  const orphanedEdges: string[] = [];

  for (const edge of diagram.edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      validEdges.push(edge);
    } else {
      orphanedEdges.push(edge.id);
      console.warn('[AI Processor] Orphaned edge removed:', edge.id, 
        `(source: ${edge.source}, target: ${edge.target})`);
    }
  }

  if (orphanedEdges.length > 0) {
    console.warn(`[AI Processor] Removed ${orphanedEdges.length} orphaned edges`);
  }

  return {
    nodes: diagram.nodes,
    edges: validEdges
  };
}

// ═══════════════════════════════════════════════════════════════════
// LAYER 5: POSITION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

/**
 * Find empty position avoiding overlaps
 */
function findEmptyPosition(occupied: Set<string>): { x: number; y: number } {
  let x = 100;
  let y = 100;
  const step = 300;
  const maxX = 1500;

  while (occupied.has(`${x},${y}`)) {
    x += step;
    if (x > maxX) {
      x = 100;
      y += step;
    }
  }

  return { x, y };
}

/**
 * Sanitize positions to prevent overlaps
 */
export function sanitizePositions(diagram: DiagramState): DiagramState {
  const occupied = new Set<string>();

  const adjustedNodes = diagram.nodes.map(node => {
    let pos = node.position || { x: 0, y: 0 };
    
    // If position is 0,0, find a new position
    if (pos.x === 0 && pos.y === 0) {
      pos = findEmptyPosition(occupied);
    }

    // Check for overlaps and adjust
    let key = `${Math.round(pos.x / 50) * 50},${Math.round(pos.y / 50) * 50}`;
    
    while (occupied.has(key)) {
      pos = { x: pos.x + 300, y: pos.y };
      key = `${Math.round(pos.x / 50) * 50},${Math.round(pos.y / 50) * 50}`;
    }

    occupied.add(key);

    return { ...node, position: pos };
  });

  return {
    nodes: adjustedNodes,
    edges: diagram.edges
  };
}

// ═══════════════════════════════════════════════════════════════════
// LAYER 6: COMPLETE PROCESSING PIPELINE
// ═══════════════════════════════════════════════════════════════════

/**
 * Process AI response with full defensive pipeline
 */
export function processAIResponse(
  response: any,
  currentDiagram: DiagramState
): { result: DiagramState | null; stats: ProcessingStats } {
  const startTime = Date.now();
  const stats: ProcessingStats = {
    nodesAdded: 0,
    nodesUpdated: 0,
    edgesAdded: 0,
    duplicatesRemoved: 0,
    warnings: [],
    processingTime: 0
  };

  console.log('═══════════════════════════════════════════════════');
  console.log('[AI Processor] Starting defensive processing pipeline');
  console.log('[AI Processor] Input response:', response);
  console.log('[AI Processor] Current diagram nodes:', currentDiagram.nodes.length);
  console.log('[AI Processor] Current diagram edges:', currentDiagram.edges.length);

  // STEP 1: Validate response
  const validation = validateAIResponse(response);
  
  if (!validation.valid) {
    console.error('[AI Processor] Validation failed:', validation.errors);
    stats.warnings.push(...validation.errors);
    stats.processingTime = Date.now() - startTime;
    return { result: null, stats };
  }

  if (validation.warnings.length > 0) {
    console.warn('[AI Processor] Validation warnings:', validation.warnings);
    stats.warnings.push(...validation.warnings);
  }

  // STEP 2: Clean elements
  const cleaned = cleanElements(validation.validElements);

  // STEP 3: Extract nodes and edges
  const newNodes = cleaned.filter(e => e.type === 'node').map(e => e.data as Node);
  const newEdges = cleaned.filter(e => e.type === 'edge').map(e => e.data as Edge);

  // STEP 4: Detect semantic duplicates in new elements
  const { unique: uniqueNodes, duplicates: nodeDuplicates } = detectSemanticDuplicates(newNodes);
  const { unique: uniqueEdges, duplicates: edgeDuplicates } = detectEdgeDuplicates(newEdges);
  
  stats.duplicatesRemoved = nodeDuplicates + edgeDuplicates;

  // STEP 5: Merge with existing diagram
  const uniqueElements: AIElement[] = [
    ...uniqueNodes.map(n => ({ type: 'node' as const, data: n })),
    ...uniqueEdges.map(e => ({ type: 'edge' as const, data: e }))
  ];

  let merged = mergeElements(currentDiagram.nodes, currentDiagram.edges, uniqueElements);

  // STEP 6: Validate reference integrity
  merged = validateReferenceIntegrity(merged);

  // STEP 7: Sanitize positions
  merged = sanitizePositions(merged);

  // STEP 8: Calculate stats
  stats.nodesAdded = merged.nodes.length - currentDiagram.nodes.length;
  stats.edgesAdded = merged.edges.length - currentDiagram.edges.length;
  stats.nodesUpdated = countUpdates(currentDiagram.nodes, merged.nodes);
  stats.processingTime = Date.now() - startTime;

  console.log('[AI Processor] Processing complete:', {
    nodesAdded: stats.nodesAdded,
    nodesUpdated: stats.nodesUpdated,
    edgesAdded: stats.edgesAdded,
    duplicatesRemoved: stats.duplicatesRemoved,
    processingTime: `${stats.processingTime}ms`
  });

  return { result: merged, stats };
}

/**
 * Count how many nodes were updated (not added)
 */
function countUpdates(oldNodes: Node[], newNodes: Node[]): number {
  const oldIds = new Set(oldNodes.map(n => n.id));
  let updates = 0;

  for (const node of newNodes) {
    if (oldIds.has(node.id)) {
      updates++;
    }
  }

  // Subtract nodes that weren't actually modified
  return Math.max(0, updates - (newNodes.length - oldNodes.length));
}

// ═══════════════════════════════════════════════════════════════════
// LAYER 7: ERROR RECOVERY
// ═══════════════════════════════════════════════════════════════════

export interface ProcessingError {
  code: 'TIMEOUT' | 'INVALID_JSON' | 'VALIDATION_ERROR' | 'UNKNOWN';
  message: string;
  recoverable: boolean;
}

/**
 * Handle processing errors with recovery strategies
 */
export function handleProcessingError(error: any): ProcessingError {
  if (error.name === 'AbortError' || error.code === 'TIMEOUT') {
    return {
      code: 'TIMEOUT',
      message: 'AI processing timed out. Please try again.',
      recoverable: true
    };
  }

  if (error instanceof SyntaxError || error.message?.includes('JSON')) {
    return {
      code: 'INVALID_JSON',
      message: 'AI returned invalid response format.',
      recoverable: true
    };
  }

  if (error.message?.includes('validation')) {
    return {
      code: 'VALIDATION_ERROR',
      message: error.message,
      recoverable: false
    };
  }

  return {
    code: 'UNKNOWN',
    message: error.message || 'An unexpected error occurred.',
    recoverable: false
  };
}
