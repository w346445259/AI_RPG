import { state } from './state.js';
import { itemConfig } from '../config/itemConfig.js';
import { weaponConfig } from '../config/weaponConfig.js';
import { showNotification, updateForgingUI, updateInventoryUI, updatePlayerStatsDisplay } from './ui.js';

export function addSessionItem(itemId, count) {
    if (!state.sessionInventory[itemId]) state.sessionInventory[itemId] = 0;
    state.sessionInventory[itemId] += count;
}

export function persistSessionItems() {
    for (const itemId in state.sessionInventory) {
        const count = state.sessionInventory[itemId];
        if (!state.inventory[itemId]) state.inventory[itemId] = 0;
        state.inventory[itemId] += count;
    }
    localStorage.setItem('inventory', JSON.stringify(state.inventory));
    state.sessionInventory = {};
}

export function addItem(itemId, count) {
    if (!state.inventory[itemId]) state.inventory[itemId] = 0;
    state.inventory[itemId] += count;
    localStorage.setItem('inventory', JSON.stringify(state.inventory));
    showNotification(`获得 ${itemConfig[itemId].name} x${count}`);
}

export function forgeWeapon(id) {
    const weapon = weaponConfig[id];
    if (!weapon || !weapon.crafting) return;
    
    for (const matId in weapon.crafting.materials) {
        const required = weapon.crafting.materials[matId];
        const owned = state.inventory[matId] || 0;
        if (owned < required) {
            showNotification('材料不足！');
            return;
        }
    }
    
    for (const matId in weapon.crafting.materials) {
        const required = weapon.crafting.materials[matId];
        state.inventory[matId] -= required;
    }
    localStorage.setItem('inventory', JSON.stringify(state.inventory));
    
    state.ownedWeapons.push(parseInt(id));
    localStorage.setItem('ownedWeapons', JSON.stringify(state.ownedWeapons));
    
    showNotification(`锻造成功: ${weapon.name}`);
    updateForgingUI();
    if (state.gameState === 'INVENTORY') updateInventoryUI();
}

export function equipWeapon(id) {
    state.equippedWeaponId = id;
    localStorage.setItem('equippedWeaponId', id);
    updateInventoryUI();
    updatePlayerStatsDisplay();
}
