/**
 * Theme utility functions for UML Editor
 * Light theme only implementation
 */

/**
 * Helper function for conditional styles (light theme only)
 */
export const getConditionalStyles = (styles: any) => {
  return [styles.base, styles.light].filter(Boolean).join(' ');
};
