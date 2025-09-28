/**
 * UML Editor Theme - Light Mode Only
 * Fixed light theme for the UML Editor
 */

import type { UMLEditorThemeProps } from './types';

/**
 * Hook that provides theme values for the UML Editor (light mode only)
 */
export const useUMLEditorTheme = (): UMLEditorThemeProps => {
  return {
    theme: 'light',
    
    // Canvas styles
    canvasBackground: 'var(--uml-canvas-bg)',
    gridColor: 'var(--uml-grid-color)',
    
    // Element colors - usando variables CSS directamente
    elementColors: {
      class: {
        background: 'var(--uml-class-bg)',
        border: 'var(--uml-class-border)',
        text: 'var(--uml-class-text)',
        header: 'var(--uml-class-header-bg)',
      },
      
      interface: {
        background: 'var(--uml-interface-bg)',
        border: 'var(--uml-interface-border)',
        text: 'var(--uml-interface-text)',
        header: 'var(--uml-interface-header-bg)',
      },
      
      abstract: {
        background: 'var(--uml-abstract-bg)',
        border: 'var(--uml-abstract-border)',
        text: 'var(--uml-abstract-text)',
        header: 'var(--uml-abstract-header-bg)',
      },
      
      enum: {
        background: 'var(--uml-enum-bg)',
        border: 'var(--uml-enum-border)',
        text: 'var(--uml-enum-text)',
        header: 'var(--uml-enum-header-bg)',
      },
      
      record: {
        background: 'var(--uml-record-bg)',
        border: 'var(--uml-record-border)',
        text: 'var(--uml-record-text)',
        header: 'var(--uml-record-header-bg)',
      },
    },
    
    // Relationship colors - usando variables CSS directamente
    relationshipColors: {
      association: 'var(--uml-association-color)',
      inheritance: 'var(--uml-inheritance-color)',
      composition: 'var(--uml-composition-color)',
      aggregation: 'var(--uml-aggregation-color)',
      dependency: 'var(--uml-dependency-color)',
      realization: 'var(--uml-realization-color)',
      generalization: 'var(--uml-generalization-color)',
    },
    
    // Interactive states
    selectionColor: 'var(--uml-selection-color)',
    hoverColor: 'var(--uml-hover-color)',
  };
};

/**
 * Gets the appropriate color for a UML element based on its type
 */
export const getElementColorsByType = (theme: UMLEditorThemeProps, type: string) => {
  switch (type) {
    case 'INTERFACE':
      return theme.elementColors.interface;
    case 'ABSTRACTCLASS':
      return theme.elementColors.abstract;
    case 'ENUM':
      return theme.elementColors.enum;
    case 'RECORD':
      return theme.elementColors.record;
    default: // CLASS
      return theme.elementColors.class;
  }
};

/**
 * Gets the appropriate color for a UML relationship based on its type
 */
export const getRelationshipColor = (theme: UMLEditorThemeProps, type: string) => {
  switch (type) {
    case 'INHERITANCE':
      return theme.relationshipColors.inheritance;
    case 'COMPOSITION':
      return theme.relationshipColors.composition;
    case 'AGGREGATION':
      return theme.relationshipColors.aggregation;
    case 'DEPENDENCY':
      return theme.relationshipColors.dependency;
    case 'REALIZATION':
      return theme.relationshipColors.realization;
    case 'GENERALIZATION':
      return theme.relationshipColors.generalization;
    default: // ASSOCIATION
      return theme.relationshipColors.association;
  }
};
