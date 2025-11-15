import React from 'react';

const DashboardPage: React.FC = () => {
  const testBackend = () => {
    fetch('http://localhost:8000/emails/test')
      .then(response => response.json())
      .then(data => {
        console.log('Email test response:', data);
        alert('Email API test successful!');
      })
      .catch(error => {
        console.error('Email API test failed:', error);
        alert('Email API test failed.');
      });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your academic emails with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Emails</h3>
          <p className="text-3xl font-bold text-blue-600">42</p>
          <p className="text-sm text-gray-500">This week</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Urgent Items</h3>
          <p className="text-3xl font-bold text-red-600">3</p>
          <p className="text-sm text-gray-500">Require attention</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Processed</h3>
          <p className="text-3xl font-bold text-green-600">39</p>
          <p className="text-sm text-gray-500">AI categorized</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent Emails</h2>
        </div>
        
        <div className="divide-y">
          <div className="p-6 hover:bg-gray-50 cursor-pointer">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Question about Assignment 3</h3>
                <p className="text-sm text-gray-600 mt-1">student@university.edu</p>
                <p className="text-sm text-gray-500 mt-2">Hi Professor, I have a question about the requirements...</p>
              </div>
              <div className="ml-4 flex flex-col items-end space-y-1">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Clarification</span>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Medium</span>
                <span className="text-xs text-gray-500">2h ago</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 hover:bg-gray-50 cursor-pointer">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Extension Request - Final Project</h3>
                <p className="text-sm text-gray-600 mt-1">another.student@university.edu</p>
                <p className="text-sm text-gray-500 mt-2">Dear Professor, I am writing to request an extension...</p>
              </div>
              <div className="ml-4 flex flex-col items-end space-y-1">
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">Extension</span>
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">High</span>
                <span className="text-xs text-gray-500">4h ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={testBackend}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Test Email API
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;