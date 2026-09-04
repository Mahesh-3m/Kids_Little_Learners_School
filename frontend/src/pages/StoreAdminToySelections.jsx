import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminGetToySelections, adminUpdateSelectionStatus } from '../services/api';
import '../css/parent.css';

const STATUS_OPTIONS = ['All', 'Requested', 'Processing', 'Delivered', 'Cancelled'];
const CATEGORY_OPTIONS = ['All', 'Toys', 'Books', 'Stationery', 'Kids Dresses'];

export default function StoreAdminToySelections() {
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    loadSelections();
  }, [categoryFilter]);

  async function loadSelections() {
    setLoading(true);
    setError(null);
    try {
      const cat = categoryFilter === 'All' ? '' : categoryFilter;
      const data = await adminGetToySelections(cat);
      setSelections(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load toy selections.');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await adminUpdateSelectionStatus(id, newStatus);
      setActionSuccess(`Order #${id} updated to status "${newStatus}"!`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadSelections();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
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

  const filteredSelections = selections.filter((item) => {
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.student_name && item.student_name.toLowerCase().includes(q)) ||
      (item.product_name && item.product_name.toLowerCase().includes(q)) ||
      (item.student_class && item.student_class.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <Link to="/store-admin/dashboard" style={{ color: '#0f766e', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              ← Store Dashboard
            </Link>
            <span style={{ color: '#94a3b8' }}>/</span>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Kid Toy & Item Requests</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', color: '#1e293b' }}>
            🎁 Student Toy & Store Fulfillment
          </h1>
          <p style={{ margin: '0.3rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
            Track toys and learning supplies requested by parents for classroom or home delivery.
          </p>
        </div>

        <button onClick={loadSelections} className="btn btn-outline btn-sm" title="Refresh list">
          🔄 Refresh Orders
        </button>
      </div>

      {/* Privacy Guarantee Alert */}
      <div
        style={{
          background: '#f0fdf4',
          border: '1.5px solid #86efac',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <span style={{ fontSize: '1.8rem' }}>🔒</span>
        <div>
          <h4 style={{ margin: '0 0 0.2rem 0', color: '#166534', fontSize: '1rem' }}>
            Privacy Guarantee: Classroom Delivery Data Only
          </h4>
          <p style={{ margin: 0, color: '#15803d', fontSize: '0.88rem' }}>
            Only child name, class, and requested toy are presented to fulfill classroom hand-off. Test marks, grades, attendance, and teacher evaluations are completely masked from store administrators.
          </p>
        </div>
      </div>

      {/* Success Notification */}
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

      {/* Filters Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="btn btn-sm"
              style={{
                background: statusFilter === st ? '#0f766e' : '#f1f5f9',
                color: statusFilter === st ? '#ffffff' : '#334155',
                border: 'none',
                fontWeight: 600,
                borderRadius: '9999px',
                padding: '0.4rem 0.9rem'
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.8rem',
              borderRadius: '9999px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.9rem',
              background: '#fff'
            }}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search child or toy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none',
              minWidth: '200px'
            }}
          />
        </div>
      </div>

      {/* Selections Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem', animation: 'spin 1.5s linear infinite' }}>⏳</span>
            <p style={{ margin: 0 }}>Loading student toy requests...</p>
          </div>
        ) : filteredSelections.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🎁</span>
            <h3>No requests found</h3>
            <p style={{ margin: 0 }}>There are currently no toy or store requests matching these filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', background: '#f8fafc' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Order #</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Child Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Classroom</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Requested Product</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Price</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSelections.map((sel) => (
                  <tr key={sel.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem 1.25rem', color: '#64748b', fontWeight: 600 }}>
                      #{sel.id}
                    </td>

                    <td style={{ padding: '1rem', fontWeight: 700, color: '#1e293b' }}>
                      🧒 {sel.student_name}
                    </td>

                    <td style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>
                      🏫 {sel.student_class}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#0f766e' }}>
                      {sel.product_name}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          background: '#e0e7ff',
                          color: '#4338ca',
                          padding: '0.2rem 0.65rem',
                          borderRadius: '9999px',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}
                      >
                        {sel.product_category}
                      </span>
                    </td>

                    <td style={{ padding: '1rem', fontWeight: 700, color: '#059669' }}>
                      ${Number(sel.price).toFixed(2)}
                    </td>

                    <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                      {sel.created_at ? new Date(sel.created_at).toLocaleDateString() : 'Today'}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${getStatusBadgeClass(sel.status)}`}>
                        {sel.status}
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <select
                        value={sel.status}
                        onChange={(e) => handleStatusUpdate(sel.id, e.target.value)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Requested">🟡 Requested</option>
                        <option value="Processing">🔵 Processing</option>
                        <option value="Delivered">🟢 Delivered</option>
                        <option value="Cancelled">🔴 Cancelled</option>
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
