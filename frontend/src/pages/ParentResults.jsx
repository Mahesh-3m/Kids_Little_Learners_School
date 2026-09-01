import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getParentChildren, getChildResults, getActiveChildId, setActiveChildId } from '../services/api';
import ResultCard from '../components/ResultCard';
import '../css/parent.css';

export default function ParentResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(searchParams.get('childId') || getActiveChildId());
  const [resultsData, setResultsData] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const childrenList = await getParentChildren();
        setChildren(childrenList || []);

        if (childrenList && childrenList.length > 0) {
          const queryId = searchParams.get('childId');
          const stored = getActiveChildId();
          const targetId = (queryId && childrenList.some(c => String(c.id) === String(queryId)))
            ? queryId
            : (stored && childrenList.some(c => String(c.id) === String(stored)))
              ? stored
              : childrenList[0].id;

          setSelectedChildId(String(targetId));
          setActiveChildId(targetId);
          await loadResults(targetId);
        }
      } catch (err) {
        setError(err.message || 'Failed to load quiz results.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const loadResults = async (childId) => {
    try {
      const data = await getChildResults(childId);
      setResultsData(data);
    } catch (err) {
      setError(err.message || 'Failed to load results for child.');
    }
  };

  const handleChildSelect = (childId) => {
    setSelectedChildId(String(childId));
    setActiveChildId(childId);
    setSearchParams({ childId });
    loadResults(childId);
    window.dispatchEvent(new CustomEvent('parentActiveChildChanged', { detail: { childId } }));
  };

  const results = resultsData?.results || [];
  const summary = resultsData?.summary || {};
  const student = resultsData?.student || {};

  const filteredResults = results.filter(r => {
    if (categoryFilter === 'ALL') return true;
    return r.category?.toLowerCase() === categoryFilter.toLowerCase();
  });

  const categories = Array.from(new Set(results.map(r => r.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <div className="spinner-text">Loading quiz results & scores... 📝🏆</div>
      </div>
    );
  }

  return (
    <div className="parent-portal-container">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">
              <span>📝</span> Quiz Results
            </h1>
            <p className="page-subtitle">
              Comprehensive report of quizzes taken, accuracy rates, and scores
            </p>
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${categoryFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setCategoryFilter('ALL')}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Child Selector */}
      {children.length > 1 && (
        <section className="child-switcher-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.3rem' }}>👧👦</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Viewing Results for:</span>
          </div>

          <div className="child-chips-group">
            {children.map(child => {
              const isSelected = String(child.id) === String(selectedChildId);
              return (
                <button
                  key={child.id}
                  type="button"
                  className={`child-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => handleChildSelect(child.id)}
                >
                  <span className="child-chip-avatar">{child.gender === 'Female' ? '👧' : '👦'}</span>
                  <span>{child.name}</span>
                  <span className="badge badge-gender" style={{ fontSize: '0.75rem', background: isSelected ? 'rgba(255,255,255,0.3)' : '#f1f5f9', color: isSelected ? 'white' : '#334155' }}>
                    {child.class_name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Summary Scorecards */}
      <div className="parent-stats-grid">
        <div className="parent-stat-card">
          <div className="parent-stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            📝
          </div>
          <div className="parent-stat-info">
            <span className="parent-stat-value">{summary.total_quizzes || 0}</span>
            <span className="parent-stat-label">Total Quizzes</span>
          </div>
        </div>

        <div className="parent-stat-card">
          <div className="parent-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            📊
          </div>
          <div className="parent-stat-info">
            <span className="parent-stat-value">{summary.average_score || 0}%</span>
            <span className="parent-stat-label">Average Score</span>
          </div>
        </div>

        <div className="parent-stat-card">
          <div className="parent-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            🏆
          </div>
          <div className="parent-stat-info">
            <span className="parent-stat-value">{summary.highest_score || 0}%</span>
            <span className="parent-stat-label">Highest Score</span>
          </div>
        </div>

        <div className="parent-stat-card">
          <div className="parent-stat-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>
            🌟
          </div>
          <div className="parent-stat-info">
            <span className="parent-stat-value">{summary.passed_count || 0}</span>
            <span className="parent-stat-label">Passed Quizzes</span>
          </div>
        </div>
      </div>

      {/* Results Table & Cards View */}
      {filteredResults.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3 className="empty-title">No Quiz Results Found</h3>
          <p className="empty-desc">
            Your child has not completed any quizzes under this category yet.
          </p>
        </div>
      ) : (
        <div className="results-grid">
          {filteredResults.map(res => (
            <ResultCard key={res.id} result={res} />
          ))}
        </div>
      )}
    </div>
  );
}
