import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { isParentAuthenticated, getStoredParent, logoutParent } from '../services/api';
import '../css/navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [parent, setParent] = useState(getStoredParent());
  const [isAuthenticated, setIsAuthenticated] = useState(isParentAuthenticated());
  const location = useLocation();

  useEffect(() => {
    setParent(getStoredParent());
    setIsAuthenticated(isParentAuthenticated());
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logoutParent();
    setIsAuthenticated(false);
    setParent(null);
    closeMenu();
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <span className="brand-icon">🌈</span>
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
              <NavLink to="/students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <span>👩‍🏫</span> Students
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

            {/* Auth / Parent Portal Nav Buttons */}
            {isAuthenticated ? (
              <li className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
                  <span>👨‍👩‍👧</span> {parent ? parent.name.split(' ')[0] : 'Portal'}
                </NavLink>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink 
                    to="/login" 
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
                    onClick={closeMenu}
                    style={{
                      background: '#f8fafc',
                      color: '#475569',
                      border: '1.5px solid #cbd5e1'
                    }}
                  >
                    <span>🔑</span> Sign In
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
