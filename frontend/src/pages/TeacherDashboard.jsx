import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeacherStats, getStudents, getStoredTeacher } from '../services/api';
import '../css/students.css';
import '../css/parent.css';

export default function TeacherDashboard() {
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const teacher = getStoredTeacher();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [statsData, studentsData] = await Promise.all([
          getTeacherStats().catch(() => null),
          getStudents('', '').catch(() => [])
        ]);
        setStats(statsData);
        setRecentStudents((studentsData || []).slice(0, 5));
      } catch (err) {
        setError(err.message || 'Failed to load teacher dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="parent-portal-container">
      {/* Header Banner */}
      <div
        className="store-header"
        style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
          borderColor: '#fdba74'
        }}
      >
        <div className="store-header-content">
          <div
            className="store-badge"
            style={{ background: '#ea580c', color: '#ffffff' }}
          >
            <span>👩‍🏫</span> Educator Workspace
          </div>
          <h1 style={{ color: '#9a3412' }}>
            Welcome back, {teacher ? teacher.name : 'Teacher'}! 🌟
          </h1>
          <p style={{ color: '#c2410c' }}>
            Manage student academic portfolios, track class allocations across Nursery, LKG, and UKG, and oversee learning progress.
          </p>
        </div>
        <div>
          <Link to="/teacher/students/add" className="btn btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c' }}>
            ➕ Enroll New Student
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stats-overview-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card" style={{ borderTop: '4px solid #6366f1' }}>
          <div className="stat-card-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>
            🎒
          </div>
          <div className="stat-card-info">
            <div className="stat-number">{stats ? stats.total_students : recentStudents.length}</div>
            <div className="stat-label">Total Enrolled Students</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #f43f5e' }}>
          <div className="stat-card-icon" style={{ background: '#ffe4e6', color: '#e11d48' }}>
            👶
          </div>
          <div className="stat-card-info">
            <div className="stat-number">{stats?.classes?.Nursery ?? '-'}</div>
            <div className="stat-label">Nursery Learners</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #d97706' }}>
          <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            🌟
          </div>
          <div className="stat-card-info">
            <div className="stat-number">{stats?.classes?.LKG ?? '-'}</div>
            <div className="stat-label">LKG Learners</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #059669' }}>
          <div className="stat-card-icon" style={{ background: '#d1fae5', color: '#047857' }}>
            🚀
          </div>
          <div className="stat-card-info">
            <div className="stat-number">{stats?.classes?.UKG ?? '-'}</div>
            <div className="stat-label">UKG Learners</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
          <div className="stat-card-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
            📝
          </div>
          <div className="stat-card-info">
            <div className="stat-number">{stats?.total_quizzes_taken ?? '-'}</div>
            <div className="stat-label">Quizzes Completed</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #10b981' }}>
          <div className="stat-card-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            🎮
          </div>
          <div className="stat-card-info">
            <div className="stat-number">{stats?.total_games_completed ?? '-'}</div>
            <div className="stat-label">Games Played</div>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚡</span> Educator Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
          <Link
            to="/teacher/students"
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              textDecoration: 'none',
              transition: 'transform 0.2s ease',
              border: '2px solid #e2e8f0'
            }}
          >
            <span style={{ fontSize: '2.2rem' }}>👩‍🏫</span>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', margin: 0 }}>Manage Students</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0.2rem 0 0' }}>Search, filter & edit records</p>
            </div>
          </Link>

          <Link
            to="/teacher/students/add"
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              textDecoration: 'none',
              transition: 'transform 0.2s ease',
              border: '2px solid #fed7aa'
            }}
          >
            <span style={{ fontSize: '2.2rem' }}>➕</span>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', margin: 0 }}>Enroll Student</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0.2rem 0 0' }}>Register new admission</p>
            </div>
          </Link>

          <Link
            to="/classes"
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              textDecoration: 'none',
              transition: 'transform 0.2s ease',
              border: '2px solid #e2e8f0'
            }}
          >
            <span style={{ fontSize: '2.2rem' }}>🏫</span>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', margin: 0 }}>Class Divisions</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0.2rem 0 0' }}>Nursery, LKG, UKG rosters</p>
            </div>
          </Link>

          <Link
            to="/progress"
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              textDecoration: 'none',
              transition: 'transform 0.2s ease',
              border: '2px solid #e2e8f0'
            }}
          >
            <span style={{ fontSize: '2.2rem' }}>📊</span>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', margin: 0 }}>Subject Mastery</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0.2rem 0 0' }}>Overall curriculum analytics</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Students Table */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#1e293b', margin: 0 }}>
            🎒 Enrolled Students Roster
          </h2>
          <Link to="/teacher/students" className="btn btn-outline btn-sm">
            View All Students →
          </Link>
        </div>

        {recentStudents.length === 0 ? (
          <p style={{ color: '#64748b' }}>No students enrolled yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Roll #</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Student Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Class</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Parent / Guardian</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Contact Phone</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map(student => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#64748b' }}>
                      #{student.id}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#1e293b' }}>
                      {student.gender === 'Female' ? '👧' : '👦'} {student.name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${student.class_name === 'Nursery' ? 'badge-nursery' : student.class_name === 'LKG' ? 'badge-lkg' : 'badge-ukg'}`}>
                        {student.class_name}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                      {student.parent_name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                      {student.phone}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <Link
                          to={`/teacher/students/${student.id}`}
                          className="btn btn-sm btn-outline"
                          title="View Student Portfolio"
                        >
                          👁️ View
                        </Link>
                        <Link
                          to={`/teacher/students/edit/${student.id}`}
                          className="btn btn-sm btn-warning"
                          title="Edit Student Profile"
                        >
                          ✏️ Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
