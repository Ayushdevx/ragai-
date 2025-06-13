// src/Routes.jsx
import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";

// Page imports
import AuthenticationLoginRegister from "pages/authentication-login-register";
import DashboardHome from "pages/dashboard-home";
import ChatInterface from "pages/chat-interface";
import DocumentManagement from "pages/document-management";
import VoiceSettingsControls from "pages/voice-settings-controls";
import ConversationHistory from "pages/conversation-history";
import NotFound from "pages/NotFound";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/authentication-login-register" replace />;
};

// Public Route component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard-home" replace /> : children;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public Routes */}
          <Route 
            path="/authentication-login-register" 
            element={
              <PublicRoute>
                <AuthenticationLoginRegister />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard-home" 
            element={
              <ProtectedRoute>
                <DashboardHome />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat-interface" 
            element={
              <ProtectedRoute>
                <ChatInterface />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/document-management" 
            element={
              <ProtectedRoute>
                <DocumentManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/voice-settings-controls" 
            element={
              <ProtectedRoute>
                <VoiceSettingsControls />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/conversation-history" 
            element={
              <ProtectedRoute>
                <ConversationHistory />
              </ProtectedRoute>
            } 
          />
          
          {/* Root redirect */}
          <Route 
            path="/" 
            element={
              <Navigate to="/dashboard-home" replace />
            } 
          />
          
          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;