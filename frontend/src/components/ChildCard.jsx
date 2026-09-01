import React from 'react';
import { Link } from 'react-router-dom';
import { setActiveChildId } from '../services/api';

export default function ChildCard({ child, isSelected, onSelect }) {
  if (!child) return null;

  const getClassBadgeClass = (className) => {
    switch (className) {
      case 'Nursery': return 'badge-nursery';
      case 'LKG': return 'badge-lkg';
      case 'UKG': return 'badge-ukg';
      default: return 'badge-gender';
    }
  };

  const handleChildSelect = () => {
    setActiveChildId(child.id);
    if (onSelect) onSelect(child);
  };

  return (
    <div className={`child-card ${isSelected ? 'selected-child-highlight' : ''}`} style={isSelected ? { borderColor: 'var(--primary-color)', boxShadow: '0 8px 25px rgba(99,102,241,0.2)' } : {}}>
      <div className="child-card-header">
        <div className="child-avatar-large">
          {child.gender === 'Female' ? '👧' : '👦'}
        </div>
        <div className="child-card-meta">
          <h3 className="child-card-name">{child.name}</h3>
          <div className="child-badges-row">
            <span className={`badge ${getClassBadgeClass(child.class_name)}`}>
              🎒 {child.class_name}
            </span>
            <span className="badge badge-gender">
              {child.gender === 'Female' ? '♀️ Girl' : '♂️ Boy'}
            </span>
          </div>
        </div>
      </div>

      <div className="child-info-grid">
        <div className="child-info-item">
          <span className="child-info-label">Date of Birth</span>
          <span className="child-info-val">📅 {child.dob || 'N/A'}</span>
        </div>
        <div className="child-info-item">
          <span className="child-info-label">Guardian</span>
          <span className="child-info-val">👤 {child.parent_name || 'Parent'}</span>
        </div>
        <div className="child-info-item">
          <span className="child-info-label">Overall Progress</span>
          <span className="child-info-val" style={{ color: 'var(--primary-color)', fontWeight: 700 }}>
            📊 {child.overall_percentage !== undefined ? `${child.overall_percentage}%` : '0%'}
          </span>
        </div>
        <div className="child-info-item">
          <span className="child-info-label">Stars Earned</span>
          <span className="child-info-val" style={{ color: '#f59e0b', fontWeight: 700 }}>
            ⭐ {child.stars_earned || 0} Stars
          </span>
        </div>
      </div>

      <div className="child-card-actions">
        <Link 
          to={`/parent/children/${child.id}`} 
          className="btn btn-primary btn-sm"
          onClick={handleChildSelect}
        >
          🔍 View Details
        </Link>
        <Link 
          to={`/parent/progress?childId=${child.id}`} 
          className="btn btn-warning btn-sm"
          onClick={handleChildSelect}
        >
          📊 Progress
        </Link>
        <Link 
          to={`/parent/activities?childId=${child.id}`} 
          className="btn btn-secondary btn-sm"
          onClick={handleChildSelect}
        >
          🎮 Activities
        </Link>
        <Link 
          to={`/parent/results?childId=${child.id}`} 
          className="btn btn-outline btn-sm"
          onClick={handleChildSelect}
        >
          📝 Results
        </Link>
      </div>
    </div>
  );
}
