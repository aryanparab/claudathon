import claudeAPI, { buildGameContext } from '../utils/claudeAPI.js';
import { AGENT_ROLES, STAGES } from '../constants/gameConfig.js';

/**
 * World Builder Agent
 * Generates environment descriptions, maintains world consistency
 * Handles atmosphere and scene setting
 */

class WorldBuilderAgent {
  constructor() {
    this.role = AGENT_ROLES.WORLD_BUILDER;
    this.worldCache = new Map();
  }

  /**
   * Generate scene description for current turn
   * @param {object} gameState - Current game state
   * @param {object} previousResults - Results from previous agents
   * @returns {Promise<object>} - Scene description
   */
  async execute(gameState, previousResults = {}) {
    const stage = STAGES.find(s => s.id === gameState.currentStage);
    const context = buildGameContext(gameState, 3);
    
    // Check cache for similar scenes
    const cacheKey = `${gameState.world.name}_${gameState.currentStage}_${gameState.world.currentLocation}`;
    if (this.worldCache.has(cacheKey) && Math.random() < 0.3) {
      console.log("Using cached world description");
      return this.worldCache.get(cacheKey);
    }
    
    const prompt = claudeAPI.buildStructuredPrompt(
      `You are the World Builder Agent in a dynamic RPG system.

Your role is to create immersive, atmospheric scene descriptions that bring the world to life.

World: ${gameState.world.name}
Current Stage: ${stage.name} - ${stage.description}
Turn: ${gameState.currentTurn}/${gameState.totalTurns}

Guidelines:
- Be vivid and sensory (sights, sounds, smells)
- Maintain consistency with previous descriptions
- Reflect the stage's tone (peaceful, tense, climactic)
- Include environmental storytelling
- Set up potential for choices (don't be static)
- Length: 3-4 sentences for main description`,
      
      `Generate the scene description for this turn.`,
      
      {
        gameContext: context,
        currentLocation: gameState.world.currentLocation || "unknown",
        lastEvent: gameState.history[gameState.history.length - 1]?.consequence,
        timeOfDay: this.determineTimeOfDay(gameState.currentTurn),
        weather: previousResults.weather || "clear",
      },
      
      {
        sceneDescription: "vivid 3-4 sentence description of the environment",
        atmosphere: "current mood/feeling (tense, peaceful, ominous, etc.)",
        notableFeatures: ["feature 1", "feature 2"],
        threatsPresent: ["potential danger 1"] || [],
        opportunitiesPresent: ["opportunity 1"] || [],
        soundscape: "what can be heard",
        visualHighlight: "most striking visual element",
        locationName: "specific location name",
        worldStateUpdates: {
          "property": "value"
        }
      }
    );

    try {
      const response = await claudeAPI.complete(prompt, { maxTokens: 1200 });
      
      if (!response.isJSON) {
        throw new Error("World Builder did not return valid JSON");
      }
      
      const sceneData = response.parsed;
      
      // Update game state world information
      gameState.world.description = sceneData.sceneDescription;
      gameState.world.atmosphere = sceneData.atmosphere;
      gameState.world.currentLocation = sceneData.locationName;
      
      // Merge world state updates
      if (sceneData.worldStateUpdates) {
        gameState.world.worldState = {
          ...gameState.world.worldState,
          ...sceneData.worldStateUpdates,
        };
      }
      
      // Cache this result
      this.worldCache.set(cacheKey, sceneData);
      
      return sceneData;
      
    } catch (error) {
      console.error("World Builder Agent error:", error);
      
      // Fallback to generic description
      return this.generateFallbackScene(gameState);
    }
  }

  /**
   * Generate fallback scene (if API fails)
   * @param {object} gameState - Current game state
   * @returns {object} - Basic scene description
   */
  generateFallbackScene(gameState) {
    const stage = STAGES.find(s => s.id === gameState.currentStage);
    
    return {
      sceneDescription: `The journey continues through ${gameState.world.name}. ${stage.description}`,
      atmosphere: "neutral",
      notableFeatures: ["The path ahead", "Your surroundings"],
      threatsPresent: [],
      opportunitiesPresent: [],
      soundscape: "ambient sounds",
      visualHighlight: "the road ahead",
      locationName: gameState.world.currentLocation || "Unknown Location",
      worldStateUpdates: {},
    };
  }

  /**
   * Determine time of day based on turn number
   * @param {number} turn - Current turn
   * @returns {string} - Time of day
   */
  determineTimeOfDay(turn) {
    const cycle = turn % 4;
    switch (cycle) {
      case 0: return "dawn";
      case 1: return "midday";
      case 2: return "dusk";
      case 3: return "night";
      default: return "day";
    }
  }

  /**
   * Generate initial world when game starts
   * @param {string} worldName - Name of the world
   * @returns {Promise<object>} - World initialization data
   */
  async initializeWorld(worldName) {
    const prompt = claudeAPI.buildStructuredPrompt(
      `You are the World Builder Agent creating the initial world for a 50-turn RPG adventure.

World Theme: ${worldName}

Create a rich, detailed world that will support:
- 50 turns of gameplay
- 5 stages of escalating drama
- Multiple NPCs and locations
- Quests, betrayals, and meaningful choices

This should be a world with depth, history, and potential for dramatic storytelling.`,
      
      `Generate the initial world state and lore.`,
      
      { worldName },
      
      {
        worldDescription: "2-3 paragraph overview of this world",
        coreLore: "essential background/history",
        majorLocations: [
          {
            name: "location name",
            description: "what this place is like",
            significance: "why it matters to the story"
          }
        ],
        dangerSources: ["primary threats in this world"],
        opportunitySources: ["sources of aid/power"],
        culturalElements: ["customs, factions, beliefs"],
        tone: "overall mood (dark, hopeful, mysterious, etc.)",
        keyThemes: ["major themes to explore"]
      }
    );

    try {
      const response = await claudeAPI.complete(prompt, { maxTokens: 2000 });
      
      if (!response.isJSON) {
        throw new Error("World initialization failed");
      }
      
      return response.parsed;
      
    } catch (error) {
      console.error("World initialization error:", error);
      
      // Fallback
      return {
        worldDescription: `Welcome to ${worldName}, a land of adventure and danger.`,
        coreLore: "An ancient conflict shapes the present day.",
        majorLocations: [
          { name: "The Starting Point", description: "Where your journey begins", significance: "The beginning" }
        ],
        dangerSources: ["Unknown threats"],
        opportunitySources: ["Potential allies"],
        culturalElements: ["Various factions and peoples"],
        tone: "mysterious",
        keyThemes: ["survival", "choice", "consequence"],
      };
    }
  }

  /**
   * Clear cache (useful between games)
   */
  clearCache() {
    this.worldCache.clear();
  }
}

// Singleton instance
const worldBuilderAgent = new WorldBuilderAgent();

export default worldBuilderAgent;