import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getParentChildren, getChildProgress, getActiveChildId, setActiveChildId } from '../services/api';
import ProgressCard from '../components/ProgressCard';
import '../css/parent.css';

export default function ParentProgress() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(searchParams.get('childId') || getActiveChildId());
  const [progressData, setProgressData] = useState(null);
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
          await loadProgress(targetId);
        }
      } catch (err) {
        setError(err.message || 'Failed to load progress data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const loadProgress = async (childId) => {
    try {
      const data = await getChildProgress(childId);
      setProgressData(data);
    } catch (err) {
      setError(err.message || 'Failed to load progress for child.');
    }
  };

  const handleChildSelect = (childId) => {
    setSelectedChildId(String(childId));
    setActiveChildId(childId);
    setSearchParams({ childId });
    loadProgress(childId);
    window.dispatchEvent(new CustomEvent('parentActiveChildChanged', { detail: { childId } }));
  };

  const categories = progressData?.categories || [];
  const overallPercentage = progressData?.overall_percentage || 0;
  const student = progressData?.student || {};

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <div className="spinner-text">Analyzing learning progress... 📊✨</div>
      </div>
    );
  }

  return (
    <div className="parent-portal-container">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">
              <span>📊</span> Child Learning Progress
            </h1>
            <p className="page-subtitle">
              Detailed breakdown of subject mastery, games played, and quiz scores
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Child Selector */}
      {children.length > 1 && (
        <section className="child-switcher-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.3rem' }}>👧👦</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Viewing Progress for:</span>
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

      {/* Overall Progress Metrics */}
      <div className="parent-stats-grid">
        <div className="parent-stat-card" style={{ borderLeft: '5px solid #6366f1' }}>
          <div className="parent-stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            🌈
          </div>
          <div className="parent-stat-info">
            <span className="parent-stat-value">{overallPercentage}%</span>
            <span className="parent-stat-label">Overall Progress</span>
          </div>
        </div>

        <div className="parent-stat-card" style={{ borderLeft: '5px solid #10b981' }}>
          <div className="parent-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            🎮
          </div>
          <div className="parent-stat-info">
            <span className="parent-stat-value">{progressData?.games_completed || 0}</span>
            <span className="parent-stat-label">Games Completed</span>
          </div>
        </div>

        <div className="parent-stat-card" style={{ borderLeft: '5px solid #f59e0b' }}>
          <div className="parent-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            📝
          </div>
          <div className="parent-stat-info">
            <span className="parent-stat-value">{progressData?.quizzes_completed || 0}</span>
            <span className="parent-stat-label">Quizzes Completed</span>
          </div>
        </div>

        <div className="parent-stat-card" style={{ borderLeft: '5px solid #db2777' }}>
          <div className="parent-stat-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>
            ⭐
          </div>
          <div className="parent-stat-info">
            <span className="parent-stat-value">{progressData?.average_quiz_score || 0}%</span>
            <span className="parent-stat-label">Average Quiz Score</span>
          </div>
        </div>
      </div>

      {/* 7 Core Categories Progress Section */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#1e293b' }}>
              📚 Subject & Skills Mastery
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Progression across early education categories based on quiz performance and games
            </p>
          </div>
          <span className="badge badge-ukg" style={{ fontSize: '0.9rem' }}>
            {student?.name} • {student?.class_name}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {categories.map(cat => (
            <ProgressCard
              key={cat.category}
              category={cat.category}
              percentage={cat.progress_percentage}
              icon={cat.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
