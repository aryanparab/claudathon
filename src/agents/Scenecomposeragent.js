import claudeAPI from '../utils/claudeAPI.js';
import { AGENT_ROLES, CHOICE_MAPPINGS } from '../constants/gameConfig.js';

class SceneComposerAgent {
  constructor() { this.role = AGENT_ROLES.SCENE_COMPOSER; }
  
  async execute(gameState, previousResults = {}) {
    const world = previousResults.worldBuilder || {};
    const npcs = previousResults.npcAgent || {};
    const dialogues = previousResults.dialogueAgent || {};
    const quests = previousResults.questAgent || {};
    
    const prompt = claudeAPI.buildStructuredPrompt(
      `You compose the final scene combining all agent outputs.

World Scene: ${world.sceneDescription}
Atmosphere: ${world.atmosphere}
NPCs Present: ${npcs.npcsInScene?.map(n => n.name).join(', ') || 'None'}
Active Quests: ${quests.activeQuests?.length || 0}

Turn: ${gameState.currentTurn}/${gameState.totalTurns}

Create 4 player choices that:
- Fit the scene naturally
- Map to different personality traits
- Have clear consequences
- Advance the story`,
      
      `Compose the scene and generate 4 choices.`,
      
      { turn: gameState.currentTurn },
      
      {
        finalScene: "complete scene description (3-4 sentences)",
        npcPresence: "how NPCs are positioned/acting",
        questHints: "subtle quest progression hints",
        choices: [
          {
            text: "Choice description",
            personalityMapping: "AGGRESSIVE",
            icon: "🔥",
            riskLevel: "low|medium|high",
            likelyOutcome: "hint at consequence"
          },
          {
            text: "Choice description",
            personalityMapping: "CAUTIOUS",
            icon: "🛡️",
            riskLevel: "low",
            likelyOutcome: "hint"
          },
          {
            text: "Choice description",
            personalityMapping: "DIPLOMATIC",
            icon: "🤝",
            riskLevel: "medium",
            likelyOutcome: "hint"
          },
          {
            text: "Choice description",
            personalityMapping: "CREATIVE",
            icon: "💡",
            riskLevel: "medium|high",
            likelyOutcome: "hint"
          }
        ]
      }
    );

    try {
      const response = await claudeAPI.complete(prompt, { maxTokens: 2000 });
      
      if (!response.isJSON) {
        throw new Error("Scene Composer failed");
      }
      
      const scene = response.parsed;
      
      // Add personality icons to choices
      scene.choices = scene.choices.map(choice => ({
        ...choice,
        icon: this.getIconForMapping(choice.personalityMapping),
      }));
      
      return scene;
      
    } catch (error) {
      console.error("Scene Composer error:", error);
      return this.generateFallbackScene(gameState);
    }
  }
  
  getIconForMapping(mapping) {
    const icons = {
      AGGRESSIVE: '🔥',
      CAUTIOUS: '🛡️',
      DIPLOMATIC: '🤝',
      CREATIVE: '💡',
      LEADERSHIP: '👑',
      LOYAL: '🤝',
      INDEPENDENT: '🦅',
      MORAL: '⚖️',
    };
    return icons[mapping] || '⭐';
  }
  
  generateFallbackScene(gameState) {
    return {
      finalScene: `You continue your journey through ${gameState.world.name}.`,
      npcPresence: "None nearby",
      questHints: "",
      choices: [
        { text: "Push forward aggressively", personalityMapping: "AGGRESSIVE", icon: "🔥", riskLevel: "high" },
        { text: "Proceed with caution", personalityMapping: "CAUTIOUS", icon: "🛡️", riskLevel: "low" },
        { text: "Seek diplomatic solution", personalityMapping: "DIPLOMATIC", icon: "🤝", riskLevel: "medium" },
        { text: "Try creative approach", personalityMapping: "CREATIVE", icon: "💡", riskLevel: "medium" },
      ]
    };
  }
}

export default new SceneComposerAgent();