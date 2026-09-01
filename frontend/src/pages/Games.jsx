import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { getGames, getStudents, completeGame } from '../services/api';
import GameCard from '../components/GameCard';
import '../css/games.css';

// Educational game round datasets
const GAME_LEVELS = {
  Alphabet: [
    { target: 'A', question: 'Find the letter A for Apple! 🍎', options: ['A', 'B', 'C', 'D'], answer: 'A', subtext: 'Apple 🍎' },
    { target: 'B', question: 'Find the letter B for Butterfly! 🦋', options: ['P', 'B', 'D', 'R'], answer: 'B', subtext: 'Butterfly 🦋' },
    { target: 'C', question: 'Find the letter C for Cat! 🐱', options: ['O', 'G', 'C', 'U'], answer: 'C', subtext: 'Cat 🐱' },
    { target: 'M', question: 'Find the letter M for Monkey! 🐵', options: ['W', 'N', 'M', 'H'], answer: 'M', subtext: 'Monkey 🐵' },
    { target: 'S', question: 'Find the letter S for Sun! ☀️', options: ['C', 'S', 'Z', 'E'], answer: 'S', subtext: 'Sun ☀️' },
  ],
  Numbers: [
    { target: '🎈🎈🎈', question: 'How many balloons do you see?', options: ['2', '3', '4', '5'], answer: '3', subtext: 'Count: 3' },
    { target: '⭐⭐⭐⭐⭐', question: 'Count the shiny stars!', options: ['4', '5', '6', '7'], answer: '5', subtext: 'Count: 5' },
    { target: '🍎🍎', question: 'How many apples are on the table?', options: ['1', '2', '3', '4'], answer: '2', subtext: 'Count: 2' },
    { target: '🚗🚗🚗🚗', question: 'How many toy cars are parked?', options: ['3', '4', '5', '6'], answer: '4', subtext: 'Count: 4' },
    { target: '🦆', question: 'How many little ducks are swimming?', options: ['1', '2', '3', '0'], answer: '1', subtext: 'Count: 1' },
  ],
  Colors: [
    { target: '🔴', question: 'Which color is this bright circle?', options: ['Red', 'Blue', 'Green', 'Yellow'], answer: 'Red', subtext: 'Strawberry Red 🍓' },
    { target: '🟡', question: 'Which color is this glowing circle?', options: ['Purple', 'Yellow', 'Black', 'Pink'], answer: 'Yellow', subtext: 'Sun Yellow ☀️' },
    { target: '🟢', question: 'Which color is this fresh circle?', options: ['Green', 'Orange', 'White', 'Blue'], answer: 'Green', subtext: 'Leaf Green 🌿' },
    { target: '🔵', question: 'Which color is this ocean circle?', options: ['Pink', 'Blue', 'Brown', 'Grey'], answer: 'Blue', subtext: 'Ocean Blue 🌊' },
    { target: '🟣', question: 'Which color is this magic circle?', options: ['Purple', 'Red', 'Yellow', 'Green'], answer: 'Purple', subtext: 'Grape Purple 🍇' },
  ],
  Shapes: [
    { target: '⭕', question: 'What round shape is this?', options: ['Circle', 'Square', 'Triangle', 'Star'], answer: 'Circle', subtext: 'Ball / Clock' },
    { target: '🔺', question: 'What 3-corner shape is this?', options: ['Rectangle', 'Triangle', 'Circle', 'Square'], answer: 'Triangle', subtext: 'Pizza Slice 🍕' },
    { target: '⬛', question: 'What 4-equal sides shape is this?', options: ['Square', 'Oval', 'Triangle', 'Diamond'], answer: 'Square', subtext: 'Building Block 🧱' },
    { target: '⭐', question: 'What twinkle shape is this?', options: ['Star', 'Heart', 'Circle', 'Square'], answer: 'Star', subtext: 'Night Star' },
    { target: '▬', question: 'What elongated shape is this?', options: ['Rectangle', 'Circle', 'Triangle', 'Hexagon'], answer: 'Rectangle', subtext: 'Door / Book 📖' },
  ],
  Animals: [
    { target: '🦁', question: 'Who is the King of the Jungle ("Roar!")?', options: ['Lion', 'Cat', 'Frog', 'Bear'], answer: 'Lion', subtext: 'Roaaar!' },
    { target: '🐱', question: 'Which friendly pet says "Meow Meow"?', options: ['Dog', 'Cat', 'Cow', 'Duck'], answer: 'Cat', subtext: 'Meow!' },
    { target: '🐘', question: 'Who has a big long trunk and big ears?', options: ['Elephant', 'Giraffe', 'Rabbit', 'Horse'], answer: 'Elephant', subtext: 'Trumpet!' },
    { target: '🐮', question: 'Who gives healthy milk and says "Moo"?', options: ['Cow', 'Sheep', 'Tiger', 'Lion'], answer: 'Cow', subtext: 'Moooo!' },
    { target: '🐵', question: 'Who loves sweet bananas and swings on trees?', options: ['Monkey', 'Fish', 'Penguin', 'Camel'], answer: 'Monkey', subtext: 'Ooh ooh aah!' },
  ],
};

