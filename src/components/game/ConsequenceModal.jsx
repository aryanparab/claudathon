import React, { useEffect, useState } from 'react';

/**
 * ConsequenceModal - Outcome popup after choices
 * 
 * Shows:
 * - Outcome description
 * - NPC reactions
 * - Stat changes (+/- health, gold, etc.)
 * - New items/quests
 * - Continue button
 */

const ConsequenceModal = ({ consequence, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Fade in animation
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  // Handle close with fade out
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Get change color (positive/negative)
  const getChangeColor = (value) => {
    if (value > 0) return '#2ecc71';
    if (value < 0) return '#e74c3c';
    return '#95a5a6';
  };

  // Format stat change
  const formatStatChange = (value) => {
    if (value > 0) return `+${value}`;
    return value.toString();
  };

  const {
    description,
    npcReactions = [],
    statChanges = {},
    itemsGained = [],
    itemsLost = [],
    questsStarted = [],
    questsCompleted = [],
    questsFailed = [],
    specialEvents = []
  } = consequence || {};

  return (
    <div className={`consequence-modal-overlay ${isVisible ? 'visible' : ''}`}>
      <div className="consequence-modal">
        {/* Header */}
        <div className="modal-header">
          <h2>Consequence</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Main description */}
          {description && (
            <div className="consequence-description">
              <p>{description}</p>
            </div>
          )}

          {/* Stat changes */}
          {Object.keys(statChanges).length > 0 && (
            <div className="stat-changes">
              <h3 className="section-title">Changes</h3>
              <div className="stat-grid">
                {statChanges.health && (
                  <div className="stat-item">
                    <span className="stat-icon">❤️</span>
                    <span className="stat-label">Health</span>
                    <span 
                      className="stat-value"
                      style={{ color: getChangeColor(statChanges.health) }}
                    >
                      {formatStatChange(statChanges.health)}
                    </span>
                  </div>
                )}

                {statChanges.gold && (
                  <div className="stat-item">
                    <span className="stat-icon">💰</span>
                    <span className="stat-label">Gold</span>
                    <span 
                      className="stat-value"
                      style={{ color: getChangeColor(statChanges.gold) }}
                    >
                      {formatStatChange(statChanges.gold)}
                    </span>
                  </div>
                )}

                {statChanges.reputation && (
                  <div className="stat-item">
                    <span className="stat-icon">⭐</span>
                    <span className="stat-label">Reputation</span>
                    <span 
                      className="stat-value"
                      style={{ color: getChangeColor(statChanges.reputation) }}
                    >
                      {formatStatChange(statChanges.reputation)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NPC reactions */}
          {npcReactions.length > 0 && (
            <div className="npc-reactions">
              <h3 className="section-title">Reactions</h3>
              <div className="reactions-list">
                {npcReactions.map((reaction, idx) => (
                  <div key={idx} className="reaction-item">
                    <span className="reaction-npc">{reaction.npc}</span>
                    <span className="reaction-text">{reaction.reaction}</span>
                    {reaction.relationshipChange && (
                      <span 
                        className="reaction-change"
                        style={{ color: getChangeColor(reaction.relationshipChange) }}
                      >
                        {formatStatChange(reaction.relationshipChange)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items gained */}
          {itemsGained.length > 0 && (
            <div className="items-gained">
              <h3 className="section-title">Items Gained</h3>
              <div className="item-list">
                {itemsGained.map((item, idx) => (
                  <div key={idx} className="item-badge gained">
                    <span className="item-icon">🎁</span>
                    <span className="item-name">{item.name || item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items lost */}
          {itemsLost.length > 0 && (
            <div className="items-lost">
              <h3 className="section-title">Items Lost</h3>
              <div className="item-list">
                {itemsLost.map((item, idx) => (
                  <div key={idx} className="item-badge lost">
                    <span className="item-icon">📤</span>
                    <span className="item-name">{item.name || item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quests started */}
          {questsStarted.length > 0 && (
            <div className="quests-started">
              <h3 className="section-title">New Quests</h3>
              <div className="quest-list">
                {questsStarted.map((quest, idx) => (
                  <div key={idx} className="quest-badge started">
                    <span className="quest-icon">📜</span>
                    <span className="quest-name">{quest.title || quest}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quests completed */}
          {questsCompleted.length > 0 && (
            <div className="quests-completed">
              <h3 className="section-title">Quests Completed</h3>
              <div className="quest-list">
                {questsCompleted.map((quest, idx) => (
                  <div key={idx} className="quest-badge completed">
                    <span className="quest-icon">✅</span>
                    <span className="quest-name">{quest.title || quest}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quests failed */}
          {questsFailed.length > 0 && (
            <div className="quests-failed">
              <h3 className="section-title">Quests Failed</h3>
              <div className="quest-list">
                {questsFailed.map((quest, idx) => (
                  <div key={idx} className="quest-badge failed">
                    <span className="quest-icon">❌</span>
                    <span className="quest-name">{quest.title || quest}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special events */}
          {specialEvents.length > 0 && (
            <div className="special-events">
              <h3 className="section-title">Special Events</h3>
              <div className="events-list">
                {specialEvents.map((event, idx) => (
                  <div key={idx} className="event-item">
                    <span className="event-icon">⚡</span>
                    <span className="event-text">{event}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-continue" onClick={handleClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsequenceModal;