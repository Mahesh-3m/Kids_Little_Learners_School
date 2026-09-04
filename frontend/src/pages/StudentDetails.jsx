import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudent, getStudentResults, getStudentGames, getProgress, getStudentAcademicDetails } from '../services/api';
import ProgressCard from '../components/ProgressCard';
import AchievementCard from '../components/AchievementCard';
import '../css/students.css';
import '../css/progress.css';

export default function StudentDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [games, setGames] = useState([]);
  const [progress, setProgress] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAllStudentData() {
      setLoading(true);
      setError(null);
      try {
        // Try to get unified academic details first (Teacher API)
        try {
          const detailed = await getStudentAcademicDetails(id);
          if (detailed && detailed.student) {
            setStudent(detailed.student);
            setResults(detailed.results || []);
            setGames(detailed.games || []);
            setProgress(detailed.progress || null);
            setAchievements(detailed.achievements || []);
            setLoading(false);
            return;
          }
        } catch (e) {
          // Fallback to individual APIs
        }

        const [studentData, resultsData, gamesData, progressData] = await Promise.all([
          getStudent(id),
          getStudentResults(id).catch(() => []),
          getStudentGames(id).catch(() => []),
          getProgress(id).catch(() => null)
        ]);

        setStudent(studentData);
        setResults(resultsData);
        setGames(gamesData);
        setProgress(progressData);
      } catch (err) {
        setError(err.message || 'Failed to load student details.');
      } finally {
        setLoading(false);
      }
    }
    loadAllStudentData();
  }, [id]);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <p className="spinner-text">Loading student portfolio...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="empty-state">
        <div className="empty-icon">😢</div>
        <h2 className="empty-title">Student Profile Not Found</h2>
        <p className="empty-desc">{error || "Could not retrieve the requested student record."}</p>
        <Link to="/students" className="btn btn-primary">
          Back to Students Roster
        </Link>
      </div>
    );
  }

  const isFemale = student.gender && student.gender.toLowerCase() === 'female';
  const avatarEmoji = isFemale ? '👧' : '👦';

  return (
    <div className="student-details-page">
      {/* Profile Header Card */}
      <div className="student-details-header">
        <div className="details-avatar">{avatarEmoji}</div>
        <div className="details-meta">
          <h1>{student.name}</h1>
          <div className="details-meta-tags">
            <span className={`badge ${student.class_name === 'Nursery' ? 'badge-nursery' : student.class_name === 'LKG' ? 'badge-lkg' : 'badge-ukg'}`}>
              {student.class_name === 'Nursery' ? '👶' : student.class_name === 'LKG' ? '🌟' : '🚀'} Class {student.class_name}
            </span>
            <span className="badge badge-gender">
              {student.gender}
            </span>
            <span className="badge" style={{ background: '#ede9fe', color: '#6d28d9', fontWeight: 700 }}>
              🆔 Student ID: {student.student_id || `LL-${String(student.id).padStart(3, '0')}`}
            </span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <Link to={`/teacher/students/edit/${student.id}`} className="btn btn-warning">
            ✏️ Edit Profile
          </Link>
          <Link to="/teacher/students" className="btn btn-outline">
            ← All Students
          </Link>
        </div>
      </div>

      {/* Two Column Grid: Personal Info & Overall Learning Progress */}
      <div className="details-grid">
        {/* Personal & Parent Info */}
        <div className="card">
          <h2 className="details-card-title">
            <span>📋</span> Bio & Contact Information
          </h2>
          <table className="details-info-table">
            <tbody>
              <tr>
                <td>🎂 Date of Birth</td>
                <td><strong>{student.dob}</strong></td>
              </tr>
              <tr>
                <td>🏫 Class Allocated</td>
                <td><strong>{student.class_name}</strong></td>
              </tr>
              <tr>
                <td>🚻 Gender</td>
                <td><strong>{student.gender}</strong></td>
              </tr>
              <tr>
                <td>👨‍👩‍👦 Parent/Guardian</td>
                <td><strong>{student.parent_name}</strong></td>
              </tr>
              <tr>
                <td>📞 Phone Number</td>
                <td><strong>{student.phone}</strong></td>
              </tr>
              <tr>
                <td>📍 Residence Address</td>
                <td><strong>{student.address}</strong></td>
              </tr>
              <tr>
                <td>📅 Registered Date</td>
                <td>{student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Overall Mastery Card */}
        <div className="overall-progress-card">
          <h3>🌟 Overall Learning Proficiency</h3>
          <div className="overall-circle-container">
            <span className="overall-percentage-number">{progress?.overall_percentage || 0}%</span>
            <span className="overall-percentage-label">Mastery Score</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', width: '100%' }}>
            <div className="quiz-stat-box" style={{ flex: 1 }}>
              <div className="quiz-stat-value">{progress?.quizzes_completed || results.length}</div>
              <div className="quiz-stat-label">Quizzes Taken</div>
            </div>
            <div className="quiz-stat-box" style={{ flex: 1 }}>
              <div className="quiz-stat-value">{progress?.games_completed || games.length}</div>
              <div className="quiz-stat-label">Games Played</div>
            </div>
            <div className="quiz-stat-box" style={{ flex: 1 }}>
              <div className="quiz-stat-value">⭐ {progress?.stars_earned || 0}</div>
              <div className="quiz-stat-label">Stars Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Progress Breakdown */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📊</span> Subject & Skill Progress Bars
        </h2>
        <div className="category-progress-list">
          {progress?.categories?.map((item) => (
            <ProgressCard
              key={item.category}
              category={item.category}
              percentage={item.progress_percentage}
              icon={item.icon}
            />
          ))}
        </div>
      </section>

      {/* Recent Quiz Scores */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📝</span> Quiz Results History
        </h2>
        {results.length === 0 ? (
          <p style={{ color: '#64748b', background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            No quizzes taken yet. Take a quiz to earn badges! 🚀
          </p>
        ) : (
          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Quiz Name</th>
                  <th>Category</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Completed At</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.quiz_title}</strong></td>
                    <td><span className="badge badge-gender">{r.category}</span></td>
                    <td>{r.score} / {r.total_questions}</td>
                    <td>
                      <span className={`score-badge ${r.percentage >= 80 ? 'high' : r.percentage >= 60 ? 'medium' : 'low'}`}>
                        {r.percentage}%
                      </span>
                    </td>
                    <td>{r.completed_at ? new Date(r.completed_at).toLocaleString() : 'Recent'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Completed Games History */}
      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🎮</span> Completed Educational Games
        </h2>
        {games.length === 0 ? (
          <p style={{ color: '#64748b', background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            No games completed yet. Head to the Games arena to start playing! 🌈
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {games.map((g, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{g.icon || '🎮'}</span>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: '#1e293b' }}>{g.game_name}</h4>
                  <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem' }}>
                    {Array.from({ length: g.stars_earned || 3 }).map((_, i) => (
                      <span key={i} style={{ color: '#f59e0b', fontSize: '1rem' }}>⭐</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Student Achievements */}
      {achievements && achievements.length > 0 && (
        <section style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🏆</span> Student Badges & Achievements
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.2rem' }}>
            {achievements.map((ach) => (
              <AchievementCard key={ach.id} achievement={ach} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
