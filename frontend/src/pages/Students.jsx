import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudents, deleteStudent } from '../services/api';
import StudentCard from '../components/StudentCard';
import '../css/students.css';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchStudentList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudents(selectedClass, searchQuery);
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentList();
  }, [selectedClass, searchQuery]);

  const handleDeleteClick = (student) => {
    setDeleteTarget(student);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteStudent(deleteTarget.id);
      setToastMessage({ type: 'success', text: `Student ${deleteTarget.name} has been deleted successfully.` });
      setDeleteTarget(null);
      fetchStudentList();
    } catch (err) {
      setToastMessage({ type: 'error', text: err.message || 'Failed to delete student.' });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="students-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`alert alert-${toastMessage.type}`}>
          <span>{toastMessage.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">👩‍🏫 Student Directory</h1>
            <p className="page-subtitle">Manage enrolled children, class allocations, and contact details</p>
          </div>
          <Link to="/students/add" className="btn btn-primary btn-lg">
            ➕ Add New Student
          </Link>
        </div>
      </div>

      {/* Controls: Class Filters & Search */}
      <div className="students-controls">
        <div className="class-filter-tabs">
          {['All', 'Nursery', 'LKG', 'UKG'].map(c => (
            <button
              key={c}
              className={`filter-tab ${selectedClass === c ? 'active' : ''}`}
              onClick={() => setSelectedClass(c)}
            >
              {c === 'All' ? '🌈 All Classes' : c === 'Nursery' ? '👶 Nursery' : c === 'LKG' ? '🌟 LKG' : '🚀 UKG'}
            </button>
          ))}
        </div>

        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, parent, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
          <button className="btn btn-outline btn-sm" onClick={fetchStudentList} style={{ marginLeft: 'auto' }}>
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner" />
          <p className="spinner-text">Loading cheerful students...</p>
        </div>
      ) : students.length === 0 ? (
        /* Empty State */
        <div className="empty-state">
          <div className="empty-icon">🎒</div>
          <h2 className="empty-title">No Students Found</h2>
          <p className="empty-desc">
            {searchQuery 
              ? `No students matching "${searchQuery}" in ${selectedClass} class.` 
              : `No students registered yet in ${selectedClass} class.`}
          </p>
          <Link to="/students/add" className="btn btn-primary">
            ➕ Add First Student
          </Link>
        </div>
      ) : (
        /* Students Grid */
        <div className="students-grid">
          {students.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => !isDeleting && setDeleteTarget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <h2 className="modal-title">Delete Student Record?</h2>
            <p className="modal-message">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong> from <strong>{deleteTarget.class_name}</strong>? 
              This will also remove all associated quiz scores and game progress.
            </p>
            <div className="modal-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
