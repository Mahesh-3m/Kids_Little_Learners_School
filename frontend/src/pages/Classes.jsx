import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getClasses, getClassStudents, isTeacherAuthenticated } from '../services/api';
import StudentCard from '../components/StudentCard';

export default function Classes() {
  const { id: paramClassId } = useParams();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(paramClassId ? parseInt(paramClassId) : 1);
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadClasses() {
      setLoading(true);
      try {
        const classesData = await getClasses();
        setClasses(classesData);
        if (!paramClassId && classesData.length > 0) {
          setSelectedClassId(classesData[0].id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load classes');
      } finally {
        setLoading(false);
      }
    }
    loadClasses();
  }, []);

  useEffect(() => {
    if (paramClassId) {
      setSelectedClassId(parseInt(paramClassId));
    }
  }, [paramClassId]);

  useEffect(() => {
    if (!selectedClassId) return;

    async function loadStudentsForClass() {
      setLoadingStudents(true);
      try {
        const data = await getClassStudents(selectedClassId);
        setClassInfo(data.class);
        setStudents(data.students || []);
      } catch (err) {
        console.error("Failed to load class students:", err);
      } finally {
        setLoadingStudents(false);
      }
    }
    loadStudentsForClass();
  }, [selectedClassId]);

  const handleSelectClass = (clsId) => {
    setSelectedClassId(clsId);
    navigate(`/classes/${clsId}`);
  };

  const getClassIcon = (className) => {
    switch (className?.toLowerCase()) {
      case 'nursery': return '👶';
      case 'lkg': return '🌟';
      case 'ukg': return '🚀';
      default: return '🏫';
    }
  };

  const getClassCardTheme = (className) => {
    switch (className?.toLowerCase()) {
      case 'nursery': return { border: '#f43f5e', bg: '#ffe4e6', text: '#9f1239' };
      case 'lkg': return { border: '#f59e0b', bg: '#fef3c7', text: '#92400e' };
      case 'ukg': return { border: '#10b981', bg: '#d1fae5', text: '#065f46' };
      default: return { border: '#6366f1', bg: '#e0e7ff', text: '#3730a3' };
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <p className="spinner-text">Loading classroom divisions...</p>
      </div>
    );
  }

  return (
    <div className="classes-page">
      <div className="page-header">
        <h1 className="page-title">🏫 Classroom Divisions</h1>
        <p className="page-subtitle">Early learning cohorts structured for age-appropriate curriculum</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* 3 Main Classroom Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        {classes.map((c) => {
          const theme = getClassCardTheme(c.class_name);
          const isSelected = selectedClassId === c.id;
          return (
            <div
              key={c.id}
              onClick={() => handleSelectClass(c.id)}
              className="card"
              style={{
                cursor: 'pointer',
                border: isSelected ? `3px solid ${theme.border}` : '2px solid #e2e8f0',
                background: isSelected ? 'white' : '#ffffff',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected ? '0 15px 30px rgba(0,0,0,0.1)' : 'var(--card-shadow)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  fontSize: '2.8rem',
                  background: theme.bg,
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${theme.border}`
                }}>
                  {getClassIcon(c.class_name)}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.6rem', color: '#1e293b' }}>{c.class_name}</h2>
                  <span className="badge badge-gender" style={{ fontWeight: 700 }}>
                    👥 {c.student_count} Children
                  </span>
                </div>
              </div>

              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.2rem', minHeight: '42px' }}>
                {c.description}
              </p>

              <button
                className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                style={{ width: '100%' }}
              >
                {isSelected ? `✓ Viewing ${c.class_name}` : `View ${c.class_name} Students`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Enrolled Students Section */}
      <section>
        <div className="page-header-row" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span>{getClassIcon(classInfo?.class_name)}</span>
              <span>{classInfo?.class_name || 'Selected'} Roster ({students.length})</span>
            </h2>
            <p style={{ color: '#64748b' }}>Students currently admitted to this grade</p>
          </div>
          {isTeacherAuthenticated() ? (
            <Link to="/teacher/students/add" className="btn btn-primary">
              ➕ Add Student to {classInfo?.class_name || 'Class'}
            </Link>
          ) : (
            <Link to="/teacher/students/add" className="btn btn-outline" title="Teacher credentials required">
              👩‍🏫 Teacher Enroll Student
            </Link>
          )}
        </div>

        {loadingStudents ? (
          <div className="spinner-container">
            <div className="spinner" />
            <p className="spinner-text">Loading enrolled children...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎒</div>
            <h3 className="empty-title">No Students Enrolled in {classInfo?.class_name}</h3>
            <p className="empty-desc">There are currently no children admitted to {classInfo?.class_name}.</p>
            <Link to="/teacher/students/add" className="btn btn-primary">
              Enroll Student Now
            </Link>
          </div>
        ) : (
          <div className="students-grid">
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onDelete={() => navigate('/students')}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
