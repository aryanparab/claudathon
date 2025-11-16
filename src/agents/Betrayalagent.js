import claudeAPI from '../utils/claudeAPI.js';
import { AGENT_ROLES } from '../constants/gameConfig.js';

class BetrayalAgent {
  constructor() {
    this.role = AGENT_ROLES.BETRAYAL;
  }

  async execute(gameState, previousResults = {}) {
    const npcsInScene = previousResults.npcAgent?.npcsInScene || [];
    const betrayalRisks = {};
    
    for (const npc of npcsInScene) {
      if (!npc.canBetray || !npc.alive) continue;
      
      const risk = this.calculateBetrayalRisk(npc, gameState);
      betrayalRisks[npc.id] = risk;
      
      // Check if betrayal should trigger
      if (risk > 0.7 && Math.random() < 0.3) {
        const betrayal = await this.generateBetrayal(npc, gameState);
        return { betrayalTriggered: true, betrayer: npc, betrayalDetails: betrayal };
      }
    }
    
    return { betrayalTriggered: false, betrayalRisks };
  }

  calculateBetrayalRisk(npc, gameState) {
    let risk = 0;
    
    // Base risk from traits
    risk += npc.traits.greed || 0;
    risk += (1 - (npc.traits.loyalty || 0.5)) * 0.5;
    
    // Relationship impact
    const relationship = npc.relationship;
    if (relationship < -50) risk += 0.3;
    else if (relationship < 0) risk += 0.1;
    else if (relationship > 50) risk -= 0.2;
    
    // Stage impact (more likely late game)
    risk += (gameState.currentStage / 5) * 0.2;
    
    return Math.max(0, Math.min(1, risk));
  }

  async generateBetrayal(npc, gameState) {
    const prompt = claudeAPI.buildStructuredPrompt(
      `NPC "${npc.name}" is about to betray the player in ${gameState.world.name}.
      
NPC Traits: ${JSON.stringify(npc.traits)}
Relationship: ${npc.relationship}
Memories: ${npc.memory.length} interactions

Create a dramatic betrayal scene.`,
      `Generate the betrayal.`,
      {},
      {
        betrayalScene: "how the betrayal unfolds",
        motivation: "why they betray",
        impact: "immediate consequences",
        canBeRedeemed: false
      }
    );

    try {
      const response = await claudeAPI.complete(prompt);
      return response.parsed || { betrayalScene: `${npc.name} betrays you!` };
    } catch (error) {
      return { betrayalScene: `${npc.name} has turned against you.`, motivation: "Unknown" };
    }
  }
}

export default new BetrayalAgent();