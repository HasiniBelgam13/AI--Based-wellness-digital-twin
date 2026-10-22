import React, { useState, useEffect } from 'react';
import {
  Moon,
  Droplets,
  Activity,
  Edit2,
  Save,
  Sun,
  Palette
} from 'lucide-react';
import Modal from '../components/common/Modal';

export default function ProfilePage({
  currentUser,
  userProfile,
  onSaveProfile,
  notificationSettings,
  onSaveNotificationSettings
}) {
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('wellnest_theme') || 'pastel';
  });

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser?.name || '');
  const [occupationInput, setOccupationInput] = useState(userProfile?.occupation || 'Doctor');
  const [ageInput, setAgeInput] = useState(userProfile?.age || 28);
  const [genderInput, setGenderInput] = useState(userProfile?.gender || 'Female');

  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [sleepGoal, setSleepGoal] = useState(userProfile?.goals?.sleepDuration || 8.0);
  const [stepGoal, setStepGoal] = useState(userProfile?.goals?.dailySteps || 10000);
  const [activityGoal, setActivityGoal] = useState(userProfile?.goals?.physicalActivity || 60);
  const [reminderError, setReminderError] = useState('');

  // Apply theme change in real-time
  const handleThemeChange = (themeKey) => {
    setSelectedTheme(themeKey);
    document.documentElement.setAttribute('data-theme', themeKey);
    localStorage.setItem('wellnest_theme', themeKey);
  };

  useEffect(() => {
    const saved = localStorage.getItem('wellnest_theme') || 'pastel';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const handleSaveInfo = (e) => {
    e.preventDefault();
    onSaveProfile({
      name: nameInput,
      profile: {
        ...userProfile,
        age: Number(ageInput),
        gender: genderInput,
        occupation: occupationInput
      }
    });
    setIsEditingInfo(false);
  };

  const handleSaveGoals = (e) => {
    e.preventDefault();
    onSaveProfile({
      name: currentUser?.name,
      profile: {
        ...userProfile,
        goals: {
          sleepDuration: Number(sleepGoal),
          dailySteps: Number(stepGoal),
          physicalActivity: Number(activityGoal)
        }
      }
    });
    setIsEditingGoals(false);
  };

  const handleReminderToggle = async (event) => {
    const enabled = event.target.checked;
    const time = notificationSettings?.time || '09:00';

    if (!enabled) {
      setReminderError('');
      onSaveNotificationSettings({ enabled: false, time });
      return;
    }

    if (!('Notification' in window)) {
      setReminderError('This browser does not support notifications.');
      return;
    }

    const permission = Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();

    if (permission !== 'granted') {
      setReminderError('Allow notifications in your browser to enable reminders.');
      return;
    }

    setReminderError('');
    onSaveNotificationSettings({ enabled: true, time });
  };

  const handleReminderTimeChange = (event) => {
    onSaveNotificationSettings({
      enabled: notificationSettings?.enabled || false,
      time: event.target.value
    });
  };

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Personal Information Card */}
      <div className="wn-card" style={{ padding: '24px 28px' }}>
        <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--wn-text-primary)', marginBottom: 16 }}>
          Personal Information
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Illustrated Avatar */}
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                backgroundColor: '#FDE68A',
                border: '3px solid #FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              <svg viewBox="0 0 100 100" width="58" height="58">
                <rect width="100" height="100" fill="#FDE68A" />
                <circle cx="50" cy="42" r="22" fill="#FBBF24" />
                <circle cx="50" cy="40" r="18" fill="#FCD34D" />
                <path d="M 30 40 Q 50 18 70 40 Q 66 22 50 22 Q 34 22 30 40 Z" fill="#8B5CF6" />
                <path d="M 24 85 Q 50 60 76 85 Z" fill="#10B981" />
              </svg>
            </div>

            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--wn-text-primary)' }}>
                {currentUser?.name || 'Your profile'}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--wn-text-muted)', marginTop: 2 }}>
                {[currentUser?.email, userProfile?.occupation].filter(Boolean).join(' • ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingInfo(true)}
            className="wn-btn wn-btn-outline"
            style={{ padding: '6px 14px', fontSize: 12.5 }}
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* 2. Wellness Goals Cards (Matching Reference Mockup) */}
      <div className="wn-card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--wn-text-primary)' }}>
            Wellness Goals
          </h4>
          <button
            onClick={() => setIsEditingGoals(true)}
            className="wn-btn wn-btn-outline"
            style={{ padding: '4px 10px', fontSize: 12 }}
          >
            Edit All
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {/* Sleep Goal */}
          <div className="wn-card-subtle" style={{ padding: '16px 18px', textAlign: 'center', backgroundColor: 'var(--wn-surface)' }}>
            <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#F4F0FF', color: '#735BF2', margin: '0 auto 8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Moon size={16} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--wn-text-muted)' }}>Sleep Goal</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--wn-text-primary)', marginTop: 2 }}>
              {sleepGoal} hours / day
            </div>
            <button
              onClick={() => setIsEditingGoals(true)}
              style={{ fontSize: 11.5, color: '#735BF2', fontWeight: 700, marginTop: 8 }}
            >
              Edit
            </button>
          </div>

          {/* Water / Steps Goal */}
          <div className="wn-card-subtle" style={{ padding: '16px 18px', textAlign: 'center', backgroundColor: 'var(--wn-surface)' }}>
            <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#F0F9FF', color: '#0EA5E9', margin: '0 auto 8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={16} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--wn-text-muted)' }}>Daily Steps Goal</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--wn-text-primary)', marginTop: 2 }}>
              {Number(stepGoal).toLocaleString()} steps / day
            </div>
            <button
              onClick={() => setIsEditingGoals(true)}
              style={{ fontSize: 11.5, color: '#735BF2', fontWeight: 700, marginTop: 8 }}
            >
              Edit
            </button>
          </div>

          {/* Activity Goal */}
          <div className="wn-card-subtle" style={{ padding: '16px 18px', textAlign: 'center', backgroundColor: 'var(--wn-surface)' }}>
            <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#ECFDF5', color: '#10B981', margin: '0 auto 8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--wn-text-muted)' }}>Activity Goal</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--wn-text-primary)', marginTop: 2 }}>
              {activityGoal} minutes / day
            </div>
            <button
              onClick={() => setIsEditingGoals(true)}
              style={{ fontSize: 11.5, color: '#735BF2', fontWeight: 700, marginTop: 8 }}
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Preferences & Themes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        {/* Preferences Card */}
        <div className="wn-card" style={{ padding: '24px 28px' }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--wn-text-primary)', marginBottom: 16 }}>
            Preferences
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: 13.5, color: 'var(--wn-text-secondary)', fontWeight: 600 }}>Daily reminder</span>
                <div style={{ fontSize: 11, color: 'var(--wn-text-muted)', marginTop: 3 }}>
                  Requires browser permission and WellNest to remain open.
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--wn-text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={notificationSettings?.enabled || false}
                  onChange={handleReminderToggle}
                  style={{ accentColor: 'var(--wn-primary)', width: 16, height: 16 }}
                />
                <span>{notificationSettings?.enabled ? 'On' : 'Off'}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--wn-text-secondary)' }}>
                <span>Reminder time</span>
                <input
                  type="time"
                  value={notificationSettings?.time || '09:00'}
                  onChange={handleReminderTimeChange}
                  disabled={!notificationSettings?.enabled}
                  style={{ padding: '6px 8px', width: 112 }}
                />
              </label>
            </div>
            {reminderError && (
              <p role="alert" style={{ color: '#C2414B', fontSize: 12.5, margin: 0 }}>
                {reminderError}
              </p>
            )}

            {/* Working Theme Selector: Light, Pastel, Dark */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
              <div>
                <span style={{ fontSize: 13.5, color: 'var(--wn-text-secondary)', fontWeight: 500 }}>Theme Mode</span>
                <div style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>Changes interface background & palette</div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'pastel', label: 'Pastel', icon: Palette },
                  { id: 'dark', label: 'Dark', icon: Moon }
                ].map((t) => {
                  const isActive = selectedTheme === t.id;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleThemeChange(t.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        backgroundColor: isActive ? '#735BF2' : 'var(--wn-surface-subtle)',
                        color: isActive ? '#FFFFFF' : 'var(--wn-text-secondary)',
                        border: isActive ? '1px solid #735BF2' : '1px solid var(--wn-border-light)',
                        boxShadow: isActive ? '0 2px 8px rgba(115, 91, 242, 0.3)' : 'none',
                        transition: 'all 0.18s ease'
                      }}
                    >
                      <Icon size={12} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Info Modal */}
      <Modal
        isOpen={isEditingInfo}
        onClose={() => setIsEditingInfo(false)}
        title="Edit Personal Information"
      >
        <form onSubmit={handleSaveInfo} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="wn-form-group">
            <label className="wn-label">Full Name</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              required
            />
          </div>

          <div className="wn-form-group">
            <label className="wn-label">Occupation</label>
            <input
              type="text"
              value={occupationInput}
              onChange={(e) => setOccupationInput(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="wn-form-group">
              <label className="wn-label">Age</label>
              <input
                type="number"
                value={ageInput}
                onChange={(e) => setAgeInput(e.target.value)}
                required
              />
            </div>
            <div className="wn-form-group">
              <label className="wn-label">Gender</label>
              <select value={genderInput} onChange={(e) => setGenderInput(e.target.value)}>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={() => setIsEditingInfo(false)} className="wn-btn wn-btn-outline">
              Cancel
            </button>
            <button type="submit" className="wn-btn wn-btn-primary">
              <Save size={15} /> Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Goals Modal */}
      <Modal
        isOpen={isEditingGoals}
        onClose={() => setIsEditingGoals(false)}
        title="Edit Wellness Goals"
      >
        <form onSubmit={handleSaveGoals} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="wn-form-group">
            <label className="wn-label">Sleep Goal (hours/day)</label>
            <input
              type="number"
              step="0.5"
              min="4"
              max="12"
              value={sleepGoal}
              onChange={(e) => setSleepGoal(e.target.value)}
              required
            />
          </div>

          <div className="wn-form-group">
            <label className="wn-label">Daily Steps Goal</label>
            <input
              type="number"
              step="500"
              min="2000"
              max="25000"
              value={stepGoal}
              onChange={(e) => setStepGoal(e.target.value)}
              required
            />
          </div>

          <div className="wn-form-group">
            <label className="wn-label">Activity Goal (minutes/day)</label>
            <input
              type="number"
              step="5"
              min="15"
              max="180"
              value={activityGoal}
              onChange={(e) => setActivityGoal(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={() => setIsEditingGoals(false)} className="wn-btn wn-btn-outline">
              Cancel
            </button>
            <button type="submit" className="wn-btn wn-btn-primary">
              <Save size={15} /> Save Targets
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
