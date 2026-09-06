import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getClasses,
  getGames,
  getQuizzes,
  isTeacherAuthenticated,
  isParentAuthenticated,
  isStoreAuthenticated,
  API_URL
} from '../services/api';

export default function Home() {
  const [stats, setStats] = useState({
    totalStudents: 11,
    nurseryCount: 4,
    lkgCount: 4,
    ukgCount: 3,
    classesCount: 3,
    gamesCount: 5,
    quizzesCount: 6
  });
  const [loading, setLoading] = useState(true);
  const [devApiError, setDevApiError] = useState(null);
  const isTeacher = isTeacherAuthenticated();
  const isParent = isParentAuthenticated();
  const isStore = isStoreAuthenticated();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [classesResult, gamesResult, quizzesResult] = await Promise.allSettled([
          getClasses(),
          getGames(),
          getQuizzes()
        ]);

        let hasError = false;
        let errorDetails = [];

        let newStats = { ...stats };

        if (classesResult.status === 'fulfilled' && Array.isArray(classesResult.value)) {
          const classesData = classesResult.value;
          const nursery = classesData.find(c => c.class_name === 'Nursery')?.student_count || 0;
          const lkg = classesData.find(c => c.class_name === 'LKG')?.student_count || 0;
          const ukg = classesData.find(c => c.class_name === 'UKG')?.student_count || 0;
          const total = classesData.reduce((acc, c) => acc + (c.student_count || 0), 0) || (nursery + lkg + ukg);

          newStats.totalStudents = total;
          newStats.nurseryCount = nursery;
          newStats.lkgCount = lkg;
          newStats.ukgCount = ukg;
          newStats.classesCount = classesData.length;
        } else if (classesResult.status === 'rejected') {
          hasError = true;
          errorDetails.push(`Classes: ${classesResult.reason?.message || 'Failed to load'}`);
        }

        if (gamesResult.status === 'fulfilled' && Array.isArray(gamesResult.value)) {
          newStats.gamesCount = gamesResult.value.length;
        } else if (gamesResult.status === 'rejected') {
          hasError = true;
          errorDetails.push(`Games: ${gamesResult.reason?.message || 'Failed to load'}`);
        }

        if (quizzesResult.status === 'fulfilled' && Array.isArray(quizzesResult.value)) {
          newStats.quizzesCount = quizzesResult.value.length;
        } else if (quizzesResult.status === 'rejected') {
          hasError = true;
          errorDetails.push(`Quizzes: ${quizzesResult.reason?.message || 'Failed to load'}`);
        }

        setStats(newStats);

        if (hasError && import.meta.env.DEV) {
          setDevApiError(errorDetails.join(' | '));
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          setDevApiError(err.message || "Failed to connect to backend server");
        }
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="home-container" style={{ animation: 'fadeIn 0.35s ease-out' }}>
      {/* Development Diagnostic Banner */}
      {devApiError && (
        <div 
          style={{
            background: '#fffbeb',
            border: '2px solid #f59e0b',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
          }}
        >
          <div>
            <strong style={{ color: '#b45309', display: 'block', marginBottom: '0.25rem' }}>
              ⚠️ Development Mode Diagnostic Notice
            </strong>
            <span style={{ color: '#92400e', fontSize: '0.9rem' }}>
              Backend server issue at <code>{API_URL}</code>: {devApiError}. Please ensure the Flask backend is started (`py app.py`).
            </span>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#f59e0b',
              color: '#fff',
              border: 'none',
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #eef2ff 0%, #fdf2f8 35%, #fffbeb 70%, #ecfdf5 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '4rem 2.5rem',
          textAlign: 'center',
          marginBottom: '3rem',
          border: '3px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Floating Playful Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            padding: '0.45rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            border: '2px solid #e0e7ff',
            color: '#4338ca',
            fontWeight: 700,
            fontSize: '0.95rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.1)'
          }}
        >
          <span>✨</span> Early Childhood Learning & School Platform 🌈
        </div>

        {/* Brand Logo Display */}
        <div style={{ marginBottom: '1.25rem' }}>
          <img 
            src="/logo.png" 
            alt="Little Learners Logo" 
            style={{ 
              width: '180px', 
              height: 'auto', 
              filter: 'drop-shadow(0 14px 28px rgba(99, 102, 241, 0.28))',
              animation: 'float 4s ease-in-out infinite' 
            }} 
          />
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontFamily: 'var(--font-heading)',
            background: 'linear-gradient(135deg, #3730a3 0%, #be185d 45%, #ea580c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.75rem',
            letterSpacing: '0.5px',
            lineHeight: 1.15
          }}
        >
          LITTLE LEARNERS
        </h1>

        <p
          style={{
            fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
            fontFamily: 'var(--font-heading)',
            color: '#4f46e5',
            fontWeight: 700,
            marginBottom: '1.25rem'
          }}
        >
          Where Tiny Steps Turn Into Giant Leaps! 🚀
        </p>

        <p
          style={{
            maxWidth: '680px',
            margin: '0 auto 2.5rem',
            fontSize: '1.15rem',
            color: '#475569',
            fontWeight: 600,
            lineHeight: 1.7
          }}
        >
          Explore educational phonics games, counting safari, color splashes, quizzes, and classroom management designed for Nursery, LKG, and UKG learners.
        </p>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <Link to="/games" className="btn btn-primary btn-lg">
            <span>🎮</span> Play Learning Games
          </Link>
          <Link to="/quiz" className="btn btn-secondary btn-lg">
            <span>📝</span> Fun Quizzes
          </Link>
          <Link
            to={isTeacher ? "/teacher/dashboard" : "/teacher/login"}
            className="btn btn-warning btn-lg"
          >
            <span>👩‍🏫</span> {isTeacher ? 'Teacher Dashboard' : 'Teacher Portal'}
          </Link>
          <Link
            to={isParent ? "/parent/dashboard" : "/parent/login"}
            className="btn btn-parent-cta btn-lg"
          >
            <span>👨‍👩‍👧</span> {isParent ? 'Parent Dashboard' : 'Parent Sign In'}
          </Link>
          <Link
            to={isStore ? "/store-admin/dashboard" : "/store-admin/login"}
            className="btn btn-lg"
            style={{
              background: 'linear-gradient(135deg, #0f766e, #0d9488)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)'
            }}
          >
            <span>🏬</span> {isStore ? 'Store Dashboard' : 'Store Admin'}
          </Link>
        </div>

        {/* Highlight Badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
            paddingTop: '1.5rem',
            borderTop: '2px dashed rgba(226, 232, 240, 0.9)'
          }}
        >
          <span className="badge" style={{ background: '#ffffff', border: '1.5px solid #fed7aa', color: '#9a3412' }}>
            <span>⭐</span> 100% Kid-Safe & Child-Friendly
          </span>
          <span className="badge" style={{ background: '#ffffff', border: '1.5px solid #d8b4fe', color: '#6b21a8' }}>
            <span>🗣️</span> Web Speech Audio Pronunciation
          </span>
          <span className="badge" style={{ background: '#ffffff', border: '1.5px solid #a7f3d0', color: '#065f46' }}>
            <span>🎉</span> Interactive Confetti Celebrations
          </span>
          <span className="badge" style={{ background: '#ffffff', border: '1.5px solid #fecdd3', color: '#9f1239' }}>
            <span>🛍️</span> Exclusive Parent Kids Store
          </span>
        </div>
      </section>

      {/* Classroom Divisions Showcase */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div className="page-header" style={{ textAlign: 'center', alignItems: 'center' }}>
          <h2 style={{ fontSize: '2rem' }}>
            <span>🏫</span> Explore Our Classrooms & Curriculum
          </h2>
          <p className="page-subtitle">
            Age-appropriate learning tracks built to nurture curiosity, motor skills, and foundational literacy
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.75rem'
          }}
        >
          {/* Nursery Class */}
          <Link
            to="/classes/1"
            className="card"
            style={{
              borderTop: '6px solid #f43f5e',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textDecoration: 'none'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '3rem' }}>👶</span>
                <span className="badge badge-nursery">
                  {stats.nurseryCount} Students
                </span>
              </div>
              <h3 style={{ fontSize: '1.45rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                Nursery Classroom
              </h3>
              <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Early sensory development, playful motor activities, nursery rhymes, animal recognition, and toddler social skills.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f43f5e', fontWeight: 700 }}>
              <span>Ages 2.5 – 3.5 Years</span>
              <span>Explore Class →</span>
            </div>
          </Link>

          {/* LKG Class */}
          <Link
            to="/classes/2"
            className="card"
            style={{
              borderTop: '6px solid #f59e0b',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textDecoration: 'none'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '3rem' }}>🌟</span>
                <span className="badge badge-lkg">
                  {stats.lkgCount} Students
                </span>
              </div>
              <h3 style={{ fontSize: '1.45rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                LKG Classroom
              </h3>
              <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Lower Kindergarten: Alphabet phonics A-Z, counting numbers 1-20, rainbow color recognition, and geometric shapes.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#d97706', fontWeight: 700 }}>
              <span>Ages 3.5 – 4.5 Years</span>
              <span>Explore Class →</span>
            </div>
          </Link>

          {/* UKG Class */}
          <Link
            to="/classes/3"
            className="card"
            style={{
              borderTop: '6px solid #10b981',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textDecoration: 'none'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '3rem' }}>🚀</span>
                <span className="badge badge-ukg">
                  {stats.ukgCount} Students
                </span>
              </div>
              <h3 style={{ fontSize: '1.45rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                UKG Classroom
              </h3>
              <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Upper Kindergarten: Simple word formation, counting 1-50, basic addition, nature awareness, and primary school readiness.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
              <span>Ages 4.5 – 6 Years</span>
              <span>Explore Class →</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Interactive Learning Modules Grid */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div className="page-header" style={{ textAlign: 'center', alignItems: 'center' }}>
          <h2 style={{ fontSize: '2rem' }}>
            <span>🎨</span> Interactive Learning Adventures
          </h2>
          <p className="page-subtitle">
            Gamified learning activities that combine speech audio, celebratory animations, and instant mastery tracking
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem'
          }}
        >
          <Link
            to="/games"
            className="card"
            style={{
              textAlign: 'center',
              padding: '2rem 1.5rem',
              border: '2px solid #e0e7ff',
              textDecoration: 'none'
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🔤</div>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.4rem' }}>Alphabet Phonics</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Hear real-time voice speech for each letter with picture matching.
            </p>
          </Link>

          <Link
            to="/games"
            className="card"
            style={{
              textAlign: 'center',
              padding: '2rem 1.5rem',
              border: '2px solid #fef3c7',
              textDecoration: 'none'
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🔢</div>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.4rem' }}>Number Safari</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Count floating cheerful balloons, stars, and juicy red apples.
            </p>
          </Link>

          <Link
            to="/games"
            className="card"
            style={{
              textAlign: 'center',
              padding: '2rem 1.5rem',
              border: '2px solid #fce7f3',
              textDecoration: 'none'
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🎨</div>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.4rem' }}>Rainbow Colors</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Identify vibrant colors and match with fruits and everyday items.
            </p>
          </Link>

          <Link
            to="/games"
            className="card"
            style={{
              textAlign: 'center',
              padding: '2rem 1.5rem',
              border: '2px solid #e0f2fe',
              textDecoration: 'none'
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🔷</div>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.4rem' }}>Shape Detective</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Spot circles, squares, triangles, and rectangles in fun puzzles.
            </p>
          </Link>
        </div>
      </section>

      {/* Role-Based Benefits Showcase */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 2rem',
          border: '2px solid #e2e8f0',
          boxShadow: 'var(--card-shadow)',
          marginBottom: '2rem'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            🌈 Built for the Whole School Community
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            A unified ecosystem connecting students, passionate educators, and engaged families
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}
        >
          {/* For Children */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-md)',
                background: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                flexShrink: 0
              }}
            >
              👧
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                For Little Champions
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Playful, pressure-free learning with instant rewards, confetti celebrations, phonics audio, and adorable badge collections.
              </p>
            </div>
          </div>

          {/* For Educators */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-md)',
                background: '#ffedd5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                flexShrink: 0
              }}
            >
              👩‍🏫
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                For School Teachers
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Secure educator portal to enroll students, organize classroom rosters, track 7-category progress, and manage student academic files.
              </p>
            </div>
          </div>

          {/* For Parents */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-md)',
                background: '#fdf4ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                flexShrink: 0
              }}
            >
              👨‍👩‍👧
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                For Caring Parents
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                Private family portal to monitor child milestone achievements, review completed quiz histories, and shop verified preschool supplies.
              </p>
              <Link to={isParent ? "/parent/dashboard" : "/parent/login"} className="btn-parent-nav-signin btn-sm">
                <span>👨‍👩‍👧</span> {isParent ? 'Parent Dashboard ➔' : 'Parent Sign In ➔'}
              </Link>
            </div>
          </div>

          {/* For Store Managers (Role 4) */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-md)',
                background: '#ccfbf1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                flexShrink: 0
              }}
            >
              🏬
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                For Store Managers
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                Dedicated inventory and pricing administration to catalog educational supplies and fulfill student toy selections with strict student privacy.
              </p>
              <Link
                to={isStore ? "/store-admin/dashboard" : "/store-admin/login"}
                className="btn btn-sm"
                style={{
                  background: 'linear-gradient(135deg, #0f766e, #0d9488)',
                  color: '#ffffff',
                  fontWeight: 700,
                  textDecoration: 'none',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  display: 'inline-block'
                }}
              >
                <span>🏬</span> {isStore ? 'Store Dashboard ➔' : 'Store Admin Sign In ➔'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
