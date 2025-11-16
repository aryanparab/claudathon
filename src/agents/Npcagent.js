import claudeAPI, { buildGameContext } from '../utils/claudeAPI.js';
import { AGENT_ROLES, NPC_ARCHETYPES } from '../constants/gameConfig.js';
import { createNPC, createMemoryEntry } from '../state/GameState.js';

/**
 * NPC Agent
 * Generates NPC personalities, manages memory, tracks relationships
 */

class NPCAgent {
  constructor() {
    this.role = AGENT_ROLES.NPC_PERSONALITY;
  }

  /**
   * Generate new NPC for the current scene
   * @param {object} gameState - Current game state
   * @param {object} sceneContext - Scene information
   * @returns {Promise<object>} - Generated NPC
   */
  async generateNPC(gameState, sceneContext) {
    const context = buildGameContext(gameState, 3);
    
    const prompt = claudeAPI.buildStructuredPrompt(
      `You are the NPC Agent creating a character for ${gameState.world.name}.

Current Scene: ${sceneContext.description}
Stage: ${gameState.currentStage}/5
Turn: ${gameState.currentTurn}

Create a memorable NPC that fits this world and situation. Consider:
- World theme and atmosphere
- Current stage (early/mid/late game)
- Existing NPCs (avoid duplication)
- Potential for drama/betrayal/alliance`,
      
      `Generate a new NPC character.`,
      
      {
        worldName: gameState.world.name,
        currentNPCs: gameState.npcs.map(n => ({ name: n.name, archetype: n.archetype })),
        sceneType: sceneContext.type || 'exploration',
      },
      
      {
        name: "NPC name",
        archetype: "WARRIOR|ROGUE|SAGE|MERCHANT|REBEL|NOBLE",
        description: "2-3 sentence character description",
        backstory: "relevant history",
        motivation: "what drives them",
        traits: {
          aggression: 0.5,
          caution: 0.5,
          morality: 0.5,
          loyalty: 0.5,
          greed: 0.5,
          courage: 0.5
        },
        secrets: ["secret 1", "secret 2"],
        skills: ["skill1", "skill2", "skill3"],
        canBetray: true,
        betrayalTriggers: ["what might cause betrayal"],
        questPotential: "what quests they could offer",
        inventory: ["item1", "item2"]
      }
    );

    try {
      const response = await claudeAPI.complete(prompt, { maxTokens: 1500 });
      
      if (!response.isJSON) {
        throw new Error("NPC Agent did not return valid JSON");
      }
      
      const npcData = response.parsed;
      
      // Create NPC with current turn as firstMet
      const npc = createNPC({
        ...npcData,
        firstMet: gameState.currentTurn,
        lastSeen: gameState.currentTurn,
        location: gameState.world.currentLocation,
        relationship: 0, // Start neutral
      });
      
      return npc;
      
    } catch (error) {
      console.error("NPC Agent error:", error);
      
      // Fallback NPC
      return this.generateFallbackNPC(gameState);
    }
  }

  /**
   * Update NPC based on player interaction
   * @param {object} npc - NPC to update
   * @param {object} interaction - Interaction details
   * @returns {object} - Updated NPC
   */
  updateNPCMemory(npc, interaction) {
    // Create memory entry
    const memory = createMemoryEntry({
      turn: interaction.turn,
      action: interaction.action,
      playerChoice: interaction.playerChoice,
      sentiment: interaction.sentiment,
      importance: interaction.importance,
      category: interaction.category,
      description: interaction.description,
      witnesses: interaction.witnesses || [],
    });
    
    // Update NPC
    const updatedNPC = {
      ...npc,
      memory: [...npc.memory, memory],
      lastSeen: interaction.turn,
    };
    
    // Update relationship based on sentiment
    const relationshipChange = this.calculateRelationshipChange(
      interaction.sentiment,
      interaction.importance
    );
    updatedNPC.relationship = Math.max(-100, Math.min(100, 
      npc.relationship + relationshipChange
    ));
    
    return updatedNPC;
  }

  /**
   * Calculate relationship change from interaction
   * @param {number} sentiment - Sentiment (-1 to 1)
   * @param {number} importance - Importance (0 to 1)
   * @returns {number} - Relationship change
   */
  calculateRelationshipChange(sentiment, importance) {
    // Base change: sentiment * 20 points
    // Multiplied by importance (minor actions matter less)
    const baseChange = sentiment * 20;
    const importanceMultiplier = 0.5 + (importance * 0.5); // 0.5 to 1.0
    
    return Math.round(baseChange * importanceMultiplier);
  }

