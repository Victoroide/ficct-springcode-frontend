/**
 * Protected AI Assistant Component - Simplified Version
 * Wraps AI Assistant with password protection and authentication
 */

import React, { useState } from 'react';
import { useAIAuthentication } from '@/hooks/useAIAuthentication';
import { AIPasswordModal } from './AIPasswordModal';
import AIAssistantComplete from './AIAssistantComplete';
import type { UMLNode, UMLEdge } from '@/components/uml-flow/types';

interface ProtectedAIAssistantProps {
  diagramId?: string;
  diagramNodes?: UMLNode[];
  diagramEdges?: UMLEdge[];
  onElementsGenerated?: (elements: { nodes: UMLNode[]; edges: UMLEdge[] }) => void;
  className?: string;
}

export const ProtectedAIAssistant: React.FC<ProtectedAIAssistantProps> = ({
  diagramId,
  diagramNodes = [],
  diagramEdges = [],
  onElementsGenerated,
  className = ''
}) => {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const {
    isAuthenticated,
    authenticateUser,
    logout,
    attempts,
    maxAttempts
  } = useAIAuthentication();

  // Check if AI features are enabled
  const aiEnabled = import.meta.env.VITE_AI_FEATURES_ENABLED === 'true';

  if (!aiEnabled) {
    return null;
  }

  const handleOpenAI = () => {
    
    if (!isAuthenticated) {
      setShowPasswordModal(true);
    } else {
      setIsAIOpen(true);
    }
  };

  const handleAuthentication = (password: string) => {
    const success = authenticateUser(password);
    if (success) {
      setShowPasswordModal(false);
      setIsAIOpen(true);
    }
    return success;
  };

  const handleLogout = () => {
    logout();
    setIsAIOpen(false);
  };

  const handleToggle = () => {
    setIsAIOpen(!isAIOpen);
  };

  return null; // No renderiza nada, la protección está en el toolbar
};

export default ProtectedAIAssistant;
