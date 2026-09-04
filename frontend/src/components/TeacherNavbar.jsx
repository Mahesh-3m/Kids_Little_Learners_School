import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { getStoredTeacher, logoutTeacher } from '../services/api';
import '../css/navbar.css';

export default function TeacherNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [teacher, setTeacher] = useState(getStoredTeacher());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setTeacher(getStoredTeacher());
  }, [location.pathname]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logoutTeacher();
    navigate('/teacher/login');
  };

  return (
    <header className="navbar" style={{ borderBottom: '2px solid #fed7aa', background: '#fffaf5' }}>
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/teacher/dashboard" className="nav-brand" onClick={closeMenu}>
          <img src="/logo.png" alt="Little Learners Logo" className="brand-logo-img" style={{ height: '44px', width: 'auto' }} />
          <div>
            <div className="brand-text" style={{ fontSize: '1.25rem', lineHeight: 1.1 }}>
              Little Learners
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#ea580c',
                background: '#ffedd5',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                display: 'inline-block'
              }}
            >
              Teacher Portal
            </span>
          </div>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={toggleMenu}
          aria-label="Toggle Teacher Menu"
        >
          {isOpen ? '✕' : '☰'}
        </button>

        {/* Navigation Links */}
        <nav>
          <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
            <li className="nav-item">
              <NavLink
                to="/teacher/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
                end
              >
                <span>📊</span> Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/teacher/students"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span>🎒</span> Manage Students
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/teacher/students/add"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span>➕</span> Enroll Student
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/classes"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span>🏫</span> Classes
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/progress"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span>📈</span> Progress
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/results"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span>🏆</span> Results
              </NavLink>
            </li>

            {/* Teacher info & controls */}
            <li className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: '0.5rem' }}>
              <span
                style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                👩‍🏫 {teacher ? teacher.name.split(' ')[0] : 'Teacher'}
              </span>

              <Link
                to="/"
                className="btn btn-outline btn-sm"
                title="Go to School Public Page"
                style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}
                onClick={closeMenu}
              >
                🏫 Public Site
              </Link>

              <button
                onClick={handleLogout}
                className="btn btn-sm"
                style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  border: '1px solid #fecaca',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
                title="Sign out of Teacher Portal"
              >
                🚪 Sign Out
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
