import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { storeManagerLogin } from '../services/api';
import '../css/parent.css';

export default function StoreAdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/store-admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await storeManagerLogin({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Store Manager authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
    setLoading(true);

    storeManagerLogin({ email: demoEmail, password: demoPassword })
      .then(() => {
        navigate(from, { replace: true });
      })
      .catch((err) => {
        setError(err.message || 'Failed to authenticate with demo credentials.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div style={{
      maxWidth: '520px',
      margin: '2.5rem auto',
      padding: '1rem'
    }}>
      <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', borderTop: '6px solid #0d9488' }}>
        <div style={{ fontSize: '3.8rem', marginBottom: '0.4rem' }}>
          🏬
        </div>

        <h1 style={{
          fontSize: '2.2rem',
          background: 'linear-gradient(135deg, #0f766e, #0d9488)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.3rem',
          fontFamily: 'var(--font-heading)'
        }}>
          Store Admin Portal
        </h1>

        <div style={{
          display: 'inline-block',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#0f766e',
          background: '#ccfbf1',
          padding: '0.2rem 0.75rem',
          borderRadius: '9999px',
          marginBottom: '1rem'
        }}>
          Role 4: Store Manager Dashboard
        </div>

        <p style={{ color: '#64748b', fontSize: '0.98rem', fontWeight: 500, marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Sign in to manage Little Learners school store inventory, stock, pricing, and fulfill student toy requests.
        </p>

        {/* Security & Privacy Notice */}
        <div style={{
          padding: '0.75rem 1rem',
          background: '#f0fdfa',
          border: '1px solid #99f6e4',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          textAlign: 'left',
          fontSize: '0.85rem',
          color: '#115e59'
        }}>
          <strong>🔒 Strict Role Isolation:</strong> Store Managers only access inventory & fulfillment. Student academic grades, progress, and teacher logs are strictly protected and isolated.
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
              Manager Email Address
            </label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="e.g. manager@littlelearners.com"
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
                placeholder="Enter password"
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
              fontSize: '1.05rem',
              width: '100%',
              background: 'linear-gradient(135deg, #0f766e, #0d9488)',
              borderColor: '#0f766e',
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
              color: '#ffffff',
              fontWeight: 700
            }}
          >
            {loading ? 'Authenticating...' : '🔐 Sign In to Store Admin'}
          </button>
        </form>

        {/* 1-Click Demo Quick Logins */}
        <div style={{
          marginTop: '1.8rem',
          padding: '1.2rem',
          background: '#f8fafc',
          border: '1.5px dashed #cbd5e1',
          borderRadius: 'var(--radius-md)',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#0f766e', fontSize: '0.95rem', marginBottom: '0.6rem' }}>
            <span>⚡</span> 1-Click Demo Access (Manager & Teacher):
          </div>
          <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.85rem', color: '#64748b' }}>
            Click either role below to sign in with full Store Manager inventory permissions:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => handleDemoLogin('manager@littlelearners.com', 'Manager@123')}
              style={{
                width: '100%',
                padding: '0.7rem',
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                background: '#ffffff',
                borderColor: '#0d9488',
                color: '#0f766e',
                fontWeight: 700
              }}
            >
              <span>🏬</span>
              <span><strong>Store Manager Alex</strong> (manager@littlelearners.com)</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.8 }}>⚡ 1-Click Login</span>
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => handleDemoLogin('teacher@littlelearners.com', 'Teacher@123')}
              style={{
                width: '100%',
                padding: '0.7rem',
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                background: '#fff7ed',
                borderColor: '#ea580c',
                color: '#c2410c',
                fontWeight: 700
              }}
            >
              <span>👩‍🏫</span>
              <span><strong>Teacher Sarah</strong> (Teacher Store Access)</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.8 }}>⚡ 1-Click Login</span>
            </button>
          </div>
        </div>

        {/* Other Portals Switch */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <div style={{ fontSize: '0.95rem', color: '#64748b' }}>
            Are you a Teacher?{' '}
            <Link to="/teacher/login" style={{ color: '#ea580c', fontWeight: 700 }}>
              Teacher Portal →
            </Link>
          </div>
          <div style={{ fontSize: '0.95rem', color: '#64748b' }}>
            Are you a Parent?{' '}
            <Link to="/parent/login" style={{ color: 'var(--primary-color)', fontWeight: 700 }}>
              Parent Portal →
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
