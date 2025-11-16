import { AGENT_ROLES } from '../constants/gameConfig.js';
import profileCalculator from '../utils/profileCalculator.js';

class ProfileAgent {
  constructor() { this.role = AGENT_ROLES.PROFILE_TRACKER; }
  
  execute(gameState, previousResults = {}) {
    // Wrapper around local profileCalculator - NO API CALLS
    const playerChoice = previousResults.playerChoice;
    
    if (!playerChoice || !playerChoice.personalityMapping) {
      return { profileUpdated: false };
    }
    
    // Update profile based on choice
    const updatedProfile = profileCalculator.updateProfile(
      gameState.profile,
      playerChoice.personalityMapping
    );
    
    // Check if profile should be revealed (turn 25)
    const shouldReveal = gameState.currentTurn === 25 && !gameState.profile.revealed;
    
    if (shouldReveal) {
      updatedProfile.revealed = true;
    }
    
    // Get profile summary
    const summary = profileCalculator.getProfileSummary(updatedProfile);
    const archetype = profileCalculator.getPersonalityArchetype(updatedProfile);
    
    return {
      profileUpdated: true,
      updatedProfile,
      summary,
      archetype,
      revealed: shouldReveal,
    };
  }
}

export default new ProfileAgent();