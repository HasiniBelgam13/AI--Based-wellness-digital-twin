import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  TrendingUp,
  Sliders,
  History,
  User,
  LogOut,
  Sprout
} from 'lucide-react';

export default function Sidebar({
  activePage,
  onNavigate,
  currentUser,
  onLogout,
  onOpenProfile
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'checkin', label: 'Check-in', icon: CalendarCheck },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'whatif', label: 'What-If', icon: Sliders },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <aside
      className="app-sidebar"
      style={{
        width: 'var(--wn-sidebar-width)',
        height: '100vh',
        overflowY: 'auto',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: 'var(--wn-surface)',
        borderRight: '1px solid var(--wn-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '18px 18px',
        zIndex: 100
      }}
    >
      {/* Top Section */}
      <div>
        {/* Brand Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '2px 8px 24px 8px'
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: '#ECFDF5',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sprout size={22} />
          </div>
          <h2
            style={{
              fontFamily: 'var(--wn-font-heading)',
              fontSize: 21,
              fontWeight: 800,
              color: 'var(--wn-text-primary)',
              letterSpacing: '-0.3px'
            }}
          >
            WellNest
          </h2>
        </div>

        {/* Navigation List */}
        <nav style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'profile') {
                    onOpenProfile();
                  } else {
                    onNavigate(item.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 16px',
                  borderRadius: '12px',
                  backgroundColor: isActive ? 'var(--wn-primary-light)' : 'transparent',
                  color: isActive ? 'var(--wn-primary)' : 'var(--wn-text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  textAlign: 'left',
                  width: '100%',
                  border: isActive ? '1px solid var(--wn-primary-subtle)' : '1px solid transparent',
                  transition: 'all 0.16s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--wn-surface-subtle)';
                    e.currentTarget.style.color = 'var(--wn-text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--wn-text-secondary)';
                  }
                }}
              >
                <Icon
                  size={18}
                  style={{
                    color: isActive ? 'var(--wn-primary)' : 'var(--wn-text-muted)'
                  }}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Account actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* User Profile Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: '12px',
            backgroundColor: 'var(--wn-surface-subtle)',
            border: '1px solid var(--wn-border-light)'
          }}
        >
          <div
            onClick={onOpenProfile}
            style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', flex: 1, overflow: 'hidden' }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'var(--wn-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--wn-text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {currentUser?.name || 'Account'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--wn-text-muted)' }}>
                View Profile
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              padding: '7px 8px',
              color: 'var(--wn-rose)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}
            title="Log out of WellNest"
            aria-label="Log out"
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
