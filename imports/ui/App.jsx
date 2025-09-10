import React, { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { TaskDetailsPage } from './pages/TaskDetailsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ClientsPage } from './pages/ClientsPage';
import { TeamPage } from './pages/TeamPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuthRequired } from './components/AuthRequired';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthContainer } from './components/auth/AuthContainer';
import { useTokenRoutes } from './hooks/useTokenRoutes';
import { PostsPage } from './pages/PostsPage';
import { AddPosts } from './pages/AddPosts';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';
import { AddTaskPage } from './pages/AddTaskPage';

// PWA Test (only in development)


export const App = () => {
  const { currentForm, tokenData } = useTokenRoutes();
  const pwaInstallRef = useRef(null);
  
  const handleNavigation = (path) => {
    console.log('[App] Navigating to:', path);
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  
  useEffect(() => {
    // PWA Install prompt handling
    let deferredPrompt;
    
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA install prompt available');
      e.preventDefault();
      deferredPrompt = e;
      
      // Show your custom install button/prompt here
      // For now, just log it
      console.log('PWA can be installed');
    };
    
    const handleAppInstalled = (e) => {
      console.log('PWA was installed');
      deferredPrompt = null;
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return (
    <>
      <Routes>
        {/* Auth routes */}
        <Route path="/auth/*" element={
          <AuthRequired>
            <AuthContainer 
              currentForm={currentForm} 
              tokenData={tokenData} 
              handleNavigation={handleNavigation}
            />
          </AuthRequired>
        } />
        
        {/* Token-based routes */}
        <Route path="/reset-password" element={
          <AuthRequired>
            <AuthContainer 
              currentForm={currentForm} 
              tokenData={tokenData} 
              handleNavigation={handleNavigation}
            />
          </AuthRequired>
        } />
        
        <Route path="/verify-email" element={
          <AuthRequired>
            <AuthContainer 
              currentForm={currentForm} 
              tokenData={tokenData} 
              handleNavigation={handleNavigation}
            />
          </AuthRequired>
        } />
        
        {/* Main application routes */}
        <Route path="/" element={
          <AuthRequired>
            <AppLayout />
          </AuthRequired>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:id" element={<TaskDetailsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="notifications/:id" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          
          {/* Admin-only routes */}
          <Route path="clients" element={
            <ProtectedRoute adminOnly={true}>
              <ClientsPage />
            </ProtectedRoute>
          } />
          <Route path="team" element={
            <ProtectedRoute adminOnly={true}>
              <TeamPage />
            </ProtectedRoute>
          } />
          <Route path="analytics" element={
            <ProtectedRoute adminOnly={true}>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="posts" element={
            <ProtectedRoute adminOnly={true}>
              <PostsPage />
            </ProtectedRoute>
          } />
          <Route path="add-post" element={
            <ProtectedRoute adminOnly={true}>
              <AddPosts />
            </ProtectedRoute>
          } />
          <Route path="add-task" element={
            <ProtectedRoute adminOnly={true}>
              <AddTaskPage />
            </ProtectedRoute>
          } />
      
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PWAInstallPrompt />
    </>
  );
};
