import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  getQuizzes, 
  getQuiz, 
  getStudents, 
  submitQuizResult,
  isTeacherAuthenticated,
  isParentAuthenticated,
  getParentChildren
} from '../services/api';
import QuizCard from '../components/QuizCard';
import '../css/quiz.css';

export default function Quiz() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [score, setScore] = useState(0);
  const [answersLog, setAnswersLog] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const quizzesData = await getQuizzes();
        setQuizzes(quizzesData);

        let studentsData = [];
        try {
          if (isTeacherAuthenticated()) {
            studentsData = await getStudents();
          } else if (isParentAuthenticated()) {
            studentsData = await getParentChildren();
          }
        } catch (sErr) {
          console.log("Students optional for quiz in guest mode:", sErr);
        }

        setStudents(studentsData || []);
        if (studentsData && studentsData.length > 0) {
          setSelectedStudentId(studentsData[0].id.toString());
        }
      } catch (err) {
        setError(err.message || 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handleStartQuiz = async (quizSummary) => {
    setLoadingQuiz(true);
    setError(null);
    try {
      const fullQuiz = await getQuiz(quizSummary.id);
      setActiveQuiz(fullQuiz);
      setCurrentQIndex(0);
      setSelectedOpt(null);
      setScore(0);
      setAnswersLog([]);
      setQuizFinished(false);
      setSaveSuccess(false);
    } catch (err) {
      setError(err.message || 'Failed to load quiz questions');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSelectOption = (option) => {
    if (selectedOpt !== null) return; // Disallow changing after choice
    setSelectedOpt(option);

    const currentQuestion = activeQuiz.questions[currentQIndex];
    const isCorrect = option === currentQuestion.correct_answer;

    if (isCorrect) {
      setScore(prev => prev + 1);
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 }
      });
    }

    setAnswersLog(prev => [
      ...prev,
      {
        questionId: currentQuestion.id,
        chosen: option,
        correct: currentQuestion.correct_answer,
        isCorrect
      }
    ]);
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < activeQuiz.questions.length) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOpt(null);
    } else {
      // Finished quiz!
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 }
    });

    const total = activeQuiz.questions.length;
    const finalScore = score + (selectedOpt === activeQuiz.questions[currentQIndex]?.correct_answer ? 0 : 0); 
    const percentage = total > 0 ? Number(((finalScore / total) * 100).toFixed(2)) : 0;

    if (selectedStudentId) {
      setSavingResult(true);
      try {
        await submitQuizResult({
          student_id: parseInt(selectedStudentId),
          quiz_id: activeQuiz.id,
          score: finalScore,
          total_questions: total,
          percentage
        });
        setSaveSuccess(true);
      } catch (err) {
        console.error("Failed to auto-submit quiz result:", err);
      } finally {
        setSavingResult(false);
      }
    }
  };

  const handleExitQuiz = () => {
    setActiveQuiz(null);
    setQuizFinished(false);
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <p className="spinner-text">Loading interactive quizzes...</p>
      </div>
    );
  }

  // Active Quiz In-Progress Screen
  if (activeQuiz) {
    const questions = activeQuiz.questions || [];
    const currentQ = questions[currentQIndex];
    const progressPct = questions.length > 0 ? ((currentQIndex + 1) / questions.length) * 100 : 0;

    if (quizFinished) {
      const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
      const wrong = questions.length - score;

      return (
        <div className="quiz-play-container">
          <div className="quiz-summary-card">
            <div className="quiz-trophy">
              {percentage >= 80 ? '🏆' : percentage >= 60 ? '🌟' : '👍'}
            </div>
            <h1 className="quiz-summary-title">
              {percentage >= 80 ? 'Outstanding Job! 🎉' : percentage >= 60 ? 'Great Effort! 🌟' : 'Keep Practicing! 💪'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
              Quiz: <strong>{activeQuiz.title}</strong>
            </p>

            <div className="quiz-stats-grid">
              <div className="quiz-stat-box">
                <div className="quiz-stat-value">{questions.length}</div>
                <div className="quiz-stat-label">Total Questions</div>
              </div>
              <div className="quiz-stat-box">
                <div className="quiz-stat-value" style={{ color: '#10b981' }}>{score}</div>
                <div className="quiz-stat-label">Correct Answers</div>
              </div>
              <div className="quiz-stat-box">
                <div className="quiz-stat-value" style={{ color: '#ef4444' }}>{wrong}</div>
                <div className="quiz-stat-label">Wrong Answers</div>
              </div>
              <div className="quiz-stat-box">
                <div className="quiz-stat-value" style={{ color: '#6366f1' }}>{percentage}%</div>
                <div className="quiz-stat-label">Score Percentage</div>
              </div>
            </div>

            {savingResult && (
              <p style={{ color: '#6366f1', marginBottom: '1.5rem', fontWeight: 600 }}>
                ⏳ Saving results to database...
              </p>
            )}

            {saveSuccess && (
              <div className="alert alert-success" style={{ justifyContent: 'center' }}>
                <span>✅ Result recorded in database & progress updated!</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => handleStartQuiz(activeQuiz)}>
                🔄 Retake Quiz
              </button>
              <Link to="/results" className="btn btn-secondary btn-lg">
                🏆 View All Results
              </Link>
              <button className="btn btn-outline btn-lg" onClick={handleExitQuiz}>
                🏠 All Quizzes
              </button>
            </div>
          </div>
        </div>
      );
    }

    const options = [
      { key: 'A', val: currentQ?.option_a },
      { key: 'B', val: currentQ?.option_b },
      { key: 'C', val: currentQ?.option_c },
      { key: 'D', val: currentQ?.option_d },
    ];

    return (
      <div className="quiz-play-container">
        {/* Progress Bar */}
        <div className="quiz-progress-bar-bg">
          <div className="quiz-progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Header Row */}
        <div className="quiz-meta-row">
          <div className="quiz-step-counter">
            Question {currentQIndex + 1} of {questions.length}
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleExitQuiz}>
            ✕ Exit Quiz
          </button>
        </div>

        {/* Question Display Box */}
        <div className="quiz-question-box">
          <h2 className="quiz-question-text">{currentQ?.question}</h2>
        </div>

        {/* Options */}
        <div className="quiz-options-list">
          {options.map(opt => {
            const isSelected = selectedOpt === opt.val;
            const isCorrect = selectedOpt !== null && opt.val === currentQ.correct_answer;
            const isWrong = isSelected && opt.val !== currentQ.correct_answer;

            let optClass = 'quiz-option-btn';
            if (isCorrect) optClass += ' correct';
            else if (isWrong) optClass += ' wrong';
            else if (isSelected) optClass += ' selected';

            return (
              <button
                key={opt.key}
                className={optClass}
                onClick={() => handleSelectOption(opt.val)}
                disabled={selectedOpt !== null}
              >
                <span className="opt-letter-tag">{opt.key}</span>
                <span>{opt.val}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback & Next Button */}
        {selectedOpt !== null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>
              {selectedOpt === currentQ.correct_answer ? (
                <span style={{ color: '#059669' }}>🎉 Brilliant! Correct Answer!</span>
              ) : (
                <span style={{ color: '#dc2626' }}>😊 Good try! The correct answer is {currentQ.correct_answer}</span>
              )}
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleNextQuestion} style={{ marginLeft: 'auto' }}>
              {currentQIndex + 1 === questions.length ? '🏁 Complete Quiz' : 'Next Question ➔'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Quiz Gallery / Category Selection
  return (
    <div className="quiz-page">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">📝 Educational Quizzes</h1>
            <p className="page-subtitle">Fun multiple-choice quizzes to assess knowledge and learning retention</p>
          </div>

          {/* Student Selector */}
          <div className="student-selector-bar">
            <span>🧒 Candidate:</span>
            <select
              className="student-select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              {students.length === 0 && (
                <option value="">Guest Learner 🌟</option>
              )}
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.class_name ? `(${s.class_name})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {loadingQuiz ? (
        <div className="spinner-container">
          <div className="spinner" />
          <p className="spinner-text">Preparing questions...</p>
        </div>
      ) : (
        <div className="quizzes-grid">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onStartQuiz={handleStartQuiz}
            />
          ))}
        </div>
      )}
    </div>
  );
}
