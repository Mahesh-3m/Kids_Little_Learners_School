import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStoreProduct } from '../services/api';
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

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const data = await getStoreProduct(id);
        setProduct(data);
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

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-lg"
              disabled={isOutOfStock}
              style={{
                opacity: isOutOfStock ? 0.6 : 1,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                boxShadow: isOutOfStock ? 'none' : undefined
              }}
              onClick={() => alert(`Item "${product.name}" added to inquiries! School administration will coordinate fulfillment.`)}
            >
              {isOutOfStock ? '🚫 Currently Unavailable' : '🛒 Request from School Store'}
            </button>
            <Link to="/parent/store" className="btn btn-outline btn-lg">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
