import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStoreProduct, getParentChildren, selectStoreProductForChild, getActiveChildId } from '../services/api';
import '../css/store.css';

const CATEGORY_ICONS = {
  books: '📚',
  stationery: '✏️',
  toys: '🧸',
  dresses: '👕',
};

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  // Child selection state
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const [prodData, kidsData] = await Promise.all([
          getStoreProduct(id),
          getParentChildren().catch(() => [])
        ]);
        setProduct(prodData);
        const kids = kidsData || [];
        setChildren(kids);
        const activeId = getActiveChildId();
        if (activeId && kids.some(k => String(k.id) === String(activeId))) {
          setSelectedChildId(String(activeId));
        } else if (kids.length > 0) {
          setSelectedChildId(String(kids[0].id));
        }
      } catch (err) {
        setError(err.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleConfirmSelection = async () => {
    if (!selectedChildId) {
      alert('Please select a child.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await selectStoreProductForChild({
        student_id: Number(selectedChildId),
        product_id: product.id,
        quantity: 1
      });
      setSuccessMessage(res.message || `Successfully requested "${product.name}"!`);
      // Update local product stock
      setProduct(prev => ({
        ...prev,
        stock: Math.max(0, Number(prev.stock) - 1)
      }));
      setShowSelectModal(false);
    } catch (err) {
      alert(err.message || 'Failed to select item.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="store-container">
        <div className="store-empty-state">
          <span className="empty-icon">⏳</span>
          <h3>Loading Product Details...</h3>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="store-container">
        <div className="store-empty-state">
          <span className="empty-icon">🔍</span>
          <h3>Product Not Found</h3>
          <p>{error || "The requested product does not exist or has been removed."}</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/parent/store" className="btn btn-primary">
              ← Return to Kids Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categoryKey = (product.category || '').toLowerCase();
  const categoryIcon = CATEGORY_ICONS[categoryKey] || '🛍️';
  const isOutOfStock = Number(product.stock) <= 0;

  return (
    <div className="store-container">
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/parent/store" className="btn btn-outline btn-sm">
          ← Back to Kids Store
        </Link>
      </div>

      <div className="product-details-container">
        {/* Product Media */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {product.image_url && !imgError ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="product-details-image"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              style={{
                fontSize: '8rem',
                height: '350px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)'
              }}
            >
              {categoryIcon}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span className="store-badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>
              {categoryIcon} {product.category}
            </span>
            {isOutOfStock ? (
              <span className="stock-badge stock-out">Out of Stock</span>
            ) : (
              <span className="stock-badge stock-in">In Stock ({product.stock} Available)</span>
            )}
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>
            {product.name}
          </h1>

          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2rem',
              fontWeight: 800,
              color: '#059669',
              marginBottom: '1.5rem'
            }}
          >
            ${Number(product.price).toFixed(2)}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#475569', marginBottom: '0.4rem' }}>
              Description
            </h4>
            <p style={{ fontSize: '1.05rem', color: '#334155', lineHeight: 1.7 }}>
              {product.description || 'No description provided for this item.'}
            </p>
          </div>

          {successMessage && (
            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
              <span>🎉</span>
              <span>{successMessage}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-lg"
              disabled={isOutOfStock}
              style={{
                opacity: isOutOfStock ? 0.6 : 1,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                boxShadow: isOutOfStock ? 'none' : undefined,
                background: isOutOfStock ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderColor: '#6366f1'
              }}
              onClick={() => setShowSelectModal(true)}
            >
              {isOutOfStock ? '🚫 Currently Unavailable' : '🎁 Select for My Child'}
            </button>
            <Link to="/parent/store" className="btn btn-outline btn-lg">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Select for Child Modal */}
      {showSelectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
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
              Request <strong>"{product.name}"</strong> (${Number(product.price).toFixed(2)}) from the school store for your child.
            </p>

            {children.length === 0 ? (
              <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: 'var(--radius-md)', color: '#991b1b', marginBottom: '1rem' }}>
                No child profiles found on your parent account. Please enroll or link a child first.
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
    </div>
  );
}
