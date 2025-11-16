import React, { useState } from 'react';

/**
 * NPCPanel - NPC relationships display
 * 
 * Shows:
 * - NPC list
 * - Relationship bars (-100 to +100)
 * - Alive/dead status
 * - Memory indicators
 * - Betrayal risk (hidden)
 */

const NPCPanel = ({ npcs, relationships }) => {
  const [expandedNpc, setExpandedNpc] = useState(null);

  // Get relationship color
  const getRelationshipColor = (value) => {
    if (value >= 50) return '#2ecc71'; // Green (ally)
    if (value >= 0) return '#3498db'; // Blue (neutral)
    if (value >= -50) return '#f39c12'; // Orange (unfriendly)
    return '#e74c3c'; // Red (enemy)
  };

  // Get relationship label
  const getRelationshipLabel = (value) => {
    if (value >= 75) return 'Trusted Ally';
    if (value >= 50) return 'Ally';
    if (value >= 25) return 'Friendly';
    if (value >= 0) return 'Neutral';
    if (value >= -25) return 'Unfriendly';
    if (value >= -50) return 'Hostile';
    if (value >= -75) return 'Enemy';
    return 'Sworn Enemy';
  };

  // Get status emoji
  const getStatusEmoji = (npc) => {
    if (!npc.alive) return '💀';
    if (npc.betrayed) return '🗡️';
    if (npc.imprisoned) return '⛓️';
    return '✅';
  };

  // Toggle NPC details
  const toggleNpcDetails = (npcId) => {
    setExpandedNpc(expandedNpc === npcId ? null : npcId);
  };

  // Filter and sort NPCs
  const npcList = Object.values(npcs || {})
    .sort((a, b) => {
      // Alive NPCs first
      if (a.alive && !b.alive) return -1;
      if (!a.alive && b.alive) return 1;
      
      // Then by relationship value
      const relA = relationships?.[a.id] || 0;
      const relB = relationships?.[b.id] || 0;
      return relB - relA;
    });

  return (
    <div className="npc-panel">
      <div className="panel-header">
        <h3>Relationships</h3>
        <span className="npc-count">{npcList.filter(n => n.alive).length} alive</span>
      </div>

      <div className="npc-list">
        {npcList.length === 0 ? (
          <div className="empty-state">
            <p>No characters encountered yet</p>
          </div>
        ) : (
          npcList.map(npc => {
            const relationshipValue = relationships?.[npc.id] || 0;
            const relationshipPercent = ((relationshipValue + 100) / 200) * 100;
            const isExpanded = expandedNpc === npc.id;

            return (
              <div 
                key={npc.id} 
                className={`npc-card ${!npc.alive ? 'dead' : ''} ${isExpanded ? 'expanded' : ''}`}
              >
                <div 
                  className="npc-header"
                  onClick={() => toggleNpcDetails(npc.id)}
                >
                  <div className="npc-info">
                    <span className="npc-status">{getStatusEmoji(npc)}</span>
                    <span className="npc-name">{npc.name}</span>
                  </div>
                  <div className="npc-relationship-value">
                    <span className={relationshipValue >= 0 ? 'positive' : 'negative'}>
                      {relationshipValue > 0 ? '+' : ''}{relationshipValue}
                    </span>
                  </div>
                </div>

                {/* Relationship bar */}
                <div className="relationship-bar-container">
                  <div className="relationship-bar">
                    <div className="relationship-midpoint" />
                    <div 
                      className="relationship-fill"
                      style={{ 
                        width: `${relationshipPercent}%`,
                        backgroundColor: getRelationshipColor(relationshipValue)
                      }}
                    />
                  </div>
                  <span 
                    className="relationship-label"
                    style={{ color: getRelationshipColor(relationshipValue) }}
                  >
                    {getRelationshipLabel(relationshipValue)}
                  </span>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="npc-details">
                    {/* Role */}
                    {npc.role && (
                      <div className="npc-detail-item">
                        <span className="detail-label">Role:</span>
                        <span className="detail-value">{npc.role}</span>
                      </div>
                    )}

                    {/* Status */}
                    <div className="npc-detail-item">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">
                        {!npc.alive && 'Deceased'}
                        {npc.alive && npc.betrayed && 'Betrayed'}
                        {npc.alive && npc.imprisoned && 'Imprisoned'}
                        {npc.alive && !npc.betrayed && !npc.imprisoned && 'Active'}
                      </span>
                    </div>

                    {/* Personality */}
                    {npc.personality && (
                      <div className="npc-detail-item">
                        <span className="detail-label">Personality:</span>
                        <span className="detail-value">{npc.personality}</span>
                      </div>
                    )}

                    {/* Last interaction */}
                    {npc.lastInteraction && (
                      <div className="npc-detail-item">
                        <span className="detail-label">Last seen:</span>
                        <span className="detail-value">Turn {npc.lastInteraction}</span>
                      </div>
                    )}

                    {/* Memory count */}
                    {npc.memory && npc.memory.length > 0 && (
                      <div className="npc-detail-item">
                        <span className="detail-label">Memories:</span>
                        <span className="detail-value">{npc.memory.length} events</span>
                      </div>
                    )}

                    {/* Description */}
                    {npc.description && (
                      <div className="npc-description">
                        <p>{npc.description}</p>
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
      </div>
    </div>
  );
};

export default NPCPanel;