import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ClientsPage } from './pages/ClientsPage';
import { TeamPage } from './pages/TeamPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export const App = () => {
  return (
    <AppLayout>
      {(props) => (
        <Routes>
          <Route path="/" element={<DashboardPage activeTab={props.activeTab} />} />
          <Route path="/tasks" element={<TasksPage activeTab={props.activeTab} />} />
          <Route path="/notifications" element={<NotificationsPage activeTab={props.activeTab} />} />
          <Route path="/profile" element={<ProfilePage activeTab={props.activeTab} />} />
          <Route path="/clients" element={<ClientsPage activeTab={props.activeTab} />} />
          <Route path="/team" element={<TeamPage activeTab={props.activeTab} />} />
          <Route path="/analytics" element={<AnalyticsPage activeTab={props.activeTab} />} />
        </Routes>
      )}
    </AppLayout>
  );
};
