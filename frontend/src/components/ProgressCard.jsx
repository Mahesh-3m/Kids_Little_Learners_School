import React from 'react';

export default function ProgressCard({ category, percentage, progress_percentage, icon }) {
  const pct = percentage !== undefined ? percentage : (progress_percentage !== undefined ? progress_percentage : 0);

  const getFillClass = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'alphabet':
        return 'fill-alphabet';
      case 'numbers':
        return 'fill-numbers';
      case 'colors':
        return 'fill-colors';
      case 'shapes':
        return 'fill-shapes';
      case 'animals':
        return 'fill-animals';
      case 'quiz':
        return 'fill-quiz';
      case 'games':
        return 'fill-games';
      default:
        return 'fill-alphabet';
    }
  };

  return (
    <div className="progress-item-card">
      <div className="progress-item-header">
        <span className="progress-item-name">
          <span>{icon || '⭐'}</span> {category}
        </span>
        <span className="progress-item-pct">{pct}%</span>
      </div>
      <div className="progress-bar-bg">
        <div 
          className={`progress-bar-fill ${getFillClass(category)}`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  );
}
