// Stage definitions
export const CONVERSATION_STAGES = {
  NEW: 'new',
  RESPONDED: 'responded', 
  QUALIFIED: 'qualified',
  COMPLETED: 'completed'
} as const;

// Keywords for detecting conversation stages
export const QUALIFYING_KEYWORDS = [
  'speak with an advisor',
  'schedule',
  'appointment', 
  'available to talk',
  'free to speak',
  'call you',
];

export const COMPLETION_KEYWORDS = [
  'scheduled for',
  'booked for',
  'appointment set',
  'call scheduled',
  'http://',
  'https://',
];

// Phone number patterns
export const PHONE_PATTERNS = [
  // UK
  /\b(?:0|\+?44)(?:\s*[()-]?\s*\d){9,11}\b/,
  // USA/Canada  
  /\b(?:\+?1[-.]?)?\s*\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  // Australia
  /\b(?:\+?61|0)[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{3}\b/,
  // General international format
  /\b\+\d{1,4}[-.\s]?\d{6,14}\b/
];