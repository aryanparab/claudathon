import claudeAPI from '../utils/claudeAPI.js';
import { AGENT_ROLES, QUEST_STATES, STAGES } from '../constants/gameConfig.js';
import { createQuest } from '../state/GameState.js';

/**
 * Quest Agent
 * Manages quests, objectives, progression (mostly local logic)
 */

class QuestAgent {
  constructor() {
    this.role = AGENT_ROLES.QUEST_MANAGER;
  }

  /**
   * Generate side quests for current stage
   * @param {object} gameState - Current game state
   * @param {number} count - Number of quests to generate
   * @returns {Promise<Array>} - Generated quests
   */
  async generateSideQuests(gameState, count = 3) {
    const stage = STAGES.find(s => s.id === gameState.currentStage);
    
    const prompt = claudeAPI.buildStructuredPrompt(
      `You are generating side quests for stage ${gameState.currentStage} of a 50-turn RPG.

World: ${gameState.world.name}
Stage: ${stage.name} - ${stage.description}
Quest Types for this stage: ${stage.questTypes.join(', ')}

Current NPCs: ${gameState.npcs.map(n => n.name).join(', ')}
Player Turn: ${gameState.currentTurn}

Create ${count} side quests that:
- Fit the stage theme
- Are completable within ~10 turns
- Involve NPCs when possible
- Have meaningful rewards
- Can succeed or fail`,
      
      `Generate ${count} side quests.`,
      
      { stageName: stage.name, npcCount: gameState.npcs.length },
      
      {
        quests: [
          {
            name: "Quest name",
            description: "What player must do",
            questType: "one of the stage types",
            objectives: [
              { description: "objective 1", required: true },
              { description: "objective 2", required: true }
            ],
            requiredItems: ["item if needed"],
            questGiver: "NPC name or null",
            involvedNPCs: ["NPC names"],
            turnsRemaining: 10,
            rewards: {
              gold: 50,
              items: ["item name"],
              reputation: 10
            },
            successConsequence: "what happens on success",
            failureConsequence: "what happens on failure"
          }
        ]
      }
    );

    try {
      const response = await claudeAPI.complete(prompt, { maxTokens: 2000 });
      
      if (!response.isJSON) {
        throw new Error("Quest generation failed");
      }
      
      const questsData = response.parsed.quests;
      
      // Create quest objects
      const quests = questsData.map(qData => createQuest({
        ...qData,
        type: 'side',
        stage: gameState.currentStage,
      }));
      
      return quests;
      
    } catch (error) {
      console.error("Quest generation error:", error);
      
      // Fallback quests
      return this.generateFallbackQuests(gameState, count);
    }
  }

  /**
   * Check quest progress based on player action (LOCAL)
   * @param {object} quest - Quest to check
   * @param {object} action - Player action
   * @param {object} gameState - Current game state
   * @returns {object} - Updated quest
   */
  checkQuestProgress(quest, action, gameState) {
    if (quest.state !== QUEST_STATES.ACTIVE) {
      return quest;
    }
    
    let progressMade = false;
    const updatedObjectives = quest.objectives.map((obj, idx) => {
      if (obj.completed) return obj;
      
      // Check if action completes this objective
      if (this.actionCompletesObjective(obj, action, gameState)) {
        progressMade = true;
        return { ...obj, completed: true };
      }
      
      return obj;
    });
    
    // Calculate progress
    const completedCount = updatedObjectives.filter(o => o.completed).length;
    const progress = (completedCount / updatedObjectives.length) * 100;
    
    // Check if quest is complete
    const isComplete = updatedObjectives.every(o => o.completed);
    
    const updatedQuest = {
      ...quest,
      objectives: updatedObjectives,
      progress,
      state: isComplete ? QUEST_STATES.COMPLETED : quest.state,
    };
    
    // Decrement turns remaining
    if (quest.turnsRemaining !== null) {
      updatedQuest.turnsRemaining = Math.max(0, quest.turnsRemaining - 1);
      
      // Check expiration
      if (updatedQuest.turnsRemaining === 0 && !isComplete) {
        updatedQuest.state = QUEST_STATES.EXPIRED;
      }
    }
    
    return updatedQuest;
  }

