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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-2xl">📧</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Professor Inbox Copilot
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            AI-powered email management for academic professionals
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Automatic email categorization</li>
                <li>• AI-powered draft responses</li>
                <li>• Honor code risk detection</li>
                <li>• Student sentiment analysis</li>
                <li>• Smart inbox search</li>
                <li>• Daily digest summaries</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {isLoading ? '⏳' : '🔗'}
              </span>
              {isLoading ? 'Connecting...' : 'Sign in with Microsoft'}
            </button>
            
            <p className="mt-2 text-xs text-gray-500 text-center">
              Development mode: Will simulate login if Microsoft OAuth is not configured
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={handleLogin}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              Test Backend Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;