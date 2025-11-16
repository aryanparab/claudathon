import { AGENT_ROLES } from '../constants/gameConfig.js';
import { createItem } from '../state/GameState.js';

class InventoryAgent {
  constructor() { this.role = AGENT_ROLES.INVENTORY; }
  
  execute(gameState, previousResults = {}) {
    // Mostly local logic - no API calls needed
    const results = { itemsAdded: [], itemsRemoved: [], inventoryFull: false };
    
    // Check inventory space
    const availableSpace = gameState.inventory.maxSize - gameState.inventory.items.length;
    results.availableSpace = availableSpace;
    results.inventoryFull = availableSpace === 0;
    
    // Process item additions from consequences
    const itemsToAdd = previousResults.consequence?.immediateEffects?.itemsGained || [];
    itemsToAdd.forEach(itemData => {
      if (availableSpace > results.itemsAdded.length) {
        const item = typeof itemData === 'string' 
          ? createItem({ name: itemData, type: 'quest' })
          : createItem(itemData);
        results.itemsAdded.push(item);
      }
    });
    
    return results;
  }
  
  hasItem(gameState, itemId) {
    return gameState.inventory.items.some(item => item.id === itemId || item.name === itemId);
  }
  
  removeItem(gameState, itemId) {
    const index = gameState.inventory.items.findIndex(i => i.id === itemId || i.name === itemId);
    if (index !== -1) {
      const removed = gameState.inventory.items.splice(index, 1);
      return removed[0];
    }
    return null;
  }
}

export default new InventoryAgent();