  /**
   * Check if action completes an objective (LOCAL)
   * @param {object} objective - Objective to check
   * @param {object} action - Player action
   * @param {object} gameState - Current game state
   * @returns {boolean} - Whether objective is completed
   */
  actionCompletesObjective(objective, action, gameState) {
    const objDesc = objective.description.toLowerCase();
    const actionType = action.type?.toLowerCase() || '';
    const actionDesc = action.description?.toLowerCase() || '';
    
    // Simple keyword matching (can be enhanced)
    if (objDesc.includes('find') && actionDesc.includes('found')) return true;
    if (objDesc.includes('talk') && actionType === 'dialogue') return true;
    if (objDesc.includes('defeat') && actionType === 'combat' && action.success) return true;
    if (objDesc.includes('collect') && actionType === 'item_acquired') return true;
    if (objDesc.includes('reach') && actionType === 'location_reached') return true;
    
    return false;
  }

  /**
   * Update all active quests (LOCAL)
   * @param {object} gameState - Current game state
   * @param {object} action - Player action
   * @returns {object} - Updated quests
   */
  updateAllQuests(gameState, action) {
    const updatedSideQuests = gameState.quests.side.map(quest =>
      this.checkQuestProgress(quest, action, gameState)
    );
    
    const updatedMainQuest = gameState.quests.main
      ? this.checkQuestProgress(gameState.quests.main, action, gameState)
      : null;
    
    // Move completed quests
    const stillActive = updatedSideQuests.filter(q => 
      q.state === QUEST_STATES.ACTIVE
    );
    const nowCompleted = updatedSideQuests.filter(q =>
      q.state === QUEST_STATES.COMPLETED || q.state === QUEST_STATES.EXPIRED
    );
    
    return {
      main: updatedMainQuest,
      side: stillActive,
      completed: [...gameState.quests.completed, ...nowCompleted],
    };
  }

  /**
   * Apply quest rewards (LOCAL)
   * @param {object} quest - Completed quest
   * @param {object} gameState - Current game state
   * @returns {object} - Rewards to apply
   */
  applyQuestRewards(quest, gameState) {
    if (quest.state !== QUEST_STATES.COMPLETED) {
      return null;
    }
    
    return {
      gold: quest.rewards.gold || 0,
      items: quest.rewards.items || [],
      reputation: quest.rewards.reputation || 0,
      experience: quest.rewards.experience || 0,
    };
  }

  /**
   * Execute agent (main entry point)
   * @param {object} gameState - Current game state
   * @param {object} previousResults - Results from previous agents
   * @returns {Promise<object>} - Quest updates
   */
  async execute(gameState, previousResults = {}) {
    const results = {
      activeQuests: [],
      questUpdates: [],
      newQuestsGenerated: [],
    };
    
    // Get active quests
    results.activeQuests = [
      ...(gameState.quests.main ? [gameState.quests.main] : []),
      ...gameState.quests.side.filter(q => q.state === QUEST_STATES.ACTIVE),
    ];
    
    // Generate new side quests if needed (start of stage)
    const isStageStart = gameState.currentTurn % 10 === 1;
    const hasActiveSideQuests = gameState.quests.side.filter(
      q => q.state === QUEST_STATES.ACTIVE
    ).length > 0;
    
    if (isStageStart && !hasActiveSideQuests) {
      const newQuests = await this.generateSideQuests(gameState, 3);
      results.newQuestsGenerated = newQuests;
    }
    
    return results;
  }

  /**
   * Generate fallback quests
   * @param {object} gameState - Current game state
   * @param {number} count - Number of quests
   * @returns {Array} - Basic quests
   */
  generateFallbackQuests(gameState, count) {
    const quests = [];
    
    for (let i = 0; i < count; i++) {
      const quest = createQuest({
        name: `Quest ${i + 1}`,
        type: 'side',
        stage: gameState.currentStage,
        description: `Complete an objective in ${gameState.world.name}`,
        objectives: [
          { description: "Explore the area", required: true, completed: false },
          { description: "Make a significant choice", required: true, completed: false },
        ],
        turnsRemaining: 10,
        rewards: {
          gold: 50,
          items: [],
          reputation: 10,
        },
      });
      
      quests.push(quest);
    }
    
    return quests;
  }
}

// Singleton instance
const questAgent = new QuestAgent();

export default questAgent;