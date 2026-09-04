import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  adminGetStoreStats,
  adminGetToySelections,
  adminUpdateSelectionStatus,
  getStoredStoreManager
} from '../services/api';
import '../css/parent.css';

export default function StoreAdminDashboard() {
  const [manager] = useState(getStoredStoreManager());
  const [stats, setStats] = useState(null);
  const [recentSelections, setRecentSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setError(null);
    try {
      const [statsData, selectionsData] = await Promise.all([
        adminGetStoreStats(),
        adminGetToySelections()
      ]);
      setStats(statsData);
      setRecentSelections((selectionsData || []).slice(0, 6));
    } catch (err) {
      setError(err.message || 'Failed to load store admin dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (selectionId, newStatus) => {
    try {
      await adminUpdateSelectionStatus(selectionId, newStatus);
      setActionSuccess(`Status updated to "${newStatus}"!`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadDashboardData();
    } catch (err) {
      setError(err.message || 'Failed to update selection status.');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'badge-success';
      case 'Processing':
        return 'badge-info';
      case 'Cancelled':
        return 'badge-danger';
      default:
        return 'badge-warning';
    }
  };

  if (loading && !stats) {
    return (
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', animation: 'spin 1.5s linear infinite' }}>⏳</div>
        <h2>Loading Store Manager Dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '1rem' }}>
      {/* Top Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f766e, #0d9488)',
          color: '#ffffff',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 10px 25px -5px rgba(15, 118, 110, 0.25)'
        }}
      >
        <div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              Role 4 of 4: Store Manager
            </span>
            <span style={{
              background: '#ccfbf1',
              color: '#0f766e',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              ✨ Dedicated Store Access
            </span>
          </div>
          <h1 style={{ margin: '0 0 0.4rem 0', fontSize: '2rem', color: '#ffffff' }}>
            Welcome back, {manager ? manager.name : 'Store Manager Alex'}! 🏬
          </h1>
          <p style={{ margin: 0, opacity: 0.92, fontSize: '1rem' }}>
            Manage educational supplies, monitor toy inventory, and fulfill student orders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <Link
            to="/store-admin/add-product"
            className="btn"
            style={{
              background: '#ffffff',
              color: '#0f766e',
              fontWeight: 700,
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none'
            }}
          >
            ➕ Add New Product
          </Link>
          <Link
            to="/store-admin/toy-selections"
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              fontWeight: 700,
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none'
            }}
          >
            🎁 View All Requests
          </Link>
        </div>
      </div>

      {/* Strict Privacy & Role Isolation Notice */}
      <div
        style={{
          background: '#f0fdf4',
          border: '1.5px solid #86efac',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <span style={{ fontSize: '1.8rem' }}>🔒</span>
        <div>
          <h4 style={{ margin: '0 0 0.2rem 0', color: '#166534', fontSize: '1rem' }}>
            Student Privacy & Role-Based Isolation Active
          </h4>
          <p style={{ margin: 0, color: '#15803d', fontSize: '0.88rem' }}>
            Store administration is strictly partitioned from student academic records, test scores, grades, and teacher notes. You have access exclusively to toy & store fulfillment data (student name, class, requested item, and status).
          </p>
        </div>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <span>✅</span>
          <span>{actionSuccess}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}
      >
        <div className="card" style={{ padding: '1.5rem', borderLeft: '5px solid #0d9488' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Store Catalog
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f766e', marginTop: '0.2rem' }}>
                {stats ? stats.total_products : 0}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                {stats ? stats.total_toys : 0} Toys & Learning Items
              </div>
            </div>
            <span style={{ fontSize: '2.5rem' }}>📦</span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderLeft: '5px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Total Kid Requests
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
                {stats ? stats.total_selections : 0}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                {stats ? stats.total_toy_requests : 0} Toy Selections
              </div>
            </div>
            <span style={{ fontSize: '2.5rem' }}>🎁</span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderLeft: '5px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Pending Delivery
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>
                {stats ? stats.pending_requests : 0}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Awaiting classroom dispatch
              </div>
            </div>
            <span style={{ fontSize: '2.5rem' }}>⏳</span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderLeft: '5px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Delivered
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
                {stats ? stats.delivered_requests : 0}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Successfully provided to kids
              </div>
            </div>
            <span style={{ fontSize: '2.5rem' }}>✅</span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderLeft: '5px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Low Stock Alerts
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#dc2626', marginTop: '0.2rem' }}>
                {stats ? stats.low_stock_alerts : 0}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                5 or fewer items remaining
              </div>
            </div>
            <span style={{ fontSize: '2.5rem' }}>⚠️</span>
          </div>
        </div>
      </div>

      {/* Kids Storage & Department Inventory Section */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '1.6rem' }}>🏬</span>
              <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>
                Kids Storage & Department Inventory
              </h2>
              <span
                style={{
                  background: '#ccfbf1',
                  color: '#0f766e',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  border: '1px solid #99f6e4'
                }}
              >
                Kids Manager Storage Access
              </span>
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem' }}>
              Dedicated storage cards for school materials, classroom supplies, and student toy inventory.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Link
              to="/store-admin/products"
              className="btn btn-sm btn-outline"
              style={{ fontWeight: 600 }}
            >
              📦 Full Storage Inventory
            </Link>
          </div>
        </div>

        {/* 4 Storage Department Cards Grid: Books, Stationery, Toys, Dresses */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {/* 1. Books Storage Card */}
          <div
            className="card"
            style={{
              padding: '1.4rem',
              borderTop: '4px solid #f59e0b',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 40%)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    fontSize: '1.8rem',
                    background: '#fef3c7',
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-md)',
                    lineHeight: 1
                  }}>
                    📚
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#92400e', fontWeight: 800 }}>
                      Books Storage
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600 }}>
                      Phonics & Storybooks
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    background: (stats?.books_stock || 0) > 10 ? '#dcfce7' : '#fee2e2',
                    color: (stats?.books_stock || 0) > 10 ? '#166534' : '#991b1b',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px'
                  }}
                >
                  {(stats?.books_stock || 0) > 10 ? '● In Stock' : '⚠️ Low Stock'}
                </span>
              </div>

              <div style={{ margin: '1rem 0' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#b45309', lineHeight: 1.1 }}>
                  {stats ? stats.books_stock : 0}
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#78350f', marginLeft: '0.4rem' }}>
                    Units in Storage
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem' }}>
                  📖 <strong>{stats ? stats.total_books : 0}</strong> catalog titles available
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #fde68a' }}>
              <Link
                to="/store-admin/products?category=books"
                className="btn btn-sm"
                style={{
                  flex: 1,
                  background: '#fef3c7',
                  color: '#92400e',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  border: '1px solid #fde68a',
                  textAlign: 'center',
                  padding: '0.45rem'
                }}
              >
                Manage Books →
              </Link>
              <Link
                to="/store-admin/add-product?category=books"
                className="btn btn-sm btn-outline"
                style={{
                  color: '#92400e',
                  borderColor: '#fde68a',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  padding: '0.45rem 0.65rem'
                }}
                title="Add New Book to Inventory"
              >
                ➕ Add
              </Link>
            </div>
          </div>

          {/* 2. Stationery Storage Card */}
          <div
            className="card"
            style={{
              padding: '1.4rem',
              borderTop: '4px solid #06b6d4',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(180deg, #ecfeff 0%, #ffffff 40%)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    fontSize: '1.8rem',
                    background: '#cffafe',
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-md)',
                    lineHeight: 1
                  }}>
                    ✏️
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0e7490', fontWeight: 800 }}>
                      Stationery Storage
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#0891b2', fontWeight: 600 }}>
                      Crayons, Pencils & Art
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    background: (stats?.stationery_stock || 0) > 10 ? '#dcfce7' : '#fee2e2',
                    color: (stats?.stationery_stock || 0) > 10 ? '#166534' : '#991b1b',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px'
                  }}
                >
                  {(stats?.stationery_stock || 0) > 10 ? '● In Stock' : '⚠️ Low Stock'}
                </span>
              </div>

              <div style={{ margin: '1rem 0' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0891b2', lineHeight: 1.1 }}>
                  {stats ? stats.stationery_stock : 0}
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#155e75', marginLeft: '0.4rem' }}>
                    Units in Storage
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem' }}>
                  🎨 <strong>{stats ? stats.total_stationery : 0}</strong> art & school supplies
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #a5f3fc' }}>
              <Link
                to="/store-admin/products?category=stationery"
                className="btn btn-sm"
                style={{
                  flex: 1,
                  background: '#cffafe',
                  color: '#0e7490',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  border: '1px solid #a5f3fc',
                  textAlign: 'center',
                  padding: '0.45rem'
                }}
              >
                Manage Stationery →
              </Link>
              <Link
                to="/store-admin/add-product?category=stationery"
                className="btn btn-sm btn-outline"
                style={{
                  color: '#0e7490',
                  borderColor: '#a5f3fc',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  padding: '0.45rem 0.65rem'
                }}
                title="Add New Stationery to Inventory"
              >
                ➕ Add
              </Link>
            </div>
          </div>

          {/* 3. Toys Storage Card */}
          <div
            className="card"
            style={{
              padding: '1.4rem',
              borderTop: '4px solid #ec4899',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(180deg, #fdf2f8 0%, #ffffff 40%)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    fontSize: '1.8rem',
                    background: '#fce7f3',
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-md)',
                    lineHeight: 1
                  }}>
                    🧸
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#be185d', fontWeight: 800 }}>
                      Toys Storage
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#db2777', fontWeight: 600 }}>
                      Sensory, Puzzles & Plush
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    background: (stats?.toys_stock || 0) > 10 ? '#dcfce7' : '#fee2e2',
                    color: (stats?.toys_stock || 0) > 10 ? '#166534' : '#991b1b',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px'
                  }}
                >
                  {(stats?.toys_stock || 0) > 10 ? '● In Stock' : '⚠️ Low Stock'}
                </span>
              </div>

              <div style={{ margin: '1rem 0' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#db2777', lineHeight: 1.1 }}>
                  {stats ? stats.toys_stock : 0}
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#9d174d', marginLeft: '0.4rem' }}>
                    Units in Storage
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem' }}>
                  🧩 <strong>{stats ? stats.total_toys : 0}</strong> play & sensory toy items
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #fbcfe8' }}>
              <Link
                to="/store-admin/products?category=toys"
                className="btn btn-sm"
                style={{
                  flex: 1,
                  background: '#fce7f3',
                  color: '#be185d',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  border: '1px solid #fbcfe8',
                  textAlign: 'center',
                  padding: '0.45rem'
                }}
              >
                Manage Toys →
              </Link>
              <Link
                to="/store-admin/add-product?category=toys"
                className="btn btn-sm btn-outline"
                style={{
                  color: '#be185d',
                  borderColor: '#fbcfe8',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  padding: '0.45rem 0.65rem'
                }}
                title="Add New Toy to Inventory"
              >
                ➕ Add
              </Link>
            </div>
          </div>

          {/* 4. Kids Dresses Storage Card */}
          <div
            className="card"
            style={{
              padding: '1.4rem',
              borderTop: '4px solid #8b5cf6',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(180deg, #f5f3ff 0%, #ffffff 40%)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    fontSize: '1.8rem',
                    background: '#ede9fe',
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-md)',
                    lineHeight: 1
                  }}>
                    👕
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#6d28d9', fontWeight: 800 }}>
                      Dresses Storage
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 600 }}>
                      School Polos & Play Wear
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    background: (stats?.dresses_stock || 0) > 10 ? '#dcfce7' : '#fee2e2',
                    color: (stats?.dresses_stock || 0) > 10 ? '#166534' : '#991b1b',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px'
                  }}
                >
                  {(stats?.dresses_stock || 0) > 10 ? '● In Stock' : '⚠️ Low Stock'}
                </span>
              </div>

              <div style={{ margin: '1rem 0' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed', lineHeight: 1.1 }}>
                  {stats ? stats.dresses_stock : 0}
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#5b21b6', marginLeft: '0.4rem' }}>
                    Units in Storage
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem' }}>
                  👗 <strong>{stats ? stats.total_dresses : 0}</strong> dress styles & uniforms
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #ddd6fe' }}>
              <Link
                to="/store-admin/products?category=dresses"
                className="btn btn-sm"
                style={{
                  flex: 1,
                  background: '#ede9fe',
                  color: '#6d28d9',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  border: '1px solid #ddd6fe',
                  textAlign: 'center',
                  padding: '0.45rem'
                }}
              >
                Manage Dresses →
              </Link>
              <Link
                to="/store-admin/add-product?category=dresses"
                className="btn btn-sm btn-outline"
                style={{
                  color: '#6d28d9',
                  borderColor: '#ddd6fe',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  padding: '0.45rem 0.65rem'
                }}
                title="Add New Dress to Inventory"
              >
                ➕ Add
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '2rem' }}>📦</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Product Inventory</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>Manage products, update stock & prices</p>
            </div>
          </div>
          <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.5 }}>
            View all 9+ preschool store items across Toys, Books, Stationery, and Kids Dresses. Update stock levels and prices with real-time sync.
          </p>
          <Link to="/store-admin/products" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
            Open Inventory Manager →
          </Link>
        </div>

        <div className="card" style={{ padding: '1.5rem', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '2rem' }}>🎁</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Kid Toy Selections</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>Track and fulfill child requests</p>
            </div>
          </div>
          <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.5 }}>
            See exactly which child and classroom selected toys or educational items, with 1-click status transitions from Requested to Delivered.
          </p>
          <Link to="/store-admin/toy-selections" className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>
            Manage Toy Orders →
          </Link>
        </div>
      </div>

      {/* Recent Toy Selections Table */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.2rem 0', fontSize: '1.35rem', color: '#1e293b' }}>
              Recent Student Toy & Store Requests
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
              Latest selections placed by parents for their little learners.
            </p>
          </div>
          <Link to="/store-admin/toy-selections" className="btn btn-sm btn-outline">
            View All Selections →
          </Link>
        </div>

        {recentSelections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🧸</span>
            <p style={{ margin: 0 }}>No toy selections recorded yet. Parents can request items from the Kids Store.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', background: '#f8fafc' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Child Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Class</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Selected Product</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentSelections.map((sel) => (
                  <tr key={sel.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#1e293b' }}>
                      🧒 {sel.student_name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                      {sel.student_class}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f766e' }}>
                      {sel.product_name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        background: '#e0e7ff',
                        color: '#4338ca',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}>
                        {sel.product_category}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#059669' }}>
                      ${Number(sel.price).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${getStatusBadgeClass(sel.status)}`}>
                        {sel.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <select
                        value={sel.status}
                        onChange={(e) => handleStatusChange(sel.id, e.target.value)}
                        style={{
                          padding: '0.3rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          background: '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Requested">Requested</option>
                        <option value="Processing">Processing</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
