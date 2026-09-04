import React, { useState, useEffect } from 'react';
import { getParentChildren, getActiveChildId, setActiveChildId, linkChildToParent } from '../services/api';
import ChildCard from '../components/ChildCard';
import '../css/parent.css';

export default function ParentChildren() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(getActiveChildId());

  // Link child modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkStudentId, setLinkStudentId] = useState('');
  const [linkChildName, setLinkChildName] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState(null);
  const [linkSuccess, setLinkSuccess] = useState(null);

  useEffect(() => {
    async function fetchChildren() {
      try {
        setLoading(true);
        const data = await getParentChildren();
        setChildren(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load children records.');
      } finally {
        setLoading(false);
      }
    }
    fetchChildren();
  }, []);

  const handleSelect = (child) => {
    setActiveId(String(child.id));
    setActiveChildId(child.id);
  };

  const handleConnectChild = async (e) => {
    if (e) e.preventDefault();
    setLinkError(null);
    setLinkSuccess(null);

    const sId = linkStudentId.trim();
    const cName = linkChildName.trim();

    if (!sId && !cName) {
      setLinkError('Please enter either the Student ID or Child\'s Full Name.');
      return;
    }

    setLinkLoading(true);
    try {
      const payload = {};
      if (sId) payload.student_id = sId;
      if (cName) payload.child_name = cName;

      const res = await linkChildToParent(payload);
      setLinkSuccess(res.message || 'Successfully connected to child! 🌟');

      const updated = await getParentChildren();
      setChildren(updated || []);

      if (res.child?.id) {
        setActiveId(String(res.child.id));
        setActiveChildId(res.child.id);
        window.dispatchEvent(new CustomEvent('parentActiveChildChanged', { detail: { childId: res.child.id } }));
      }

      setLinkStudentId('');
      setLinkChildName('');
      setTimeout(() => {
        setShowLinkModal(false);
        setLinkSuccess(null);
      }, 1600);
    } catch (err) {
      setLinkError(err.message || 'Failed to link child. Please verify details.');
    } finally {
      setLinkLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <div className="spinner-text">Loading your children's profiles... 👧👦</div>
      </div>
    );
  }

  return (
    <div className="parent-portal-container">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">
              <span>👧</span> My Children
            </h1>
            <p className="page-subtitle">
              Securely view linked students and their individual academic progress
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowLinkModal(true)}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700 }}
            >
              ➕ Connect Another Child
            </button>
            <span className="badge badge-gender" style={{ fontSize: '0.95rem', padding: '0.45rem 0.9rem' }}>
              {children.length} {children.length === 1 ? 'Child' : 'Children'} Linked
            </span>
          </div>
        </div>
      </div>

      {showLinkModal && (
        <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🔗</span> Connect Enrolled Child
              </h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.4rem',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.2rem 0.5rem'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Connect your parent account to your child enrolled in Little Learners School.
            </p>

            {linkSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                <span>✅</span> {linkSuccess}
              </div>
            )}
            {linkError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <span>⚠️</span> {linkError}
              </div>
            )}

            <form onSubmit={handleConnectChild}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem' }}>Child's Registered Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Diya Sen, Ananya Patel, Aarav Sharma"
                  value={linkChildName}
                  onChange={(e) => setLinkChildName(e.target.value)}
                />
              </div>

              <div style={{ textAlign: 'center', margin: '0.6rem 0', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 700 }}>
                — OR BY STUDENT ID —
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem' }}>Child's Student ID (e.g. LL-001)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. LL-001, LL-002, LL-003..."
                  value={linkStudentId}
                  onChange={(e) => setLinkStudentId(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowLinkModal(false)}
                  disabled={linkLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={linkLoading}
                >
                  {linkLoading ? 'Connecting...' : '🔗 Connect Child'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {children.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👧</div>
          <h2 className="empty-title">No children linked to your account</h2>
          <p className="empty-desc">
            Please contact school administration to link your student to this parent account.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.75rem'
        }}>
          {children.map(child => (
            <ChildCard
              key={child.id}
              child={child}
              isSelected={String(child.id) === String(activeId)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
