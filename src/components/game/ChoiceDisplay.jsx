import React, { useState } from 'react';

/**
 * ChoiceDisplay - Player choice buttons
 * 
 * Features:
 * - 4 choices per turn
 * - Personality icons (hidden meaning to player)
 * - Risk indicators
 * - Hover effects
 * - Disabled state while processing
 */

const ChoiceDisplay = ({ choices, onChoiceSelect, isProcessing, turn }) => {
  const [hoveredChoice, setHoveredChoice] = useState(null);

  // Personality type icons (player doesn't know what they mean!)
  const PERSONALITY_ICONS = {
    'aggressive': '⚔️',
    'diplomatic': '🤝',
    'cunning': '🎭',
    'cautious': '🛡️',
    'heroic': '✨',
    'pragmatic': '⚖️',
    'ruthless': '💀',
    'merciful': '💝',
    'ambitious': '👑',
    'loyal': '🔗'
  };

  // Risk level indicators
  const RISK_INDICATORS = {
    'low': { emoji: '🟢', label: 'Safe' },
    'medium': { emoji: '🟡', label: 'Risky' },
    'high': { emoji: '🔴', label: 'Dangerous' },
    'unknown': { emoji: '❓', label: 'Unknown' }
  };

  // Get personality icon for choice
  const getPersonalityIcon = (choice) => {
    const personality = choice.personalityType?.toLowerCase();
    return PERSONALITY_ICONS[personality] || '🎯';
  };

  // Get risk indicator
  const getRiskIndicator = (choice) => {
    const risk = choice.risk?.toLowerCase() || 'unknown';
    return RISK_INDICATORS[risk] || RISK_INDICATORS['unknown'];
  };

  // Handle choice click
  const handleChoiceClick = (index) => {
    if (!isProcessing) {
      onChoiceSelect(index);
    }
  };

  // Default choices if none provided
  const displayChoices = choices.length > 0 ? choices : [
    { text: "Wait and observe", personalityType: "cautious", risk: "low" },
    { text: "Take action", personalityType: "aggressive", risk: "medium" },
    { text: "Seek allies", personalityType: "diplomatic", risk: "low" },
    { text: "Investigate further", personalityType: "cunning", risk: "medium" }
  ];

  return (
    <div className="choice-display">
      <div className="choice-header">
        <h3>What will you do?</h3>
        <p className="choice-subtitle">Choose wisely - your decisions shape your destiny</p>
      </div>

      <div className="choice-grid">
        {displayChoices.map((choice, index) => {
          const risk = getRiskIndicator(choice);
          const isHovered = hoveredChoice === index;
          const isDisabled = isProcessing;

          return (
            <button
              key={index}
              className={`choice-button ${isHovered ? 'hovered' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => handleChoiceClick(index)}
              onMouseEnter={() => setHoveredChoice(index)}
              onMouseLeave={() => setHoveredChoice(null)}
              disabled={isDisabled}
            >
              {/* Choice number */}
              <div className="choice-number">{index + 1}</div>

              {/* Personality icon (mysterious to player) */}
              <div className="choice-icon">
                {getPersonalityIcon(choice)}
              </div>

              {/* Choice text */}
              <div className="choice-text">
                {choice.text || `Choice ${index + 1}`}
              </div>

              {/* Risk indicator */}
              <div className="choice-footer">
                <span className="risk-indicator">
                  <span className="risk-emoji">{risk.emoji}</span>
                  <span className="risk-label">{risk.label}</span>
                </span>

                {/* Hidden consequence hints */}
                {choice.consequenceHint && isHovered && (
                  <span className="consequence-hint">
                    {choice.consequenceHint}
                  </span>
                )}
              </div>

              {/* Hover glow effect */}
              {isHovered && !isDisabled && (
                <div className="choice-glow" />
              )}
            </button>
          );
        })}
      </div>

      {/* Helper text */}
      <div className="choice-helper">
        <p className="helper-text">
          {isProcessing 
            ? "Processing your choice..." 
            : "Hover over choices to see potential outcomes"}
        </p>
      </div>
    </div>
  );
};

export default ChoiceDisplay;