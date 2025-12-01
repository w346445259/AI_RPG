import { state } from './state.js';
import { buffConfig } from '../config/buffConfig.js';
import { showNotification } from './ui/common.js';
import { updateBuffUI } from './ui/buff.js';
import { updatePlayerStatsDisplay } from './ui/lobby.js';

export function applyBuff(buffId, duration, customValue = null) {
    const config = buffConfig[buffId];
    if (!config) return;

    let appliedValue = config.value;

    // Handle immediate effects
    if (config.type === 'shield_add') {
        appliedValue = customValue !== null ? customValue : config.value;
        state.player.shield = (state.player.shield || 0) + appliedValue;
        state.player.maxShield = Math.max((state.player.maxShield || 0), state.player.shield);
    }

    // Handle elemental attack toggle on apply
    if (config.type === 'attack_element' && Array.isArray(config.elements)) {
        if (!state.attackElements) {
            state.attackElements = {
                metal: false,
                wood: false,
                water: false,
                fire: false,
                earth: false
            };
        }
        config.elements.forEach(el => {
            if (el === 'metal') state.attackElements.metal = true;
            if (el === 'wood') state.attackElements.wood = true;
            if (el === 'water') state.attackElements.water = true;
            if (el === 'fire') state.attackElements.fire = true;
            if (el === 'earth') state.attackElements.earth = true;
        });
        // Elemental imbues are temporary combat effects; do not persist to localStorage
    }

    const existingBuff = state.activeBuffs.find(b => b.id === buffId);
    if (existingBuff) {
        existingBuff.duration = duration;
        existingBuff.maxDuration = duration;
        existingBuff.value = appliedValue;
    } else {
        state.activeBuffs.push({
            id: buffId,
            duration: duration,
            maxDuration: duration,
            value: appliedValue
        });
    }
    
    showNotification(`获得状态: ${config.name}`);
    updateBuffUI();
    updatePlayerStatsDisplay();
}

export function queueBattleBuff(buffId, duration) {
    const config = buffConfig[buffId];
    if (!config) return;

    if (!state.pendingBattleBuffs) state.pendingBattleBuffs = {};
    state.pendingBattleBuffs[buffId] = duration;
    showNotification(`调试: ${config.name} 将在下次战斗生效`);
}

export function applyQueuedBattleBuffs() {
    if (!state.pendingBattleBuffs) return;
    const entries = Object.entries(state.pendingBattleBuffs);
    if (entries.length === 0) return;

    entries.forEach(([buffId, duration]) => {
        applyBuff(parseInt(buffId, 10), duration);
    });

    state.pendingBattleBuffs = {};
}

export function clearAllBuffs() {
    // Revert effects of all active buffs similar to updateBuffs expiration
    if (state.activeBuffs && state.activeBuffs.length > 0) {
        state.activeBuffs.forEach(buff => {
            const config = buffConfig[buff.id];
            if (!config) return;

            if (config.type === 'shield_add') {
                const removeValue = buff.value !== undefined ? buff.value : config.value;
                state.player.shield = Math.max(0, (state.player.shield || 0) - removeValue);
            }

            if (config.type === 'attack_element' && Array.isArray(config.elements)) {
                if (!state.attackElements) {
                    state.attackElements = {
                        metal: false,
                        wood: false,
                        water: false,
                        fire: false,
                        earth: false
                    };
                }
                config.elements.forEach(el => {
                    if (el === 'metal') state.attackElements.metal = false;
                    if (el === 'wood') state.attackElements.wood = false;
                    if (el === 'water') state.attackElements.water = false;
                    if (el === 'fire') state.attackElements.fire = false;
                    if (el === 'earth') state.attackElements.earth = false;
                });
            }
        });
    }

    // Ensure elemental flags are fully reset even if no active buff remains
    if (state.attackElements) {
        state.attackElements.metal = false;
        state.attackElements.wood = false;
        state.attackElements.water = false;
        state.attackElements.fire = false;
        state.attackElements.earth = false;
    }

    state.activeBuffs = [];

    updateBuffUI();
    updatePlayerStatsDisplay();
}

export function updateBuffs(dt) {
    if (state.activeBuffs.length === 0) return;

    let changed = false;
    for (let i = state.activeBuffs.length - 1; i >= 0; i--) {
        const buff = state.activeBuffs[i];
        buff.duration -= dt * 1000;
        if (buff.duration <= 0) {
            // Handle expiration effects
            const config = buffConfig[buff.id];
            if (config) {
                if (config.type === 'shield_add') {
                    const removeValue = buff.value !== undefined ? buff.value : config.value;
                    state.player.shield = Math.max(0, (state.player.shield || 0) - removeValue);
                }
                if (config.type === 'attack_element' && Array.isArray(config.elements)) {
                    if (!state.attackElements) {
                        state.attackElements = {
                            metal: false,
                            wood: false,
                            water: false,
                            fire: false,
                            earth: false
                        };
                    }
                    config.elements.forEach(el => {
                        if (el === 'metal') state.attackElements.metal = false;
                        if (el === 'wood') state.attackElements.wood = false;
                        if (el === 'water') state.attackElements.water = false;
                        if (el === 'fire') state.attackElements.fire = false;
                        if (el === 'earth') state.attackElements.earth = false;
                    });
                }
            }

            state.activeBuffs.splice(i, 1);
            changed = true;
        }
    }
    
    // 只有当buff消失或者每秒更新一次UI (为了倒计时)
    // 这里为了性能，我们可以在UI层做倒计时动画，或者每秒刷新一次
    // 暂时简单处理：每帧更新数据，UI层由主循环控制刷新频率
}
