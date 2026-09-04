import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { getStoreProducts } from '../services/api';
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

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const catFilter = activeCategory === 'all' ? '' : activeCategory;
        const data = await getStoreProducts(catFilter);
        if (isMounted) {
          setProducts(data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load store products.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProducts();
    return () => { isMounted = false; };
  }, [activeCategory]);

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
      </div>

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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
