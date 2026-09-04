import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { teacherLogin, teacherRegister } from '../services/api';
import '../css/parent.css';

export default function TeacherLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/teacher/dashboard';

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await teacherLogin({ email, password });
        navigate(from, { replace: true });
      } else {
        await teacherRegister({ name, email, password });
        navigate('/teacher/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '520px',
      margin: '2.5rem auto',
      padding: '1rem'
    }}>
      <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', borderTop: '6px solid #ea580c' }}>
        <div style={{ fontSize: '3.8rem', marginBottom: '0.4rem' }}>
          👩‍🏫
        </div>

        <h1 style={{
          fontSize: '2.2rem',
          background: 'linear-gradient(135deg, #ea580c, #f59e0b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.3rem',
          fontFamily: 'var(--font-heading)'
        }}>
          Teacher Portal
        </h1>

        <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          {mode === 'login'
            ? 'Sign in to access student management and class analytics'
            : 'Register a new educator account for Little Learners School'}
        </p>

        {/* Tab switch between Sign In and Register */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: 'var(--radius-full)',
          padding: '0.3rem',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '0.55rem',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              background: mode === 'login' ? '#ffffff' : 'transparent',
              color: mode === 'login' ? '#c2410c' : '#64748b',
              boxShadow: mode === 'login' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            🔑 Teacher Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            style={{
              flex: 1,
              padding: '0.55rem',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              background: mode === 'register' ? '#ffffff' : 'transparent',
              color: mode === 'register' ? '#c2410c' : '#64748b',
              boxShadow: mode === 'register' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            ✨ Register Teacher
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ textAlign: 'left', marginBottom: '1.2rem' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" style={{ textAlign: 'left', marginBottom: '1.2rem' }}>
            <span>✅</span> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                Full Name / Title
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Ms. Anjali Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid #cbd5e1',
                  fontSize: '1rem',
                  outline: 'none',
                  fontFamily: 'var(--font-body)'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
              Teacher Email Address
            </label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="e.g. teacher@littlelearners.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid #cbd5e1',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: 'var(--font-body)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder={mode === 'register' ? 'Minimum 6 characters' : 'Enter password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 2.8rem 0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid #cbd5e1',
                  fontSize: '1rem',
                  outline: 'none',
                  fontFamily: 'var(--font-body)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: '#64748b'
                }}
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              marginTop: '0.5rem',
              padding: '0.85rem',
              fontSize: '1.1rem',
              width: '100%',
              background: 'linear-gradient(135deg, #ea580c, #f59e0b)',
              borderColor: '#ea580c',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
            }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? '🔐 Log In to Teacher Portal' : '✨ Complete Registration'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ fontSize: '0.95rem', color: '#64748b' }}>
            Are you a parent?{' '}
            <Link to="/parent/login" style={{ color: 'var(--primary-color)', fontWeight: 700 }}>
              Go to Parent Portal →
            </Link>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            <Link to="/" style={{ color: '#64748b' }}>
              ← Return to School Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
