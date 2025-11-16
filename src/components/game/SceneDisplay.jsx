import React, { useEffect, useRef } from 'react';

/**
 * SceneDisplay - Story narration and scene description
 * 
 * Shows:
 * - Scene description (narration)
 * - Current location
 * - Atmosphere
 * - NPC presence
 * - Quest hints
 */

const SceneDisplay = ({ scene, turn, location, atmosphere, isProcessing }) => {
  const sceneRef = useRef(null);

  // Auto-scroll to new scene content
  useEffect(() => {
    if (sceneRef.current && !isProcessing) {
      sceneRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [turn, isProcessing]);

  // Get atmosphere emoji
  const getAtmosphereEmoji = (atm) => {
    const atmosphereMap = {
      'peaceful': '🕊️',
      'tense': '⚡',
      'mysterious': '🌙',
      'dangerous': '⚔️',
      'chaotic': '🌪️',
      'hopeful': '🌅',
      'dark': '🌑',
      'festive': '🎭',
      'somber': '🕯️',
      'energetic': '✨'
    };
    return atmosphereMap[atm?.toLowerCase()] || '🎭';
  };

  // Get location emoji
  const getLocationEmoji = (loc) => {
    const locationMap = {
      'throne room': '👑',
      'dungeon': '⛓️',
      'forest': '🌲',
      'castle': '🏰',
      'village': '🏘️',
      'tavern': '🍺',
      'battlefield': '⚔️',
      'temple': '⛪',
      'market': '🏪',
      'chamber': '🚪'
    };
    
    const lowerLoc = loc?.toLowerCase() || '';
    for (const [key, emoji] of Object.entries(locationMap)) {
      if (lowerLoc.includes(key)) return emoji;
    }
    return '📍';
  };

  const sceneDescription = scene.description || "The Council awaits your next move...";
  const sceneNpcs = scene.npcsPresent || [];
  const sceneHints = scene.questHints || [];

  return (
    <div className="scene-display" ref={sceneRef}>
      {/* Location and atmosphere bar */}
      <div className="scene-header">
        <div className="location-badge">
          <span className="location-emoji">{getLocationEmoji(location)}</span>
          <span className="location-name">{location || "Unknown Location"}</span>
        </div>

        <div className="atmosphere-badge">
          <span className="atmosphere-emoji">{getAtmosphereEmoji(atmosphere)}</span>
          <span className="atmosphere-name">{atmosphere || "Neutral"}</span>
        </div>

        <div className="turn-badge">
          Turn {turn}
        </div>
      </div>

      {/* Main scene description */}
      <div className="scene-content">
        <div className="scene-narration">
          {sceneDescription.split('\n').map((paragraph, idx) => (
            <p key={idx} className="narration-paragraph">
              {paragraph}
            </p>
          ))}
        </div>

        {/* NPCs present indicator */}
        {sceneNpcs.length > 0 && (
          <div className="scene-npcs">
            <div className="scene-section-header">
              <span className="section-icon">👥</span>
              <span>Present</span>
            </div>
            <div className="npc-tags">
              {sceneNpcs.map((npc, idx) => (
                <span key={idx} className="npc-tag">
                  {npc.name || npc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quest hints */}
        {sceneHints.length > 0 && (
          <div className="scene-hints">
            <div className="scene-section-header">
              <span className="section-icon">💡</span>
              <span>Hints</span>
            </div>
            <ul className="hint-list">
              {sceneHints.map((hint, idx) => (
                <li key={idx} className="hint-item">
                  {hint}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="scene-processing">
          <div className="processing-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
          <p>The story unfolds...</p>
        </div>
      )}
    </div>
  );
};

export default SceneDisplay;