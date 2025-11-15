// Simple auth store without zustand dependency
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Simple in-memory auth state for now
let authState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export const authStore = {
  getState: () => authState,
  
  login: (user: User, token: string) => {
    authState = { user, token, isAuthenticated: true };
    localStorage.setItem('auth-storage', JSON.stringify(authState));
  },
  
  logout: () => {
    authState = { user: null, token: null, isAuthenticated: false };
    localStorage.removeItem('auth-storage');
  },
  
  init: () => {
    try {
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        authState = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    }
  }
};

// Initialize on module load
authStore.init();