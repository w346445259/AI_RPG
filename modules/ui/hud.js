import { state } from '../state.js';
import { getPlayerStats } from '../playerStats.js';

const panelEl = document.getElementById('player-health-panel');
const barEl = document.getElementById('player-health-bar');
const textEl = document.getElementById('player-health-text');

const visibleStates = new Set(['PLAYING', 'PAUSED', 'AFFIX_SELECTION']);

function syncPanelVisibility() {
    if (!panelEl) return false;
    const shouldShow = visibleStates.has(state.gameState);
    panelEl.classList.toggle('hidden', !shouldShow);
    return shouldShow;
}

export function initPlayerHealthPanel() {
    syncPanelVisibility();
    updatePlayerHealthPanel();
}

export function updatePlayerHealthPanel(stats) {
    if (!panelEl || !barEl || !textEl) return;
    const isVisible = syncPanelVisibility();
    if (!isVisible) return;

    const derivedStats = stats || getPlayerStats();
    const maxHp = Math.max(1, derivedStats?.maxHp ?? state.player?.maxHp ?? 1);
    const currentHp = Math.max(0, Math.min(maxHp, state.player?.hp ?? 0));
    const ratio = currentHp / maxHp;

    barEl.style.width = `${(ratio * 100).toFixed(1)}%`;
    textEl.textContent = `${Math.ceil(currentHp)} / ${Math.ceil(maxHp)}`;
}
