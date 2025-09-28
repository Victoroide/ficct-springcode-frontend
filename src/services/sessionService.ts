/**
 * Anonymous Session Service
 * Manages local session state without authentication
 */

export interface AnonymousSession {
  sessionId: string;
  nickname: string;
  createdAt: Date;
  diagramIds: string[];
}

/**
 * Generate a random session ID
 */
export const generateSessionId = (): string => {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Generate a random anonymous nickname
 */
export const generateNickname = (): string => {
  const adjectives = ['Creative', 'Smart', 'Quick', 'Bright', 'Cool', 'Swift', 'Sharp', 'Clever', 'Wise', 'Bold'];
  const animals = ['Fox', 'Wolf', 'Eagle', 'Lion', 'Tiger', 'Bear', 'Hawk', 'Owl', 'Cat', 'Dog'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  return `${adjective}${animal}${number}`;
};

/**
 * Get or create a session ID for the current browser
 */
export const getOrCreateSession = (): string => {
  let sessionId = localStorage.getItem('diagram_session');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('diagram_session', sessionId);
  }
  return sessionId;
};

/**
 * Get or create a nickname for the current browser
 */
export const getNickname = (): string => {
  let nickname = localStorage.getItem('diagram_nickname');
  if (!nickname) {
    nickname = generateNickname();
    localStorage.setItem('diagram_nickname', nickname);
  }
  return nickname;
};

/**
 * Update the current session nickname
 */
export const updateNickname = (newNickname: string): void => {
  localStorage.setItem('diagram_nickname', newNickname);
};

/**
 * Add a diagram ID to the current session
 */
export const addDiagramToSession = (diagramId: string): void => {
  const diagramIds = getDiagramIds();
  if (!diagramIds.includes(diagramId)) {
    diagramIds.push(diagramId);
    localStorage.setItem('diagram_ids', JSON.stringify(diagramIds));
  }
};

/**
 * Get all diagram IDs associated with the current session
 */
export const getDiagramIds = (): string[] => {
  const stored = localStorage.getItem('diagram_ids');
  return stored ? JSON.parse(stored) : [];
};

/**
 * Clear the current session
 */
export const clearSession = (): void => {
  localStorage.removeItem('diagram_session');
  localStorage.removeItem('diagram_nickname');
  localStorage.removeItem('diagram_ids');
};

/**
 * Get current session information
 */
export const getCurrentSession = (): AnonymousSession => {
  return {
    sessionId: getOrCreateSession(),
    nickname: getNickname(),
    createdAt: new Date(),
    diagramIds: getDiagramIds()
  };
};

export default {
  getOrCreateSession,
  getNickname,
  updateNickname,
  addDiagramToSession,
  getDiagramIds,
  clearSession,
  getCurrentSession,
  generateNickname
};
