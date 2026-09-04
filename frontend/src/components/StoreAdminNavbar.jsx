import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { getStoredStoreManager, logoutStoreManager } from '../services/api';
import '../css/navbar.css';

export default function StoreAdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [manager, setManager] = useState(getStoredStoreManager());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setManager(getStoredStoreManager());
  }, [location.pathname]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logoutStoreManager();
    navigate('/store-admin/login');
  };

  return (
    <header className="navbar" style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc' }}>
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/store-admin/dashboard" className="nav-brand" onClick={closeMenu}>
          <img src="/logo.png" alt="Little Learners Logo" className="brand-logo-img" style={{ height: '44px', width: 'auto' }} />
          <div>
            <div className="brand-text" style={{ fontSize: '1.25rem', lineHeight: 1.1 }}>
              Little Learners
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#0f766e',
                background: '#ccfbf1',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                display: 'inline-block'
              }}
            >
              🏬 Store Admin
            </span>
          </div>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={toggleMenu}
          aria-label="Toggle Store Admin Menu"
        >
          {isOpen ? '✕' : '☰'}
        </button>

        {/* Navigation Links */}
        <nav>
          <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
            <li className="nav-item">
              <NavLink
                to="/store-admin/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
                end
              >
                <span>📊</span> Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/store-admin/products"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span>📦</span> Inventory & Catalog
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/store-admin/add-product"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span>➕</span> Add Product
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/store-admin/toy-selections"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span>🎁</span> Kid Toy Requests
              </NavLink>
            </li>

            {/* Manager info & controls */}
            <li className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: '0.5rem' }}>
              <span
                style={{
                  background: '#e0f2fe',
                  color: '#0369a1',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                🏬 {manager ? manager.name.split(' ')[0] : 'Manager'}
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
                title="Sign out of Store Admin"
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
