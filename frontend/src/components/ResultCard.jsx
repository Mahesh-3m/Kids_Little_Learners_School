import React, { useState } from 'react';

export default function ResultCard({ result }) {
  const [modalOpen, setModalOpen] = useState(false);
  if (!result) return null;

  const percentage = parseFloat(result.percentage) || 0;
  const score = result.score;
  const total = result.total_questions;

  const getScoreColor = (pct) => {
    if (pct >= 80) return { color: '#059669', bg: '#10b981', label: '🌟 Outstanding' };
    if (pct >= 60) return { color: '#d97706', bg: '#f59e0b', label: '👍 Good Job' };
    return { color: '#dc2626', bg: '#ef4444', label: '💪 Keep Practicing' };
  };

  const status = getScoreColor(percentage);

  const formattedDate = result.completed_at 
    ? new Date(result.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent';

  return (
    <>
      <div className="result-card">
        <div className="result-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.8rem' }}>📝</span>
            <div>
              <h4 style={{ fontSize: '1.15rem', color: '#1e293b', fontWeight: 700 }}>
                {result.quiz_title || `Quiz #${result.quiz_id}`}
              </h4>
              <span className="badge badge-gender" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                {result.category}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="result-card-score">{score}/{total}</span>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              {percentage}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="result-bar-wrapper">
          <div 
            className="result-bar-fill"
            style={{ width: `${percentage}%`, background: status.bg }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem', color: status.color, fontWeight: 700 }}>
            {status.label}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>📅 {formattedDate}</span>
            <button 
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
              onClick={() => setModalOpen(true)}
            >
              👁️ View Result
            </button>
          </div>
        </div>
      </div>

      {/* Result Details Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              {percentage >= 80 ? '🏆' : percentage >= 60 ? '🌟' : '📚'}
            </div>
            <h3 className="modal-title">{result.quiz_title || 'Quiz Performance Details'}</h3>
            <p className="modal-message">
              Child demonstrated understanding in the <strong>{result.category}</strong> category.
            </p>

            <div style={{
              background: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              textAlign: 'left'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>STUDENT</div>
                <div style={{ fontWeight: 700, color: '#1e293b' }}>{result.student_name || 'Child'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>CLASS</div>
                <div style={{ fontWeight: 700, color: '#1e293b' }}>{result.class_name || 'Classroom'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>TOTAL SCORE</div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-color)' }}>
                  {score} / {total} correct
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>ACCURACY</div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: status.color }}>
                  {percentage}%
                </div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => setModalOpen(false)} style={{ width: '100%' }}>
              Close Result
            </button>
          </div>
        </div>
      )}
    </>
  );
}
