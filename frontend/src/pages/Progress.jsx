import React, { useState, useEffect } from 'react';
import { getStudents, getProgress, updateProgress } from '../services/api';
import ProgressCard from '../components/ProgressCard';
import '../css/progress.css';

export default function Progress() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Edit progress modal state
  const [editCategory, setEditCategory] = useState(null);
  const [newPercentage, setNewPercentage] = useState(0);

  useEffect(() => {
    async function loadStudentsList() {
      try {
        const data = await getStudents();
        setStudents(data);
        if (data.length > 0) {
          setSelectedStudentId(data[0].id.toString());
        }
      } catch (err) {
        setError(err.message || 'Failed to load students');
      }
    }
    loadStudentsList();
  }, []);

  useEffect(() => {
    if (!selectedStudentId) return;

    async function loadStudentProgress() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProgress(selectedStudentId);
        setProgressData(data);
      } catch (err) {
        setError(err.message || 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    }
    loadStudentProgress();
  }, [selectedStudentId]);

  const handleUpdateCategoryProgress = async () => {
    if (!editCategory || !selectedStudentId) return;
    try {
      await updateProgress(selectedStudentId, {
        category: editCategory,
        progress_percentage: parseInt(newPercentage)
      });
      setToast({ type: 'success', text: `Updated ${editCategory} progress to ${newPercentage}%!` });
      setEditCategory(null);
      // Reload
      const updated = await getProgress(selectedStudentId);
      setProgressData(updated);
    } catch (err) {
      setToast({ type: 'error', text: err.message || 'Failed to update progress' });
    } finally {
      setTimeout(() => setToast(null), 3500);
    }
  };

  const getProficiencyLabel = (pct) => {
    if (pct >= 90) return { text: 'Star Master 🌟', color: '#059669' };
    if (pct >= 75) return { text: 'Advanced Explorer 🚀', color: '#4f46e5' };
    if (pct >= 50) return { text: 'Growing Learner 🌱', color: '#d97706' };
    return { text: 'Early Beginner 👶', color: '#e11d48' };
  };

  const currentStudent = progressData?.student;
  const overall = progressData?.overall_percentage || 0;
  const proficiency = getProficiencyLabel(overall);

  return (
    <div className="progress-page">
      {toast && (
        <div className={`alert alert-${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toast.text}</span>
        </div>
      )}

      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">📊 Learning Progress Dashboard</h1>
            <p className="page-subtitle">Track educational milestones and subject proficiency for every student</p>
          </div>

          <div className="student-selector-bar">
            <span>🧒 Select Student:</span>
            <select
              className="student-select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.class_name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {loading ? (
        <div className="spinner-container">
          <div className="spinner" />
          <p className="spinner-text">Analyzing learning statistics...</p>
        </div>
      ) : !progressData ? (
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <h2 className="empty-title">No Progress Data</h2>
          <p className="empty-desc">Please select a student to view learning analytics.</p>
        </div>
      ) : (
        <div>
          {/* Main Progress Grid */}
          <div className="progress-grid">
            {/* Overall Card */}
            <div className="overall-progress-card">
              <h2 style={{ fontSize: '1.4rem', color: '#1e1b4b', marginBottom: '0.2rem' }}>
                {currentStudent?.name}
              </h2>
              <span className={`badge ${currentStudent?.class_name === 'Nursery' ? 'badge-nursery' : currentStudent?.class_name === 'LKG' ? 'badge-lkg' : 'badge-ukg'}`}>
                {currentStudent?.class_name} Class
              </span>

              <div className="overall-circle-container">
                <span className="overall-percentage-number">{overall}%</span>
                <span className="overall-percentage-label">Average Score</span>
              </div>

              <div style={{
                background: 'white',
                padding: '0.5rem 1.2rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 800,
                color: proficiency.color,
                marginBottom: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                {proficiency.text}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', width: '100%' }}>
                <div className="quiz-stat-box">
                  <div className="quiz-stat-value">{progressData.quizzes_completed}</div>
                  <div className="quiz-stat-label">Quizzes Done</div>
                </div>
                <div className="quiz-stat-box">
                  <div className="quiz-stat-value">⭐ {progressData.stars_earned}</div>
                  <div className="quiz-stat-label">Stars Collected</div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem' }}>🎯 Curriculum Subject Progress</h3>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                  Click any subject to adjust
                </span>
              </div>

              <div className="category-progress-list">
                {progressData.categories?.map((cat) => (
                  <div 
                    key={cat.category} 
                    onClick={() => { setEditCategory(cat.category); setNewPercentage(cat.progress_percentage); }}
                    style={{ cursor: 'pointer' }}
                    title="Click to adjust progress percentage"
                  >
                    <ProgressCard
                      category={cat.category}
                      percentage={cat.progress_percentage}
                      icon={cat.icon}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Guidance Card */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', border: '2px solid #a7f3d0' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#065f46', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💡</span> Teacher / Parent Tip
            </h3>
            <p style={{ color: '#047857', fontSize: '0.95rem' }}>
              Progress is automatically updated whenever <strong>{currentStudent?.name}</strong> completes educational games or submits quiz assessments. You can also click any progress bar above to manually update scores.
            </p>
          </div>
        </div>
      )}

      {/* Edit Progress Modal */}
      {editCategory && (
        <div className="modal-overlay" onClick={() => setEditCategory(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">📊</div>
            <h2 className="modal-title">Adjust {editCategory} Progress</h2>
            <p className="modal-message">
              Set the progress percentage for <strong>{currentStudent?.name}</strong>:
            </p>

            <div style={{ margin: '1.5rem 0' }}>
              <input
                type="range"
                min="0"
                max="100"
                value={newPercentage}
                onChange={(e) => setNewPercentage(e.target.value)}
                style={{ width: '100%', height: '10px', accentColor: '#6366f1', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#4f46e5', marginTop: '0.5rem' }}>
                {newPercentage}%
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setEditCategory(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleUpdateCategoryProgress}>
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
