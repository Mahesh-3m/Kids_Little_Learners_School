import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CATEGORY_ICONS = {
  books: '📚',
  stationery: '✏️',
  toys: '🧸',
  dresses: '👕',
};

export default function ProductCard({ product, onSelect }) {
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const categoryKey = (product.category || '').toLowerCase();
  const categoryIcon = CATEGORY_ICONS[categoryKey] || '🛍️';
  const isOutOfStock = Number(product.stock) <= 0;

  return (
    <div className="product-card">
      <div className="product-image-container">
        <span className="product-category-tag">
          {categoryIcon} {product.category}
        </span>
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="product-image"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="product-image-fallback">
            {categoryIcon}
          </div>
        )}
      </div>

      <div className="product-content">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-desc">{product.description || 'Quality learning & creative supplies for little learners.'}</p>

        <div className="product-footer">
          <div className="product-price">
            ${Number(product.price).toFixed(2)}
          </div>
          <div>
            {isOutOfStock ? (
              <span className="stock-badge stock-out">Out of Stock</span>
            ) : (
              <span className="stock-badge stock-in">In Stock ({product.stock})</span>
            )}
          </div>
        </div>

        <div style={{ marginTop: '0.9rem', display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onSelect && onSelect(product)}
            disabled={isOutOfStock}
            className="btn btn-sm btn-primary"
            style={{
              flex: 1,
              fontSize: '0.85rem',
              padding: '0.45rem 0.6rem',
              background: isOutOfStock ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderColor: isOutOfStock ? '#cbd5e1' : '#6366f1',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
            }}
          >
            {isOutOfStock ? 'Out of Stock' : '🎁 Select for Child'}
          </button>
          <Link
            to={`/parent/store/product/${product.id}`}
            className="btn btn-sm btn-outline"
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.7rem' }}
          >
            Details 🔍
          </Link>
        </div>
      </div>
    </div>
  );
}
