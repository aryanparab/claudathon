import claudeAPI, { buildGameContext } from '../utils/claudeAPI.js';
import { AGENT_ROLES } from '../constants/gameConfig.js';

/**
 * Consequence Agent
 * Determines outcomes of player choices, calculates effects
 */

class ConsequenceAgent {
  constructor() {
    this.role = AGENT_ROLES.CONSEQUENCE;
  }

  async execute(gameState, previousResults = {}) {
    // This runs AFTER player makes a choice
    const playerChoice = previousResults.playerChoice;
    if (!playerChoice) {
      return { message: "No player choice to process" };
    }

    const context = buildGameContext(gameState, 5);
    
    const prompt = claudeAPI.buildStructuredPrompt(
      `You are the Consequence Agent determining the outcome of a player's choice.

World: ${gameState.world.name}
Turn: ${gameState.currentTurn}/${gameState.totalTurns}
Stage: ${gameState.currentStage}/5

Current Scene:
${previousResults.sceneComposer?.finalScene || gameState.currentScene.description}

Player Choice: ${playerChoice.text}
Choice Type: ${playerChoice.type} (${playerChoice.personalityMapping})

NPCs Present: ${previousResults.npcAgent?.npcsInScene?.map(n => n.name).join(', ') || 'None'}

Consider:
- Player's choice type and personality
- NPCs present and their relationships
- Active quests
- World state
- Stage difficulty
- Past consequences`,
      
      `Determine the immediate outcome and ripple effects.`,
      
      { playerChoice: playerChoice.text, turn: gameState.currentTurn },
      
      {
        outcome: "vivid 3-4 sentence description of what happens",
        success: true,
        consequenceLevel: "minor|moderate|major|critical",
        immediateEffects: {
          playerHealth: 0,
          npcRelationshipChanges: {
            "npc_id": 10
          },
          itemsGained: [],
          itemsLost: [],
          goldChange: 0,
          reputationChange: 0
        },
        longTermEffects: ["effect that will matter later"],
        npcsAffected: ["npc names that reacted"],
        questProgressions: ["quest affected"],
        worldStateChanges: {
          "property": "new value"
        },
        betrayalTriggered: false,
        deathOccurred: false,
        storyFlagsSet: ["flag name"]
      }
    );

    try {
      const response = await claudeAPI.complete(prompt, { maxTokens: 1500 });
      
      if (!response.isJSON) {
        throw new Error("Consequence Agent failed");
      }
      
      const consequence = response.parsed;
      
      // Apply consequences to game state
      this.applyConsequences(gameState, consequence);
      
      return consequence;
      
    } catch (error) {
      console.error("Consequence Agent error:", error);
      
      return this.generateFallbackConsequence(gameState, playerChoice);
    }
  }

  applyConsequences(gameState, consequence) {
    // Apply health changes
    if (consequence.immediateEffects.playerHealth !== 0) {
      gameState.stats.health = Math.max(0, Math.min(
        gameState.stats.maxHealth,
        gameState.stats.health + consequence.immediateEffects.playerHealth
      ));
    }
    
    // Apply NPC relationship changes
    Object.entries(consequence.immediateEffects.npcRelationshipChanges || {}).forEach(([npcId, change]) => {
      if (gameState.npcRelationships[npcId] !== undefined) {
        gameState.npcRelationships[npcId] = Math.max(-100, Math.min(100,
          gameState.npcRelationships[npcId] + change
        ));
      }
    });
    
    // Apply items
    consequence.immediateEffects.itemsGained?.forEach(item => {
      gameState.inventory.items.push(item);
    });
    
    // Apply gold
    gameState.inventory.gold += consequence.immediateEffects.goldChange || 0;
    
    // Apply reputation
    gameState.stats.reputation += consequence.immediateEffects.reputationChange || 0;
    
    // Set story flags
    consequence.storyFlagsSet?.forEach(flag => {
      gameState.storyFlags[flag] = true;
    });
    
    // Merge world state changes
    if (consequence.worldStateChanges) {
      gameState.world.worldState = {
        ...gameState.world.worldState,
        ...consequence.worldStateChanges,
      };
    }
  }

  generateFallbackConsequence(gameState, playerChoice) {
    return {
      outcome: `Your choice to ${playerChoice.text} has consequences.`,
      success: Math.random() > 0.3,
      consequenceLevel: "moderate",
      immediateEffects: {
        playerHealth: 0,
        npcRelationshipChanges: {},
        itemsGained: [],
        itemsLost: [],
        goldChange: 0,
        reputationChange: 0,
      },
      longTermEffects: [],
      npcsAffected: [],
      questProgressions: [],
      worldStateChanges: {},
      betrayalTriggered: false,
      deathOccurred: false,
      storyFlagsSet: [],
    };
  }
}

const consequenceAgent = new ConsequenceAgent();
export default consequenceAgent;