import React from 'react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <img src="/logo.png" alt="Little Learners Logo" style={{ height: '56px', width: 'auto' }} />
          <span>LITTLE LEARNERS</span>
        </div>
        <p className="footer-tagline">
          Learn • Play • Grow — Inspiring young minds for a brighter tomorrow! ✨
        </p>
        <p className="footer-copy">
          © {new Date().getFullYear()} Little Learners Early Childhood Academy. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
