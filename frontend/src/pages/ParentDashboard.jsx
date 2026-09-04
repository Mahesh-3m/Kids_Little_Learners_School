import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getStoredParent,
  getParentChildren,
  getChildDetails,
  getActiveChildId,
  setActiveChildId,
  linkChildToParent
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

  // Connect child modal & form state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkStudentId, setLinkStudentId] = useState('');
  const [linkChildName, setLinkChildName] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState(null);
  const [linkSuccess, setLinkSuccess] = useState(null);

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

  const handleConnectChild = async (e) => {
    if (e) e.preventDefault();
    setLinkError(null);
    setLinkSuccess(null);

    const sId = linkStudentId.trim();
    const cName = linkChildName.trim();

    if (!sId && !cName) {
      setLinkError('Please enter either your child\'s Student ID or Full Name.');
      return;
    }

    setLinkLoading(true);
    try {
      const payload = {};
      if (sId) payload.student_id = sId;
      if (cName) payload.child_name = cName;

      const res = await linkChildToParent(payload);
      setLinkSuccess(res.message || 'Successfully connected to your child! 🌟');

      // Refresh parent children list
      const updatedChildren = await getParentChildren();
      setChildren(updatedChildren || []);

      if (res.child?.id) {
        const newId = String(res.child.id);
        setSelectedChildId(newId);
        setActiveChildId(newId);
        await loadChildDetails(newId);
        window.dispatchEvent(new CustomEvent('parentActiveChildChanged', { detail: { childId: newId } }));
      }

      setLinkStudentId('');
      setLinkChildName('');
      setTimeout(() => {
        setShowLinkModal(false);
        setLinkSuccess(null);
      }, 1600);
    } catch (err) {
      setLinkError(err.message || 'Failed to connect child. Please verify the student name or ID with school records.');
    } finally {
      setLinkLoading(false);
    }
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
          <button
            type="button"
            onClick={() => setShowLinkModal(true)}
            className="btn btn-primary"
            style={{ fontWeight: 700 }}
          >
            🔗 Connect Child
          </button>
          <Link to="/parent/children" className="btn btn-secondary">
            👧 My Children ({children.length})
          </Link>
          <Link to="/parent/activities" className="btn btn-outline" style={{ background: 'white' }}>
            🎮 Activities
          </Link>
        </div>
      </section>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Prominent Connected Child Status Section */}
      {children.length === 0 ? (
        <section
          className="card"
          style={{
            padding: '2.5rem 2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #fefce8 0%, #ffffff 50%, #eff6ff 100%)',
            border: '2px dashed #f59e0b',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem'
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}>🔗</div>
          <h2 style={{ fontSize: '1.8rem', color: '#1e293b', marginBottom: '0.5rem' }}>
            Connect Your Child to Your Parent Account
          </h2>
          <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto 1.75rem auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
            You are signed in as <strong>{parent?.name}</strong>. Connect your enrolled child to securely view their academic report cards, quiz results, classroom activities, and select items from the Kids Store!
          </p>

          <form
            onSubmit={handleConnectChild}
            style={{
              maxWidth: '500px',
              margin: '0 auto',
              background: '#ffffff',
              padding: '1.75rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--card-shadow)',
              border: '1px solid #e2e8f0',
              textAlign: 'left'
            }}
          >
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

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Child's Registered Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Aarav Sharma, Diya Sen, Ananya Patel"
                value={linkChildName}
                onChange={(e) => setLinkChildName(e.target.value)}
              />
            </div>

            <div style={{ textAlign: 'center', margin: '0.6rem 0', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>
              — OR BY STUDENT ID —
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Child's Student ID (e.g. LL-001)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. LL-001, LL-002, LL-003..."
                value={linkStudentId}
                onChange={(e) => setLinkStudentId(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', fontWeight: 700 }}
              disabled={linkLoading}
            >
              {linkLoading ? 'Connecting Child...' : '🔗 Connect to My Child Now'}
            </button>
          </form>
        </section>
      ) : (
        <section className="connected-child-banner">
          {/* Top Status Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingBottom: '1rem',
            borderBottom: '1.5px solid #dcfce7',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="connected-badge-pill">
                <span className="connection-dot" />
                Connected & Verified Student
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                🏫 Little Learners Official Family Link
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowLinkModal(true)}
                className="btn btn-sm"
                style={{
                  background: '#ffffff',
                  color: '#4338ca',
                  border: '1.5px solid #c7d2fe',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.35rem 0.85rem'
                }}
              >
                ➕ Connect Another Child
              </button>
              <Link
                to="/parent/children"
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#4f46e5',
                  textDecoration: 'none',
                  padding: '0.35rem 0.5rem'
                }}
              >
                👧 View All ({children.length}) →
              </Link>
            </div>
          </div>

          {/* Child Profile & Store Access Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            {/* Left: Avatar + Details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: selectedChild?.gender === 'Female' ? 'linear-gradient(135deg, #fce7f3, #fbcfe8)' : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                border: '3px solid #ffffff',
                boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                position: 'relative'
              }}>
                {selectedChild?.gender === 'Female' ? '👧' : '👦'}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    background: '#22c55e',
                    color: 'white',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white'
                  }}
                  title="Verified Connection"
                >
                  ✓
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>
                    {selectedChild?.name}
                  </h2>
                  <span className={`badge ${selectedChild?.class_name === 'Nursery' ? 'badge-nursery' : selectedChild?.class_name === 'LKG' ? 'badge-lkg' : 'badge-ukg'}`} style={{ fontSize: '0.82rem' }}>
                    🎒 Class {selectedChild?.class_name}
                  </span>
                  <span className="badge badge-gender" style={{ fontSize: '0.82rem' }}>
                    {selectedChild?.gender === 'Female' ? '♀️ Girl' : '♂️ Boy'}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#4338ca', background: '#e0e7ff', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                    🆔 Student ID: {selectedChild?.student_id || `LL-${String(selectedChild?.id).padStart(3, '0')}`}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '1.2rem', marginTop: '0.4rem', flexWrap: 'wrap', fontSize: '0.88rem', color: '#475569' }}>
                  <span>
                    👩‍🏫 <strong>Teacher:</strong> Sarah Jenkins
                  </span>
                  <span>
                    👨‍👧 <strong>Guardian:</strong> {selectedChild?.parent_name || parent?.name || 'Parent'}
                  </span>
                  {selectedChild?.dob && (
                    <span>
                      📅 <strong>DOB:</strong> {selectedChild.dob}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Direct Actions including Kids Store */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                to={`/parent/store?childId=${selectedChild?.id}`}
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#ffffff',
                  fontWeight: 800,
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)',
                  border: 'none'
                }}
              >
                <span>🎁</span> Select Toys from Store
              </Link>
              <Link
                to={`/parent/progress?childId=${selectedChild?.id}`}
                className="btn btn-outline"
                style={{
                  fontWeight: 700,
                  padding: '0.75rem 1.1rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                📊 Full Progress
              </Link>
            </div>
          </div>

          {/* Child Highlights Ribbon */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px dashed #cbd5e1'
          }}>
            <div style={{ background: '#ffffff', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Stars Earned</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>
                ⭐ {selectedChild?.stars_earned !== undefined ? selectedChild.stars_earned : (progressInfo?.stars_earned || 45)}
              </div>
            </div>
            <div style={{ background: '#ffffff', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Learning Progress</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
                📊 {selectedChild?.overall_percentage !== undefined ? selectedChild.overall_percentage : (progressInfo?.overall_percentage || 0)}%
              </div>
            </div>
            <div style={{ background: '#ffffff', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Quizzes Taken</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
                📝 {selectedChild?.quizzes_completed !== undefined ? selectedChild.quizzes_completed : (progressInfo?.quizzes_completed || 0)}
              </div>
            </div>
            <div style={{ background: '#ffffff', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Games Finished</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.2rem' }}>
                🎮 {selectedChild?.games_completed !== undefined ? selectedChild.games_completed : (progressInfo?.games_completed || 0)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Connect Child Modal */}
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
              Connect your parent account to your child enrolled in Little Learners School. Enter their registered Student ID or Full Name.
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
