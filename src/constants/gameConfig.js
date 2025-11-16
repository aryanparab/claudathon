// Game Configuration Constants
export const GAME_CONFIG = {
  TOTAL_TURNS: 50,
  TOTAL_STAGES: 5,
  TURNS_PER_STAGE: 10,
  SIDE_QUESTS_PER_STAGE: 3,
  MAX_NPCS: 15,
  MAX_INVENTORY_SIZE: 20,
  MAX_GROUP_SIZE: 8,
};

// Stage definitions
export const STAGES = [
  {
    id: 1,
    name: "The Beginning",
    turns: [1, 10],
    description: "Establish the world and meet initial characters",
    questTypes: ["recruitment", "exploration", "introduction"],
    difficultyMultiplier: 1.0,
  },
  {
    id: 2,
    name: "Rising Conflict",
    turns: [11, 20],
    description: "Build alliances or go solo, first betrayals possible",
    questTypes: ["alliance", "resource_gathering", "trust_building"],
    difficultyMultiplier: 1.3,
  },
  {
    id: 3,
    name: "The Turning Point",
    turns: [21, 30],
    description: "Major plot developments, consequences of past decisions",
    questTypes: ["confrontation", "revelation", "preparation"],
    difficultyMultiplier: 1.6,
  },
  {
    id: 4,
    name: "Escalation",
    turns: [31, 40],
    description: "Everything converges, alliances tested",
    questTypes: ["betrayal_possible", "final_preparation", "critical_choice"],
    difficultyMultiplier: 2.0,
  },
  {
    id: 5,
    name: "Endgame",
    turns: [41, 50],
    description: "Final confrontation and resolution",
    questTypes: ["finale", "resolution", "consequence"],
    difficultyMultiplier: 2.5,
  },
];

// Personality trait definitions
export const PERSONALITY_TRAITS = {
  AGGRESSION: {
    name: "Aggression",
    description: "Tendency to use force and confrontation",
    icon: "🔥",
    range: [0, 1],
  },
  CAUTION: {
    name: "Caution",
    description: "Risk aversion and careful planning",
    icon: "🛡️",
    range: [0, 1],
  },
  MORALITY: {
    name: "Morality",
    description: "Adherence to ethical principles",
    icon: "⚖️",
    range: [0, 1],
  },
  CREATIVITY: {
    name: "Creativity",
    description: "Unconventional and innovative thinking",
    icon: "💡",
    range: [0, 1],
  },
  LEADERSHIP: {
    name: "Leadership",
    description: "Ability to lead and inspire others",
    icon: "👑",
    range: [0, 1],
  },
  LOYALTY: {
    name: "Loyalty",
    description: "Commitment to allies and principles",
    icon: "🤝",
    range: [0, 1],
  },
  INDEPENDENCE: {
    name: "Independence",
    description: "Preference for solo action",
    icon: "🦅",
    range: [0, 1],
  },
  DIPLOMACY: {
    name: "Diplomacy",
    description: "Skill in negotiation and compromise",
    icon: "🕊️",
    range: [0, 1],
  },
};

// Choice personality mappings
export const CHOICE_MAPPINGS = {
  // Each choice type maps to personality adjustments
  AGGRESSIVE: {
    aggression: 0.15,
    caution: -0.10,
    diplomacy: -0.08,
  },
  CAUTIOUS: {
    caution: 0.15,
    aggression: -0.10,
    creativity: -0.05,
  },
  DIPLOMATIC: {
    diplomacy: 0.15,
    morality: 0.08,
    aggression: -0.10,
  },
  CREATIVE: {
    creativity: 0.15,
    independence: 0.08,
    caution: -0.05,
  },
  LEADERSHIP: {
    leadership: 0.15,
    independence: -0.08,
    diplomacy: 0.05,
  },
  LOYAL: {
    loyalty: 0.15,
    independence: -0.10,
    leadership: 0.05,
  },
  INDEPENDENT: {
    independence: 0.15,
    loyalty: -0.10,
    leadership: -0.05,
  },
  MORAL: {
    morality: 0.15,
    aggression: -0.08,
    loyalty: 0.05,
  },
};

