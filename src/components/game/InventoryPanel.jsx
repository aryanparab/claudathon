import React, { useState } from 'react';

/**
 * InventoryPanel - Item display and management
 * 
 * Shows:
 * - Item grid
 * - Item tooltips
 * - Gold counter
 * - Use/drop actions
 * - Item categories
 */

const InventoryPanel = ({ inventory, gold }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Item category icons
  const CATEGORY_ICONS = {
    'weapon': '⚔️',
    'armor': '🛡️',
    'potion': '🧪',
    'key': '🔑',
    'quest': '📜',
    'misc': '📦',
    'consumable': '🍎',
    'treasure': '💎'
  };

  // Item rarity colors
  const RARITY_COLORS = {
    'common': '#95a5a6',
    'uncommon': '#2ecc71',
    'rare': '#3498db',
    'epic': '#9b59b6',
    'legendary': '#f39c12'
  };

  // Get item icon
  const getItemIcon = (item) => {
    const category = item.category?.toLowerCase() || 'misc';
    return CATEGORY_ICONS[category] || '📦';
  };

  // Get item rarity color
  const getRarityColor = (item) => {
    const rarity = item.rarity?.toLowerCase() || 'common';
    return RARITY_COLORS[rarity] || '#95a5a6';
  };

  // Handle item click
  const handleItemClick = (item) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item);
  };

  // Group items by category
  const groupedItems = (inventory || []).reduce((groups, item) => {
    const category = item.category || 'misc';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  const itemCount = inventory?.length || 0;

  return (
    <div className="inventory-panel">
      <div className="panel-header">
        <h3>Inventory</h3>
        <span className="item-count">{itemCount} items</span>
      </div>

      {/* Gold display */}
      <div className="gold-display">
        <span className="gold-icon">💰</span>
        <span className="gold-amount">{gold || 0}</span>
        <span className="gold-label">Gold</span>
      </div>

      <div className="inventory-content">
        {itemCount === 0 ? (
          <div className="empty-state">
            <p>No items yet</p>
            <span className="empty-hint">Find items on your journey</span>
          </div>
        ) : (
          <div className="inventory-categories">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="item-category">
                <h4 className="category-header">
                  <span className="category-icon">
                    {CATEGORY_ICONS[category.toLowerCase()] || '📦'}
                  </span>
                  <span className="category-name">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                  <span className="category-count">({items.length})</span>
                </h4>

                <div className="item-grid">
                  {items.map(item => {
                    const isSelected = selectedItem?.id === item.id;
                    const isHovered = hoveredItem?.id === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`item-card ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                        onClick={() => handleItemClick(item)}
                        onMouseEnter={() => setHoveredItem(item)}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{
                          borderColor: getRarityColor(item)
                        }}
                      >
                        <div className="item-icon">
                          {getItemIcon(item)}
                        </div>

                        <div className="item-info">
                          <span className="item-name">{item.name}</span>
                          {item.quantity && item.quantity > 1 && (
                            <span className="item-quantity">×{item.quantity}</span>
                          )}
                        </div>

                        {/* Rarity indicator */}
                        <div 
                          className="item-rarity"
                          style={{ backgroundColor: getRarityColor(item) }}
                        />

                        {/* Hover tooltip */}
                        {isHovered && (
                          <div className="item-tooltip">
                            <h5 className="tooltip-name">{item.name}</h5>
                            {item.rarity && (
                              <p className="tooltip-rarity" style={{ color: getRarityColor(item) }}>
                                {item.rarity}
                              </p>
                            )}
                            {item.description && (
                              <p className="tooltip-description">{item.description}</p>
                            )}
                            {item.effects && item.effects.length > 0 && (
                              <div className="tooltip-effects">
                                <strong>Effects:</strong>
                                <ul>
                                  {item.effects.map((effect, idx) => (
                                    <li key={idx}>{effect}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {item.value && (
                              <p className="tooltip-value">
                                Value: {item.value} gold
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected item details */}
        {selectedItem && (
          <div className="selected-item-panel">
            <div className="selected-header">
              <h4>{selectedItem.name}</h4>
              <button 
                className="close-btn"
                onClick={() => setSelectedItem(null)}
              >
                ×
              </button>
            </div>

            <div className="selected-details">
              {selectedItem.description && (
                <p className="selected-description">{selectedItem.description}</p>
              )}

              {selectedItem.effects && selectedItem.effects.length > 0 && (
                <div className="selected-effects">
                  <strong>Effects:</strong>
                  <ul>
                    {selectedItem.effects.map((effect, idx) => (
                      <li key={idx}>{effect}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action buttons */}
              <div className="item-actions">
                {selectedItem.usable && (
                  <button className="btn-use">
                    Use Item
                  </button>
                )}
                {selectedItem.droppable !== false && (
                  <button className="btn-drop">
                    Drop
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;