import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { loginUser } from '../services/storageService';
import AuthLayout from '../components/layout/AuthLayout';

export default function LoginPage({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      const session = loginUser(email, password);
      onLoginSuccess(session);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="login">
      <div className="auth-form-heading">
        <p className="auth-eyebrow">Your wellness journey continues</p>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-description">Log in to your WellNest account.</p>
      </div>

      {error && <div className="auth-error" role="alert">{error}</div>}

      <form onSubmit={handleLogin} className="auth-form">
        <div className="auth-field">
          <label htmlFor="login-email">Email address</label>
          <div className="auth-input-wrap">
            <Mail size={17} aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">Password</label>
          <div className="auth-input-wrap">
            <Lock size={17} aria-hidden="true" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="wn-btn wn-btn-primary auth-submit">
          {loading ? 'Signing in...' : 'Sign in'}
          {!loading && <ArrowRight size={17} />}
        </button>
      </form>

      <p className="auth-switch">
        New to WellNest?{' '}
        <button type="button" onClick={() => onNavigate('register')}>Create an account</button>
      </p>
    </AuthLayout>
  );
}