// NPC personality archetypes
export const NPC_ARCHETYPES = {
  WARRIOR: {
    traits: { aggression: 0.8, loyalty: 0.7, caution: 0.3 },
    skills: ["combat", "intimidation", "protection"],
  },
  ROGUE: {
    traits: { creativity: 0.8, independence: 0.9, loyalty: 0.3 },
    skills: ["stealth", "lockpicking", "deception"],
  },
  SAGE: {
    traits: { morality: 0.8, caution: 0.7, diplomacy: 0.6 },
    skills: ["knowledge", "healing", "persuasion"],
  },
  MERCHANT: {
    traits: { diplomacy: 0.8, caution: 0.6, morality: 0.4 },
    skills: ["trading", "appraisal", "networking"],
  },
  REBEL: {
    traits: { independence: 0.9, aggression: 0.6, loyalty: 0.4 },
    skills: ["guerrilla_tactics", "inspiration", "sabotage"],
  },
  NOBLE: {
    traits: { leadership: 0.8, morality: 0.7, diplomacy: 0.7 },
    skills: ["command", "etiquette", "resources"],
  },
};

// Item types
export const ITEM_TYPES = {
  WEAPON: {
    category: "weapon",
    stackable: false,
    degradable: true,
    maxDurability: 100,
  },
  ARMOR: {
    category: "armor",
    stackable: false,
    degradable: true,
    maxDurability: 100,
  },
  CONSUMABLE: {
    category: "consumable",
    stackable: true,
    maxStack: 10,
  },
  QUEST_ITEM: {
    category: "quest",
    stackable: false,
    droppable: false,
  },
  KEY_ITEM: {
    category: "key",
    stackable: false,
    droppable: false,
  },
  CRAFTING: {
    category: "crafting",
    stackable: true,
    maxStack: 99,
  },
};

// Quest states
export const QUEST_STATES = {
  LOCKED: "locked",
  AVAILABLE: "available",
  ACTIVE: "active",
  COMPLETED: "completed",
  FAILED: "failed",
  EXPIRED: "expired",
};

// Relationship levels
export const RELATIONSHIP_LEVELS = {
  HOSTILE: { min: -100, max: -60, label: "Hostile", color: "#ef4444" },
  UNFRIENDLY: { min: -59, max: -20, label: "Unfriendly", color: "#f97316" },
  NEUTRAL: { min: -19, max: 20, label: "Neutral", color: "#6b7280" },
  FRIENDLY: { min: 21, max: 60, label: "Friendly", color: "#10b981" },
  TRUSTED: { min: 61, max: 100, label: "Trusted", color: "#3b82f6" },
};

// API Configuration
export const API_CONFIG = {
  CLAUDE_MODEL: "claude-sonnet-4-20250514",
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.7,
  BASE_URL: "https://api.anthropic.com/v1/messages",
};

// Agent roles
export const AGENT_ROLES = {
  ORCHESTRATOR: "orchestrator",
  WORLD_BUILDER: "world_builder",
  NPC_PERSONALITY: "npc_personality",
  DIALOGUE: "dialogue",
  QUEST_MANAGER: "quest_manager",
  COMBAT: "combat",
  BETRAYAL: "betrayal",
  CONSEQUENCE: "consequence",
  INVENTORY: "inventory",
  PROFILE_TRACKER: "profile_tracker",
  CONTINUITY: "continuity",
  SCENE_COMPOSER: "scene_composer",
};

export default {
  GAME_CONFIG,
  STAGES,
  PERSONALITY_TRAITS,
  CHOICE_MAPPINGS,
  NPC_ARCHETYPES,
  ITEM_TYPES,
  QUEST_STATES,
  RELATIONSHIP_LEVELS,
  API_CONFIG,
  AGENT_ROLES,
};