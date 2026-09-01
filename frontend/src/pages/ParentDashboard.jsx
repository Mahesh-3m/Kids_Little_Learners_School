import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getStoredParent,
  getParentChildren,
  getChildDetails,
  getActiveChildId,
  setActiveChildId
} from '../services/api';
import ActivityCard from '../components/ActivityCard';
import ProgressCard from '../components/ProgressCard';
import '../css/parent.css';

export default function ParentDashboard() {
  const [parent, setParent] = useState(getStoredParent());
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(getActiveChildId());
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load parent's children list
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const childrenList = await getParentChildren();
        setChildren(childrenList || []);

        if (childrenList && childrenList.length > 0) {
          const stored = getActiveChildId();
          const currentId = stored && childrenList.some(c => String(c.id) === String(stored))
            ? stored
            : childrenList[0].id;
          
          setSelectedChildId(String(currentId));
          setActiveChildId(currentId);
          await loadChildDetails(currentId);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.message || 'Failed to load parent dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Listen for global navbar child changes
  useEffect(() => {
    const handleChildChanged = (e) => {
      const newChildId = e.detail?.childId;
      if (newChildId) {
        setSelectedChildId(String(newChildId));
        loadChildDetails(newChildId);
      }
    };
    window.addEventListener('parentActiveChildChanged', handleChildChanged);
    return () => window.removeEventListener('parentActiveChildChanged', handleChildChanged);
  }, []);

  const loadChildDetails = async (childId) => {
    try {
      const details = await getChildDetails(childId);
      setChildData(details);
    } catch (err) {
      console.error("Error loading child details:", err);
    }
  };

  const handleSelectChild = (childId) => {
    setSelectedChildId(String(childId));
    setActiveChildId(childId);
    loadChildDetails(childId);
    window.dispatchEvent(new CustomEvent('parentActiveChildChanged', { detail: { childId } }));
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <div className="spinner-text">Loading your child's dashboard... 🌈</div>
      </div>
    );
  }

  const selectedChild = children.find(c => String(c.id) === String(selectedChildId)) || children[0];
  const progressInfo = childData?.progress || {};
  const recentActivities = childData?.recent_activities || [];
  const achievementsCount = childData?.achievements_count || 0;

  return (
    <div className="parent-portal-container">
      {/* Welcome Banner */}
      <section className="hero-banner" style={{
        background: 'linear-gradient(135deg, #e0e7ff 0%, #fdf4ff 50%, #fef3c7 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2rem',
        marginBottom: '2rem',
        border: '3px solid #ede9fe',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ fontSize: '3rem', marginBottom: '0.3rem' }}>🌈</div>
          <h1 style={{
            fontSize: '2.4rem',
            background: 'linear-gradient(135deg, #4338ca 0%, #db2777 50%, #ea580c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.4rem'
          }}>
            Welcome, {parent?.name || 'Parent'}!
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#475569', fontWeight: 600 }}>
            Monitor your child's learning journey and celebrate every milestone ⭐
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <Link to="/parent/children" className="btn btn-primary">
            👧 My Children ({children.length})
          </Link>
          <Link to="/parent/activities" className="btn btn-secondary">
            🎮 View Activities
          </Link>
        </div>
      </section>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Multi-Child Selector */}
      {children.length > 1 && (
        <section className="child-switcher-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>👶</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' }}>
              Select Child:
            </span>
          </div>

          <div className="child-chips-group">
            {children.map(child => {
              const isSelected = String(child.id) === String(selectedChildId);
              return (
                <button
                  key={child.id}
                  type="button"
                  className={`child-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectChild(child.id)}
                >
                  <span className="child-chip-avatar">
                    {child.gender === 'Female' ? '👧' : '👦'}
                  </span>
                  <span>{child.name}</span>
                  <span className="badge badge-gender" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', background: isSelected ? 'rgba(255,255,255,0.3)' : '#f1f5f9', color: isSelected ? 'white' : '#475569' }}>
                    {child.class_name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Child Summary Stats Cards */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="page-header" style={{ marginBottom: '1.2rem' }}>
          <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>{selectedChild?.gender === 'Female' ? '👧' : '👦'}</span>
            <span>{selectedChild?.name}'s Learning Overview</span>
            <span className="badge badge-ukg" style={{ fontSize: '0.85rem' }}>
              Class {selectedChild?.class_name}
            </span>
          </h2>
        </div>

        <div className="parent-stats-grid">
          {/* My Children Card */}
          <Link to="/parent/children" className="parent-stat-card" style={{ textDecoration: 'none' }}>
            <div className="parent-stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
              👧
            </div>
            <div className="parent-stat-info">
              <span className="parent-stat-value">{children.length}</span>
              <span className="parent-stat-label">Linked Children</span>
            </div>
          </Link>

          {/* Quizzes Completed */}
          <Link to={`/parent/results?childId=${selectedChild?.id}`} className="parent-stat-card" style={{ textDecoration: 'none' }}>
            <div className="parent-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              📝
            </div>
            <div className="parent-stat-info">
              <span className="parent-stat-value">{progressInfo?.quizzes_completed || 0}</span>
              <span className="parent-stat-label">Quizzes Completed</span>
            </div>
          </Link>

          {/* Games Completed */}
          <Link to={`/parent/activities?childId=${selectedChild?.id}`} className="parent-stat-card" style={{ textDecoration: 'none' }}>
            <div className="parent-stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              🎮
            </div>
            <div className="parent-stat-info">
              <span className="parent-stat-value">{progressInfo?.games_completed || 0}</span>
              <span className="parent-stat-label">Games Completed</span>
            </div>
          </Link>

          {/* Achievements */}
          <Link to={`/parent/achievements?childId=${selectedChild?.id}`} className="parent-stat-card" style={{ textDecoration: 'none' }}>
            <div className="parent-stat-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>
              🏆
            </div>
            <div className="parent-stat-info">
              <span className="parent-stat-value">{achievementsCount}</span>
              <span className="parent-stat-label">Achievements</span>
            </div>
          </Link>

          {/* Overall Progress */}
          <Link to={`/parent/progress?childId=${selectedChild?.id}`} className="parent-stat-card" style={{ textDecoration: 'none' }}>
            <div className="parent-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              📊
            </div>
            <div className="parent-stat-info">
              <span className="parent-stat-value">{progressInfo?.overall_percentage || 0}%</span>
              <span className="parent-stat-label">Overall Progress</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Main Grid: Learning Progress & Recent Activities */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2rem',
        marginBottom: '2.5rem'
      }}>
        {/* Category Progress Preview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📊</span> Subject Progress
            </h3>
            <Link to={`/parent/progress?childId=${selectedChild?.id}`} style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.9rem' }}>
              Full Details →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(progressInfo?.categories || []).slice(0, 5).map(cat => (
              <ProgressCard 
                key={cat.category} 
                category={cat.category} 
                percentage={cat.progress_percentage} 
                icon={cat.icon} 
              />
            ))}
          </div>
        </div>

        {/* Recent Activities Timeline Preview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚡</span> Recent Activities
            </h3>
            <Link to={`/parent/activities?childId=${selectedChild?.id}`} style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.9rem' }}>
              View All ({recentActivities.length}) →
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div className="empty-icon">🎮</div>
              <div className="empty-title" style={{ fontSize: '1.2rem' }}>No recent activities yet</div>
              <p className="empty-desc" style={{ fontSize: '0.9rem' }}>
                Activities will appear here when your child completes games or quizzes!
              </p>
            </div>
          ) : (
            <div className="activities-timeline">
              {recentActivities.slice(0, 4).map(act => (
                <ActivityCard key={act.id} activity={act} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
