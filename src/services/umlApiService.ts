/**
 * Anonymous UML API Service
 * Provides API integration for the UML Editor without authentication
 */

import { anonymousApiClient } from './anonymousApiClient';
import type { 
  UMLClass, 
  UMLAttribute, 
  UMLMethod,
  UMLRelationship,
  Point 
} from '@/components/uml-editor/types';

/**
 * Anonymous UML API Service for interacting with the backend
 */
const umlApiService = {
  // ===== Element CRUD operations =====
  
  /**
   * Create a new UML element
   */
  async createElement(element: Partial<UMLClass>): Promise<UMLClass> {
    try {
      const response = await anonymousApiClient.post('/elements/', element);
      return response.data as UMLClass;
    } catch (error) {
      console.error('Error creating UML element:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing UML element
   */
  async updateElement(id: string, element: Partial<UMLClass>): Promise<UMLClass> {
    try {
      const response = await anonymousApiClient.put(`/elements/${id}/`, element);
      return response.data as UMLClass;
    } catch (error) {
      console.error(`Error updating UML element ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a UML element
   */
  async deleteElement(id: string): Promise<void> {
    try {
      await anonymousApiClient.delete(`/elements/${id}/`);
    } catch (error) {
      console.error(`Error deleting UML element ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get elements by diagram ID
   */
  async getElementsByDiagram(diagramId: string): Promise<UMLClass[]> {
    try {
      const response = await anonymousApiClient.get(`/diagrams/${diagramId}/elements/`);
      return response.data as UMLClass[];
    } catch (error) {
      console.error(`Error fetching elements for diagram ${diagramId}:`, error);
      throw error;
    }
  },
  
  // ===== Attribute operations =====
  /**
   * Add an attribute to a UML element
   */
  async addAttribute(elementId: string, attribute: Partial<UMLAttribute>): Promise<UMLAttribute> {
    try {
      const response = await anonymousApiClient.put(`/elements/${elementId}/add-attribute/`, attribute);
      return response.data as UMLAttribute;
    } catch (error) {
      console.error(`Error adding attribute to element ${elementId}:`, error);
      throw error;
    }
  },
  
  /**
   * Add a method to a UML element
   */
  async addMethod(elementId: string, method: Partial<UMLMethod>): Promise<UMLMethod> {
    try {
      const response = await anonymousApiClient.put(`/elements/${elementId}/add-method/`, method);
      return response.data as UMLMethod;
    } catch (error) {
      console.error(`Error adding method to element ${elementId}:`, error);
      throw error;
    }
  },
  
  // ===== Relationship operations =====
  /**
   * Create a relationship between elements
   */
  async createRelationship(relationship: Partial<UMLRelationship>): Promise<UMLRelationship> {
    try {
      const response = await anonymousApiClient.post('/relationships/', relationship);
      return response.data as UMLRelationship;
    } catch (error) {
      console.error('Error creating relationship:', error);
      throw error;
    }
  },
  
  /**
   * Update a relationship
   */
  async updateRelationship(id: string, updates: Partial<UMLRelationship>): Promise<UMLRelationship> {
    try {
      const response = await anonymousApiClient.put(`/relationships/${id}/`, updates);
      return response.data as UMLRelationship;
    } catch (error) {
      console.error(`Error updating relationship ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a relationship
   */
  async deleteRelationship(id: string): Promise<void> {
    try {
      await anonymousApiClient.delete(`/relationships/${id}/`);
    } catch (error) {
      console.error(`Error deleting relationship ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get relationships for a diagram
   */
  async getDiagramRelationships(diagramId: string): Promise<UMLRelationship[]> {
    try {
      const response = await anonymousApiClient.get(`/diagrams/${diagramId}/relationships/`);
      return response.data as UMLRelationship[];
    } catch (error) {
      console.error(`Error fetching relationships for diagram ${diagramId}:`, error);
      throw error;
    }
  },
  
  // ===== Individual element/relationship getters =====
  /**
   * Get a single element
   */
  async getElement(id: string): Promise<UMLClass> {
    try {
      const response = await anonymousApiClient.get(`/elements/${id}/`);
      return response.data as UMLClass;
    } catch (error) {
      console.error(`Error fetching element ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get a single relationship
   */
  async getRelationship(id: string): Promise<UMLRelationship> {
    try {
      const response = await anonymousApiClient.get(`/relationships/${id}/`);
      return response.data as UMLRelationship;
    } catch (error) {
      console.error(`Error fetching relationship ${id}:`, error);
      throw error;
    }
  }
};

export default umlApiService;
