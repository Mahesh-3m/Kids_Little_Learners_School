import React, { useState, useEffect } from 'react';
import { getParentChildren, getActiveChildId, setActiveChildId } from '../services/api';
import ChildCard from '../components/ChildCard';
import '../css/parent.css';

export default function ParentChildren() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(getActiveChildId());

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
          <span className="badge badge-gender" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
            {children.length} {children.length === 1 ? 'Child' : 'Children'} Linked
          </span>
        </div>
      </div>

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
