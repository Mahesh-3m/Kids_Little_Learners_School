import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { adminAddProduct } from '../services/api';
import '../css/parent.css';

const PRESET_CATEGORIES = ['Toys', 'Books', 'Stationery', 'Kids Dresses', 'General'];

export default function StoreAdminAddProduct() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryCat = (searchParams.get('category') || '').toLowerCase();

  let initialCat = 'Toys';
  if (queryCat.includes('book')) initialCat = 'Books';
  else if (queryCat.includes('station')) initialCat = 'Stationery';
  else if (queryCat.includes('dress')) initialCat = 'Kids Dresses';
  else if (queryCat.includes('toy')) initialCat = 'Toys';

  const [name, setName] = useState('');
  const [category, setCategory] = useState(initialCat);
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const chosenCategory = category === 'Other' ? customCategory.trim() : category;
    if (!chosenCategory) {
      setError('Please provide a category for the product.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please provide a valid price greater than $0.');
      return;
    }

    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setError('Please provide a valid inventory stock count.');
      return;
    }

    setLoading(true);
    try {
      await adminAddProduct({
        name: name.trim(),
        category: chosenCategory,
        price: priceNum,
        stock: stockNum,
        image_url: imageUrl.trim() || null,
        description: description.trim()
      });

      navigate('/store-admin/products', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to add product to catalog.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '2rem auto', padding: '1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/store-admin/products" style={{ color: '#0f766e', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
          ← Back to Inventory
        </Link>
        <h1 style={{ margin: '0.5rem 0 0.2rem 0', fontSize: '1.85rem', color: '#1e293b' }}>
          ➕ Add New Store Product
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
          Catalog a new educational book, cognitive toy, stationery, or preschool item.
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
              Product Name *
            </label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Wooden Rainbow Alphabet Blocks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid #cbd5e1',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                Category *
              </label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1rem',
                  background: '#ffffff',
                  outline: 'none'
                }}
              >
                {PRESET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Other">Custom Category...</option>
              </select>
            </div>

            {category === 'Other' && (
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                  Custom Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sensory & Crafts"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                Price ($ USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                className="form-input"
                placeholder="19.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                Initial Stock Inventory *
              </label>
              <input
                type="number"
                min="0"
                required
                className="form-input"
                placeholder="20"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
              Product Image URL (Optional)
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/... or leave blank for category icon"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid #cbd5e1',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
              Description
            </label>
            <textarea
              rows="3"
              className="form-input"
              placeholder="Describe educational benefits, materials, age group, or usage instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #0f766e, #0d9488)',
                borderColor: '#0f766e'
              }}
            >
              {loading ? 'Adding Product...' : '✨ Save Product to Store'}
            </button>
            <Link to="/store-admin/products" className="btn btn-outline" style={{ padding: '0.85rem 1.5rem' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
