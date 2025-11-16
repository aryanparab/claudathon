import React, { useState, useEffect } from 'react';

/**
 * ProfilePanel - Player personality profile
 * 
 * HIDDEN until turn 25!
 * Shows:
 * - Personality breakdown
 * - Dominant archetype
 * - Trait bars
 * - Reveal animation
 */

const ProfilePanel = ({ profile, turn, isRevealed }) => {
  const [showReveal, setShowReveal] = useState(false);
  const [hasBeenRevealed, setHasBeenRevealed] = useState(false);

  // Trigger reveal animation at turn 25
  useEffect(() => {
    if (isRevealed && !hasBeenRevealed) {
      setShowReveal(true);
      setHasBeenRevealed(true);
      
      // Hide reveal animation after 3 seconds
      setTimeout(() => {
        setShowReveal(false);
      }, 3000);
    }
  }, [isRevealed, hasBeenRevealed]);

  // Personality archetype definitions
  const ARCHETYPES = {
    'the-conqueror': { emoji: '⚔️', color: '#e74c3c', name: 'The Conqueror' },
    'the-diplomat': { emoji: '🤝', color: '#3498db', name: 'The Diplomat' },
    'the-shadow': { emoji: '🎭', color: '#9b59b6', name: 'The Shadow' },
    'the-guardian': { emoji: '🛡️', color: '#2ecc71', name: 'The Guardian' },
    'the-tyrant': { emoji: '👑', color: '#e67e22', name: 'The Tyrant' },
    'the-sage': { emoji: '📚', color: '#1abc9c', name: 'The Sage' },
    'the-rebel': { emoji: '🔥', color: '#e74c3c', name: 'The Rebel' },
    'the-merchant': { emoji: '💰', color: '#f39c12', name: 'The Merchant' }
  };

  // Get trait color based on value
  const getTraitColor = (value) => {
    if (value >= 70) return '#2ecc71'; // Green
    if (value >= 40) return '#f39c12'; // Orange
    return '#e74c3c'; // Red
  };

  // Calculate dominant archetype
  const getDominantArchetype = () => {
    if (!profile || !profile.traits) return null;

    const { aggressive, diplomatic, cunning, cautious } = profile.traits;

    if (aggressive > 60 && cunning > 50) return 'the-tyrant';
    if (aggressive > 60) return 'the-conqueror';
    if (diplomatic > 60 && cautious > 50) return 'the-sage';
    if (diplomatic > 60) return 'the-diplomat';
    if (cunning > 60 && aggressive > 50) return 'the-shadow';
    if (cunning > 60) return 'the-merchant';
    if (cautious > 60) return 'the-guardian';
    
    return 'the-rebel'; // Balanced or unpredictable
  };

  const traits = profile?.traits || {
    aggressive: 50,
    diplomatic: 50,
    cunning: 50,
    cautious: 50
  };

  const archetype = getDominantArchetype();
  const archetypeData = archetype ? ARCHETYPES[archetype] : null;

  // Before turn 25, show locked panel
  if (!isRevealed) {
    const turnsRemaining = 25 - turn;
    
    return (
      <div className="profile-panel locked">
        <div className="panel-header">
          <h3>Your Profile</h3>
          <span className="locked-icon">🔒</span>
        </div>
        <div className="locked-content">
          <div className="locked-message">
            <p className="locked-title">Profile Locked</p>
            <p className="locked-text">
              Your true nature remains hidden...
            </p>
            <div className="unlock-countdown">
              <span className="countdown-number">{turnsRemaining}</span>
              <span className="countdown-label">turns until reveal</span>
            </div>
          </div>
          <div className="locked-silhouette">
            <div className="silhouette-icon">❓</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-panel revealed">
      {/* Reveal animation overlay */}
      {showReveal && (
        <div className="reveal-overlay">
          <div className="reveal-content">
            <h2 className="reveal-title">Your True Nature Revealed!</h2>
            {archetypeData && (
              <div className="reveal-archetype">
                <span className="reveal-emoji">{archetypeData.emoji}</span>
                <span className="reveal-name">{archetypeData.name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="panel-header">
        <h3>Your Profile</h3>
        <span className="unlocked-icon">🔓</span>
      </div>

      <div className="profile-content">
        {/* Dominant archetype */}
        {archetypeData && (
          <div className="archetype-display">
            <div 
              className="archetype-badge"
              style={{ 
                borderColor: archetypeData.color,
                backgroundColor: `${archetypeData.color}15`
              }}
            >
              <span className="archetype-emoji">{archetypeData.emoji}</span>
              <span 
                className="archetype-name"
                style={{ color: archetypeData.color }}
              >
                {archetypeData.name}
              </span>
            </div>
          </div>
        )}

        {/* Personality traits */}
        <div className="traits-display">
          <h4 className="traits-title">Personality Traits</h4>
          
          <div className="trait-bars">
            {/* Aggressive */}
            <div className="trait-item">
              <div className="trait-label">
                <span className="trait-icon">⚔️</span>
                <span className="trait-name">Aggressive</span>
                <span className="trait-value">{traits.aggressive}%</span>
              </div>
              <div className="trait-bar">
                <div 
                  className="trait-fill"
                  style={{ 
                    width: `${traits.aggressive}%`,
                    backgroundColor: getTraitColor(traits.aggressive)
                  }}
                />
              </div>
            </div>

            {/* Diplomatic */}
            <div className="trait-item">
              <div className="trait-label">
                <span className="trait-icon">🤝</span>
                <span className="trait-name">Diplomatic</span>
                <span className="trait-value">{traits.diplomatic}%</span>
              </div>
              <div className="trait-bar">
                <div 
                  className="trait-fill"
                  style={{ 
                    width: `${traits.diplomatic}%`,
                    backgroundColor: getTraitColor(traits.diplomatic)
                  }}
                />
              </div>
            </div>

            {/* Cunning */}
            <div className="trait-item">
              <div className="trait-label">
                <span className="trait-icon">🎭</span>
                <span className="trait-name">Cunning</span>
                <span className="trait-value">{traits.cunning}%</span>
              </div>
              <div className="trait-bar">
                <div 
                  className="trait-fill"
                  style={{ 
                    width: `${traits.cunning}%`,
                    backgroundColor: getTraitColor(traits.cunning)
                  }}
                />
              </div>
            </div>

            {/* Cautious */}
            <div className="trait-item">
              <div className="trait-label">
                <span className="trait-icon">🛡️</span>
                <span className="trait-name">Cautious</span>
                <span className="trait-value">{traits.cautious}%</span>
              </div>
              <div className="trait-bar">
                <div 
                  className="trait-fill"
                  style={{ 
                    width: `${traits.cautious}%`,
                    backgroundColor: getTraitColor(traits.cautious)
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats summary */}
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-label">Choices Made</span>
            <span className="stat-value">{turn}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Dominant Trait</span>
            <span className="stat-value">
              {Object.entries(traits).reduce((a, b) => traits[a[0]] > traits[b[0]] ? a : b)[0]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;