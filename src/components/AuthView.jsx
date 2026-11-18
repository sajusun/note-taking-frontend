import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, User, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthView = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [interests, setInterests] = useState('chess, reading, technology');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          role,
          interests: interests.split(',').map((i) => i.trim()).filter(Boolean)
        });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setError('');
    setLoading(true);
    try {
      await login(quickEmail, quickPassword);
    } catch (err) {
      setError(err.message || 'Quick login failed. Ensure database is seeded with "npm run seed"');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <Shield size={32} />
          </div>
          <h2 className="auth-title">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="auth-subtitle">
            Care Guide BD Secure Note-Taking Application with Role-Based Access Control
          </p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {/* Demo Fast Login Buttons */}
        <div className="quick-login-section">
          <div className="quick-login-label">
            <Sparkles size={14} />
            <span>Fast Reviewer Login (Seeded Accounts)</span>
          </div>
          <div className="quick-login-buttons">
            <button
              type="button"
              className="btn-quick admin"
              onClick={() => handleQuickLogin('admin@careguide.com', 'password123')}
              disabled={loading}
            >
              <Shield size={14} />
              <span>Login as Admin</span>
            </button>
            <button
              type="button"
              className="btn-quick user"
              onClick={() => handleQuickLogin('rahim@careguide.com', 'password123')}
              disabled={loading}
            >
              <User size={14} />
              <span>Login as User (Rahim)</span>
            </button>
          </div>
        </div>

        <div className="auth-divider">
          <span>OR USE FORM</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label>Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-select"
                >
                  <option value="user">User (Standard Access)</option>
                  <option value="admin">Admin (Manage Users & View All Notes)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Interests (Comma separated - for Scenario 1 Aggregation)</label>
                <input
                  type="text"
                  placeholder="e.g. chess, reading, coding"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="form-input"
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
              >
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
