import React, { useState, useEffect } from 'react';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccountPage';
import DashboardPage from './pages/DashboardPage';
import DailyCheckInPage from './pages/DailyCheckInPage';
import InsightsTrendsPage from './pages/InsightsTrendsPage';
import WhatIfAnalysisPage from './pages/WhatIfAnalysisPage';
import WellnessHistoryPage from './pages/WellnessHistoryPage';
import ProfilePage from './pages/ProfilePage';
import ProfileGoalsModal from './components/modals/ProfileGoalsModal';

import {
  getCurrentSession,
  logoutUser,
  getUserProfile,
  saveUserProfile,
  getUserCheckIns,
  deleteCheckIn,
  removeLegacyDemoAccount
} from './services/storageService';

import { checkBackendHealth } from './services/wellnessService';
import {
  getDailyReminderSettings,
  saveDailyReminderSettings,
  startDailyReminder
} from './services/notificationService';

export default function App() {
  // Apply theme on application load
  useEffect(() => {
    const savedTheme = localStorage.getItem('wellnest_theme') || 'pastel';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const [currentUser, setCurrentUser] = useState(() => {
    removeLegacyDemoAccount();
    return getCurrentSession();
  });
  const [activePage, setActivePage] = useState('dashboard');
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'register'
  const [userProfile, setUserProfile] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [dailyReminderSettings, setDailyReminderSettings] = useState(() =>
    getDailyReminderSettings(getCurrentSession()?.id)
  );
  const [backendStatus, setBackendStatus] = useState({ isOnline: false, message: 'Checking...' });
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      const profile = getUserProfile(currentUser.id);
      const history = getUserCheckIns(currentUser.id);
      setUserProfile(profile);
      setCheckIns(history);
      setDailyReminderSettings(getDailyReminderSettings(currentUser.id));
      setActivePage('dashboard');
    } else {
      setUserProfile(null);
      setCheckIns([]);
      setDailyReminderSettings({ enabled: false, time: '09:00' });
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.id) return undefined;
    return startDailyReminder(currentUser.id);
  }, [currentUser?.id, dailyReminderSettings]);

  useEffect(() => {
    let isMounted = true;
    async function verifyBackend() {
      const status = await checkBackendHealth();
      if (isMounted) setBackendStatus(status);
    }
    verifyBackend();
    const interval = setInterval(verifyBackend, 12000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLoginSuccess = (session) => {
    setCurrentUser(session);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setAuthPage('login');
  };

  const handleSaveProfileAndGoals = ({ name, profile }) => {
    if (!currentUser?.id) return;
    saveUserProfile(currentUser.id, profile);
    setUserProfile(profile);

    if (name && name !== currentUser.name) {
      const updatedUser = { ...currentUser, name };
      setCurrentUser(updatedUser);
      localStorage.setItem('wellnest_session_v1', JSON.stringify(updatedUser));
    }

    const refreshed = getUserCheckIns(currentUser.id);
    setCheckIns(refreshed);
  };

  const handleSaveDailyReminderSettings = (settings) => {
    if (!currentUser?.id) return;
    saveDailyReminderSettings(currentUser.id, settings);
    setDailyReminderSettings(settings);
  };

  const handleCheckInSaved = (savedEntry) => {
    if (!currentUser?.id) return;
    const updated = getUserCheckIns(currentUser.id);
    setCheckIns(updated);
  };

  const handleDeleteCheckIn = (entryId) => {
    if (!currentUser?.id) return;
    deleteCheckIn(currentUser.id, entryId);
    const updated = getUserCheckIns(currentUser.id);
    setCheckIns(updated);
  };

  if (!currentUser) {
    if (authPage === 'register') {
      return (
        <CreateAccountPage
          onNavigate={(page) => setAuthPage(page)}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }
    return (
      <LoginPage
        onNavigate={(page) => setAuthPage(page)}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={setActivePage}
      currentUser={currentUser}
      onLogout={handleLogout}
      onOpenProfile={() => setActivePage('profile')}
      backendStatus={backendStatus}
    >
      {activePage === 'dashboard' && (
        <DashboardPage
          currentUser={currentUser}
          userProfile={userProfile}
          checkIns={checkIns}
          onNavigate={setActivePage}
          onOpenGoals={() => setActivePage('profile')}
        />
      )}

      {activePage === 'checkin' && (
        <DailyCheckInPage
          currentUser={currentUser}
          userProfile={userProfile}
          checkIns={checkIns}
          onCheckInSaved={handleCheckInSaved}
          onNavigate={setActivePage}
        />
      )}

      {activePage === 'insights' && (
        <InsightsTrendsPage
          checkIns={checkIns}
          onNavigate={setActivePage}
        />
      )}

      {activePage === 'whatif' && (
        <WhatIfAnalysisPage
          currentUser={currentUser}
          userProfile={userProfile}
          checkIns={checkIns}
          onNavigate={setActivePage}
        />
      )}

      {activePage === 'history' && (
        <WellnessHistoryPage
          checkIns={checkIns}
          onDeleteCheckIn={handleDeleteCheckIn}
          onNavigate={setActivePage}
        />
      )}

      {activePage === 'profile' && (
        <ProfilePage
          currentUser={currentUser}
          userProfile={userProfile}
          onSaveProfile={handleSaveProfileAndGoals}
          notificationSettings={dailyReminderSettings}
          onSaveNotificationSettings={handleSaveDailyReminderSettings}
        />
      )}

      <ProfileGoalsModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        currentUser={currentUser}
        currentProfile={userProfile}
        onSave={handleSaveProfileAndGoals}
      />
    </AppLayout>
  );
}
