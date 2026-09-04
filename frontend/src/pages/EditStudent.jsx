import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudent, updateStudent } from '../services/api';
import StudentForm from '../components/StudentForm';

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStudent() {
      setLoading(true);
      setError(null);
      try {
        const data = await getStudent(id);
        setStudent(data);
      } catch (err) {
        setError(err.message || 'Failed to load student details');
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updateStudent(id, formData);
      navigate('/teacher/students', { state: { message: `Student ${formData.name} updated successfully! ✨` } });
    } catch (err) {
      setError(err.message || 'Failed to update student details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <p className="spinner-text">Loading student information...</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-title-group">
          <h1 className="form-main-title">
            <span>✏️</span> Edit Student Profile
          </h1>
          <p className="form-subtitle">
            Update personal information, class grade, or contact numbers for {student?.name || 'student'}
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {student && (
          <StudentForm
            initialData={student}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update Student Record"
          />
        )}
      </div>
    </div>
  );
}
