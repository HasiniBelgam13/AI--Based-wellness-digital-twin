import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { registerUser } from '../services/storageService';
import AuthLayout from '../components/layout/AuthLayout';

export default function CreateAccountPage({ onNavigate, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'Female',
    age: 26,
    occupation: 'Doctor',
    sleepGoal: 8.0,
    stepGoal: 10000,
    activityGoal: 60
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRules = [
    { label: '8 or more characters', valid: formData.password.length >= 8 },
    { label: 'Uppercase and lowercase letters', valid: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) },
    { label: 'At least one number', valid: /\d/.test(formData.password) },
    { label: 'At least one symbol', valid: /[^A-Za-z0-9]/.test(formData.password) }
  ];
  const passwordStrength = passwordRules.filter((rule) => rule.valid).length;
  const passwordStrengthLabel = passwordStrength <= 1
    ? 'Weak'
    : passwordStrength === 2
      ? 'Fair'
      : passwordStrength === 3
        ? 'Good'
        : 'Strong';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (passwordStrength < 4) {
      setError('Please meet all password strength requirements.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    setLoading(true);

    try {
      const newUser = registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        profileDetails: {
          gender: formData.gender,
          age: Number(formData.age),
          occupation: formData.occupation,
          sleepGoal: Number(formData.sleepGoal),
          stepGoal: Number(formData.stepGoal),
          activityGoal: Number(formData.activityGoal)
        }
      });

      onLoginSuccess({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      });
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="register">
      <div className="auth-form-heading">
        <p className="auth-eyebrow">Start your wellness journey</p>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-description">Set up your personal WellNest space.</p>
      </div>

      {error && <div className="auth-error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form auth-register-form">
        <div className="auth-field">
          <label htmlFor="register-name">Full name</label>
          <div className="auth-input-wrap">
            <User size={17} aria-hidden="true" />
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="register-email">Email address</label>
          <div className="auth-input-wrap">
            <Mail size={17} aria-hidden="true" />
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="register-password">Password</label>
          <div className="auth-input-wrap">
            <Lock size={17} aria-hidden="true" />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <div className={`password-strength strength-${passwordStrength}`} aria-live="polite">
            <div className="password-strength-topline">
              <span>Password strength</span>
              <strong>{formData.password ? passwordStrengthLabel : 'Not set'}</strong>
            </div>
            <div className="password-strength-meter" aria-hidden="true">
              {[1, 2, 3, 4].map((segment) => (
                <span className={passwordStrength >= segment ? 'is-filled' : ''} key={segment} />
              ))}
            </div>
            <div className="password-rules">
              {passwordRules.map((rule) => (
                <span className={rule.valid ? 'is-valid' : ''} key={rule.label}>
                  {rule.valid ? '✓' : '•'} {rule.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="register-confirm-password">Confirm password</label>
          <div className="auth-input-wrap">
            <Lock size={17} aria-hidden="true" />
            <input
              id="register-confirm-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Enter your password again"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="wn-btn wn-btn-primary auth-submit">
          {loading ? 'Creating account...' : 'Create account'}
          {!loading && <ArrowRight size={17} />}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" onClick={() => onNavigate('login')}>Sign in</button>
      </p>
    </AuthLayout>
  );
}
