import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getParentProfile, updateParentProfile, logoutParent } from '../services/api';
import '../css/parent.css';

export default function ParentProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [children, setChildren] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await getParentProfile();
        setProfile(data.parent);
        setChildren(data.children || []);
        setName(data.parent?.name || '');
        setPhone(data.parent?.phone || '');
      } catch (err) {
        setError(err.message || 'Failed to load parent profile.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      const res = await updateParentProfile({ name, phone });
      setProfile(res.parent);
      setMessage('Profile updated successfully! ✨');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logoutParent();
    navigate('/parent/login');
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <div className="spinner-text">Loading profile details... 👤</div>
      </div>
    );
  }

  return (
    <div className="parent-portal-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">
          <span>👤</span> Parent Profile & Settings
        </h1>
        <p className="page-subtitle">
          Manage your account information and contact preferences
        </p>
      </div>

      {message && (
        <div className="alert alert-success">
          <span>✅</span> {message}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#1e293b' }}>
              Full Name
            </label>
            <input
              type="text"
              required
              className="form-input"
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

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#1e293b' }}>
              Email Address (Login ID)
            </label>
            <input
              type="email"
              disabled
              className="form-input"
              value={profile?.email || ''}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid #e2e8f0',
                fontSize: '1rem',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                fontFamily: 'var(--font-body)',
                cursor: 'not-allowed'
              }}
            />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Email address is managed by school administration.
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.4rem', color: '#1e293b' }}>
              Contact Phone Number
            </label>
            <input
              type="text"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
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

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '💾 Saving Changes...' : '💾 Save Profile Changes'}
            </button>
            <button type="button" onClick={handleLogout} className="btn btn-danger">
              🚪 Sign Out of Parent Portal
            </button>
          </div>
        </form>
      </div>

      {/* Linked Children Summary */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>👧👦</span> Linked Students ({children.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {children.map(child => (
            <div 
              key={child.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.9rem 1.2rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{child.gender === 'Female' ? '👧' : '👦'}</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>{child.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>DOB: {child.dob}</div>
                </div>
              </div>
              <span className={`badge ${child.class_name === 'Nursery' ? 'badge-nursery' : child.class_name === 'LKG' ? 'badge-lkg' : 'badge-ukg'}`}>
                {child.class_name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
