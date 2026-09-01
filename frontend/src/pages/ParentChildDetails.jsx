import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getChildDetails, getChildAchievements, getChildResults, getChildActivities } from '../services/api';
import ProgressCard from '../components/ProgressCard';
import ActivityCard from '../components/ActivityCard';
import ResultCard from '../components/ResultCard';
import AchievementCard from '../components/AchievementCard';
import '../css/parent.css';

export default function ParentChildDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [results, setResults] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function loadAllChildData() {
      try {
        setLoading(true);
        setError(null);
        const [detailsRes, achieveRes, resultsRes, actRes] = await Promise.all([
          getChildDetails(id),
          getChildAchievements(id),
          getChildResults(id),
          getChildActivities(id, 10)
        ]);

        setData(detailsRes);
        setAchievements(achieveRes || []);
        setResults(resultsRes?.results || []);
        setActivities(actRes || []);
      } catch (err) {
        console.error("Child details error:", err);
        setError(err.message || 'Failed to load child details. Please ensure you are authorized to view this record.');
      } finally {
        setLoading(false);
      }
    }
    loadAllChildData();
  }, [id]);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <div className="spinner-text">Loading student profile... 👧👦</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="parent-portal-container">
        <div className="alert alert-error" style={{ margin: '2rem 0' }}>
          <span>⚠️</span> {error || 'Child record not found.'}
        </div>
        <Link to="/parent/children" className="btn btn-primary">
          ← Back to My Children
        </Link>
      </div>
    );
  }

  const { student, progress } = data;
  const categories = progress?.categories || [];
  const overallPct = progress?.overall_percentage || 0;

  return (
    <div className="parent-portal-container">
      {/* Header Back Link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/parent/children" style={{ color: 'var(--primary-color)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          ← Back to My Children
        </Link>
      </div>

      {/* Child Profile Card Banner */}
      <div className="card" style={{
        padding: '2rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '2px solid #e0e7ff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="child-avatar-large" style={{ width: '80px', height: '80px', fontSize: '2.8rem' }}>
              {student.gender === 'Female' ? '👧' : '👦'}
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', color: '#1e293b', marginBottom: '0.3rem' }}>
                {student.name}
              </h1>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className={`badge ${student.class_name === 'Nursery' ? 'badge-nursery' : student.class_name === 'LKG' ? 'badge-lkg' : 'badge-ukg'}`}>
                  🎒 {student.class_name} Classroom
                </span>
                <span className="badge badge-gender">
                  {student.gender === 'Female' ? '♀️ Female' : '♂️ Male'}
                </span>
                <span className="badge badge-gender">
                  📅 DOB: {student.dob}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to={`/parent/progress?childId=${student.id}`} className="btn btn-warning btn-sm">
              📊 Full Progress
            </Link>
            <Link to={`/parent/results?childId=${student.id}`} className="btn btn-primary btn-sm">
              📝 Quiz Results
            </Link>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1.75rem',
          paddingTop: '1.5rem',
          borderTop: '2px solid #f1f5f9'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>GUARDIAN NAME</div>
            <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '0.2rem' }}>👤 {student.parent_name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>PHONE NUMBER</div>
            <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '0.2rem' }}>📞 {student.phone}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>RESIDENCE ADDRESS</div>
            <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '0.2rem' }}>🏡 {student.address}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>OVERALL SCORE</div>
            <div style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '1.1rem', marginTop: '0.2rem' }}>
              📊 {overallPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.75rem',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '0.5rem',
        overflowX: 'auto'
      }}>
        {[
          { id: 'overview', label: '📊 Learning Progress', count: `${overallPct}%` },
          { id: 'activities', label: '🎮 Recent Activities', count: activities.length },
          { id: 'results', label: '📝 Quizzes & Scores', count: results.length },
          { id: 'achievements', label: '🏆 Achievements', count: achievements.filter(a => a.is_unlocked).length },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.95rem', padding: '0.5rem 1.1rem', borderRadius: 'var(--radius-full)' }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} <span className="badge badge-gender" style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : '#f1f5f9', color: activeTab === tab.id ? 'white' : '#334155', fontSize: '0.75rem' }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Progress Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.2rem' }}>
              🌟 Category Mastery Breakdown
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
              {categories.map(cat => (
                <ProgressCard
                  key={cat.category}
                  category={cat.category}
                  percentage={cat.progress_percentage}
                  icon={cat.icon}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Activities */}
      {activeTab === 'activities' && (
        <div className="card">
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.2rem' }}>
            ⚡ Activity Feed
          </h3>
          {activities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎮</div>
              <p className="empty-desc">No activities completed yet.</p>
            </div>
          ) : (
            <div className="activities-timeline">
              {activities.map(act => (
                <ActivityCard key={act.id} activity={act} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Quiz Results */}
      {activeTab === 'results' && (
        <div>
          <div className="results-grid">
            {results.map(res => (
              <ResultCard key={res.id} result={res} />
            ))}
          </div>
          {results.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p className="empty-desc">No quizzes taken yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Achievements */}
      {activeTab === 'achievements' && (
        <div className="achievements-grid">
          {achievements.map(ach => (
            <AchievementCard key={ach.id} achievement={ach} />
          ))}
        </div>
      )}
    </div>
  );
}
