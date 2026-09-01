import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudents, getClasses } from '../services/api';

export default function Home() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    nurseryCount: 0,
    lkgCount: 0,
    ukgCount: 0,
    classesCount: 3,
    gamesCount: 5,
    quizzesCount: 6
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [studentsData, classesData] = await Promise.all([
          getStudents(),
          getClasses()
        ]);
        
        const nursery = studentsData.filter(s => s.class_name === 'Nursery').length;
        const lkg = studentsData.filter(s => s.class_name === 'LKG').length;
        const ukg = studentsData.filter(s => s.class_name === 'UKG').length;

        setStats({
          totalStudents: studentsData.length,
          nurseryCount: nursery,
          lkgCount: lkg,
          ukgCount: ukg,
          classesCount: classesData.length || 3,
          gamesCount: 5,
          quizzesCount: 6
        });
      } catch (err) {
        console.error("Error loading home dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Banner */}
      <section className="hero-banner" style={{
        background: 'linear-gradient(135deg, #e0e7ff 0%, #fae8ff 50%, #fef3c7 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '3.5rem 2rem',
        textAlign: 'center',
        marginBottom: '2.5rem',
        border: '3px solid #ede9fe',
        boxShadow: 'var(--card-shadow)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ fontSize: '4.5rem', marginBottom: '0.8rem', animation: 'bounce 2s infinite' }}>🌈</div>
        <h1 style={{
          fontSize: '3.2rem',
          fontFamily: 'var(--font-heading)',
          background: 'linear-gradient(135deg, #4338ca 0%, #db2777 50%, #ea580c 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem',
          letterSpacing: '1px'
        }}>
          LITTLE LEARNERS
        </h1>
        <p style={{
          fontSize: '1.5rem',
          fontFamily: 'var(--font-heading)',
          color: '#6366f1',
          fontWeight: 700,
          marginBottom: '1.2rem'
        }}>
          Learn • Play • Grow 🚀
        </p>
        <p style={{
          maxWidth: '620px',
          margin: '0 auto 2rem',
          fontSize: '1.15rem',
          color: '#475569',
          fontWeight: 600
        }}>
          Welcome to our vibrant early education portal where preschool and kindergarten champions explore alphabets, numbers, colors, shapes, animals, quizzes, and games!
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/games" className="btn btn-primary btn-lg">
            🎮 Play Educational Games
          </Link>
          <Link to="/quiz" className="btn btn-secondary btn-lg">
            📝 Take Fun Quizzes
          </Link>
          <Link to="/students" className="btn btn-outline btn-lg">
            👩‍🏫 Manage Students
          </Link>
          <Link to="/parent/dashboard" className="btn btn-warning btn-lg" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
            👨‍👩‍👧 Parent Portal
          </Link>
        </div>
      </section>

      {/* Quick Access Modules Navigation */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          🌟 Explore Modules & Classrooms
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Students Card */}
          <Link to="/students" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', textDecoration: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>👩‍🏫</span>
              <span className="badge badge-gender">{stats.totalStudents} Enrolled</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b' }}>Student Roster</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Full management: add, edit, view profiles, and record progress.</p>
          </Link>

          {/* Nursery Classroom */}
          <Link to="/classes/1" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', textDecoration: 'none', borderLeft: '6px solid #f43f5e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>👶</span>
              <span className="badge badge-nursery">{stats.nurseryCount} Kids</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b' }}>Nursery Class</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Playful rhymes, sensory activities, and early motor skills.</p>
          </Link>

          {/* LKG Classroom */}
          <Link to="/classes/2" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', textDecoration: 'none', borderLeft: '6px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>🌟</span>
              <span className="badge badge-lkg">{stats.lkgCount} Kids</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b' }}>LKG Class</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Lower Kindergarten: Alphabets, numbers 1-20, colors & shapes.</p>
          </Link>

          {/* UKG Classroom */}
          <Link to="/classes/3" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', textDecoration: 'none', borderLeft: '6px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>🚀</span>
              <span className="badge badge-ukg">{stats.ukgCount} Kids</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b' }}>UKG Class</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Upper Kindergarten: Phonics words, numbers 1-50, and math.</p>
          </Link>

          {/* Games Card */}
          <Link to="/games" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', textDecoration: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>🎮</span>
              <span className="badge badge-gender">5 Games</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b' }}>Educational Games</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Alphabet phonics, number safari, rainbow colors, shapes & animals.</p>
          </Link>

          {/* Quiz Card */}
          <Link to="/quiz" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', textDecoration: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>📝</span>
              <span className="badge badge-gender">6 Categories</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b' }}>Interactive Quizzes</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Test learning with cheerful touch-friendly multiple choice questions.</p>
          </Link>

          {/* Results Card */}
          <Link to="/results" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', textDecoration: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>🏆</span>
              <span className="badge badge-gender">Leaderboards</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b' }}>Quiz Results</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Review student performance, percentage scores, and achievements.</p>
          </Link>

          {/* Progress Card */}
          <Link to="/progress" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', textDecoration: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>📊</span>
              <span className="badge badge-gender">Analytics</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b' }}>Learning Progress</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Visual category progress bars across all 7 early learning subjects.</p>
          </Link>

          {/* Parent Dashboard Card */}
          <Link to="/parent/dashboard" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', textDecoration: 'none', border: '2px solid #e9d5ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>👨‍👩‍👧</span>
              <span className="badge" style={{ background: '#f3e8ff', color: '#7e22ce' }}>Parent Access</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b' }}>Parent Dashboard</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Secure portal for parents to monitor their child's activities, quizzes, and trophies.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
