import claudeAPI, { buildGameContext, extractStoryFlags } from '../utils/claudeAPI.js';
import { AGENT_ROLES } from '../constants/gameConfig.js';

class ContinuityAgent {
  constructor() { this.role = AGENT_ROLES.CONTINUITY; }
  
  async execute(gameState, previousResults = {}) {
    const context = buildGameContext(gameState, 10);
    const storyFlags = extractStoryFlags(gameState);
    
    const prompt = claudeAPI.buildStructuredPrompt(
      `You ensure story consistency in ${gameState.world.name}.
      
Recent History: ${JSON.stringify(gameState.history.slice(-5))}
Story Flags: ${JSON.stringify(storyFlags)}
World State: ${JSON.stringify(gameState.world.worldState)}

Check for:
- Continuity errors
- References to past events
- NPC consistency
- World state logic`,
      `Verify continuity and suggest references.`,
      {},
      {
        continuityIssues: [],
        suggestedReferences: ["reference to past event"],
        importantReminders: ["key story point to maintain"]
      }
    );
    
    try {
      const response = await claudeAPI.complete(prompt, { maxTokens: 1000 });
      return response.parsed || { continuityIssues: [] };
    } catch (error) {
      return { continuityIssues: [], suggestedReferences: [] };
    }
  }
}

export default new ContinuityAgent();