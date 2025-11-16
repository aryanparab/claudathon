import React, { useState, useEffect } from 'react';
import SceneDisplay from './SceneDisplay';
import ChoiceDisplay from './ChoiceDisplay';
import ProfilePanel from './ProfilePanel';
import NPCPanel from './NPCPanel';
import QuestTracker from './QuestTracker';
import InventoryPanel from './InventoryPanel';
import ConsequenceModal from './ConsequenceModal';
import '../../styles/game.css';

/**
 * GameInterface - Main game container
 * 
 * Layout:
 * - Top: Scene display (main story)
 * - Middle: Choice buttons (4 choices)
 * - Right Sidebar: Profile, NPCs, Quests, Inventory
 * - Modal: Consequence popup
 */

const GameInterface = ({ gameState, onChoice, onEndGame }) => {
  const [showConsequence, setShowConsequence] = useState(false);
  const [lastConsequence, setLastConsequence] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Stage names for display
  const STAGE_NAMES = {
    'introduction': 'Introduction',
    'rising-action': 'Rising Action',
    'midpoint': 'The Turning Point',
    'complications': 'Complications',
    'climax': 'Climax',
    'resolution': 'Resolution'
  };

  // Handle choice selection
  const handleChoiceSelect = async (choiceIndex) => {
    setIsProcessing(true);
    
    try {
      const consequence = await onChoice(choiceIndex);
      
      if (consequence) {
        setLastConsequence(consequence);
        setShowConsequence(true);
      }
    } catch (error) {
      console.error('Error processing choice:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Close consequence modal
  const handleConsequenceClose = () => {
    setShowConsequence(false);
    setLastConsequence(null);
  };

  // Check if game is over
  const isGameOver = gameState.turn >= 50 || gameState.player.health <= 0;

  // Get current scene data
  const currentScene = gameState.currentScene || {};
  const currentChoices = currentScene.choices || [];

  return (
    <div className="game-interface">
      {/* Header with game info */}
      <header className="game-header">
        <div className="game-info">
          <div className="turn-counter">
            <span className="turn-label">Turn</span>
            <span className="turn-number">{gameState.turn}</span>
            <span className="turn-max">/ 50</span>
          </div>

          <div className="stage-indicator">
            <span className="stage-icon">⚔️</span>
            <span className="stage-name">
              {STAGE_NAMES[gameState.narrativeStage] || gameState.narrativeStage}
            </span>
          </div>

          <div className="player-health">
            <span className="health-icon">❤️</span>
            <span className="health-value">{gameState.player.health}</span>
            <span className="health-max">/ 100</span>
            <div className="health-bar">
              <div 
                className="health-fill" 
                style={{ width: `${gameState.player.health}%` }}
              />
            </div>
          </div>
        </div>

        <button className="end-game-btn" onClick={onEndGame}>
          End Game
        </button>
      </header>

      {/* Main game layout */}
      <div className="game-layout">
        {/* Main content area */}
        <main className="game-main">
          {/* Scene display */}
          <SceneDisplay 
            scene={currentScene}
            turn={gameState.turn}
            location={gameState.worldState.location}
            atmosphere={gameState.worldState.atmosphere}
            isProcessing={isProcessing}
          />

          {/* Choice display */}
          {!isGameOver && (
            <ChoiceDisplay
              choices={currentChoices}
              onChoiceSelect={handleChoiceSelect}
              isProcessing={isProcessing}
              turn={gameState.turn}
            />
          )}

          {/* Game over message */}
          {isGameOver && (
            <div className="game-over-panel">
              <h2>Game Complete</h2>
              <p>
                {gameState.player.health <= 0 
                  ? "Your journey has ended..."
                  : "You've completed your journey through the Shadow Council!"}
              </p>
              <button className="btn-primary" onClick={onEndGame}>
                View Final Results
              </button>
            </div>
          )}
        </main>

        {/* Right sidebar with panels */}
        <aside className="game-sidebar">
          {/* Profile panel (hidden until turn 25) */}
          <ProfilePanel 
            profile={gameState.player.profile}
            turn={gameState.turn}
            isRevealed={gameState.turn >= 25}
          />

          {/* NPC panel */}
          <NPCPanel 
            npcs={gameState.npcs}
            relationships={gameState.player.relationships}
          />

          {/* Quest tracker */}
          <QuestTracker 
            quests={gameState.quests}
            turn={gameState.turn}
          />

          {/* Inventory panel */}
          <InventoryPanel 
            inventory={gameState.player.inventory}
            gold={gameState.player.gold}
          />
        </aside>
      </div>

      {/* Consequence modal */}
      {showConsequence && lastConsequence && (
        <ConsequenceModal
          consequence={lastConsequence}
          onClose={handleConsequenceClose}
        />
      )}

      {/* Loading overlay */}
      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-spinner">
            <div className="spinner"></div>
            <p>The Council deliberates...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameInterface;