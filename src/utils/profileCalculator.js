import { CHOICE_MAPPINGS, PERSONALITY_TRAITS } from '../constants/gameConfig.js';

/**
 * Profile Calculator - Runs locally without API calls
 * Tracks and updates player personality based on choices
 */

/**
 * Update profile based on choice
 * @param {object} currentProfile - Current personality profile
 * @param {string} choiceType - Type of choice made (AGGRESSIVE, CAUTIOUS, etc.)
 * @returns {object} - Updated profile
 */
export function updateProfile(currentProfile, choiceType) {
  const mapping = CHOICE_MAPPINGS[choiceType];
  
  if (!mapping) {
    console.warn(`Unknown choice type: ${choiceType}`);
    return currentProfile;
  }
  
  const updatedProfile = { ...currentProfile };
  const changes = {};
  
  // Apply changes from mapping
  Object.entries(mapping).forEach(([trait, delta]) => {
    const oldValue = updatedProfile[trait] || 0.5;
    const newValue = clampValue(oldValue + delta);
    
    updatedProfile[trait] = newValue;
    changes[trait] = {
      old: oldValue,
      new: newValue,
      delta: delta,
    };
  });
  
  // Track this change in history
  if (!updatedProfile.profileHistory) {
    updatedProfile.profileHistory = [];
  }
  
  updatedProfile.profileHistory.push({
    timestamp: Date.now(),
    choiceType,
    changes,
  });
  
  return updatedProfile;
}

/**
 * Clamp value between 0 and 1
 * @param {number} value - Value to clamp
 * @returns {number} - Clamped value
 */
function clampValue(value) {
  return Math.max(0, Math.min(1, value));
}

/**
 * Calculate profile summary with rankings
 * @param {object} profile - Personality profile
 * @returns {Array} - Sorted array of traits
 */
