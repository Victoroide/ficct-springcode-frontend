/**
 * UML Element Context Menu Integration
 * A wrapper around ContextMenu with type-safe implementation for UML elements
 */
import React from 'react';
import { ContextMenu } from './ContextMenu';
import type { MenuItem } from './ContextMenuTypes';
import type { UMLClass } from './types';

interface ElementContextMenuProps {
  show: boolean;
  position: { x: number; y: number };
  element: UMLClass;
  onNameEdit: () => void;
  onAttributeAdd: () => void;
  onMethodAdd: () => void;
  onRelationshipStart: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const ElementContextMenu: React.FC<ElementContextMenuProps> = ({
  show,
  position,
  element,
  onNameEdit,
  onAttributeAdd,
  onMethodAdd,
  onRelationshipStart,
  onDelete,
  onClose
}) => {
  if (!show) return null;
  
  // Create properly-typed menu items
  const menuItems: MenuItem[] = [
    {
      label: 'Edit Name',
      icon: '✏️',
      action: onNameEdit
    },
    {
      label: 'Change Type',
      icon: '🔄',
      action: () => console.log('Change type not implemented')
    },
    {
      divider: true
    },
    {
      label: 'Add Attribute',
      icon: '➕',
      action: onAttributeAdd
    },
    {
      label: 'Add Method',
      icon: '➕',
      action: onMethodAdd
    },
    {
      divider: true
    },
    {
      label: 'Create Relationship',
      icon: '↔️',
      action: onRelationshipStart
    },
    {
      divider: true
    },
    {
      label: 'Delete',
      icon: '🗑️',
      action: onDelete,
      danger: true
    }
  ];
  
  return (
    <ContextMenu
      x={position.x}
      y={position.y}
      items={menuItems}
      onClose={onClose}
    />
  );
};

export default ElementContextMenu;
