import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getParentChildren, getChildAchievements, getActiveChildId, setActiveChildId } from '../services/api';
import AchievementCard from '../components/AchievementCard';
import '../css/parent.css';

export default function ParentAchievements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(searchParams.get('childId') || getActiveChildId());
  const [achievements, setAchievements] = useState([]);
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
          await loadAchievements(targetId);
        }
      } catch (err) {
        setError(err.message || 'Failed to load achievements.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const loadAchievements = async (childId) => {
    try {
      const data = await getChildAchievements(childId);
      setAchievements(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load achievements for child.');
    }
  };

  const handleChildSelect = (childId) => {
    setSelectedChildId(String(childId));
    setActiveChildId(childId);
    setSearchParams({ childId });
    loadAchievements(childId);
    window.dispatchEvent(new CustomEvent('parentActiveChildChanged', { detail: { childId } }));
  };

  const selectedChild = children.find(c => String(c.id) === String(selectedChildId));
  const unlockedCount = achievements.filter(a => a.is_unlocked).length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <div className="spinner-text">Polishing child's trophies and badges... 🏆✨</div>
      </div>
    );
  }

  return (
    <div className="parent-portal-container">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">
              <span>🏆</span> Learning Achievements & Badges
            </h1>
            <p className="page-subtitle">
              Celebrate your child's milestones, badges, and learning trophies
            </p>
          </div>
          <span className="badge badge-ukg" style={{ fontSize: '1.05rem', padding: '0.5rem 1.2rem' }}>
            ✨ {unlockedCount} / {totalCount} Badges Unlocked!
          </span>
        </div>
      </div>

      {/* Multi-Child Selector */}
      {children.length > 1 && (
        <section className="child-switcher-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.3rem' }}>👧👦</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Viewing Badges for:</span>
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
                  <span className="badge badge-gender" style={{ fontSize: '0.75rem', background: isSelected ? 'rgba(255,255,255,0.3)' : '#f1f5f9', color: isSelected ? 'white' : '#475569' }}>
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

      {/* Hero Badge Showcase */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 50%, #fdf4ff 100%)',
        border: '3px solid #fde68a',
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ fontSize: '3.5rem', animation: 'bounce 2s infinite' }}>🌟</div>
          <div>
            <h2 style={{ fontSize: '1.6rem', color: '#92400e', marginBottom: '0.3rem' }}>
              {selectedChild?.name}'s Trophy Cabinet
            </h2>
            <p style={{ color: '#78350f', fontWeight: 600 }}>
              Badges are automatically awarded when your child completes games, reaches progress targets, and aces quizzes!
            </p>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '0.8rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', color: '#d97706', fontWeight: 800 }}>
            {Math.round((unlockedCount / (totalCount || 1)) * 100)}%
          </div>
          <div style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 700 }}>ACCOMPLISHED</div>
        </div>
      </div>

      {/* Achievements Cards Grid */}
      <div className="achievements-grid">
        {achievements.map(ach => (
          <AchievementCard key={ach.id} achievement={ach} />
        ))}
      </div>
    </div>
  );
}
