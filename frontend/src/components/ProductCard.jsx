import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CATEGORY_ICONS = {
  books: '📚',
  stationery: '✏️',
  toys: '🧸',
  dresses: '👕',
};

export default function ProductCard({ product }) {
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

        <div style={{ marginTop: '0.9rem' }}>
          <Link
            to={`/parent/store/product/${product.id}`}
            className="btn btn-sm btn-outline"
            style={{ width: '100%', fontSize: '0.88rem' }}
          >
            View Details 🔍
          </Link>
        </div>
      </div>
    </div>
  );
}
