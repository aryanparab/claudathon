import claudeAPI from '../utils/claudeAPI.js';
import { AGENT_ROLES } from '../constants/gameConfig.js';

/**
 * Dialogue Agent
 * Generates NPC dialogue based on personality, memory, and relationships
 */

class DialogueAgent {
  constructor() {
    this.role = AGENT_ROLES.DIALOGUE;
  }

  /**
   * Generate dialogue for an NPC
   * @param {object} npc - The NPC speaking
   * @param {object} context - Conversation context
   * @param {object} gameState - Current game state
   * @returns {Promise<object>} - Generated dialogue
   */
  async generateDialogue(npc, context, gameState) {
    const recentMemory = npc.memory.slice(-3);
    const relationship = npc.relationship;
    
    const prompt = claudeAPI.buildStructuredPrompt(
      `You are generating dialogue for "${npc.name}", a ${npc.archetype}.

NPC Personality:
${JSON.stringify(npc.traits, null, 2)}

NPC Description: ${npc.description}
Motivation: ${npc.motivation}

Relationship with Player: ${relationship} (${this.getRelationshipLabel(relationship)})

Recent Memories of Player:
${JSON.stringify(recentMemory, null, 2)}

Current Situation:
${context.situation}

Guidelines:
- Match personality traits (aggressive, cautious, etc.)
- Reference past interactions if relevant
- Tone should match relationship level
- Stay in character
- Keep it natural and concise (2-4 sentences)`,
      
      `Generate dialogue for this NPC in this situation.`,
      
      {
        npcName: npc.name,
        archetype: npc.archetype,
        relationship: relationship,
        memoryCount: npc.memory.length,
      },
      
      {
        dialogue: "NPC's spoken words (2-4 sentences)",
        tone: "friendly|neutral|cautious|hostile|betrayed|grateful",
        bodyLanguage: "brief description of nonverbal cues",
        emotionalState: "current emotion",
        subtext: "what they're not saying / hidden meaning",
        trustIndicator: "sign of trust level (if any)"
      }
    );

    try {
      const response = await claudeAPI.complete(prompt, { maxTokens: 800 });
      
      if (!response.isJSON) {
        throw new Error("Dialogue Agent did not return valid JSON");
      }
      
      return response.parsed;
      
    } catch (error) {
      console.error("Dialogue Agent error:", error);
      
      // Fallback dialogue
      return this.generateFallbackDialogue(npc, relationship);
    }
  }

  /**
   * Generate dialogue for multiple NPCs in a scene
   * @param {Array} npcs - NPCs present
   * @param {object} context - Scene context
   * @param {object} gameState - Current game state
   * @returns {Promise<object>} - Dialogues for all NPCs
   */
  async generateSceneDialogue(npcs, context, gameState) {
    const dialogues = {};
    
    for (const npc of npcs) {
      const dialogue = await this.generateDialogue(npc, context, gameState);
      dialogues[npc.id] = dialogue;
    }
    
    return dialogues;
  }

  /**
   * Generate reaction dialogue to player choice
   * @param {object} npc - NPC reacting
   * @param {string} playerAction - What player did
   * @param {number} sentimentChange - Change in relationship
   * @param {object} gameState - Current game state
   * @returns {Promise<object>} - Reaction dialogue
   */
  async generateReaction(npc, playerAction, sentimentChange, gameState) {
    const prompt = claudeAPI.buildStructuredPrompt(
      `You are generating ${npc.name}'s reaction to the player's action.

NPC: ${npc.name} (${npc.archetype})
Personality: ${JSON.stringify(npc.traits, null, 2)}

Player Action: ${playerAction}
Relationship Impact: ${sentimentChange > 0 ? 'Positive' : sentimentChange < 0 ? 'Negative' : 'Neutral'}
New Relationship: ${npc.relationship}

Generate a brief reaction that shows how the NPC feels about this action.`,
      
      `Create the NPC's reaction.`,
      
      { npcName: npc.name, action: playerAction },
      
      {
        reaction: "NPC's immediate reaction (1-2 sentences)",
        emotionalResponse: "how they feel",
        futureImplications: "how this might affect future interactions"
      }
    );

    try {
      const response = await claudeAPI.complete(prompt, { maxTokens: 600 });
      
      if (!response.isJSON) {
        throw new Error("Reaction generation failed");
      }
      
      return response.parsed;
      
    } catch (error) {
      console.error("Reaction generation error:", error);
      
      // Simple fallback
      return {
        reaction: sentimentChange > 0 
          ? `${npc.name} seems pleased with your actions.`
          : sentimentChange < 0
          ? `${npc.name} looks displeased.`
          : `${npc.name} acknowledges your decision.`,
        emotionalResponse: "neutral",
        futureImplications: "Unknown",
      };
    }
  }

  /**
   * Execute agent (main entry point)
   * @param {object} gameState - Current game state
   * @param {object} previousResults - Results from previous agents
   * @returns {Promise<object>} - Generated dialogues
   */
  async execute(gameState, previousResults = {}) {
    const npcsInScene = previousResults.npcAgent?.npcsInScene || gameState.currentScene.npcsPresent;
    
    if (!npcsInScene || npcsInScene.length === 0) {
      return { dialogues: {}, npcsPresent: [] };
    }
    
    const context = {
      situation: previousResults.worldBuilder?.sceneDescription || gameState.world.description,
      atmosphere: previousResults.worldBuilder?.atmosphere || 'neutral',
      location: gameState.world.currentLocation,
    };
    
    const dialogues = await this.generateSceneDialogue(npcsInScene, context, gameState);
    
    return {
      dialogues,
      npcsPresent: npcsInScene.map(npc => npc.id),
    };
  }

  /**
   * Get relationship label
   * @param {number} relationship - Relationship value
   * @returns {string} - Label
   */
  getRelationshipLabel(relationship) {
    if (relationship <= -60) return 'Hostile';
    if (relationship <= -20) return 'Unfriendly';
    if (relationship >= 60) return 'Trusted';
    if (relationship >= 20) return 'Friendly';
    return 'Neutral';
  }

  /**
   * Generate fallback dialogue
   * @param {object} npc - NPC
   * @param {number} relationship - Relationship value
   * @returns {object} - Basic dialogue
   */
  generateFallbackDialogue(npc, relationship) {
    let dialogue = `${npc.name} greets you.`;
    let tone = 'neutral';
    
    if (relationship > 50) {
      dialogue = `${npc.name} greets you warmly, clearly happy to see you.`;
      tone = 'friendly';
    } else if (relationship < -50) {
      dialogue = `${npc.name} glares at you with evident distrust.`;
      tone = 'hostile';
    }
    
    return {
      dialogue,
      tone,
      bodyLanguage: "Standard body language",
      emotionalState: tone,
      subtext: "Unknown",
      trustIndicator: relationship > 0 ? "Seems willing to talk" : "Guarded",
    };
  }
}

// Singleton instance
const dialogueAgent = new DialogueAgent();

export default dialogueAgent;