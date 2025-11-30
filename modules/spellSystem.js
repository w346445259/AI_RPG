import { state } from './state.js';
import { spellConfig } from '../config/spellConfig.js';
import { getNearestMonster } from './utils.js';
import { getPlayerStats } from './playerStats.js';
import { showNotification } from './ui/common.js';
import { applyBuff } from './buff.js';
import { cameraConfig } from '../config/cameraConfig.js';

export function updateSpells(dt) {
    // Update cooldowns
    for (const spellId in state.spellCooldowns) {
        state.spellCooldowns[spellId] -= dt * 1000;
        if (state.spellCooldowns[spellId] <= 0) {
            delete state.spellCooldowns[spellId];
        }
    }
}

export function castSpell(slotIndex) {
    if (!state.equippedSpells || !state.equippedSpells[slotIndex]) return;
    
    const spellId = state.equippedSpells[slotIndex];
    const spell = spellConfig[spellId];
    
    if (!spell) return;
    
    // Check cooldown
    if (state.spellCooldowns[spellId] > 0) {
        return;
    }
    
    // Check cost
    const manaCost = spell.manaCost || spell.spiritCost || 0;
    if (state.player.mana < manaCost) {
        showNotification("法力不足！");
        return;
    }
    
    const stats = getPlayerStats();
    const spellPowerMultiplier = 1 + (stats.spellPower || 0);
    
    // Damage linked to spiritualPower instead of attack, amplified by spellPower
    const damage = (stats.spiritualPower || 0) * (spell.damageMultiplier || 1) * spellPowerMultiplier;
    
    let success = false;
    
    if (spell.type === 'active') {
        // Target mouse position (Convert from Screen/Canvas space to World space)
        let targetX, targetY;
        
        if (state.mouse) {
            const zoom = cameraConfig.zoomLevel || 1;
            targetX = (state.mouse.x / zoom) + state.camera.x;
            targetY = (state.mouse.y / zoom) + state.camera.y;
        } else {
            targetX = state.player.x + 100;
            targetY = state.player.y;
        }
        
        spawnSpellProjectile(spell, targetX, targetY, damage);
        success = true;
    } else if (spell.type === 'buff') {
        if (spell.buffId) {
             let customValue = null;
             // Calculate shield amount based on spiritualPower if multiplier exists
             if (spell.shieldMultiplier) {
                 customValue = (stats.spiritualPower || 0) * spell.shieldMultiplier * spellPowerMultiplier;
             }
             applyBuff(spell.buffId, spell.duration, customValue);
             success = true;
        }
    }
    
    if (success) {
        state.player.mana -= manaCost;
        state.spellCooldowns[spellId] = spell.cooldown;
    }
}

function spawnSpellProjectile(spell, targetX, targetY, damage) {
    const dx = targetX - state.player.x;
    const dy = targetY - state.player.y;
    const angle = Math.atan2(dy, dx);
    const speed = 500; // Default speed
    
    state.bullets.push({
        x: state.player.x,
        y: state.player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: damage,
        life: 2,
        color: spell.id === 1 ? '#FF5722' : '#00BCD4',
        radius: 10,
        penetration: spell.penetration || 0,
        hitIds: [],
        isEnemy: false,
        type: 'penetrate' // Default to penetrate logic
    });
}
