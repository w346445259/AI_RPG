import { state } from './state.js';
import { affixPool, affixConfig } from '../config/affixConfig.js';
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
    const pool = [...affixPool];
    shuffle(pool);
    return pool.slice(0, count);
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
