import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { getTimeBasedGreeting } from '../../utils/dateUtils';

export default function Header({
  activePage,
  currentUser,
  onOpenGoals
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const now = new Date();
  const formattedHeaderDate = now.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const titles = {
    dashboard: `${getTimeBasedGreeting(currentUser?.name)}! 👋`,
    checkin: "Daily Check-in",
    insights: "Insights & Trends",
    whatif: "What-If Analysis",
    history: "Wellness History",
    profile: "Profile & Goals"
  };

  const subtitles = {
    dashboard: "Small steps every day lead to a healthier, happier you.",
    checkin: "How are you feeling today? Fill in your wellness details.",
    insights: "See your progress, trends and personalized insights.",
    whatif: "Explore how lifestyle modifications change your wellness score.",
    history: "Review and manage your chronological recorded check-ins.",
    profile: "Manage your profile, set your goals and customize your wellness journey."
  };

  const markAllRead = () => setUnreadCount(0);

  const clearNotification = (id) => {
    setNotifications((previous) => previous.filter((notification) => notification.id !== id));
    setUnreadCount((count) => Math.max(0, count - 1));
  };

  return (
    <header
      className="app-header"
      style={{
        height: 'var(--wn-header-height)',
        backgroundColor: 'var(--wn-bg)',
        display: 'flex',
        alignItems: 'center',
          justifyContent: 'space-between',
        padding: '0 40px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      {/* Left: Title & Subtitle */}
      <div>
        <h1
              style={{
            fontSize: activePage === 'dashboard' ? 28 : 22,
            fontWeight: 800,
            color: activePage === 'dashboard' ? '#176B52' : 'var(--wn-text-primary)',
            letterSpacing: '-0.3px'
          }}
        >
          {titles[activePage] || "WellNest"}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--wn-text-muted)', marginTop: 2 }}>
            {subtitles[activePage]}
        </p>
      </div>

      {/* Right: Date, Notifications Bell & User Avatar (Exact Reference Mockup Layout) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative' }}>
        {/* Date string */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--wn-text-secondary)',
            letterSpacing: '0.1px'
          }}
        >
          {formattedHeaderDate}
        </span>

        {/* Bell Notification Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: 'var(--wn-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--wn-text-secondary)',
              position: 'relative',
              boxShadow: 'var(--wn-shadow-xs)'
            }}
            title="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 9,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#F43F5E'
                }}
              />
            )}
          </button>

          {/* Interactive Notifications Popover */}
          {notificationsOpen && (
            <div
              style={{
                position: 'absolute',
                top: 48,
                right: 0,
                width: 320,
                backgroundColor: 'var(--wn-surface)',
                borderRadius: '16px',
                border: '1px solid var(--wn-border)',
                boxShadow: 'var(--wn-shadow-lg)',
                padding: '16px',
                zIndex: 200,
                animation: 'scaleUp 0.15s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--wn-border-light)' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--wn-text-primary)' }}>
                  Notifications ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{ fontSize: 11.5, color: '#735BF2', fontWeight: 600 }}
                  >
                    Mark read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--wn-text-muted)', fontSize: 12.5 }}>
                  No new notifications
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '10px',
                          borderRadius: '12px',
                          backgroundColor: 'var(--wn-surface-subtle)',
                          position: 'relative'
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: '8px',
                            backgroundColor: n.bgColor,
                            color: n.iconColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Icon size={14} />
                        </div>
                        <div style={{ flex: 1, paddingRight: 14 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--wn-text-primary)' }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--wn-text-secondary)', marginTop: 2, lineHeight: 1.35 }}>
                            {n.message}
                          </div>
                          <span style={{ fontSize: 10, color: 'var(--wn-text-muted)', marginTop: 4, display: 'inline-block' }}>
                            {n.time}
                          </span>
                        </div>
                        <button
                          onClick={() => clearNotification(n.id)}
                          style={{ position: 'absolute', right: 8, top: 8, color: 'var(--wn-text-muted)' }}
                          title="Dismiss"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Circular Avatar matching reference image */}
        <div
          onClick={onOpenGoals}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            backgroundColor: '#FDE68A',
            border: '2px solid #FFFFFF',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden'
          }}
          title="Profile & Settings"
        >
          <svg viewBox="0 0 100 100" width="38" height="38">
            <rect width="100" height="100" fill="#FDE68A" />
            <circle cx="50" cy="42" r="22" fill="#FBBF24" />
            <circle cx="50" cy="40" r="18" fill="#FCD34D" />
            <path d="M 30 40 Q 50 18 70 40 Q 66 22 50 22 Q 34 22 30 40 Z" fill="#8B5CF6" />
            <path d="M 24 85 Q 50 60 76 85 Z" fill="#10B981" />
          </svg>
        </div>
      </div>
    </header>
  );
}