export function getProfileSummary(profile) {
  const traits = Object.keys(PERSONALITY_TRAITS);
  
  return traits
    .map(traitKey => ({
      key: traitKey.toLowerCase(),
      name: PERSONALITY_TRAITS[traitKey].name,
      value: profile[traitKey.toLowerCase()] || 0.5,
      icon: PERSONALITY_TRAITS[traitKey].icon,
      percentage: Math.round((profile[traitKey.toLowerCase()] || 0.5) * 100),
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Get dominant personality traits
 * @param {object} profile - Personality profile
 * @param {number} count - Number of top traits to return
 * @returns {Array} - Top traits
 */
export function getDominantTraits(profile, count = 3) {
  return getProfileSummary(profile).slice(0, count);
}

/**
 * Get personality archetype based on profile
 * @param {object} profile - Personality profile
 * @returns {object} - Archetype information
 */
export function getPersonalityArchetype(profile) {
  const dominant = getDominantTraits(profile, 2);
  
  // Define archetypes based on trait combinations
  const archetypes = {
    'aggression-leadership': {
      name: 'The Warlord',
      description: 'Commands through strength and intimidation',
      icon: '⚔️',
    },
    'aggression-independence': {
      name: 'The Lone Wolf',
      description: 'Fights alone, trusts no one',
      icon: '🐺',
    },
    'diplomacy-leadership': {
      name: 'The Diplomat',
      description: 'Leads through charisma and negotiation',
      icon: '👑',
    },
    'diplomacy-morality': {
      name: 'The Peacemaker',
      description: 'Seeks harmony and ethical solutions',
      icon: '🕊️',
    },
    'caution-morality': {
      name: 'The Guardian',
      description: 'Protects others while avoiding unnecessary risks',
      icon: '🛡️',
    },
    'creativity-independence': {
      name: 'The Maverick',
      description: 'Forges unique paths with unconventional methods',
      icon: '🎭',
    },
    'leadership-loyalty': {
      name: 'The Commander',
      description: 'Inspires devoted followers through example',
      icon: '⭐',
    },
    'caution-creativity': {
      name: 'The Strategist',
      description: 'Carefully plans innovative solutions',
      icon: '🧠',
    },
  };
  
  const archetypeKey = `${dominant[0].key}-${dominant[1].key}`;
  return archetypes[archetypeKey] || {
    name: 'The Wanderer',
    description: 'Undefined path, many possibilities',
    icon: '🌟',
  };
}

/**
 * Analyze profile changes over time
 * @param {object} profile - Personality profile
 * @returns {object} - Analysis of changes
 */
export function analyzeProfileEvolution(profile) {
  if (!profile.profileHistory || profile.profileHistory.length === 0) {
    return { message: 'No history available' };
  }
  
  const history = profile.profileHistory;
  const first = history[0];
  const last = history[history.length - 1];
  
  // Calculate total changes
  const totalChanges = {};
  Object.keys(PERSONALITY_TRAITS).forEach(traitKey => {
    const trait = traitKey.toLowerCase();
    totalChanges[trait] = (profile[trait] || 0.5) - 0.5; // Compare to starting value
  });
  
  // Find biggest shifts
  const biggestShifts = Object.entries(totalChanges)
    .map(([trait, change]) => ({
      trait,
      change,
      direction: change > 0 ? 'increased' : 'decreased',
    }))
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 3);
  
  // Determine trend
  const recentChanges = history.slice(-5);
  const trendAnalysis = analyzeTrend(recentChanges);
  
  return {
    totalDecisions: history.length,
    biggestShifts,
    currentArchetype: getPersonalityArchetype(profile),
    trend: trendAnalysis,
  };
}

/**
 * Analyze recent trend in personality changes
 * @param {Array} recentHistory - Recent profile changes
 * @returns {object} - Trend information
 */
function analyzeTrend(recentHistory) {
  if (recentHistory.length < 2) {
    return { trend: 'insufficient_data' };
  }
  
  const traitChanges = {};
  
  recentHistory.forEach(entry => {
    Object.entries(entry.changes).forEach(([trait, change]) => {
      if (!traitChanges[trait]) traitChanges[trait] = [];
      traitChanges[trait].push(change.delta);
    });
  });
  
  // Find traits with consistent trends
  const trends = {};
  Object.entries(traitChanges).forEach(([trait, deltas]) => {
    const avg = deltas.reduce((sum, d) => sum + d, 0) / deltas.length;
    if (Math.abs(avg) > 0.05) {
      trends[trait] = {
        direction: avg > 0 ? 'increasing' : 'decreasing',
        strength: Math.abs(avg),
      };
    }
  });
  
  return {
    trend: 'evolving',
    recentTrends: trends,
  };
}

/**
 * Predict likely next choices based on profile
 * @param {object} profile - Personality profile
 * @returns {Array} - Predicted preferences
 */
export function predictChoicePreferences(profile) {
  const summary = getProfileSummary(profile);
  const top3 = summary.slice(0, 3);
  
  // Map traits to likely choice types
  const traitToChoice = {
    aggression: 'AGGRESSIVE',
    caution: 'CAUTIOUS',
    diplomacy: 'DIPLOMATIC',
    creativity: 'CREATIVE',
    leadership: 'LEADERSHIP',
    loyalty: 'LOYAL',
    independence: 'INDEPENDENT',
    morality: 'MORAL',
  };
  
  return top3.map(trait => ({
    choiceType: traitToChoice[trait.key],
    likelihood: trait.percentage,
    icon: trait.icon,
  }));
}

/**
 * Compare profile with NPC personality
 * @param {object} playerProfile - Player's profile
 * @param {object} npcTraits - NPC's traits
 * @returns {object} - Compatibility analysis
 */
export function calculateCompatibility(playerProfile, npcTraits) {
  const traits = Object.keys(npcTraits);
  
  let compatibility = 0;
  const similarities = [];
  const differences = [];
  
  traits.forEach(trait => {
    const playerValue = playerProfile[trait] || 0.5;
    const npcValue = npcTraits[trait] || 0.5;
    const difference = Math.abs(playerValue - npcValue);
    
    if (difference < 0.2) {
      similarities.push({ trait, similarity: 1 - difference });
      compatibility += (1 - difference);
    } else {
      differences.push({ trait, difference });
      compatibility -= difference * 0.5;
    }
  });
  
  // Normalize to 0-100 scale
  const normalizedCompatibility = Math.max(0, Math.min(100, 
    (compatibility / traits.length) * 100
  ));
  
  return {
    score: Math.round(normalizedCompatibility),
    similarities,
    differences,
    verdict: getCompatibilityVerdict(normalizedCompatibility),
  };
}

/**
 * Get compatibility verdict based on score
 * @param {number} score - Compatibility score
 * @returns {string} - Verdict
 */
function getCompatibilityVerdict(score) {
  if (score >= 80) return 'Highly Compatible';
  if (score >= 60) return 'Compatible';
  if (score >= 40) return 'Neutral';
  if (score >= 20) return 'Incompatible';
  return 'Highly Incompatible';
}

/**
 * Generate profile reveal text
 * @param {object} profile - Personality profile
 * @returns {string} - Descriptive text
 */
export function generateProfileRevealText(profile) {
  const archetype = getPersonalityArchetype(profile);
  const dominant = getDominantTraits(profile, 3);
  const analysis = analyzeProfileEvolution(profile);
  
  return `You are "${archetype.name}" - ${archetype.description}

Your dominant traits:
${dominant.map(t => `• ${t.name}: ${t.percentage}% ${t.icon}`).join('\n')}

${analysis.biggestShifts.length > 0 ? `
Your journey has shaped you:
${analysis.biggestShifts.map(s => 
  `• ${s.trait} has ${s.direction} significantly`
).join('\n')}` : ''}

This unique combination of traits will determine your fate in the final chapters.`;
}

export default {
  updateProfile,
  getProfileSummary,
  getDominantTraits,
  getPersonalityArchetype,
  analyzeProfileEvolution,
  predictChoicePreferences,
  calculateCompatibility,
  generateProfileRevealText,
};