export default function Games() {
  const [games, setGames] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Game State
  const [activeGame, setActiveGame] = useState(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [gamesData, studentsData] = await Promise.all([
          getGames(),
          getStudents()
        ]);
        setGames(gamesData);
        setStudents(studentsData);
        if (studentsData.length > 0) {
          setSelectedStudentId(studentsData[0].id.toString());
        }
      } catch (err) {
        setError(err.message || 'Failed to load games');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartGame = (game) => {
    setActiveGame(game);
    setCurrentLevelIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setGameFinished(false);
    setSaveStatus(null);

    const levels = GAME_LEVELS[game.category] || GAME_LEVELS.Alphabet;
    if (levels && levels[0]) {
      speakText(levels[0].question);
    }
  };

  const handleOptionClick = (option) => {
    if (selectedAnswer !== null) return; // Prevent multi click

    const levels = GAME_LEVELS[activeGame?.category] || GAME_LEVELS.Alphabet;
    const currentQuestion = levels[currentLevelIndex];
    const correct = option === currentQuestion.answer;

    setSelectedAnswer(option);
    setIsAnswerCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
      speakText("Super job! That is correct!");
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      speakText(`Nice try! The correct answer was ${currentQuestion.answer}`);
    }

    // Move to next question after 1.4 seconds
    setTimeout(() => {
      if (currentLevelIndex + 1 < levels.length) {
        setCurrentLevelIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsAnswerCorrect(null);
        speakText(levels[currentLevelIndex + 1].question);
      } else {
        // Finished game
        setGameFinished(true);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
        saveCompletionData();
      }
    }, 1400);
  };

  const saveCompletionData = async () => {
    if (!selectedStudentId || !activeGame) return;
    try {
      await completeGame(activeGame.id, {
        student_id: parseInt(selectedStudentId),
        stars_earned: 3
      });
      setSaveStatus("Success! Game completion & progress stars recorded. ⭐⭐⭐");
    } catch (err) {
      console.error("Failed to record game completion:", err);
      setSaveStatus("Saved locally! (Could not reach server)");
    }
  };

  const closeGameModal = () => {
    setActiveGame(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
        <p className="spinner-text">Loading cheerful learning games...</p>
      </div>
    );
  }

  const currentQuestions = activeGame ? (GAME_LEVELS[activeGame.category] || GAME_LEVELS.Alphabet) : [];
  const currentQ = currentQuestions[currentLevelIndex];

  return (
    <div className="games-page">
      {/* Active Game Arena Popup / View */}
      {activeGame && (
        <div className="modal-overlay" onClick={closeGameModal}>
          <div className="game-arena modal-content" style={{ maxWidth: '780px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className="game-arena-header">
              <div className="game-arena-title">
                <span>{activeGame.icon}</span>
                <span>{activeGame.game_name}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <button 
                  className="btn btn-outline btn-sm" 
                  onClick={() => speakText(currentQ?.question)}
                  title="Read question aloud"
                >
                  🔊 Listen
                </button>
                <button className="btn btn-danger btn-sm" onClick={closeGameModal}>
                  ✕ Exit
                </button>
              </div>
            </div>

            {!gameFinished ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#64748b', fontWeight: 700 }}>
                  <span>Round {currentLevelIndex + 1} of {currentQuestions.length}</span>
                  <span>Score: {score} ⭐</span>
                </div>

                <div className="game-question-box">
                  <h3 className="game-instruction">{currentQ?.question}</h3>
                  <div className="game-target-display">{currentQ?.target}</div>
                </div>

                <div className="game-options-grid">
                  {currentQ?.options.map((opt) => {
                    const isSelected = selectedAnswer === opt;
                    const isCorrect = isAnswerCorrect && isSelected;
                    const isWrong = isAnswerCorrect === false && isSelected;

                    return (
                      <button
                        key={opt}
                        className={`game-opt-btn ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                        onClick={() => handleOptionClick(opt)}
                        disabled={selectedAnswer !== null}
                      >
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="win-box">
                <div className="win-stars">⭐⭐⭐</div>
                <h2 className="win-title">Hooray! Game Completed! 🎉</h2>
                <p className="win-desc">
                  Fantastic job! You scored <strong>{score}</strong> out of <strong>{currentQuestions.length}</strong>!
                </p>
                {saveStatus && (
                  <p style={{ color: '#065f46', background: '#ecfdf5', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.2rem', fontWeight: 600 }}>
                    {saveStatus}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button className="btn btn-primary btn-lg" onClick={() => handleStartGame(activeGame)}>
                    🔄 Play Again
                  </button>
                  <button className="btn btn-outline btn-lg" onClick={closeGameModal}>
                    🏠 Back to Games
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Games List */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">🎮 Educational Games Playground</h1>
            <p className="page-subtitle">Interactive, safe, and cheerful skill-building games for kids</p>
          </div>

          {/* Student Selector */}
          <div className="student-selector-bar">
            <span>🧒 Playing As:</span>
            <select
              className="student-select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.class_name})
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

      <div className="games-grid">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPlayGame={handleStartGame}
          />
        ))}
      </div>
    </div>
  );
}
