import React from 'react';

export default function GameCard({ game, onPlayGame }) {
  const getBannerClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'alphabet':
        return 'banner-alphabet';
      case 'numbers':
        return 'banner-numbers';
      case 'colors':
        return 'banner-colors';
      case 'shapes':
        return 'banner-shapes';
      case 'animals':
        return 'banner-animals';
      default:
        return 'banner-alphabet';
    }
  };

  return (
    <div className="game-card">
      <div className={`game-card-banner ${getBannerClass(game.category)}`}>
        <div className="game-card-icon">{game.icon || '🎮'}</div>
      </div>
      <div className="game-card-body">
        <div>
          <h3 className="game-card-title">{game.game_name}</h3>
          <p className="game-card-desc">{game.description}</p>
        </div>
        <button 
          onClick={() => onPlayGame(game)} 
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
        >
          🎮 Play Now
        </button>
      </div>
    </div>
  );
}
