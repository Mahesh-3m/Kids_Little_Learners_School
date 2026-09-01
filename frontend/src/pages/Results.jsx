import React, { useState, useEffect } from 'react';
import { getResults, getStudents, getQuizzes } from '../services/api';
import '../css/progress.css';

export default function Results() {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadFilters() {
      try {
        const [studentsData, quizzesData] = await Promise.all([
          getStudents(),
          getQuizzes()
        ]);
        setStudents(studentsData);
        setQuizzes(quizzesData);
      } catch (err) {
        console.error("Error loading filter data:", err);
      }
    }
    loadFilters();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (selectedStudent) filters.student_id = selectedStudent;
      if (selectedCategory && selectedCategory !== 'All') filters.category = selectedCategory;

      const data = await getResults(filters);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [selectedStudent, selectedCategory]);

  const categories = ['All', 'Alphabet', 'Numbers', 'Colors', 'Shapes', 'Animals', 'General Learning'];

  return (
    <div className="results-page">
      <div className="page-header">
        <h1 className="page-title">🏆 Quiz Results & Leaderboard</h1>
        <p className="page-subtitle">Historical quiz assessment records, scores, and performance analytics</p>
      </div>

      {/* Filter Controls */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.2rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: '220px' }}>
            <label style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>
              Filter by Student:
            </label>
            <select
              className="form-select"
              style={{ padding: '0.5rem 0.8rem', background: 'white' }}
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">All Students</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.class_name})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: '220px' }}>
            <label style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>
              Filter by Category:
            </label>
            <select
              className="form-select"
              style={{ padding: '0.5rem 0.8rem', background: 'white' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {(selectedStudent || selectedCategory !== 'All') && (
            <button
              className="btn btn-outline btn-sm"
              style={{ alignSelf: 'flex-end', marginBottom: '4px' }}
              onClick={() => { setSelectedStudent(''); setSelectedCategory('All'); }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {loading ? (
        <div className="spinner-container">
          <div className="spinner" />
          <p className="spinner-text">Loading quiz records...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2 className="empty-title">No Results Recorded Yet</h2>
          <p className="empty-desc">
            No quiz submissions match your filter criteria. Go to the Quiz section to take a quiz!
          </p>
        </div>
      ) : (
        <div className="results-table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Quiz Title</th>
                <th>Category</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Completed At</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res) => {
                const badgeClass = res.percentage >= 80 ? 'high' : res.percentage >= 60 ? 'medium' : 'low';
                return (
                  <tr key={res.id}>
                    <td>
                      <strong>{res.student_name}</strong>
                    </td>
                    <td>
                      <span className={`badge ${res.class_name === 'Nursery' ? 'badge-nursery' : res.class_name === 'LKG' ? 'badge-lkg' : 'badge-ukg'}`}>
                        {res.class_name}
                      </span>
                    </td>
                    <td>{res.quiz_title}</td>
                    <td>
                      <span className="badge badge-gender">🏷️ {res.category}</span>
                    </td>
                    <td>
                      <strong>{res.score}</strong> / {res.total_questions}
                    </td>
                    <td>
                      <span className={`score-badge ${badgeClass}`}>
                        {res.percentage}%
                      </span>
                    </td>
                    <td>
                      {res.completed_at ? new Date(res.completed_at).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
