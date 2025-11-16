import claudeAPI, { buildGameContext } from '../utils/claudeAPI.js';
import { AGENT_ROLES } from '../constants/gameConfig.js';

/**
 * Orchestrator Agent - Master coordinator
 * Decides which agents to call based on game state
 * Manages turn flow and agent priority
 */

class OrchestratorAgent {
  constructor() {
    this.role = AGENT_ROLES.ORCHESTRATOR;
    this.callHistory = [];
  }

  /**
   * Analyze current situation and determine which agents to call
   * @param {object} gameState - Current game state
   * @returns {Promise<object>} - Agent execution plan
   */
  async determineTurnFlow(gameState) {
    const context = buildGameContext(gameState);
    
    const prompt = claudeAPI.buildStructuredPrompt(
      `You are the Orchestrator Agent - the master coordinator of a multi-agent RPG system.
      
Your role is to analyze the current game state and determine which agents should be called for this turn.

Available Agents:
- WORLD_BUILDER: Generates environment descriptions and world state
- NPC_PERSONALITY: Manages NPC behaviors and personalities
- DIALOGUE: Creates NPC dialogue and conversations
- QUEST_MANAGER: Updates quest states and objectives
- COMBAT: Handles combat scenarios
- BETRAYAL: Identifies betrayal opportunities
- CONSEQUENCE: Determines outcomes of player choices
- INVENTORY: Manages item interactions
- CONTINUITY: Ensures story consistency
- SCENE_COMPOSER: Combines all elements into cohesive scene

Consider:
- What's happening in the current scene?
- Which NPCs are present?
- Is there combat potential?
- Are there quest-related events?
- What was the last player action?`,
      
      `Analyze the game state and create an execution plan for this turn.`,
      
      {
        gameContext: context,
        currentTurn: gameState.currentTurn,
        currentStage: gameState.currentStage,
        lastAction: gameState.history[gameState.history.length - 1],
      },
      
      {
        agentsToCall: [
          {
            agent: "AGENT_NAME",
            priority: 1,
            reason: "why this agent is needed",
            dependencies: ["other agents that must run first"]
          }
        ],
        executionOrder: ["AGENT_1", "AGENT_2"],
        estimatedApiCalls: 5,
        sceneType: "combat|dialogue|exploration|quest|betrayal",
        urgentFlags: ["any urgent situations"]
      }
    );

    try {
      const response = await claudeAPI.complete(prompt, { maxTokens: 1500 });
      
      if (!response.isJSON) {
        throw new Error("Orchestrator did not return valid JSON");
      }
      
      const plan = response.parsed;
      
      // Log this decision
      this.callHistory.push({
        turn: gameState.currentTurn,
        plan,
        timestamp: Date.now(),
      });
      
      return plan;
      
    } catch (error) {
      console.error("Orchestrator Agent error:", error);
      
      // Fallback: default agent sequence
      return this.getDefaultTurnFlow(gameState);
    }
  }

