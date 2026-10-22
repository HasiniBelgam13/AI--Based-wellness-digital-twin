import React from 'react';

export default function AuthLayout({ children, variant = 'login' }) {
  return (
    <main className={`auth-layout auth-layout-${variant}`}>
      <section className="auth-intro">
        <div className="auth-intro-copy">
          <p className="auth-eyebrow">WELLNESS, AT YOUR PACE</p>
          <h2>Small steps build a healthier, happier you.</h2>
        </div>

        <div className="auth-illustration-wrap">
          <img
            className="auth-logo-art"
            src="/wellnest-meditation-logo.png"
            alt="WellNest: Better habits, healthier you"
          />
        </div>

        <p className="auth-intro-note">Make space for the habits that help you feel well.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-form-content">{children}</div>
      </section>
    </main>
  );
}