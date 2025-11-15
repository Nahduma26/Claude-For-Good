import React from 'react';

const LoginPage: React.FC = () => {
  const handleLogin = () => {
    // For now, just simulate login
    console.log('Login clicked - will integrate with Microsoft OAuth later');
    
    // Test the backend connection
    fetch('http://localhost:8000/auth/test')
      .then(response => response.json())
      .then(data => {
        console.log('Backend test response:', data);
        alert('Backend connection successful! Check console for details.');
      })
      .catch(error => {
        console.error('Backend connection failed:', error);
        alert('Backend connection failed. Make sure the Flask server is running on port 8000.');
      });
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

          <div>
            <button
              onClick={handleLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                🔗
              </span>
              Sign in with Microsoft
            </button>
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