import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { parentLogin } from '../services/api';
import '../css/parent.css';

export default function ParentLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await parentLogin({ email, password });
      navigate('/parent/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
    setLoading(true);
    try {
      await parentLogin({ email: demoEmail, password: demoPassword });
      navigate('/parent/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '520px',
      margin: '2rem auto',
      padding: '1rem'
    }}>
      <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '0.5rem', animation: 'bounce 2s infinite' }}>
          👨‍👩‍👧
        </div>

        <h1 style={{
          fontSize: '2.2rem',
          background: 'linear-gradient(135deg, #4f46e5, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.4rem',
          fontFamily: 'var(--font-heading)'
        }}>
          Parent Portal Login
        </h1>

        <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.8rem' }}>
          Sign in to view and monitor your child's learning journey 🌈
        </p>

        {error && (
          <div className="alert alert-error" style={{ textAlign: 'left', marginBottom: '1.2rem' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
              Parent Email Address
            </label>
            <input 
              type="email"
              required
              className="form-input"
              placeholder="e.g. parent@littlelearners.com"
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
                type={showPassword ? "text" : "password"}
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 2.75rem 0.75rem 1rem',
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
                  fontSize: '1.1rem',
                  color: '#64748b'
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
          >
            {loading ? '🔐 Authenticating...' : '🚀 Sign In to Dashboard'}
          </button>
        </form>

        {/* Link to Register */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #fdf4ff, #f3e8ff)',
          borderRadius: 'var(--radius-md)',
          border: '1.5px dashed #d8b4fe'
        }}>
          <p style={{ margin: 0, color: '#6b21a8', fontWeight: 700, fontSize: '0.95rem' }}>
            New to Little Learners? 🌟
          </p>
          <div style={{ marginTop: '0.4rem' }}>
            <Link 
              to="/register" 
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-block',
                textDecoration: 'none',
                fontWeight: 700,
                padding: '0.45rem 1.2rem'
              }}
            >
              📝 Create New Parent Account
            </Link>
          </div>
        </div>

        {/* 1-Click Demo Parent Quick Logins */}
        <div className="demo-accounts-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#334155', fontSize: '0.95rem' }}>
            <span>⚡</span> Quick Demo Parent Logins:
          </div>
          <div className="demo-btn-group">
            <button 
              type="button" 
              className="demo-account-btn"
              onClick={() => handleDemoLogin('parent@littlelearners.com', 'password123')}
            >
              <span>👤 <strong>Rohit Sharma</strong> (1 Child: Aarav)</span>
              <span className="badge badge-lkg" style={{ fontSize: '0.75rem' }}>Single Child</span>
            </button>

            <button 
              type="button" 
              className="demo-account-btn"
              onClick={() => handleDemoLogin('priya@littlelearners.com', 'password123')}
            >
              <span>👩 <strong>Priya Verma</strong> (2 Children: Diya & Kabir)</span>
              <span className="badge badge-ukg" style={{ fontSize: '0.75rem' }}>Multi-Child</span>
            </button>

            <button 
              type="button" 
              className="demo-account-btn"
              onClick={() => handleDemoLogin('suresh@littlelearners.com', 'password123')}
            >
              <span>👤 <strong>Suresh Patel</strong> (1 Child: Ananya)</span>
              <span className="badge badge-nursery" style={{ fontSize: '0.75rem' }}>LKG</span>
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.95rem' }}>
            ← Return to Little Learners Main Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
