import api from '../lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  tone_profile?: string;
  reply_length?: string;
  auto_reply_enabled?: boolean;
}

export interface LoginResponse {
  success: boolean;
  auth_url?: string;
  message?: string;
  error?: string;
}

export interface AuthCallbackResponse {
  success: boolean;
  jwt?: string;
  user?: User;
  message?: string;
  error?: string;
}

export const authService = {
  // Get Microsoft OAuth login URL from backend
  async getLoginUrl(): Promise<LoginResponse> {
    try {
      const response = await api.get<{ auth_url: string; error?: string; message?: string }>('/auth/login');
      
      if (response.data.error) {
        return {
          success: false,
          error: response.data.error,
          message: response.data.message || 'Authentication service error'
        };
      }
      
      if (!response.data.auth_url) {
        return {
          success: false,
          error: 'No auth URL received',
          message: 'Backend did not return an authentication URL'
        };
      }
      
      return {
        success: true,
        auth_url: response.data.auth_url,
        message: 'Login URL generated'
      };
    } catch (error: any) {
      console.error('Failed to get login URL:', error);
      
      // Check if it's a network error (backend not running)
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        return {
          success: false,
          error: 'Backend server not running',
          message: 'Please make sure the backend server is running on http://localhost:8000'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to get login URL',
        message: error.response?.data?.message || 'Failed to connect to authentication service. Check backend logs for details.'
      };
    }
  },

  // Handle OAuth callback - exchange code for token
  async handleCallback(code: string, state?: string): Promise<AuthCallbackResponse> {
    try {
      // The backend callback endpoint expects the code in the URL query params
      // Since we're calling it from frontend, we need to send the code
      // But the backend callback is designed to receive it from Microsoft redirect
      // So we'll create a frontend callback handler that processes the redirect
      
      // For now, we'll use a workaround: redirect to backend callback
      // Backend will process and redirect back with token
      // Or we can modify backend to accept POST with code
      
      // Actually, let's check if we can call the callback endpoint directly
      // The backend callback expects GET with query params
      const response = await api.get(`/auth/callback?code=${code}&state=${state || 'inboxcopilot'}`);
      
      if (response.data.jwt && response.data.user) {
        // Store JWT token and user info
        localStorage.setItem('authToken', response.data.jwt);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        
        return {
          success: true,
          jwt: response.data.jwt,
          user: response.data.user,
          message: 'Login successful'
        };
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Callback failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Authentication failed',
        message: 'Failed to complete authentication'
      };
    }
  },

  // Get current user info from storage
  async getCurrentUser(): Promise<User> {
    const storedUser = this.getStoredUser();
    if (storedUser) {
      return storedUser;
    }
    
    throw new Error('No user found. Please log in.');
  },

  // Logout
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  // Get stored user info
  getStoredUser(): User | null {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }
};