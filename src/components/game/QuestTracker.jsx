import React, { useState } from 'react';

/**
 * QuestTracker - Quest progress display
 * 
 * Shows:
 * - Active quests
 * - Objectives checklist
 * - Progress bars
 * - Turn timers
 * - Rewards preview
 */

const QuestTracker = ({ quests, turn }) => {
  const [expandedQuest, setExpandedQuest] = useState(null);

  // Quest status emoji
  const getQuestStatusEmoji = (quest) => {
    if (quest.completed) return '✅';
    if (quest.failed) return '❌';
    if (quest.turnsRemaining && quest.turnsRemaining <= 3) return '⏰';
    return '📜';
  };

  // Quest difficulty color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      'easy': '#2ecc71',
      'medium': '#f39c12',
      'hard': '#e74c3c',
      'legendary': '#9b59b6'
    };
    return colors[difficulty?.toLowerCase()] || '#3498db';
  };

  // Calculate quest progress
  const getQuestProgress = (quest) => {
    if (!quest.objectives || quest.objectives.length === 0) return 0;
    
    const completed = quest.objectives.filter(obj => obj.completed).length;
    return (completed / quest.objectives.length) * 100;
  };

  // Toggle quest details
  const toggleQuestDetails = (questId) => {
    setExpandedQuest(expandedQuest === questId ? null : questId);
  };

  // Filter and sort quests
  const activeQuests = Object.values(quests || {})
    .filter(q => !q.completed && !q.failed)
    .sort((a, b) => {
      // Urgent quests first (time-sensitive)
      if (a.turnsRemaining && !b.turnsRemaining) return -1;
      if (!a.turnsRemaining && b.turnsRemaining) return 1;
      if (a.turnsRemaining && b.turnsRemaining) {
        return a.turnsRemaining - b.turnsRemaining;
      }
      return 0;
    });

  const completedQuests = Object.values(quests || {})
    .filter(q => q.completed);

  const failedQuests = Object.values(quests || {})
    .filter(q => q.failed);

  return (
    <div className="quest-tracker">
      <div className="panel-header">
        <h3>Quests</h3>
        <span className="quest-count">
          {activeQuests.length} active
        </span>
      </div>

      <div className="quest-list">
        {/* Active quests */}
        {activeQuests.length === 0 ? (
          <div className="empty-state">
            <p>No active quests</p>
            <span className="empty-hint">Explore to find opportunities</span>
          </div>
        ) : (
          activeQuests.map(quest => {
            const progress = getQuestProgress(quest);
            const isExpanded = expandedQuest === quest.id;
            const isUrgent = quest.turnsRemaining && quest.turnsRemaining <= 3;

            return (
              <div 
                key={quest.id}
                className={`quest-card ${isUrgent ? 'urgent' : ''} ${isExpanded ? 'expanded' : ''}`}
              >
                <div 
                  className="quest-header"
                  onClick={() => toggleQuestDetails(quest.id)}
                >
                  <div className="quest-info">
                    <span className="quest-status">{getQuestStatusEmoji(quest)}</span>
                    <span className="quest-title">{quest.title || 'Untitled Quest'}</span>
                  </div>

                  {/* Difficulty badge */}
                  {quest.difficulty && (
                    <span 
                      className="difficulty-badge"
                      style={{ 
                        backgroundColor: getDifficultyColor(quest.difficulty),
                        opacity: 0.8 
                      }}
                    >
                      {quest.difficulty}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="quest-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: getDifficultyColor(quest.difficulty)
                      }}
                    />
                  </div>
                  <span className="progress-text">{Math.round(progress)}%</span>
                </div>

                {/* Timer (if time-sensitive) */}
                {quest.turnsRemaining && (
                  <div className={`quest-timer ${isUrgent ? 'urgent' : ''}`}>
                    <span className="timer-icon">⏰</span>
                    <span className="timer-text">
                      {quest.turnsRemaining} turns remaining
                    </span>
                  </div>
                )}

                {/* Expanded details */}
                {isExpanded && (
                  <div className="quest-details">
                    {/* Description */}
                    {quest.description && (
                      <p className="quest-description">{quest.description}</p>
                    )}

                    {/* Objectives */}
                    {quest.objectives && quest.objectives.length > 0 && (
                      <div className="quest-objectives">
                        <h4 className="objectives-title">Objectives:</h4>
                        <ul className="objectives-list">
                          {quest.objectives.map((objective, idx) => (
                            <li 
                              key={idx}
                              className={`objective-item ${objective.completed ? 'completed' : ''}`}
                            >
                              <span className="objective-checkbox">
                                {objective.completed ? '☑️' : '☐'}
                              </span>
                              <span className="objective-text">
                                {objective.description}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Rewards */}
                    {quest.rewards && (
                      <div className="quest-rewards">
                        <h4 className="rewards-title">Rewards:</h4>
                        <div className="rewards-list">
                          {quest.rewards.gold && (
                            <span className="reward-item">
                              💰 {quest.rewards.gold} gold
                            </span>
                          )}
                          {quest.rewards.items && quest.rewards.items.length > 0 && (
                            <span className="reward-item">
                              🎁 {quest.rewards.items.length} item(s)
                            </span>
                          )}
                          {quest.rewards.reputation && (
                            <span className="reward-item">
                              ⭐ +{quest.rewards.reputation} reputation
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quest giver */}
                    {quest.giver && (
                      <div className="quest-giver">
                        <span className="giver-label">Quest Giver:</span>
                        <span className="giver-name">{quest.giver}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Expand indicator */}
                <div className="expand-indicator">
                  {isExpanded ? '▲' : '▼'}
                </div>
              </div>
            );
          })
        )}

        {/* Completed quests summary */}
        {completedQuests.length > 0 && (
          <div className="quest-summary completed">
            <span className="summary-icon">✅</span>
            <span className="summary-text">
              {completedQuests.length} completed
            </span>
          </div>
        )}

        {/* Failed quests summary */}
        {failedQuests.length > 0 && (
          <div className="quest-summary failed">
            <span className="summary-icon">❌</span>
            <span className="summary-text">
              {failedQuests.length} failed
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestTracker;