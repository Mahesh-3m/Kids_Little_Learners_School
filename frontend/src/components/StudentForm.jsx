import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/forms.css';

export default function StudentForm({ initialData = {}, onSubmit, isSubmitting = false, submitLabel = "Save Student" }) {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    class_name: 'Nursery',
    gender: 'Male',
    parent_name: '',
    phone: '',
    address: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Ensure dob is formatted YYYY-MM-DD for date input if it contains ISO timestamp
        dob: initialData.dob ? initialData.dob.split('T')[0] : ''
      }));
    }
  }, [initialData]);

  const validate = (dataToValidate = formData) => {
    const errs = {};

    if (!dataToValidate.name || !dataToValidate.name.trim()) {
      errs.name = "Student name is required";
    } else if (dataToValidate.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    }

    if (!dataToValidate.dob) {
      errs.dob = "Date of birth is required";
    } else {
      const birthDate = new Date(dataToValidate.dob);
      const today = new Date();
      if (birthDate > today) {
        errs.dob = "Date of birth cannot be in the future";
      }
    }

    if (!dataToValidate.class_name) {
      errs.class_name = "Class is required";
    }

    if (!dataToValidate.gender) {
      errs.gender = "Gender is required";
    }

    if (!dataToValidate.parent_name || !dataToValidate.parent_name.trim()) {
      errs.parent_name = "Parent name is required";
    }

    if (!dataToValidate.phone || !dataToValidate.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^[0-9+\s-]{7,15}$/.test(dataToValidate.phone.trim())) {
      errs.phone = "Please enter a valid phone number (7-15 digits)";
    }

    if (!dataToValidate.address || !dataToValidate.address.trim()) {
      errs.address = "Address is required";
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (touched[name]) {
        const validationErrors = validate(updated);
        setErrors(validationErrors);
      }
      return updated;
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const validationErrors = validate();
    setErrors(validationErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mark all fields as touched
    setTouched({
      name: true,
      dob: true,
      class_name: true,
      gender: true,
      parent_name: true,
      phone: true,
      address: true
    });

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <form className="student-form" onSubmit={handleSubmit} noValidate>
      {/* Student Name */}
      <div className="form-group">
        <label className="form-label" htmlFor="name">
          <span>👶</span> Student Full Name <span className="required-star">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Aarav Sharma"
          className={`form-input ${touched.name && errors.name ? 'input-error' : ''}`}
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.name && errors.name && <div className="field-error">⚠️ {errors.name}</div>}
      </div>

      {/* DOB & Gender Row */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="dob">
            <span>🎂</span> Date of Birth <span className="required-star">*</span>
          </label>
          <input
            id="dob"
            name="dob"
            type="date"
            className={`form-input ${touched.dob && errors.dob ? 'input-error' : ''}`}
            value={formData.dob}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.dob && errors.dob && <div className="field-error">⚠️ {errors.dob}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>🚻</span> Gender <span className="required-star">*</span>
          </label>
          <div className="radio-pill-group">
            {['Male', 'Female', 'Other'].map(g => (
              <label 
                key={g} 
                className={`radio-pill-label ${formData.gender === g ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={formData.gender === g}
                  onChange={handleChange}
                />
                <span>{g === 'Male' ? '👦 Boy' : g === 'Female' ? '👧 Girl' : '🌟 Other'}</span>
              </label>
            ))}
          </div>
          {touched.gender && errors.gender && <div className="field-error">⚠️ {errors.gender}</div>}
        </div>
      </div>

      {/* Class Selection */}
      <div className="form-group">
        <label className="form-label">
          <span>🏫</span> Enrolled Class <span className="required-star">*</span>
        </label>
        <div className="radio-pill-group">
          {[
            { name: 'Nursery', icon: '👶', desc: 'Ages 2.5 - 3.5' },
            { name: 'LKG', icon: '🌟', desc: 'Ages 3.5 - 4.5' },
            { name: 'UKG', icon: '🚀', desc: 'Ages 4.5 - 5.5' }
          ].map(c => (
            <label 
              key={c.name} 
              className={`radio-pill-label ${formData.class_name === c.name ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="class_name"
                value={c.name}
                checked={formData.class_name === c.name}
                onChange={handleChange}
              />
              <span>{c.icon} {c.name}</span>
            </label>
          ))}
        </div>
        {touched.class_name && errors.class_name && <div className="field-error">⚠️ {errors.class_name}</div>}
      </div>

      {/* Parent Name & Phone Row */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="parent_name">
            <span>👨‍👩‍👦</span> Parent / Guardian Name <span className="required-star">*</span>
          </label>
          <input
            id="parent_name"
            name="parent_name"
            type="text"
            placeholder="e.g. Rohit Sharma"
            className={`form-input ${touched.parent_name && errors.parent_name ? 'input-error' : ''}`}
            value={formData.parent_name}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.parent_name && errors.parent_name && <div className="field-error">⚠️ {errors.parent_name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="phone">
            <span>📞</span> Contact Phone <span className="required-star">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="e.g. 9876543210"
            className={`form-input ${touched.phone && errors.phone ? 'input-error' : ''}`}
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.phone && errors.phone && <div className="field-error">⚠️ {errors.phone}</div>}
        </div>
      </div>

      {/* Address */}
      <div className="form-group">
        <label className="form-label" htmlFor="address">
          <span>📍</span> Residential Address <span className="required-star">*</span>
        </label>
        <textarea
          id="address"
          name="address"
          rows="3"
          placeholder="e.g. Plot 12, Jubilee Hills, Hyderabad"
          className={`form-textarea ${touched.address && errors.address ? 'input-error' : ''}`}
          value={formData.address}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.address && errors.address && <div className="field-error">⚠️ {errors.address}</div>}
      </div>

      {/* Action Buttons */}
      <div className="form-actions">
        <Link to="/students" className="btn btn-outline">
          Cancel
        </Link>
        <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : `✨ ${submitLabel}`}
        </button>
      </div>
    </form>
  );
}
