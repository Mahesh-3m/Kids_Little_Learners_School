import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getStudents, deleteStudent } from '../services/api';
import StudentCard from '../components/StudentCard';
import '../css/students.css';

export default function TeacherStudents() {
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(
    location.state?.message ? { type: 'success', text: location.state.message } : null
  );

  const fetchStudentList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudents(selectedClass, searchQuery);
      setStudents(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentList();
  }, [selectedClass, searchQuery]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleDeleteClick = (student) => {
    setDeleteTarget(student);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteStudent(deleteTarget.id);
      setToastMessage({ type: 'success', text: `Student ${deleteTarget.name} (ID: ${deleteTarget.id}) deleted successfully.` });
      setDeleteTarget(null);
      fetchStudentList();
    } catch (err) {
      setToastMessage({ type: 'error', text: err.message || 'Failed to delete student.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="students-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`alert alert-${toastMessage.type}`} style={{ marginBottom: '1.5rem' }}>
          <span>{toastMessage.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">👩‍🏫 Student Directory Management</h1>
            <p className="page-subtitle">
              Manage enrolled children, class allocations (Nursery, LKG, UKG), and academic records
            </p>
          </div>
          <Link to="/teacher/students/add" className="btn btn-primary btn-lg" style={{ background: '#ea580c', borderColor: '#ea580c' }}>
            ➕ Enroll New Student
          </Link>
        </div>
      </div>

      {/* Class Filter Tabs & Search Bar */}
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

      {/* Error state */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Students Count Summary */}
      {!loading && !error && (
        <div style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.95rem' }}>
          Showing <strong>{students.length}</strong> {selectedClass !== 'All' ? `${selectedClass} ` : ''}student{students.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner" />
          <p className="spinner-text">Loading student records...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎒</div>
          <h2 className="empty-title">No Students Found</h2>
          <p className="empty-desc">
            {searchQuery
              ? `No student matching "${searchQuery}" was found.`
              : selectedClass !== 'All'
              ? `No students are currently enrolled in class ${selectedClass}.`
              : 'No students have been enrolled in the school yet.'}
          </p>
          <Link to="/teacher/students/add" className="btn btn-primary">
            Enroll First Student
          </Link>
        </div>
      ) : (
        <div className="students-grid">
          {students.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              onDelete={handleDeleteClick}
              basePath="/teacher/students"
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-icon">⚠️</div>
            <h2 className="modal-title">Confirm Student Deletion</h2>
            <p className="modal-desc">
              Are you sure you want to delete student <strong>{deleteTarget.name}</strong> (Roll #{deleteTarget.id}, {deleteTarget.class_name})? This action will permanently remove their records.
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
