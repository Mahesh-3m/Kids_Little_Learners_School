import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addStudent } from '../services/api';
import StudentForm from '../components/StudentForm';

export default function AddStudent() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await addStudent(formData);
      navigate('/students', { state: { message: `Student ${formData.name} added successfully! 🌟` } });
    } catch (err) {
      setError(err.message || 'Failed to add student. Please check the form data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-title-group">
          <h1 className="form-main-title">
            <span>✨</span> Enroll New Student
          </h1>
          <p className="form-subtitle">
            Enter the child's admission details, class allocation, and parent contact info
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <StudentForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Enroll Student"
        />
      </div>
    </div>
  );
}
