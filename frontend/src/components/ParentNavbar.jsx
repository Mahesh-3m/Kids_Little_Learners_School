import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  getStoredParent,
  logoutParent,
  getParentChildren,
  getActiveChildId,
  setActiveChildId
} from '../services/api';
import '../css/parent.css';

export default function ParentNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [parent, setParent] = useState(getStoredParent());
  const [children, setChildren] = useState([]);
  const [activeChildId, setActiveChild] = useState(getActiveChildId());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadChildren() {
      try {
        const list = await getParentChildren();
        setChildren(list || []);
        if (list && list.length > 0) {
          const current = getActiveChildId();
          const exists = list.some(c => String(c.id) === String(current));
          if (!current || !exists) {
            setActiveChildId(list[0].id);
            setActiveChild(String(list[0].id));
          }
        }
      } catch (err) {
        console.error("Failed to load children in navbar:", err);
      }
    }
    loadChildren();
  }, [location.pathname]);

  const handleChildChange = (e) => {
    const newId = e.target.value;
    setActiveChildId(newId);
    setActiveChild(newId);
    // Dispatch custom event so listening child views update immediately
    window.dispatchEvent(new CustomEvent('parentActiveChildChanged', { detail: { childId: newId } }));
  };

  const handleLogout = () => {
    logoutParent();
    navigate('/parent/login');
  };

  return (
    <header className="parent-navbar">
      <div className="parent-navbar-container">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/parent/dashboard" className="parent-brand">
            <img src="/logo.png" alt="Little Learners Logo" className="brand-logo-img" style={{ height: '44px', width: 'auto' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.1 }}>
                Little Learners
              </div>
              <span className="parent-brand-badge">Parent Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav>
          <ul className={`parent-nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <li>
              <NavLink 
                to="/parent/dashboard" 
                className={({ isActive }) => `parent-nav-link ${isActive ? 'active' : ''}`}
                end
              >
                <span>🏠</span> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/parent/children" 
                className={({ isActive }) => `parent-nav-link ${isActive ? 'active' : ''}`}
              >
                <span>👧</span> My Children
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/parent/activities" 
                className={({ isActive }) => `parent-nav-link ${isActive ? 'active' : ''}`}
              >
                <span>🎮</span> Activities
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/parent/results" 
                className={({ isActive }) => `parent-nav-link ${isActive ? 'active' : ''}`}
              >
                <span>📝</span> Quiz Results
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/parent/achievements" 
                className={({ isActive }) => `parent-nav-link ${isActive ? 'active' : ''}`}
              >
                <span>🏆</span> Achievements
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/parent/progress" 
                className={({ isActive }) => `parent-nav-link ${isActive ? 'active' : ''}`}
              >
                <span>📊</span> Progress
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/parent/store" 
                className={({ isActive }) => `parent-nav-link ${isActive ? 'active' : ''}`}
                style={({ isActive }) => isActive ? { background: '#fef3c7', color: '#b45309', border: '1.5px solid #fde68a' } : {}}
              >
                <span>🛍️</span> Kids Store
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/parent/profile" 
                className={({ isActive }) => `parent-nav-link ${isActive ? 'active' : ''}`}
              >
                <span>👤</span> Profile
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Controls: Child selector & Logout */}
        <div className="parent-nav-controls">
          {children.length > 1 && (
            <div className="child-selector-pill" title="Switch active child">
              <span>👶</span>
              <select 
                className="child-select-dropdown"
                value={activeChildId || ''} 
                onChange={handleChildChange}
              >
                {children.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.class_name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {children.length === 1 && (
            <div className="child-selector-pill">
              <span>👧</span>
              <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{children[0].name}</span>
            </div>
          )}

          <Link to="/" className="btn btn-outline btn-sm" title="Go to Little Learners Main Portal" style={{ fontSize: '0.85rem' }}>
            🏫 Main Portal
          </Link>

          <button onClick={handleLogout} className="btn-logout" title="Sign out of Parent Portal">
            <span>🚪</span> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
