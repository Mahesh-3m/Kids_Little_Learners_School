import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStoreDetails, adminUpdateStoreDetails } from '../services/api';
import '../css/parent.css';

export default function StoreAdminDetails() {
  const [formData, setFormData] = useState({
    store_name: '',
    manager_name: '',
    email: '',
    phone: '',
    location: '',
    operating_hours: '',
    delivery_policy: '',
    storage_capacity: '',
    description: '',
    announcement: '',
    is_open: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        const data = await getStoreDetails();
        if (data) {
          setFormData({
            store_name: data.store_name || 'Little Learners Official Kids Store',
            manager_name: data.manager_name || 'Store Manager Alex',
            email: data.email || 'store@littlelearners.com',
            phone: data.phone || '+1 (555) 019-2834',
            location: data.location || 'Main Campus, Early Learning Wing A - Ground Floor',
            operating_hours: data.operating_hours || 'Monday – Friday: 8:00 AM – 4:00 PM',
            delivery_policy: data.delivery_policy || '',
            storage_capacity: data.storage_capacity || '',
            description: data.description || '',
            announcement: data.announcement || '',
            is_open: data.is_open !== undefined ? Boolean(data.is_open) : true,
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load store details.');
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.store_name.trim()) {
      setError('Store name is required.');
      return;
    }

    setSaving(true);
    try {
      const res = await adminUpdateStoreDetails(formData);
      setSuccess(res.message || 'Store details updated and stored in database successfully! 🏬');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update store details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '3rem auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', animation: 'spin 1.5s linear infinite' }}>⏳</div>
        <h2>Loading Store Details from Database...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '1rem' }}>
      {/* Top Breadcrumb & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link
            to="/store-admin/dashboard"
            style={{
              textDecoration: 'none',
              color: '#0f766e',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '0.4rem'
            }}
          >
            ← Back to Store Dashboard
          </Link>
          <h1 style={{ margin: 0, fontSize: '1.85rem', color: '#1e293b', fontWeight: 800 }}>
            🏪 School Store Information & Operating Details
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
            Add, update, and manage official store details saved in the database for parents, teachers, and school fulfillment.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <Link to="/store-admin/products" className="btn btn-outline btn-sm">
            📦 Products Catalog
          </Link>
          <Link to="/parent/store" className="btn btn-sm" style={{ background: '#0f766e', color: '#ffffff', fontWeight: 700 }}>
            👀 View Parent Store
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Edit Form (Left) + Live Preview (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Form Container */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.6rem' }}>✏️</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Edit Store Profile</h2>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Changes are persisted directly in MySQL database</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Store Name */}
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                Store Name *
              </label>
              <input
                type="text"
                name="store_name"
                className="form-input"
                value={formData.store_name}
                onChange={handleChange}
                placeholder="e.g. Little Learners Official Kids Store"
                required
              />
            </div>

            {/* Manager Name & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  Manager / Person In-Charge
                </label>
                <input
                  type="text"
                  name="manager_name"
                  className="form-input"
                  value={formData.manager_name}
                  onChange={handleChange}
                  placeholder="e.g. Store Manager Alex"
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  Contact Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1 (555) 019-2834"
                />
              </div>
            </div>

            {/* Email & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  Store Support Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. store@littlelearners.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  Operating / Dispatch Hours
                </label>
                <input
                  type="text"
                  name="operating_hours"
                  className="form-input"
                  value={formData.operating_hours}
                  onChange={handleChange}
                  placeholder="e.g. Mon – Fri: 8:00 AM – 4:00 PM"
                />
              </div>
            </div>

            {/* Campus Physical Location */}
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                Campus Physical Location & Room
              </label>
              <input
                type="text"
                name="location"
                className="form-input"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Main Campus, Early Learning Wing A - Ground Floor"
              />
            </div>

            {/* Classroom Delivery Policy */}
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                Classroom Delivery & Fulfillment Policy
              </label>
              <textarea
                name="delivery_policy"
                className="form-input"
                rows="3"
                value={formData.delivery_policy}
                onChange={handleChange}
                placeholder="e.g. Student toy and stationery selections are packaged and dispatched directly to child classrooms every weekday afternoon by 2:30 PM."
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Storage Warehouse Notes */}
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                Storage Warehouse Capacity Notes
              </label>
              <input
                type="text"
                name="storage_capacity"
                className="form-input"
                value={formData.storage_capacity}
                onChange={handleChange}
                placeholder="e.g. Dedicated 4-Department Storage: Books, Stationery, Sensory Toys, and Uniform Dresses"
              />
            </div>

            {/* Public Announcement */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                Public Announcement Banner (Shown to Parents)
              </label>
              <input
                type="text"
                name="announcement"
                className="form-input"
                value={formData.announcement}
                onChange={handleChange}
                placeholder="e.g. ✨ All preschool store supplies & educational toys in stock for immediate classroom dispatch!"
              />
            </div>

            {/* Store Status Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                background: '#f8fafc',
                padding: '0.9rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.75rem',
                border: '1px solid #e2e8f0'
              }}
            >
              <input
                type="checkbox"
                id="is_open"
                name="is_open"
                checked={formData.is_open}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="is_open" style={{ cursor: 'pointer', margin: 0, fontWeight: 700, color: '#1e293b' }}>
                Store Open for Requests {formData.is_open ? '🟢 (Active & Receiving Orders)' : '🔴 (Temporarily Paused)'}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '1.05rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #0f766e, #0d9488)',
                borderColor: '#0f766e',
                boxShadow: '0 4px 14px rgba(15, 118, 110, 0.3)'
              }}
            >
              {saving ? 'Saving Details to Database...' : '💾 Save Store Details to Database'}
            </button>
          </form>
        </div>

        {/* Live Preview Container (Right) */}
        <div>
          <div
            className="card"
            style={{
              padding: '1.75rem',
              border: '2px solid #99f6e4',
              background: 'linear-gradient(180deg, #f0fdfa 0%, #ffffff 50%)',
              position: 'sticky',
              top: '90px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #ccfbf1', paddingBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>👀</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f766e', fontWeight: 800 }}>
                  Live Store Display Preview
                </h3>
              </div>
              <span
                style={{
                  background: formData.is_open ? '#dcfce7' : '#fee2e2',
                  color: formData.is_open ? '#166534' : '#991b1b',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px'
                }}
              >
                {formData.is_open ? '● OPEN' : '● CLOSED'}
              </span>
            </div>

            {/* Announcement banner preview */}
            {formData.announcement && (
              <div
                style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem'
                }}
              >
                📢 {formData.announcement}
              </div>
            )}

            <div style={{ marginBottom: '1.2rem' }}>
              <h2 style={{ margin: '0 0 0.3rem 0', fontSize: '1.5rem', color: '#0f172a', fontWeight: 800 }}>
                🏬 {formData.store_name || 'Store Name'}
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
                {formData.description || 'Official school store providing educational books, creative stationery, toys, and uniform apparel.'}
              </p>
            </div>

            {/* Quick Details Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>📍</span>
                <div>
                  <strong style={{ color: '#0f172a' }}>Campus Location:</strong>
                  <div>{formData.location || 'Not specified'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>⏰</span>
                <div>
                  <strong style={{ color: '#0f172a' }}>Operating Hours:</strong>
                  <div>{formData.operating_hours || 'Not specified'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>🚚</span>
                <div>
                  <strong style={{ color: '#0f172a' }}>Classroom Dispatch Policy:</strong>
                  <div>{formData.delivery_policy || 'Daily classroom dispatch.'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>📦</span>
                <div>
                  <strong style={{ color: '#0f172a' }}>Storage Departments:</strong>
                  <div>{formData.storage_capacity || 'Books, Stationery, Toys, Dresses'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginTop: '0.4rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>👤</span>
                <div>
                  <strong style={{ color: '#0f172a' }}>Store Contact:</strong>
                  <div>{formData.manager_name} • {formData.phone} • {formData.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