  /**
   * Get default turn flow (fallback)
   * @param {object} gameState - Current game state
   * @returns {object} - Default execution plan
   */
  getDefaultTurnFlow(gameState) {
    const plan = {
      agentsToCall: [
        {
          agent: AGENT_ROLES.WORLD_BUILDER,
          priority: 1,
          reason: "Generate scene context",
          dependencies: [],
        },
        {
          agent: AGENT_ROLES.SCENE_COMPOSER,
          priority: 2,
          reason: "Create cohesive scene",
          dependencies: [AGENT_ROLES.WORLD_BUILDER],
        },
      ],
      executionOrder: [
        AGENT_ROLES.WORLD_BUILDER,
        AGENT_ROLES.SCENE_COMPOSER,
      ],
      estimatedApiCalls: 2,
      sceneType: "exploration",
      urgentFlags: [],
    };
    
    // Add NPC agent if NPCs are present
    if (gameState.currentScene.npcsPresent.length > 0) {
      plan.agentsToCall.push({
        agent: AGENT_ROLES.NPC_PERSONALITY,
        priority: 2,
        reason: "Manage NPC interactions",
        dependencies: [AGENT_ROLES.WORLD_BUILDER],
      });
      plan.agentsToCall.push({
        agent: AGENT_ROLES.DIALOGUE,
        priority: 3,
        reason: "Generate NPC dialogue",
        dependencies: [AGENT_ROLES.NPC_PERSONALITY],
      });
      plan.executionOrder.splice(1, 0, AGENT_ROLES.NPC_PERSONALITY, AGENT_ROLES.DIALOGUE);
      plan.estimatedApiCalls += 2;
    }
    
    // Add quest agent if active quests exist
    const activeQuests = gameState.quests.side.filter(q => q.state === 'active');
    if (activeQuests.length > 0 || gameState.quests.main) {
      plan.agentsToCall.push({
        agent: AGENT_ROLES.QUEST_MANAGER,
        priority: 2,
        reason: "Update quest progress",
        dependencies: [],
      });
      plan.executionOrder.splice(1, 0, AGENT_ROLES.QUEST_MANAGER);
      plan.estimatedApiCalls += 1;
    }
    
    // Always add consequence agent for after player choice
    plan.agentsToCall.push({
      agent: AGENT_ROLES.CONSEQUENCE,
      priority: 10,
      reason: "Determine outcome of player choice",
      dependencies: ["PLAYER_CHOICE"],
    });
    
    return plan;
  }

  /**
   * Validate that required agents are available
   * @param {Array} agentList - List of agent names
   * @returns {boolean} - Whether all agents are valid
   */
  validateAgents(agentList) {
    const validAgents = Object.values(AGENT_ROLES);
    return agentList.every(agent => validAgents.includes(agent));
  }

  /**
   * Optimize agent call sequence to minimize API calls
   * @param {Array} agentList - List of agents to call
   * @returns {Array} - Optimized sequence
   */
  optimizeSequence(agentList) {
    // Sort by priority and dependencies
    const sorted = [...agentList].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // If same priority, dependencies go first
      return b.dependencies.length - a.dependencies.length;
    });
    
    return sorted;
  }

  /**
   * Get statistics about orchestrator decisions
   * @returns {object} - Statistics
   */
  getStats() {
    const totalCalls = this.callHistory.length;
    const avgAgentsPerTurn = this.callHistory.reduce(
      (sum, call) => sum + call.plan.agentsToCall.length, 0
    ) / totalCalls || 0;
    
    const sceneTypes = {};
    this.callHistory.forEach(call => {
      const type = call.plan.sceneType || 'unknown';
      sceneTypes[type] = (sceneTypes[type] || 0) + 1;
    });
    
    return {
      totalTurnsOrchestrated: totalCalls,
      averageAgentsPerTurn: avgAgentsPerTurn.toFixed(2),
      sceneTypeDistribution: sceneTypes,
      mostCommonScene: Object.entries(sceneTypes).sort((a, b) => b[1] - a[1])[0]?.[0],
    };
  }
}

// Singleton instance
const orchestratorAgent = new OrchestratorAgent();

export default orchestratorAgent;

/**
 * Execute turn with orchestrated agent calls
 * @param {object} gameState - Current game state
 * @param {object} agentRegistry - Registry of all available agents
 * @returns {Promise<object>} - Turn results
 */
export async function executeTurn(gameState, agentRegistry) {
  // Get execution plan from orchestrator
  const plan = await orchestratorAgent.determineTurnFlow(gameState);
  
  console.log(`Turn ${gameState.currentTurn} Plan:`, plan);
  
  const results = {};
  const errors = [];
  
  // Execute agents in order
  for (const agentName of plan.executionOrder) {
    try {
      const agent = agentRegistry[agentName];
      
      if (!agent) {
        console.warn(`Agent ${agentName} not found in registry`);
        continue;
      }
      
      console.log(`Calling ${agentName}...`);
      
      // Call agent with current game state and previous results
      const agentResult = await agent.execute(gameState, results);
      results[agentName] = agentResult;
      
    } catch (error) {
      console.error(`Error executing ${agentName}:`, error);
      errors.push({
        agent: agentName,
        error: error.message,
      });
    }
  }
  
  return {
    plan,
    results,
    errors,
    success: errors.length === 0,
  };
}