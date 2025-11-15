// Email categories based on backend AI categorization
export const EMAIL_CATEGORIES = {
  URGENT: 'urgent',
  ACADEMIC: 'academic',
  ADMINISTRATIVE: 'administrative',
  PERSONAL: 'personal',
  RESEARCH: 'research',
  STUDENT_INQUIRY: 'student_inquiry',
  MEETING: 'meeting',
  OTHER: 'other'
} as const;

export type EmailCategory = typeof EMAIL_CATEGORIES[keyof typeof EMAIL_CATEGORIES];

// Priority levels (1-5 scale from backend)
export const PRIORITY_LEVELS = {
  VERY_LOW: 1,
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  VERY_HIGH: 5
} as const;

export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];

// Email importance levels from Microsoft
export const IMPORTANCE_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high'
} as const;

export type ImportanceLevel = typeof IMPORTANCE_LEVELS[keyof typeof IMPORTANCE_LEVELS];

// Processing status
export const PROCESSING_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  FAILED: 'failed'
} as const;

export type ProcessingStatus = typeof PROCESSING_STATUS[keyof typeof PROCESSING_STATUS];

// User preferences
export const TONE_PROFILES = {
  PROFESSIONAL: 'professional',
  FRIENDLY: 'friendly',
  FORMAL: 'formal'
} as const;

export type ToneProfile = typeof TONE_PROFILES[keyof typeof TONE_PROFILES];

export const REPLY_LENGTHS = {
  SHORT: 'short',
  MEDIUM: 'medium',
  LONG: 'long'
} as const;

export type ReplyLength = typeof REPLY_LENGTHS[keyof typeof REPLY_LENGTHS];