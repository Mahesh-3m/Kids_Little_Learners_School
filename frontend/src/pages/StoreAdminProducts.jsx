import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  adminGetProducts,
  adminUpdateStock,
  adminUpdatePrice,
  adminDeleteProduct
} from '../services/api';
import '../css/parent.css';

const CATEGORIES = [
  { id: 'all', name: 'All Products', icon: '🛍️' },
  { id: 'toys', name: 'Toys', icon: '🧸' },
  { id: 'books', name: 'Books', icon: '📚' },
  { id: 'stationery', name: 'Stationery', icon: '✏️' },
  { id: 'dresses', name: 'Kids Dresses', icon: '👕' },
];

export default function StoreAdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  // Sync category if URL parameter changes
  useEffect(() => {
    const currentParam = searchParams.get('category') || 'all';
    if (currentParam !== activeCategory) {
      setActiveCategory(currentParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, [activeCategory]);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const cat = activeCategory === 'all' ? '' : activeCategory;
      const data = await adminGetProducts(cat);
      setProducts(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }

  const handleStockSave = async (productId) => {
    try {
      const stockNum = parseInt(newStockValue, 10);
      if (isNaN(stockNum) || stockNum < 0) {
        alert('Please enter a valid non-negative number for stock.');
        return;
      }
      await adminUpdateStock(productId, stockNum);
      setActionSuccess('Stock updated successfully!');
      setTimeout(() => setActionSuccess(null), 3000);
      setEditingStockId(null);
      loadProducts();
    } catch (err) {
      alert(err.message || 'Failed to update stock.');
    }
  };

  const handlePriceSave = async (productId) => {
    try {
      const priceNum = parseFloat(newPriceValue);
      if (isNaN(priceNum) || priceNum < 0) {
        alert('Please enter a valid price amount.');
        return;
      }
      await adminUpdatePrice(productId, priceNum);
      setActionSuccess('Price updated successfully!');
      setTimeout(() => setActionSuccess(null), 3000);
      setEditingPriceId(null);
      loadProducts();
    } catch (err) {
      alert(err.message || 'Failed to update price.');
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}" from the store catalog?`)) {
      return;
    }
    try {
      await adminDeleteProduct(productId);
      setActionSuccess(`Product "${productName}" was deleted.`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadProducts();
    } catch (err) {
      setError(err.message || 'Failed to delete product.');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
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
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Inventory Management</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', color: '#1e293b' }}>
            📦 Store Inventory & Products
          </h1>
          <p style={{ margin: '0.3rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
            Add, edit stock, update pricing, and manage products available for little learners.
          </p>
        </div>

        <Link
          to="/store-admin/add-product"
          className="btn btn-primary"
          style={{
            background: 'linear-gradient(135deg, #0f766e, #0d9488)',
            borderColor: '#0f766e',
            padding: '0.75rem 1.25rem',
            fontWeight: 700
          }}
        >
          ➕ Add New Product
        </Link>
      </div>

      {/* Category Pills & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setSearchParams(cat.id === 'all' ? {} : { category: cat.id });
              }}
              className="btn btn-sm"
              style={{
                background: activeCategory === cat.id ? '#0f766e' : '#f1f5f9',
                color: activeCategory === cat.id ? '#ffffff' : '#334155',
                border: 'none',
                fontWeight: 600,
                borderRadius: '9999px',
                padding: '0.45rem 1rem'
              }}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.4rem',
              borderRadius: '9999px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Action Messages */}
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

      {/* Inventory Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem', animation: 'spin 1.5s linear infinite' }}>⏳</span>
            <p style={{ margin: 0 }}>Loading inventory catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🛍️</span>
            <h3>No products found</h3>
            <p style={{ margin: '0 0 1rem 0' }}>No items match your search or filter criteria.</p>
            <Link to="/store-admin/add-product" className="btn btn-sm btn-primary">
              Add First Product
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', background: '#f8fafc' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Item</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Price ($)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Stock</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => {
                  const isOutOfStock = Number(prod.stock) <= 0;
                  const isLowStock = Number(prod.stock) > 0 && Number(prod.stock) <= 5;

                  return (
                    <tr key={prod.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* Product Name & Image */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: 'var(--radius-sm)',
                              background: '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.4rem',
                              flexShrink: 0,
                              overflow: 'hidden'
                            }}
                          >
                            {prod.image_url ? (
                              <img
                                src={prod.image_url}
                                alt={prod.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <span>
                                {prod.category === 'Toys' ? '🧸' : prod.category === 'Books' ? '📚' : prod.category === 'Stationery' ? '✏️' : '👕'}
                              </span>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{prod.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '340px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prod.description || 'Quality school learning product'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
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
                          {prod.category}
                        </span>
                      </td>

                      {/* Price (Editable inline) */}
                      <td style={{ padding: '1rem' }}>
                        {editingPriceId === prod.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                              type="number"
                              step="0.01"
                              value={newPriceValue}
                              onChange={(e) => setNewPriceValue(e.target.value)}
                              style={{ width: '70px', padding: '0.25rem 0.4rem', borderRadius: '4px', border: '1px solid #0f766e' }}
                            />
                            <button
                              onClick={() => handlePriceSave(prod.id)}
                              className="btn btn-sm"
                              style={{ background: '#0f766e', color: '#fff', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingPriceId(null)}
                              className="btn btn-sm"
                              style={{ background: '#e2e8f0', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.98rem' }}>
                              ${Number(prod.price).toFixed(2)}
                            </span>
                            <button
                              onClick={() => {
                                setEditingPriceId(prod.id);
                                setNewPriceValue(String(prod.price));
                              }}
                              title="Edit Price"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '0.85rem' }}
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Stock (Editable inline) */}
                      <td style={{ padding: '1rem' }}>
                        {editingStockId === prod.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                              type="number"
                              value={newStockValue}
                              onChange={(e) => setNewStockValue(e.target.value)}
                              style={{ width: '60px', padding: '0.25rem 0.4rem', borderRadius: '4px', border: '1px solid #0f766e' }}
                            />
                            <button
                              onClick={() => handleStockSave(prod.id)}
                              className="btn btn-sm"
                              style={{ background: '#0f766e', color: '#fff', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="btn btn-sm"
                              style={{ background: '#e2e8f0', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>
                              {prod.stock} units
                            </span>
                            <button
                              onClick={() => {
                                setEditingStockId(prod.id);
                                setNewStockValue(String(prod.stock));
                              }}
                              title="Update Stock Count"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '0.85rem' }}
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem' }}>
                        {isOutOfStock ? (
                          <span className="badge badge-danger">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="badge badge-warning">Low Stock ({prod.stock})</span>
                        ) : (
                          <span className="badge badge-success">In Stock</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setEditingStockId(prod.id);
                              setNewStockValue(String(prod.stock));
                            }}
                            className="btn btn-sm btn-outline"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                          >
                            📦 Stock
                          </button>
                          <button
                            onClick={() => {
                              setEditingPriceId(prod.id);
                              setNewPriceValue(String(prod.price));
                            }}
                            className="btn btn-sm btn-outline"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                          >
                            💲 Price
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="btn btn-sm"
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              fontSize: '0.8rem',
                              padding: '0.3rem 0.6rem'
                            }}
                            title="Delete Product"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
