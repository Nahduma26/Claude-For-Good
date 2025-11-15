import api from '../lib/api';
import { adaptBackendEmail, adaptBackendEmails, adaptBackendEmailWithContent, BackendEmail, EmailWithContent } from '../utils/emailAdapter';
import { Email } from '../components/EmailCard';

// Backend API response format
export interface BackendEmailsResponse {
  success: boolean;
  emails: BackendEmail[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

export interface BackendEmailResponse {
  success: boolean;
  email: BackendEmail;
}

export interface DailyDigest {
  date: string;
  total_emails: number;
  categories_summary: Record<string, number>;
  urgent_emails: Email[];
  summary: string;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface EmailStats {
  total_emails: number;
  unread_emails: number;
  processed_emails: number;
  urgent_emails: number;
  risk_flagged_emails: number;
  processing_rate: number;
}

export const emailService = {
  // Get emails with pagination and filters
  async getEmails(params?: {
    page?: number;
    per_page?: number;
    category?: string;
    urgency?: string;
    unread_only?: boolean;
  }): Promise<{ emails: Email[]; pagination: BackendEmailsResponse['pagination'] }> {
    try {
      const response = await api.get<BackendEmailsResponse>('/emails/', { params });
      if (response.data.success) {
        return {
          emails: adaptBackendEmails(response.data.emails),
          pagination: response.data.pagination,
        };
      }
      throw new Error('Failed to fetch emails');
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  },

  // Get email details by ID
  async getEmailById(emailId: string): Promise<Email> {
    try {
      const response = await api.get<BackendEmailResponse>(`/emails/${emailId}`);
      if (response.data.success) {
        return adaptBackendEmail(response.data.email);
      }
      throw new Error('Email not found');
    } catch (error) {
      console.error('Error fetching email:', error);
      throw error;
    }
  },

  // Get email details with full content
  async getEmailWithContent(emailId: string): Promise<EmailWithContent> {
    try {
      const response = await api.get<BackendEmailResponse>(`/emails/${emailId}`);
      if (response.data.success) {
        return adaptBackendEmailWithContent(response.data.email);
      }
      throw new Error('Email not found');
    } catch (error) {
      console.error('Error fetching email:', error);
      throw error;
    }
  },

  // Mark email as read
  async markAsRead(emailId: string): Promise<void> {
    try {
      await api.post(`/emails/${emailId}/mark-read`);
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw error;
    }
  },

  // Get categories with counts
  async getCategories(): Promise<CategoryCount[]> {
    try {
      const response = await api.get<{ success: boolean; categories: CategoryCount[] }>('/emails/categories');
      if (response.data.success) {
        return response.data.categories;
      }
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get email statistics
  async getStats(): Promise<EmailStats> {
    try {
      const response = await api.get<{ success: boolean; stats: EmailStats }>('/emails/stats');
      if (response.data.success) {
        return response.data.stats;
      }
      throw new Error('Failed to fetch stats');
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // Generate reply for email (from processing module)
  async generateReply(emailId: string, preferences?: string): Promise<{ reply: string }> {
    try {
      const response = await api.post(`/process/draft`, { 
        email_id: emailId,
        preferences 
      });
      if (response.data.success && response.data.draft) {
        return { reply: response.data.draft.reply || response.data.draft };
      }
      throw new Error('Failed to generate reply');
    } catch (error) {
      console.error('Error generating reply:', error);
      throw error;
    }
  },

  // Sync emails from Microsoft
  async syncEmails(): Promise<{ message: string; new_emails: number }> {
    try {
      const response = await api.post<{ success: boolean; message: string; new_emails: number }>('/emails/sync');
      if (response.data.success) {
        return {
          message: response.data.message,
          new_emails: response.data.new_emails,
        };
      }
      throw new Error('Failed to sync emails');
    } catch (error) {
      console.error('Error syncing emails:', error);
      throw error;
    }
  },

  // ============ AI FUNCTIONALITY ============

  // Semantic search emails
  async searchEmails(query: string): Promise<{ results: BackendEmail[] }> {
    try {
      const response = await api.post<{ success: boolean; results: BackendEmail[] }>('/process/search', { query });
      if (response.data.success) {
        return { results: response.data.results };
      }
      throw new Error('Search failed');
    } catch (error) {
      console.error('Error searching emails:', error);
      throw error;
    }
  },

  // Generate daily digest
  async generateDailyDigest(date?: string): Promise<{
    summary: string;
    categories: Record<string, number>;
    high_priority: string[];
    common_themes: string[];
    recommendations: string[];
    statistics: {
      total_emails: number;
      priority_distribution: { low: number; medium: number; high: number };
    };
  }> {
    try {
      const response = await api.post<{ success: boolean; digest: any }>('/process/digest', { date });
      if (response.data.success) {
        return response.data.digest;
      }
      throw new Error('Failed to generate digest');
    } catch (error) {
      console.error('Error generating digest:', error);
      throw error;
    }
  },

  // Classify email (AI categorization)
  async classifyEmail(emailId: string): Promise<{
    category: string;
    priority_score: number;
    tone: string;
    summary: string;
    hidden_intent?: string;
  }> {
    try {
      const response = await api.post<{ success: boolean; classification: any }>('/process/classify', { email_id: emailId });
      if (response.data.success) {
        return response.data.classification;
      }
      throw new Error('Classification failed');
    } catch (error) {
      console.error('Error classifying email:', error);
      throw error;
    }
  },

  // Batch classify emails
  async batchClassify(): Promise<{ processed: number }> {
    try {
      const response = await api.post<{ success: boolean; processed: number }>('/process/batch-classify');
      if (response.data.success) {
        return { processed: response.data.processed };
      }
      throw new Error('Batch classification failed');
    } catch (error) {
      console.error('Error batch classifying:', error);
      throw error;
    }
  }
};