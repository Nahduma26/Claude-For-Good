import api from '../lib/api';

export interface Email {
  id: number;
  subject: string;
  sender_email: string;
  sender_name: string;
  body_preview: string;
  received_at: string;
  importance: string;
  is_read: boolean;
  has_attachments: boolean;
  processing_status: string;
  ai_category: string;
  priority_level: number;
  requires_reply: boolean;
  reply_generated: boolean;
  reply_sent: boolean;
}

export interface EmailsResponse {
  success: boolean;
  emails: Email[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface DailyDigest {
  date: string;
  total_emails: number;
  categories_summary: Record<string, number>;
  urgent_emails: Email[];
  summary: string;
}

export const emailService = {
  // Get emails with pagination and filters
  async getEmails(params?: {
    page?: number;
    per_page?: number;
    category?: string;
    urgency?: string;
    unread_only?: boolean;
  }): Promise<EmailsResponse> {
    const response = await api.get('/emails/', { params });
    return response.data;
  },

  // Get email details by ID
  async getEmailById(emailId: number): Promise<Email> {
    const response = await api.get(`/emails/${emailId}`);
    return response.data.email;
  },

  // Mark email as read/unread
  async markAsRead(emailId: number, isRead: boolean = true): Promise<void> {
    await api.put(`/emails/${emailId}/read`, { is_read: isRead });
  },

  // Generate reply for email
  async generateReply(emailId: number, preferences?: string): Promise<{ reply: string }> {
    const response = await api.post(`/emails/${emailId}/generate-reply`, { preferences });
    return response.data;
  },

  // Send reply
  async sendReply(emailId: number, replyContent: string): Promise<void> {
    await api.post(`/emails/${emailId}/send-reply`, { reply_content: replyContent });
  },

  // Get daily digest
  async getDailyDigest(date?: string): Promise<DailyDigest> {
    const params = date ? { date } : {};
    const response = await api.get('/emails/daily-digest', { params });
    return response.data;
  },

  // Search emails
  async searchEmails(query: string): Promise<Email[]> {
    const response = await api.get('/emails/search', { params: { q: query } });
    return response.data.emails;
  },

  // Sync emails from Microsoft
  async syncEmails(): Promise<{ message: string; synced_count: number }> {
    const response = await api.post('/emails/sync');
    return response.data;
  }
};