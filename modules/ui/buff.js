import { state } from '../state.js';
import { buffConfig } from '../../config/buffConfig.js';
import { formationConfig } from '../../config/formationConfig.js';

const tooltip = document.getElementById('game-tooltip');

function showTooltip(e, text) {
    if (!tooltip) return;
    tooltip.textContent = text;
    tooltip.classList.remove('hidden');
    updateTooltipPosition(e);
}

function hideTooltip() {
    if (!tooltip) return;
    tooltip.classList.add('hidden');
}

function updateTooltipPosition(e) {
    if (!tooltip || tooltip.classList.contains('hidden')) return;
    const x = e.clientX + 10;
    const y = e.clientY - 10;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.transform = 'translate(0, -100%)';
}

function updateTooltipText(text) {
    if (!tooltip || tooltip.classList.contains('hidden')) return;
    tooltip.textContent = text;
}

function createBuffElement(id, icon, borderColor) {
    const el = document.createElement('div');
    el.id = id;
    el.style.position = 'relative';
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    el.style.border = `1px solid ${borderColor}`;
    el.style.borderRadius = '5px';
    el.style.display = 'flex';
    el.style.justifyContent = 'center';
    el.style.alignItems = 'center';
    el.style.fontSize = '16px';
    el.style.cursor = 'help';
    el.textContent = icon;
    return el;
}

export function updateBuffUI() {
    const buffBar = document.getElementById('buff-bar');
    const formationBar = document.getElementById('formation-bar');
    const activeBuffBar = document.getElementById('active-buff-bar');

    if (!buffBar || !formationBar || !activeBuffBar) return;

    if (state.gameState !== 'PLAYING') {
        buffBar.style.display = 'none';
        // Clear content to ensure no stale icons persist
        formationBar.innerHTML = '';
        activeBuffBar.innerHTML = '';
        return;
    } else {
        buffBar.style.display = 'flex';
        buffBar.classList.remove('hidden');
    }

    const activeFormationIds = new Set();
    const activeBuffIds = new Set();

    // Render Active Formations (Combat only) - MOVED TO HUD (player-health-panel)
    // if (state.activeFormations) { ... }

    // Render Active Buffs
    if (state.activeBuffs) {
        state.activeBuffs.forEach(buff => {
            const config = buffConfig[buff.id];
            if (!config) return;

            const elementId = `buff-active-${buff.id}`;
            activeBuffIds.add(elementId);

            let buffEl = document.getElementById(elementId);
            let progressBar;

            if (!buffEl) {
                buffEl = createBuffElement(elementId, config.icon, '#fff');
                activeBuffBar.appendChild(buffEl);

                progressBar = document.createElement('div');
                progressBar.className = 'buff-progress';
                progressBar.style.position = 'absolute';
                progressBar.style.bottom = '0';
                progressBar.style.left = '0';
                progressBar.style.height = '4px';
                progressBar.style.backgroundColor = '#4CAF50';
                progressBar.style.transition = 'width 0.1s linear';
                buffEl.appendChild(progressBar);

                buffEl.addEventListener('mouseenter', (e) => {
                    buffEl._isHovered = true;
                    showTooltip(e, `${config.name}\n${config.description}\n剩余时间: ${Math.ceil(buff.duration / 1000)}s`);
                });
                buffEl.addEventListener('mousemove', updateTooltipPosition);
                buffEl.addEventListener('mouseleave', () => {
                    buffEl._isHovered = false;
                    hideTooltip();
                });
            } else {
                progressBar = buffEl.querySelector('.buff-progress');
            }

            // Update Progress
            if (progressBar) {
                const progress = Math.max(0, buff.duration / buff.maxDuration);
                progressBar.style.width = `${progress * 100}%`;
            }

            // Update Tooltip if hovered
            if (buffEl._isHovered) {
                updateTooltipText(`${config.name}\n${config.description}\n剩余时间: ${Math.ceil(buff.duration / 1000)}s`);
            }
        });
    }

    // Remove stale elements from Formation Bar
    Array.from(formationBar.children).forEach(child => {
        if (!activeFormationIds.has(child.id)) {
            formationBar.removeChild(child);
        }
    });

    // Remove stale elements from Active Buff Bar
    Array.from(activeBuffBar.children).forEach(child => {
        if (!activeBuffIds.has(child.id)) {
            activeBuffBar.removeChild(child);
        }
    });
}

