import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import HomeLayout from './components/HomePage/HomeLayout';
import { HomePage } from './pages/HomePage';
import DetectionPage from './pages/DetectionPage';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import ErrorBoundary from './components/ErrorBoundary';

import './i18n';

// Import AuthProvider
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout wrapper component
const HomeLayoutWrapper = () => {
  return (
    <HomeLayout>
      <Outlet />
    </HomeLayout>
  );
};

const AppContent = () => {
  // Use useAuth hook to get user information and loading state
  const { user, loading } = useAuth();

  console.log("AppContent: User status", { user, loading });

  return (
    <Routes>
      {/* Auth routes without layout */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Routes with HomeLayout */}
      <Route element={<HomeLayoutWrapper />}>
        {/* Home page */}
        <Route path="/" element={<HomePage />} />

        {/* Detection Page (now with HomeLayout) */}
        <Route path="/detect" element={<DetectionPage />} />

        {/* 404 page - Moved inside HomeLayoutWrapper for consistency, or keep outside if preferred */}
        {/* If 404 should also have HomeLayout, keep it here. If not, move it outside HomeLayoutWrapper */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen">
              <h1 className="text-2xl">Page not found</h1>
            </div>
          }
        />
      </Route>
    </Routes>
  );
};

export const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

// Also export as default
export default App;
