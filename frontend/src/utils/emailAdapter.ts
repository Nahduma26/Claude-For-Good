import { Email } from '../components/EmailCard';

// Backend email format from API
export interface BackendEmail {
  id: string;
  subject: string | null;
  sender_name: string | null;
  sender_email: string | null;
  body_preview: string | null;
  body_content: string | null;
  received_at: string | null;
  is_read: boolean;
  processed: boolean;
  category: string | null;
  urgency: number | null;
  risk_flag: boolean;
  summary: string | null;
  draft_reply: string | null;
}

// Extended email interface with full content for detail view
export interface EmailWithContent extends Email {
  bodyContent?: string | null;
  draftReply?: string | null;
}

// Map urgency number (0-5) to priority (0-1) for frontend
function urgencyToPriority(urgency: number | null): number {
  if (urgency === null) return 0.3;
  // Backend urgency: 0-5, Frontend priority: 0-1
  return Math.min(urgency / 5, 1);
}

// Infer emotion from category and risk flag
function inferEmotion(category: string | null, riskFlag: boolean): 'neutral' | 'anxious' | 'confused' | 'frustrated' | 'calm' {
  if (riskFlag) return 'anxious';
  if (category === 'urgent' || category === 'honor') return 'anxious';
  if (category === 'grades') return 'frustrated';
  if (category === 'clarification') return 'confused';
  if (category === 'extension') return 'calm';
  return 'neutral';
}

// Format timestamp to relative time
function formatTimestamp(dateString: string | null): string {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  } catch {
    return 'Unknown';
  }
}

// Convert backend email to frontend email format
export function adaptBackendEmail(backendEmail: BackendEmail): Email {
  return {
    id: backendEmail.id,
    studentName: backendEmail.sender_name || backendEmail.sender_email?.split('@')[0] || 'Unknown',
    subject: backendEmail.subject || 'No Subject',
    summary: backendEmail.summary || backendEmail.body_preview || 'No preview available',
    priority: urgencyToPriority(backendEmail.urgency),
    category: backendEmail.category || 'all',
    emotion: inferEmotion(backendEmail.category, backendEmail.risk_flag),
    timestamp: formatTimestamp(backendEmail.received_at),
    unread: !backendEmail.is_read,
  };
}

// Convert backend email to extended format with full content
export function adaptBackendEmailWithContent(backendEmail: BackendEmail): EmailWithContent {
  const baseEmail = adaptBackendEmail(backendEmail);
  return {
    ...baseEmail,
    bodyContent: backendEmail.body_content || backendEmail.body_preview,
    draftReply: backendEmail.draft_reply,
  };
}

// Convert array of backend emails
export function adaptBackendEmails(backendEmails: BackendEmail[]): Email[] {
  return backendEmails.map(adaptBackendEmail);
}

