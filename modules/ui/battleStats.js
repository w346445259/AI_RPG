import { state } from '../state.js';
import { getPlayerStats } from '../playerStats.js';

const panel = document.getElementById('battle-stats-panel');
const toggleBtn = document.getElementById('battle-stats-btn');

const statElements = {
    strength: document.getElementById('battle-stat-strength'),
    defense: document.getElementById('battle-stat-defense'),
    physique: document.getElementById('battle-stat-physique'),
    agility: document.getElementById('battle-stat-agility'),
    comprehension: document.getElementById('battle-stat-comprehension'),
    maxHp: document.getElementById('battle-stat-maxhp'),
    hpRegen: document.getElementById('battle-stat-hpregen'),
    speed: document.getElementById('battle-stat-speed'),
    critChance: document.getElementById('battle-stat-critChance'),
    critDamage: document.getElementById('battle-stat-critDamage'),
    soulAmplification: document.getElementById('battle-stat-soulAmp'),
    spiritualPower: document.getElementById('battle-stat-spiritualPower')
};

let isVisible = false;
let initialized = false;

function formatStat(key, stats) {
    switch (key) {
        case 'hpRegen':
            return `${((stats.hpRegen ?? 0)).toFixed(1)}/秒`;
        case 'speed':
            return `${((stats.speed ?? 0)).toFixed(1)} 像素/秒`;
        case 'critChance':
            return `${(((stats.critChance ?? 0) * 100)).toFixed(1)}%`;
        case 'critDamage':
            return `${(((stats.critDamage ?? 0) * 100)).toFixed(0)}%`;
        case 'soulAmplification':
            return `${(((stats.soulAmplification ?? 0) * 100)).toFixed(1)}%`;
        default:
            return stats[key] !== undefined ? Math.floor(stats[key]) : '0';
    }
}

function updateText(stats) {
    if (!panel) return;
    const data = stats || getPlayerStats();
    if (!data) return;

    Object.keys(statElements).forEach(key => {
        const el = statElements[key];
        if (!el) return;
        el.textContent = formatStat(key, data);
    });
}

function syncVisibility(stats) {
    if (!panel || !toggleBtn) return;
    const shouldShowBtn = state.gameState === 'PLAYING';
    toggleBtn.classList.toggle('hidden', !shouldShowBtn);
    if (!shouldShowBtn) {
        isVisible = false;
        panel.classList.add('hidden');
        return;
    }

    if (isVisible) {
        panel.classList.remove('hidden');
        updateText(stats);
    } else {
        panel.classList.add('hidden');
    }
}

export function toggleBattleStatsPanel(forceVisible) {
    if (!panel) return;
    if (forceVisible === true) {
        isVisible = true;
    } else if (forceVisible === false) {
        isVisible = false;
    } else {
        isVisible = !isVisible;
    }
    syncVisibility();
}

function handleTabToggle(e) {
    if (e.key !== 'Tab') return;
    if (e.target) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
    }
    if (state.gameState !== 'PLAYING') return;
    e.preventDefault();
    toggleBattleStatsPanel();
}

export function initBattleStatsUI() {
    if (initialized) return;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            toggleBattleStatsPanel();
        });
    }
    document.addEventListener('keydown', handleTabToggle);
    initialized = true;
}

export function updateBattleStatsPanel(stats) {
    syncVisibility(stats);
}
