import React from 'react';

export default function ActivityCard({ activity }) {
  if (!activity) return null;

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMins = Math.floor(diffMs / (1000 * 60));
          return diffMins <= 1 ? 'Just now' : `${diffMins} mins ago`;
        }
        return 'Today';
      }
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'Recent';
    }
  };

  const isGame = activity.type === 'game';

  return (
    <div className="activity-card">
      <div className="activity-left">
        <div className={`activity-icon-badge ${isGame ? 'activity-icon-game' : 'activity-icon-quiz'}`}>
          {activity.icon || (isGame ? '🎮' : '📝')}
        </div>
        <div>
          <h4 className="activity-title">{activity.title}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
            <span className="activity-subtitle">{activity.subtitle}</span>
            <span className="badge badge-gender" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
              {activity.category}
            </span>
          </div>
        </div>
      </div>

      <div className="activity-right">
        {isGame ? (
          <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.95rem' }}>
            {'⭐'.repeat(activity.stars_earned || 3)}
          </span>
        ) : (
          <span className={`badge ${activity.percentage >= 80 ? 'badge-ukg' : activity.percentage >= 60 ? 'badge-lkg' : 'badge-nursery'}`} style={{ fontSize: '0.85rem' }}>
            {activity.score_text || `${activity.percentage}%`}
          </span>
        )}
        <span className="activity-time">🕒 {formatDate(activity.completed_at)}</span>
      </div>
    </div>
  );
}
