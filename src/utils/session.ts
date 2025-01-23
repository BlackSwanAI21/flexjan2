// Generate a unique session ID
export function generateSessionId(): string {
  return 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Get or create a session ID from localStorage
export function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
}