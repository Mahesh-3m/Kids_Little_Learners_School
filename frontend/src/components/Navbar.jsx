import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  isParentAuthenticated,
  getStoredParent,
  isTeacherAuthenticated,
  getStoredTeacher
} from '../services/api';
import '../css/navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [parent, setParent] = useState(getStoredParent());
  const [teacher, setTeacher] = useState(getStoredTeacher());
  const [isParentAuth, setIsParentAuth] = useState(isParentAuthenticated());
  const [isTeacherAuth, setIsTeacherAuth] = useState(isTeacherAuthenticated());
  const location = useLocation();

  useEffect(() => {
    setParent(getStoredParent());
    setTeacher(getStoredTeacher());
    setIsParentAuth(isParentAuthenticated());
    setIsTeacherAuth(isTeacherAuthenticated());
  }, [location.pathname]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <img src="/logo.png" alt="Little Learners Logo" className="brand-logo-img" />
          <span className="brand-text">Little Learners</span>
        </Link>

        <button 
          className="mobile-toggle" 
          onClick={toggleMenu} 
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? '✕' : '☰'}
        </button>

        <nav>
          <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
            <li className="nav-item">
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu} end>
                <span>🏠</span> Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/classes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <span>👶</span> Classes
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/games" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <span>🎮</span> Games
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/quiz" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <span>📝</span> Quiz
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/results" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <span>🏆</span> Results
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/progress" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <span>📊</span> Progress
              </NavLink>
            </li>

            {/* Teacher Link / Portal */}
            {isTeacherAuth ? (
              <li className="nav-item">
                <NavLink 
                  to="/teacher/dashboard" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
                  onClick={closeMenu}
                  style={{
                    background: '#ffedd5',
                    color: '#c2410c',
                    fontWeight: 700,
                    border: '1.5px solid #fed7aa'
                  }}
                >
                  <span>👩‍🏫</span> {teacher ? teacher.name.split(' ')[0] : 'Teacher'} Portal
                </NavLink>
              </li>
            ) : (
              <li className="nav-item">
                <NavLink 
                  to="/teacher/login" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
                  onClick={closeMenu}
                  style={{
                    background: '#fff7ed',
                    color: '#c2410c',
                    border: '1.5px solid #ffedd5'
                  }}
                >
                  <span>👩‍🏫</span> Teacher
                </NavLink>
              </li>
            )}

            {/* Auth / Parent Portal Nav Buttons */}
            {isParentAuth ? (
              <li className="nav-item">
                <NavLink 
                  to="/parent/dashboard" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
                  onClick={closeMenu}
                  style={{
                    background: 'linear-gradient(135deg, #fdf4ff, #f3e8ff)',
                    color: '#7e22ce',
                    fontWeight: 700,
                    border: '1.5px solid #d8b4fe'
                  }}
                >
                  <span>👨‍👩‍👧</span> {parent ? parent.name.split(' ')[0] : 'Parent'} Portal
                </NavLink>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink 
                    to="/login" 
                    className="btn-parent-nav-signin" 
                    onClick={closeMenu}
                    title="Sign in to Parent Portal"
                  >
                    <span>👨‍👩‍👧</span> Parent Sign In
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink 
                    to="/register" 
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
                    onClick={closeMenu}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                      color: '#ffffff',
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)'
                    }}
                  >
                    <span>✨</span> Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
