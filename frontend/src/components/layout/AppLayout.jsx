import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({
  activePage,
  onNavigate,
  currentUser,
  onLogout,
  onOpenProfile,
  backendStatus,
  children
}) {
  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--wn-bg)' }}>
      {/* Fixed Left Desktop Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        currentUser={currentUser}
        onLogout={onLogout}
        onOpenProfile={onOpenProfile}
      />

      {/* Main Content Area shifted right by sidebar width */}
      <div
        className="app-main-column"
        style={{
          marginLeft: 'var(--wn-sidebar-width)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh'
        }}
      >
        <Header
          activePage={activePage}
          currentUser={currentUser}
          backendStatus={backendStatus}
          onOpenGoals={onOpenProfile}
          onNavigate={onNavigate}
        />

        <main
          className="app-main-content"
          style={{
            flex: 1,
            padding: '36px 48px',
            maxWidth: 1360,
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
