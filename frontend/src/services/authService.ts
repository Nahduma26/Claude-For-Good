import api from '../lib/api';

export interface User {
  id: number;
  email: string;
  name: string;
  tone_profile: string;
  reply_length: string;
  auto_reply_enabled: boolean;
}

export interface LoginResponse {
  success: boolean;
  auth_url?: string;
  message: string;
  error?: string;
}

export interface AuthCallbackResponse {
  success: boolean;
  access_token?: string;
  user?: User;
  message: string;
  error?: string;
}

export const authService = {
  // Simulate Microsoft OAuth login URL
  async getLoginUrl(): Promise<LoginResponse> {
    // Return a simulated login URL for development
    return {
      success: true,
      auth_url: '/simulate-login',
      message: 'Simulated login URL generated'
    };
  },

  // Simulate OAuth callback with mock user data
  async handleCallback(code?: string, state?: string): Promise<AuthCallbackResponse> {
    // Simulate a successful login with mock data
    const mockUser: User = {
      id: 1,
      email: 'professor@university.edu',
      name: 'Dr. Jane Smith',
      tone_profile: 'professional',
      reply_length: 'medium',
      auto_reply_enabled: false
    };

    const mockToken = 'mock-jwt-token-' + Date.now();
    
    // Store auth token and user info
    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('userInfo', JSON.stringify(mockUser));
    
    return {
      success: true,
      access_token: mockToken,
      user: mockUser,
      message: 'Login successful (simulated)'
    };
  },

  // Simulate login (for development)
  async simulateLogin(): Promise<AuthCallbackResponse> {
    return this.handleCallback();
  },

  // Get current user info (simulated)
  async getCurrentUser(): Promise<User> {
    const storedUser = this.getStoredUser();
    if (storedUser) {
      return storedUser;
    }
    
    // Return mock user if no stored user
    const mockUser: User = {
      id: 1,
      email: 'professor@university.edu',
      name: 'Dr. Jane Smith',
      tone_profile: 'professional',
      reply_length: 'medium',
      auto_reply_enabled: false
    };
    
    localStorage.setItem('userInfo', JSON.stringify(mockUser));
    return mockUser;
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