import React from 'react';
import { Link } from 'react-router-dom';

export default function QuizCard({ quiz, onStartQuiz }) {
  return (
    <div className="quiz-card">
      <div>
        <div className="quiz-card-header">
          <div className="quiz-icon-box">{quiz.icon || '📝'}</div>
          <div>
            <h3 className="quiz-title">{quiz.title}</h3>
            <span className="badge badge-gender">🏷️ {quiz.category}</span>
          </div>
        </div>
        <p className="quiz-card-desc">{quiz.description}</p>
      </div>

      <div className="quiz-card-footer">
        <span className="badge badge-lkg">
          🎯 {quiz.question_count || 5} Questions
        </span>
        <button 
          onClick={() => onStartQuiz(quiz)} 
          className="btn btn-secondary btn-sm"
        >
          🚀 Start Quiz
        </button>
      </div>
    </div>
  );
}
