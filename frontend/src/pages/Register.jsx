import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { parentRegister, getStudents } from '../services/api';
import '../css/parent.css';

export default function Register() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    student_id: '',
    child_name: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Load existing enrolled students for easy linking
  useEffect(() => {
    async function loadStudentsList() {
      try {
        const students = await getStudents();
        if (Array.isArray(students)) {
          setAvailableStudents(students);
        }
      } catch (err) {
        // Non-fatal, student linking is optional
        console.log("Students lookup notice:", err.message);
      }
    }
    loadStudentsList();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user modifies fields
    if (error) setError(null);
  };

  const handleStudentSelect = (e) => {
    const selectedId = e.target.value;
    const found = availableStudents.find(s => String(s.id) === String(selectedId));
    setFormData(prev => ({
      ...prev,
      student_id: selectedId,
      child_name: found ? found.name : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Client-side validations
    if (!formData.name.trim()) {
      setError("Please enter your Full Name.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@') || !formData.email.includes('.')) {
      setError("Please provide a valid email address.");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        student_id: formData.student_id ? parseInt(formData.student_id) : undefined,
        child_name: formData.child_name.trim() || undefined
      };

      const res = await parentRegister(payload);
      setSuccessMsg(res.message || "Account created successfully! Redirecting...");
      
      // Navigate to dashboard after short celebration
      setTimeout(() => {
        navigate('/parent/dashboard');
      }, 1000);

    } catch (err) {
      setError(err.message || "Registration failed. Please verify your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '560px',
      margin: '2rem auto',
      padding: '1rem'
    }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{ fontSize: '3.8rem', marginBottom: '0.4rem', animation: 'bounce 2s infinite' }}>
            🌟
          </div>
          <h1 style={{
            fontSize: '2.2rem',
            background: 'linear-gradient(135deg, #4f46e5, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.3rem',
            fontFamily: 'var(--font-heading)'
          }}>
            Create Parent Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 600 }}>
            Join Little Learners to track & celebrate your child's learning journey 🌈
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.2rem' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: '1.2rem' }}>
            <span>🎉</span> {successMsg}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.35rem' }}>
              Parent / Guardian Full Name <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <input 
              type="text"
              name="name"
              required
              className="form-input"
              placeholder="e.g. Ramesh Kumar"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid #cbd5e1',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: 'var(--font-body)'
              }}
            />
          </div>

          {/* Email Address */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.35rem' }}>
              Email Address <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <input 
              type="email"
              name="email"
              required
              className="form-input"
              placeholder="e.g. ramesh@example.com"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid #cbd5e1',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: 'var(--font-body)'
              }}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.35rem' }}>
              Phone Number <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>(Optional)</span>
            </label>
            <input 
              type="tel"
              name="phone"
              className="form-input"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid #cbd5e1',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: 'var(--font-body)'
              }}
            />
          </div>

          {/* Optional: Link Registered Child */}
          {availableStudents.length > 0 && (
            <div style={{
              background: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem', color: '#334155', marginBottom: '0.35rem' }}>
                <span>👶</span> Link Your Enrolled Child <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>(Optional)</span>
              </label>
              <select
                name="student_id"
                value={formData.student_id}
                onChange={handleStudentSelect}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.95rem',
                  outline: 'none',
                  background: 'white',
                  fontFamily: 'var(--font-body)'
                }}
              >
                <option value="">-- Select Child (or link later in Dashboard) --</option>
                {availableStudents.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.class_name}) - Parent: {student.parent_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Password with Toggle */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.35rem' }}>
              Password <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className="form-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 2.75rem 0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid #cbd5e1',
                  fontSize: '1rem',
                  outline: 'none',
                  fontFamily: 'var(--font-body)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  color: '#64748b'
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.35rem' }}>
              Confirm Password <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                className="form-input"
                placeholder="Re-type your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 2.75rem 0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid #cbd5e1',
                  fontSize: '1rem',
                  outline: 'none',
                  fontFamily: 'var(--font-body)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  color: '#64748b'
                }}
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            disabled={loading}
            style={{ width: '100%', marginTop: '0.6rem', padding: '0.85rem' }}
          >
            {loading ? '✨ Creating Your Account...' : '🚀 Register & Go to Dashboard'}
          </button>
        </form>

        {/* Switch to Login */}
        <div style={{
          marginTop: '1.6rem',
          paddingTop: '1.2rem',
          borderTop: '1.5px solid #f1f5f9',
          textAlign: 'center'
        }}>
          <p style={{ color: '#475569', fontSize: '0.98rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4f46e5', fontWeight: 800, textDecoration: 'underline' }}>
              Sign In here →
            </Link>
          </p>

          <Link to="/" style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
            ← Return to Little Learners Main Portal
          </Link>
        </div>

      </div>
    </div>
  );
}
