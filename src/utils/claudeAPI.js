import { API_CONFIG } from '../constants/gameConfig.js';

/**
 * Claude API wrapper for all agent communications
 */
class ClaudeAPI {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.model = API_CONFIG.CLAUDE_MODEL;
    this.callCount = 0;
    this.totalCost = 0;
  }

  /**
   * Make a completion request to Claude
   * @param {string} prompt - The prompt to send
   * @param {object} options - Additional options
   * @returns {Promise<object>} - The parsed response
   */
  async complete(prompt, options = {}) {
    this.callCount++;
    
    const requestBody = {
      model: options.model || this.model,
      max_tokens: options.maxTokens || API_CONFIG.MAX_TOKENS,
      temperature: options.temperature || API_CONFIG.TEMPERATURE,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    };

    try {
      const response = await fetch(this.baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Calculate approximate cost (rough estimate)
      const inputTokens = this.estimateTokens(prompt);
      const outputTokens = this.estimateTokens(data.content[0].text);
      this.totalCost += (inputTokens * 0.003 + outputTokens * 0.015) / 1000;
      
      return this.parseResponse(data);
      
    } catch (error) {
      console.error("Claude API Error:", error);
      throw error;
    }
  }

  /**
   * Parse Claude's response and extract JSON if present
   * @param {object} data - Raw API response
   * @returns {object} - Parsed response
   */
  parseResponse(data) {
    let responseText = data.content[0].text;
    
    // Try to extract JSON from response
    try {
      // Remove markdown code blocks if present
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      // Try to parse as JSON
      const jsonResponse = JSON.parse(responseText);
      return {
        raw: data.content[0].text,
        parsed: jsonResponse,
        isJSON: true,
      };
    } catch (e) {
      // Not JSON, return as text
      return {
        raw: responseText,
        parsed: null,
        isJSON: false,
      };
    }
  }

  /**
   * Estimate token count (rough approximation)
   * @param {string} text - Text to estimate
   * @returns {number} - Estimated tokens
   */
  estimateTokens(text) {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Build a structured prompt for JSON responses
   * @param {string} systemContext - Context for the agent
   * @param {string} task - The specific task
   * @param {object} data - Data to include
   * @param {object} outputFormat - Expected output structure
   * @returns {string} - Formatted prompt
   */
  buildStructuredPrompt(systemContext, task, data, outputFormat) {
    return `${systemContext}

TASK:
${task}

DATA:
${JSON.stringify(data, null, 2)}

CRITICAL: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation.

OUTPUT FORMAT:
${JSON.stringify(outputFormat, null, 2)}

Your response must be parseable JSON matching the format above.`;
  }

  /**
   * Get API statistics
   * @returns {object} - Usage stats
   */
  getStats() {
    return {
      callCount: this.callCount,
      totalCost: this.totalCost.toFixed(4),
      averageCostPerCall: (this.totalCost / this.callCount).toFixed(4),
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.callCount = 0;
    this.totalCost = 0;
  }
}

// Singleton instance
const claudeAPI = new ClaudeAPI();

export default claudeAPI;

/**
 * Utility functions for common agent patterns
 */

/**
 * Call agent with retry logic
 * @param {Function} agentFn - Agent function to call
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<any>} - Agent response
 */
export async function callAgentWithRetry(agentFn, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await agentFn();
    } catch (error) {
      lastError = error;
      console.warn(`Agent call attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw new Error(`Agent call failed after ${maxRetries} attempts: ${lastError.message}`);
}

/**
 * Batch multiple agent calls
 * @param {Array<Function>} agentFns - Array of agent functions
 * @returns {Promise<Array>} - Array of responses
 */
export async function batchAgentCalls(agentFns) {
  return Promise.all(agentFns.map(fn => fn()));
}

/**
 * Sequential agent calls (for dependent operations)
 * @param {Array<Function>} agentFns - Array of agent functions
 * @returns {Promise<Array>} - Array of responses
 */
export async function sequentialAgentCalls(agentFns) {
  const results = [];
  
  for (const fn of agentFns) {
    const result = await fn();
    results.push(result);
  }
  
  return results;
}

/**
 * Build context string from game state
 * @param {object} gameState - Current game state
 * @param {number} historyLimit - Number of recent turns to include
 * @returns {string} - Formatted context
 */
export function buildGameContext(gameState, historyLimit = 5) {
  const recentHistory = gameState.history.slice(-historyLimit);
  
  const context = {
    world: gameState.world.name,
    turn: gameState.currentTurn,
    stage: gameState.currentStage,
    location: gameState.world.currentLocation,
    
    playerProfile: gameState.profile.revealed 
      ? gameState.profile 
      : { hidden: true },
    
    groupStatus: {
      isGroup: gameState.group.members.length > 0,
      memberCount: gameState.group.members.length,
      morale: gameState.group.morale,
    },
    
    activeQuests: gameState.quests.side
      .filter(q => q.state === 'active')
      .map(q => ({ name: q.name, progress: q.progress })),
    
    recentHistory: recentHistory.map(h => ({
      turn: h.turn,
      choice: h.choiceType,
      consequence: h.consequence,
    })),
    
    npcsPresent: gameState.currentScene.npcsPresent,
    
    stats: gameState.stats,
  };
  
  return JSON.stringify(context, null, 2);
}

/**
 * Extract important story flags from history
 * @param {object} gameState - Current game state
 * @returns {object} - Important flags
 */
export function extractStoryFlags(gameState) {
  const flags = {
    betrayalsExperienced: gameState.stats.betrayalsSuffered,
    betrayalsCommitted: gameState.stats.betrayalsCommitted,
    playStyle: determinePlayStyle(gameState.profile),
    groupMode: gameState.group.members.length > 0,
    reputation: gameState.stats.reputation,
    majorDecisions: gameState.history
      .filter(h => h.importance && h.importance > 0.7)
      .map(h => ({ turn: h.turn, choice: h.choiceType })),
  };
  
  return flags;
}

/**
 * Determine player's dominant play style
 * @param {object} profile - Player profile
 * @returns {string} - Play style label
 */
function determinePlayStyle(profile) {
  const traits = [
    { name: 'aggression', value: profile.aggression },
    { name: 'caution', value: profile.caution },
    { name: 'morality', value: profile.morality },
    { name: 'creativity', value: profile.creativity },
    { name: 'leadership', value: profile.leadership },
    { name: 'independence', value: profile.independence },
  ];
  
  const dominant = traits.reduce((max, trait) => 
    trait.value > max.value ? trait : max
  );
  
  return dominant.name;
}