  /**
   * Determine NPC's current attitude toward player
   * @param {object} npc - NPC to analyze
   * @param {object} gameState - Current game state
   * @returns {Promise<object>} - NPC attitude
   */
  async analyzeNPCAttitude(npc, gameState) {
    if (npc.memory.length === 0) {
      return {
        attitude: 'neutral',
        trustLevel: 0,
        willingToHelp: true,
        betrayalRisk: 0,
      };
    }
    
    const recentMemory = npc.memory.slice(-5);
    const context = buildGameContext(gameState, 3);
    
    const prompt = claudeAPI.buildStructuredPrompt(
      `You are analyzing NPC "${npc.name}" (${npc.archetype}) and their attitude toward the player.

NPC Traits:
${JSON.stringify(npc.traits, null, 2)}

Recent Interactions:
${JSON.stringify(recentMemory, null, 2)}

Current Relationship: ${npc.relationship} (-100 to 100)

Consider:
- NPC's personality traits
- History of interactions
- Current relationship level
- NPC's archetype tendencies`,
      
      `Determine the NPC's current attitude and intentions.`,
      
      {
        npcName: npc.name,
        npcArchetype: npc.archetype,
        relationship: npc.relationship,
        memoryCount: npc.memory.length,
      },
      
      {
        attitude: "hostile|unfriendly|neutral|friendly|trusted",
        trustLevel: 0.5,
        willingToHelp: true,
        betrayalRisk: 0.3,
        currentMood: "description of mood",
        keyMemories: ["memories affecting current attitude"],
        intentions: "what NPC plans to do regarding player"
      }
    );

    try {
      const response = await claudeAPI.complete(prompt, { maxTokens: 1000 });
      
      if (!response.isJSON) {
        throw new Error("NPC attitude analysis failed");
      }
      
      return response.parsed;
      
    } catch (error) {
      console.error("NPC attitude analysis error:", error);
      
      // Fallback based on relationship
      return this.estimateAttitudeFromRelationship(npc.relationship);
    }
  }

  /**
   * Estimate attitude from relationship value (fallback)
   * @param {number} relationship - Relationship value
   * @returns {object} - Attitude estimate
   */
  estimateAttitudeFromRelationship(relationship) {
    let attitude = 'neutral';
    if (relationship <= -60) attitude = 'hostile';
    else if (relationship <= -20) attitude = 'unfriendly';
    else if (relationship >= 60) attitude = 'trusted';
    else if (relationship >= 20) attitude = 'friendly';
    
    return {
      attitude,
      trustLevel: (relationship + 100) / 200, // 0 to 1
      willingToHelp: relationship > 0,
      betrayalRisk: Math.max(0, (-relationship + 50) / 100),
      currentMood: attitude,
      keyMemories: [],
      intentions: "Unknown",
    };
  }

  /**
   * Generate NPCs for a scene
   * @param {object} gameState - Current game state
   * @param {object} sceneContext - Scene context
   * @param {number} count - Number of NPCs to generate
   * @returns {Promise<Array>} - Generated NPCs
   */
  async generateNPCsForScene(gameState, sceneContext, count = 1) {
    const npcs = [];
    
    for (let i = 0; i < count; i++) {
      const npc = await this.generateNPC(gameState, sceneContext);
      npcs.push(npc);
    }
    
    return npcs;
  }

  /**
   * Check if NPC should appear in current scene
   * @param {object} npc - NPC to check
   * @param {object} gameState - Current game state
   * @returns {boolean} - Should appear
   */
  shouldNPCAppear(npc, gameState) {
    // Dead NPCs don't appear
    if (!npc.alive) return false;
    
    // NPCs in group always appear
    if (npc.inGroup) return true;
    
    // Check location match
    if (npc.location === gameState.world.currentLocation) return true;
    
    // Random encounter chance based on relationship
    const encounterChance = 0.3 + (npc.relationship / 200); // 0.3 to 0.8
    return Math.random() < encounterChance;
  }

  /**
   * Execute agent (main entry point)
   * @param {object} gameState - Current game state
   * @param {object} previousResults - Results from previous agents
   * @returns {Promise<object>} - Agent results
   */
  async execute(gameState, previousResults = {}) {
    const results = {
      npcsInScene: [],
      npcAttitudes: {},
      newNPCsGenerated: [],
    };
    
    // Determine which existing NPCs should appear
    for (const npc of gameState.npcs) {
      if (this.shouldNPCAppear(npc, gameState)) {
        results.npcsInScene.push(npc);
        
        // Analyze attitude if they have history
        if (npc.memory.length > 0) {
          const attitude = await this.analyzeNPCAttitude(npc, gameState);
          results.npcAttitudes[npc.id] = attitude;
        }
      }
    }
    
    // Generate new NPCs if needed (early game or special scenes)
    const shouldGenerateNew = (
      gameState.npcs.length < 5 || // Early game
      (previousResults.worldBuilder?.npcsNeeded && results.npcsInScene.length === 0)
    );
    
    if (shouldGenerateNew) {
      const newNPC = await this.generateNPC(gameState, previousResults.worldBuilder || {});
      results.newNPCsGenerated.push(newNPC);
      results.npcsInScene.push(newNPC);
    }
    
    return results;
  }

  /**
   * Generate fallback NPC (if API fails)
   * @param {object} gameState - Current game state
   * @returns {object} - Basic NPC
   */
  generateFallbackNPC(gameState) {
    const archetypes = Object.keys(NPC_ARCHETYPES);
    const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
    
    return createNPC({
      name: `Stranger ${gameState.npcs.length + 1}`,
      archetype,
      description: `A mysterious ${archetype.toLowerCase()} you encounter.`,
      backstory: "Unknown",
      motivation: "Unknown",
      traits: NPC_ARCHETYPES[archetype].traits,
      secrets: [],
      skills: NPC_ARCHETYPES[archetype].skills,
      canBetray: true,
      betrayalTriggers: [],
      questPotential: "Unknown",
      inventory: [],
      firstMet: gameState.currentTurn,
      lastSeen: gameState.currentTurn,
      location: gameState.world.currentLocation,
    });
  }
}

// Singleton instance
const npcAgent = new NPCAgent();

export default npcAgent;