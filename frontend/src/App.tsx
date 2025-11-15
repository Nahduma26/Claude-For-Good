import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import LoginPage from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { DailyDigest } from './pages/DailyDigestPage';
import { AskTheInbox } from './pages/AskTheInbox';
import { EmailDetail } from './pages/EmailDetail';
import { SettingsPage } from './pages/SettingsPage';
import { Toaster } from 'sonner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = async () => {
      try {
        const isAuth = authService.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          // Verify token is still valid
          await authService.getCurrentUser();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page);
    if (page === 'email-detail' && data) {
      // Store the entire email object
      setSelectedEmail(data);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderPage = () => {
    if (!isAuthenticated) {
      return <LoginPage onLogin={handleLogin} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'daily-digest':
        return <DailyDigest onBack={() => handleNavigate('dashboard')} />;
      case 'ask-inbox':
        return <AskTheInbox onBack={() => handleNavigate('dashboard')} onNavigate={handleNavigate} />;
      case 'email-detail':
        return selectedEmail ? (
          <EmailDetail 
            email={selectedEmail} 
            onBack={() => handleNavigate('dashboard')} 
          />
        ) : (
          <Dashboard onNavigate={handleNavigate} />
        );
      case 'settings':
        return <SettingsPage onBack={() => handleNavigate('dashboard')} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="App min-h-screen bg-gray-50">
      {renderPage()}
      <Toaster position="top-right" />
    </div>
  );
}

export default App;