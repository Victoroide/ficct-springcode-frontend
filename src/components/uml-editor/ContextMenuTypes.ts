/**
 * Common type definitions for context menus
 */

// Define a flexible menu item type that can handle any form of divider
export type MenuItem = {
  label: string;
  icon?: string;
  action?: () => void;
  divider?: boolean;
  danger?: boolean;
  disabled?: boolean;
};

export type ContextMenuType = 'canvas' | 'element' | 'relationship';

export interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}
