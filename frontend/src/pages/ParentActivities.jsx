import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getParentChildren, getChildActivities, getActiveChildId, setActiveChildId } from '../services/api';
import ActivityCard from '../components/ActivityCard';
import '../css/parent.css';

export default function ParentActivities() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(searchParams.get('childId') || getActiveChildId());
  const [activities, setActivities] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const childrenList = await getParentChildren();
        setChildren(childrenList || []);

        if (childrenList && childrenList.length > 0) {
          const queryId = searchParams.get('childId');
          const stored = getActiveChildId();
          const targetId = (queryId && childrenList.some(c => String(c.id) === String(queryId)))
            ? queryId
            : (stored && childrenList.some(c => String(c.id) === String(stored)))
              ? stored
              : childrenList[0].id;

          setSelectedChildId(String(targetId));
          setActiveChildId(targetId);
          await loadActivities(targetId);
        }
      } catch (err) {
        setError(err.message || 'Failed to load activities.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const loadActivities = async (childId) => {
    try {
      const data = await getChildActivities(childId);
      setActivities(data || []);
    } catch (err) {
      console.error("Activities error:", err);
      setError(err.message || 'Failed to load activities for child.');
    }
  };

  const handleChildSelect = (childId) => {
    setSelectedChildId(String(childId));
    setActiveChildId(childId);
    setSearchParams({ childId });
    loadActivities(childId);
    window.dispatchEvent(new CustomEvent('parentActiveChildChanged', { detail: { childId } }));
  };

  const filteredActivities = activities.filter(act => {
    if (filterType === 'GAMES') return act.type === 'game';
    if (filterType === 'QUIZ') return act.type === 'quiz';
    return true;
  });

  const selectedChild = children.find(c => String(c.id) === String(selectedChildId));

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <div className="spinner-text">Loading recent activities... 🎮📝</div>
      </div>
    );
  }

  return (
    <div className="parent-portal-container">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">
              <span>🎮</span> Child Activities
            </h1>
            <p className="page-subtitle">
              Live feed of games played and quizzes completed by your child
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${filterType === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterType('ALL')}
            >
              All Activities ({activities.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterType === 'GAMES' ? 'btn-secondary' : 'btn-outline'}`}
              onClick={() => setFilterType('GAMES')}
            >
              🎮 Games Only ({activities.filter(a => a.type === 'game').length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterType === 'QUIZ' ? 'btn-warning' : 'btn-outline'}`}
              onClick={() => setFilterType('QUIZ')}
            >
              📝 Quizzes Only ({activities.filter(a => a.type === 'quiz').length})
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Child Selector Chips */}
      {children.length > 1 && (
        <section className="child-switcher-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.3rem' }}>👧👦</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Viewing Activities for:</span>
          </div>

          <div className="child-chips-group">
            {children.map(child => {
              const isSelected = String(child.id) === String(selectedChildId);
              return (
                <button
                  key={child.id}
                  type="button"
                  className={`child-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => handleChildSelect(child.id)}
                >
                  <span className="child-chip-avatar">{child.gender === 'Female' ? '👧' : '👦'}</span>
                  <span>{child.name}</span>
                  <span className="badge badge-gender" style={{ fontSize: '0.75rem', background: isSelected ? 'rgba(255,255,255,0.3)' : '#f1f5f9', color: isSelected ? 'white' : '#334155' }}>
                    {child.class_name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Activities Timeline */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📅</span> Timeline for {selectedChild?.name || 'Child'}
          </h3>
          <span className="badge badge-gender" style={{ fontSize: '0.85rem' }}>
            {filteredActivities.length} Records Found
          </span>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎮</div>
            <h3 className="empty-title">No activities found</h3>
            <p className="empty-desc">
              No learning activities matching the current filter have been recorded yet.
            </p>
          </div>
        ) : (
          <div className="activities-timeline">
            {filteredActivities.map(act => (
              <ActivityCard key={act.id} activity={act} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
