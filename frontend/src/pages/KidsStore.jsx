import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useParams, Link } from 'react-router-dom';
import {
  getStoreProducts,
  getParentChildren,
  selectStoreProductForChild,
  getMyToySelections,
  getActiveChildId,
  getStoreDetails
} from '../services/api';
import ProductCard from '../components/ProductCard';
import '../css/store.css';

const CATEGORIES = [
  { id: 'all', name: 'All Items', icon: '🛍️', path: '/parent/store' },
  { id: 'books', name: 'Books', icon: '📚', path: '/parent/store/books' },
  { id: 'stationery', name: 'Stationery', icon: '✏️', path: '/parent/store/stationery' },
  { id: 'toys', name: 'Toys', icon: '🧸', path: '/parent/store/toys' },
  { id: 'dresses', name: 'Kids Dresses', icon: '👕', path: '/parent/store/dresses' },
];

export default function KidsStore({ initialCategory = '' }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'all');
  const [storeDetails, setStoreDetails] = useState(null);

  // Child selection & orders state
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // My requests modal
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    let isMounted = true;
    async function loadProductsAndKids() {
      setLoading(true);
      setError(null);
      try {
        const catFilter = activeCategory === 'all' ? '' : activeCategory;
        const [prodData, kidsData, detailsData] = await Promise.all([
          getStoreProducts(catFilter),
          getParentChildren().catch(() => []),
          getStoreDetails().catch(() => null)
        ]);

        if (isMounted) {
          setProducts(prodData || []);
          if (detailsData) setStoreDetails(detailsData);
          const kids = kidsData || [];
          setChildren(kids);
          const activeId = getActiveChildId();
          if (activeId && kids.some(k => String(k.id) === String(activeId))) {
            setSelectedChildId(String(activeId));
          } else if (kids.length > 0) {
            setSelectedChildId(String(kids[0].id));
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load store products.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProductsAndKids();
    return () => { isMounted = false; };
  }, [activeCategory]);

  const handleOpenSelectModal = (product) => {
    setSelectedProduct(product);
    setShowSelectModal(true);
  };

  const handleConfirmSelection = async () => {
    if (!selectedChildId || !selectedProduct) return;
    setSubmitting(true);
    try {
      const res = await selectStoreProductForChild({
        student_id: Number(selectedChildId),
        product_id: selectedProduct.id,
        quantity: 1
      });
      setSuccessMessage(res.message || `Successfully requested "${selectedProduct.name}"!`);
      setTimeout(() => setSuccessMessage(null), 4500);

      // Decrement stock locally
      setProducts(prev =>
        prev.map(p => p.id === selectedProduct.id ? { ...p, stock: Math.max(0, p.stock - 1) } : p)
      );
      setShowSelectModal(false);
    } catch (err) {
      alert(err.message || 'Failed to request item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenMyRequests = async () => {
    setShowMyRequests(true);
    setLoadingRequests(true);
    try {
      const data = await getMyToySelections();
      setMyRequests(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="store-container">
      {/* Banner Header */}
      <div className="store-header">
        <div className="store-header-content">
          <div className="store-badge">
            <span>✨</span> Parent Exclusive
          </div>
          <h1>
            <span>🧸</span> Little Learners Kids Store
          </h1>
          <p>
            Explore verified educational books, non-toxic stationery, cognitive sensory toys, and adorable school dresses for your children.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleOpenMyRequests}
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              border: '1.5px solid rgba(255, 255, 255, 0.6)',
              fontWeight: 700,
              padding: '0.6rem 1.1rem',
              borderRadius: '9999px',
              cursor: 'pointer'
            }}
          >
            🎁 View My Child's Requests
          </button>
        </div>
      </div>

      {/* Live Store Details & Announcement Strip */}
      {storeDetails && (
        <div style={{ marginBottom: '1.5rem' }}>
          {storeDetails.announcement && (
            <div
              style={{
                background: '#fef3c7',
                border: '1.5px solid #fde68a',
                color: '#92400e',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>📢</span>
              <span>{storeDetails.announcement}</span>
            </div>
          )}

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              alignItems: 'center',
              fontSize: '0.85rem',
              color: '#475569'
            }}
          >
            <div>
              <strong>📍 Campus Location:</strong> {storeDetails.location || 'Main Campus'}
            </div>
            <div>
              <strong>⏰ Hours:</strong> {storeDetails.operating_hours || 'Mon–Fri 8am–4pm'}
            </div>
            <div>
              <strong>🚚 Dispatch:</strong> {storeDetails.delivery_policy || 'Classroom fulfillment'}
            </div>
            <div>
              <strong>📞 Support:</strong> {storeDetails.phone}
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <span>🎉</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Category Tabs & Search Bar */}
      <div className="store-controls">
        <div className="store-category-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`store-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>

        <div className="search-input-wrapper" style={{ minWidth: '240px' }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="store-empty-state">
          <span className="empty-icon" style={{ animation: 'spin 1.5s linear infinite' }}>⏳</span>
          <h3>Loading Store Products...</h3>
          <p>Connecting to catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="store-empty-state">
          <span className="empty-icon">🛍️</span>
          <h3>No products available.</h3>
          <p>
            {searchQuery
              ? `No products found matching "${searchQuery}". Try a different keyword.`
              : activeCategory !== 'all'
              ? `There are currently no products in the ${activeCategory} category.`
              : 'Our store inventory is currently being updated. Please check back soon!'}
          </p>
        </div>
      ) : (
        /* Product Cards Grid */
        <div className="products-grid">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={handleOpenSelectModal}
            />
          ))}
        </div>
      )}

      {/* Select for Child Modal */}
      {showSelectModal && selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b' }}>
                🎁 Select Toy for Child
              </h3>
              <button
                onClick={() => setShowSelectModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
              Request <strong>"{selectedProduct.name}"</strong> (${Number(selectedProduct.price).toFixed(2)}) from the school store.
            </p>

            {children.length === 0 ? (
              <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: 'var(--radius-md)', color: '#991b1b', marginBottom: '1rem' }}>
                No child profiles found on your account.
              </div>
            ) : (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.4rem', color: '#334155' }}>
                  Choose Child:
                </label>
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '1rem',
                    background: '#fff'
                  }}
                >
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      🧒 {child.name} ({child.class_name || child.class || 'Pre-K'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowSelectModal(false)}
                className="btn btn-outline"
                style={{ padding: '0.6rem 1.2rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSelection}
                disabled={submitting || children.length === 0}
                className="btn btn-primary"
                style={{
                  padding: '0.6rem 1.4rem',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  borderColor: '#6366f1'
                }}
              >
                {submitting ? 'Submitting...' : 'Confirm Request ✨'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View My Child's Requests Modal */}
      {showMyRequests && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '640px', width: '100%', maxHeight: '80vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#1e293b' }}>
                🎁 My Child's Store Requests
              </h3>
              <button
                onClick={() => setShowMyRequests(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {loadingRequests ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem', animation: 'spin 1.5s linear infinite' }}>⏳</span>
                <p>Loading requests...</p>
              </div>
            ) : myRequests.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🧸</span>
                <p>No store items selected yet for your child.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#f8fafc'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>
                        {req.product_name}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                        For: 🧒 {req.student_name} ({req.student_class}) • ${Number(req.price).toFixed(2)}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: req.status === 'Delivered' ? '#dcfce7' : req.status === 'Processing' ? '#e0f2fe' : '#fef3c7',
                        color: req.status === 'Delivered' ? '#166534' : req.status === 'Processing' ? '#0369a1' : '#92400e'
                      }}
                    >
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                onClick={() => setShowMyRequests(false)}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1.25rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

