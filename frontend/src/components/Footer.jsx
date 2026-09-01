import React from 'react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-logo">
          🌈 LITTLE LEARNERS
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
