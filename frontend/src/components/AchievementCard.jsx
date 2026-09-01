import React from 'react';

export default function AchievementCard({ achievement }) {
  if (!achievement) return null;

  const isUnlocked = Boolean(achievement.is_unlocked);

  return (
    <div className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
      <div className="achievement-icon-circle">
        {achievement.icon || '🏆'}
        {isUnlocked && <span className="achievement-sparkle">✨</span>}
      </div>

      <div>
        <h3 className="achievement-title">{achievement.title}</h3>
        <span className="badge badge-gender" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
          {achievement.category}
        </span>
      </div>

      <p className="achievement-desc">{achievement.description}</p>

      <div style={{ marginTop: 'auto', width: '100%' }}>
        {isUnlocked ? (
          <div style={{
            background: '#ecfdf5',
            color: '#065f46',
            border: '1.5px solid #a7f3d0',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <span>✨</span> Unlocked & Earned!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              <span>Target: {achievement.criteria}</span>
              <span>{achievement.progress_pct || 0}%</span>
            </div>
            <div style={{ background: '#e2e8f0', height: '8px', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${Math.min(100, Math.max(0, achievement.progress_pct || 0))}%`, 
                  background: 'var(--primary-color)', 
                  height: '100%' 
                }} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
