import React, { useState } from 'react';
import { authService } from '../services/authService';

interface LoginPageProps {
  onLogin?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use simulated login for development
      const result = await authService.simulateLogin();
      
      if (result.success) {
        console.log('Simulated login successful:', result.user);
        
        if (onLogin) {
          onLogin();
        }
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-20 w-20 flex items-center justify-center rounded-full bg-blue-100 shadow-lg">
            <span className="text-4xl">📧</span>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 text-center tracking-tight">Professor Inbox Copilot</h2>
          <p className="text-lg text-gray-600 text-center">AI-powered email management for academic professionals</p>
        </div>
        <div className="w-full bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-8 shadow flex flex-col items-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-blue-500">✨</span> Features
          </h3>
          <ul className="space-y-3 text-base text-gray-700 w-full">
            <li className="flex items-center gap-2"><span className="text-blue-400">•</span> Automatic email categorization</li>
            <li className="flex items-center gap-2"><span className="text-blue-400">•</span> AI-powered draft responses</li>
            <li className="flex items-center gap-2"><span className="text-blue-400">•</span> Honor code risk detection</li>
            <li className="flex items-center gap-2"><span className="text-blue-400">•</span> Student sentiment analysis</li>
            <li className="flex items-center gap-2"><span className="text-blue-400">•</span> Smart inbox search</li>
            <li className="flex items-center gap-2"><span className="text-blue-400">•</span> Daily digest summaries</li>
          </ul>
        </div>
        {error && (
          <div className="rounded-md bg-red-50 p-4 w-full">
            <div className="text-base text-red-700 text-center">{error}</div>
          </div>
        )}
        <div className="w-full flex flex-col items-center gap-4">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="group relative w-full flex items-center justify-center py-4 px-6 text-lg font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-lg"
          >
            <span className="absolute left-4 flex items-center">
              {isLoading ? (
                <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
              ) : (
                <svg className="h-6 w-6 text-white" viewBox="0 0 32 32"><rect x="2" y="2" width="28" height="28" rx="6" fill="#0078D4" /><path d="M8 16h16M16 8v16" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
              )}
            </span>
            <span className="ml-8">{isLoading ? 'Connecting...' : 'Sign in with Microsoft'}</span>
          </button>
          <p className="text-xs text-gray-500 text-center">
            Development mode: Will simulate login if Microsoft OAuth is not configured
          </p>
        </div>
      </div>
      <footer className="mt-10 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Professor Inbox Copilot. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;