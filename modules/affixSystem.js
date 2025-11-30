import { state } from './state.js';
import { affixPool, affixConfig } from '../config/affixConfig.js';
import { weaponConfig } from '../config/weaponConfig.js';
import { getActiveWeaponConfig } from './weaponUtils.js';
import { showAffixSelection, hideAffixSelection } from './ui/affix.js';
import { updatePlayerStatsDisplay } from './ui/lobby.js';
import { getPlayerStats } from './playerStats.js';

const SOUL_CAPACITY = 20;

export function initAffixSystem() {
    state.activeAffixes = [];
    state.pendingAffixChoices = [];
    state.soulCapacity = SOUL_CAPACITY;
    state.soulCount = 0;
    state.soulReady = false;
    state.runAffixPool = buildRunAffixPool();
    hideAffixSelection();
}

export function gainSoulFromKill(baseSouls = 1) {
    if (state.hasWon) return;
    if (state.gameState !== 'PLAYING') return;
    const stats = getPlayerStats();
    const amp = Math.max(0, stats.soulAmplification || 0);
    const gain = baseSouls * (1 + amp);
    state.soulCount += gain;
    updateSoulReadyFlag();
}

export function attemptSoulAwakening() {
    if (state.gameState !== 'PLAYING') return;
    if (!state.soulReady) return;
    if (state.hasWon) return;

    const options = drawAffixOptions(3);
    state.pendingAffixChoices = options.map(option => option.id);
    showAffixSelection(options);
    state.gameState = 'AFFIX_SELECTION';
    state.soulReady = false;
}

export function selectAffix(affixId) {
    const config = affixConfig[affixId];
    if (!config) return;
    if (Array.isArray(state.pendingAffixChoices) && state.pendingAffixChoices.length > 0) {
        if (!state.pendingAffixChoices.includes(affixId)) return;
    }

    if (!Array.isArray(state.activeAffixes)) {
        state.activeAffixes = [];
    }

    state.activeAffixes.push(affixId);
    state.pendingAffixChoices = [];
    hideAffixSelection();
    state.gameState = 'PLAYING';
    state.soulCount = Math.max(0, state.soulCount - state.soulCapacity);
    state.soulCapacity += 10;
    updatePlayerStatsDisplay();
    updateSoulReadyFlag();
}

export function skipAffixSelection() {
    state.pendingAffixChoices = [];
    hideAffixSelection();
    state.gameState = 'PLAYING';
    updateSoulReadyFlag();
}

function drawAffixOptions(count) {
    const basePool = (Array.isArray(state.runAffixPool) && state.runAffixPool.length > 0)
        ? state.runAffixPool
        : affixPool;
    const filteredPool = filterPoolByShotCap(basePool);
    const pool = [...filteredPool];
    shuffle(pool);
    return pool.slice(0, count);
}

// 根据当前武器类型生成可用词缀池
function buildRunAffixPool() {
    const weapon = weaponConfig[state.equippedWeaponId];
    if (!weapon) {
        return [...affixPool];
    }
    const weaponType = weapon.type;
    return affixPool.filter(affix => {
        const modifier = affix.weaponModifier;
        if (!modifier) return true;
        const targets = Array.isArray(modifier.targetTypes) ? modifier.targetTypes : [];
        if (targets.length === 0) return true;
        return targets.includes(weaponType);
    });
}

// 当远程武器弹道总量达到3*3时移除相关词缀
function filterPoolByShotCap(pool) {
    const weapon = getActiveWeaponConfig();
    if (!weapon || weapon.type !== 'penetrate') return pool;
    const projectileCount = Math.max(1, weapon.projectileCount || 1);
    const burstCount = Math.max(1, weapon.burstCount || 1);
    if (projectileCount * burstCount < 9) return pool;
    const cappedIds = new Set([19, 20]);
    return pool.filter(affix => !cappedIds.has(affix.id));
}

function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
}

function updateSoulReadyFlag() {
    state.soulReady = state.soulCount >= state.soulCapacity;
}
