import claudeAPI from '../utils/claudeAPI.js';
import { AGENT_ROLES } from '../constants/gameConfig.js';

class CombatAgent {
  constructor() { this.role = AGENT_ROLES.COMBAT; }
  
  async execute(gameState, previousResults = {}) {
    const scene = previousResults.worldBuilder;
    if (!scene?.threatsPresent?.length) return { combatOccurred: false };
    
    const prompt = `Combat encounter in ${gameState.world.name}.
Player Health: ${gameState.stats.health}
Threats: ${scene.threatsPresent.join(', ')}
Allies: ${gameState.group.members.length}

Resolve combat narrative style. JSON: { outcome, playerDamage, enemiesDefeated, dramatic: true }`;
    
    try {
      const response = await claudeAPI.complete(prompt);
      return response.parsed || { combatOccurred: true, outcome: "Combat resolved" };
    } catch (error) {
      return { combatOccurred: true, outcome: "You engage in combat", playerDamage: -10 };
    }
  }
}

export default new CombatAgent();