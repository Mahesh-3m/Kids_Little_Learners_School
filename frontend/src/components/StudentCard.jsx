import React from 'react';
import { Link } from 'react-router-dom';

export default function StudentCard({ student, onDelete }) {
  const isFemale = student.gender && student.gender.toLowerCase() === 'female';
  const avatarEmoji = isFemale ? '👧' : '👦';

  const getClassBadgeClass = (className) => {
    switch (className?.toLowerCase()) {
      case 'nursery':
        return 'badge-nursery';
      case 'lkg':
        return 'badge-lkg';
      case 'ukg':
        return 'badge-ukg';
      default:
        return 'badge-gender';
    }
  };

  return (
    <div className="student-card">
      <div>
        <div className="student-card-top">
          <div className="student-avatar">{avatarEmoji}</div>
          <div className="student-card-meta">
            <h3 className="student-name">{student.name}</h3>
            <div className="student-tags">
              <span className={`badge ${getClassBadgeClass(student.class_name)}`}>
                {student.class_name === 'Nursery' ? '👶' : student.class_name === 'LKG' ? '🌟' : '🚀'} {student.class_name}
              </span>
              <span className="badge badge-gender">
                {student.gender}
              </span>
            </div>
          </div>
        </div>

        <div className="student-info-list">
          <div className="student-info-item">
            <span className="info-icon">🎂</span>
            <span>DOB: <strong>{student.dob}</strong></span>
          </div>
          <div className="student-info-item">
            <span className="info-icon">👨‍👩‍👦</span>
            <span>Parent: <strong>{student.parent_name}</strong></span>
          </div>
          <div className="student-info-item">
            <span className="info-icon">📞</span>
            <span>Phone: <strong>{student.phone}</strong></span>
          </div>
          <div className="student-info-item">
            <span className="info-icon">📍</span>
            <span>Address: <strong>{student.address}</strong></span>
          </div>
        </div>
      </div>

      <div className="student-card-actions">
        <Link to={`/students/${student.id}`} className="btn btn-outline btn-sm" title="View Student Details">
          👁️ View
        </Link>
        <Link to={`/students/edit/${student.id}`} className="btn btn-warning btn-sm" title="Edit Student">
          ✏️ Edit
        </Link>
        <button 
          onClick={() => onDelete(student)} 
          className="btn btn-danger btn-sm"
          title="Delete Student"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
