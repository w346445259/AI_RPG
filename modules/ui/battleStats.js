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

const formulaElements = {
    strength: document.getElementById('battle-formula-strength'),
    defense: document.getElementById('battle-formula-defense'),
    physique: document.getElementById('battle-formula-physique'),
    agility: document.getElementById('battle-formula-agility'),
    comprehension: document.getElementById('battle-formula-comprehension'),
    maxHp: document.getElementById('battle-formula-maxhp'),
    hpRegen: document.getElementById('battle-formula-hpregen'),
    speed: document.getElementById('battle-formula-speed'),
    critChance: document.getElementById('battle-formula-critChance'),
    critDamage: document.getElementById('battle-formula-critDamage'),
    soulAmplification: document.getElementById('battle-formula-soulAmp'),
    spiritualPower: document.getElementById('battle-formula-spiritualPower')
};

let isVisible = false;
let initialized = false;

const panelAllowedStates = new Set(['PLAYING', 'PAUSED', 'AFFIX_SELECTION']);

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
        updateFormulaText(key, data);
    });
}

function syncVisibility(stats) {
    if (!panel || !toggleBtn) return;
    const allowPanel = panelAllowedStates.has(state.gameState);
    toggleBtn.classList.toggle('hidden', !allowPanel);
    if (!allowPanel) {
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
    if (!panelAllowedStates.has(state.gameState) && forceVisible !== false) return;
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

function updateFormulaText(key, stats) {
    const formulaEl = formulaElements[key];
    if (!formulaEl) return;
    const info = (stats.statFormulas && stats.statFormulas[key]) || { base: stats[key] ?? 0, formation: 0, affix: 0, affixAdd: 0 };
    const hasFormation = Math.abs(info.formation || 0) > 0.0001;
    const hasAffix = Math.abs(info.affix || 0) > 0.0001;
    const hasAffixAdd = Math.abs(info.affixAdd || 0) > 0.0001;
    if (!hasFormation && !hasAffix && !hasAffixAdd) {
        formulaEl.textContent = '';
        formulaEl.classList.add('hidden');
        return;
    }

    const baseStr = formatFormulaBase(key, info.base);
    const segments = [`<span class="formula-base">${baseStr}</span>`];
    if (hasFormation) {
        const formationStr = formatPercentValue(info.formation);
        segments.push(`(1 + <span class="formula-formation">${formationStr}</span>)`);
    }
    if (hasAffix) {
        const affixStr = formatPercentValue(info.affix);
        segments.push(`(1 + <span class="formula-affix">${affixStr}</span>)`);
    }
    let expression;
    if (segments.length > 1) {
        expression = `(${segments.join(' * ')})`;
    } else {
        expression = segments[0];
    }
    if (hasAffixAdd) {
        const addStr = formatPercentValue(info.affixAdd);
        expression += ` + <span class="formula-affix">${addStr}</span>`;
    }
    formulaEl.innerHTML = expression;
    formulaEl.classList.remove('hidden');
}

function formatFormulaBase(key, value) {
    if (!Number.isFinite(value)) return '0';
    if (key === 'hpRegen' || key === 'speed') {
        return value.toFixed(1);
    }
    if (key === 'critChance' || key === 'soulAmplification') {
        return value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
    }
    if (key === 'critDamage') {
        return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
    }
    return Math.floor(value).toString();
}

function formatPercentValue(value) {
    if (!Number.isFinite(value)) return '0.00';
    return value.toFixed(2);
}
