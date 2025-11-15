import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check if we have token directly (from backend redirect)
      const token = urlParams.get('token');
      const userId = urlParams.get('user_id');
      const email = urlParams.get('email');
      const name = urlParams.get('name');
      
      if (token && userId && email && name) {
        // Backend redirected with token - store it
        localStorage.setItem('authToken', token);
        localStorage.setItem('userInfo', JSON.stringify({
          id: userId,
          email: decodeURIComponent(email),
          name: decodeURIComponent(name),
        }));
        
        setStatus('success');
        // Trigger page reload to update auth state in App
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
        return;
      }
      
      // Otherwise, try to exchange code for token
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (!code) {
        setError('No authorization code or token received');
        setStatus('error');
        return;
      }

      try {
        // Exchange code for JWT token
        const result = await authService.handleCallback(code, state || undefined);
        
        if (result.success && result.jwt) {
          setStatus('success');
          // Redirect to dashboard after a brief delay
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          throw new Error(result.error || 'Authentication failed');
        }
      } catch (error: any) {
        console.error('Callback error:', error);
        setError(error.message || 'Failed to complete authentication');
        setStatus('error');
      }
    };

    handleCallback();
  }, []);

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-lg text-slate-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Successful!</h2>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

