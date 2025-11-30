import { state } from '../state.js';
import { getPlayerStats } from '../playerStats.js';
import { formationConfig } from '../../config/formationConfig.js';
import { spellConfig } from '../../config/spellConfig.js';

const panelEl = document.getElementById('combat-bottom-panel');
const barEl = document.getElementById('player-health-bar');
const textEl = document.getElementById('player-health-text');
const shieldBarContainer = document.getElementById('player-shield-bar-container');
const shieldBarEl = document.getElementById('player-shield-bar');
const shieldTextEl = document.getElementById('player-shield-text');
const soulPanelEl = document.getElementById('player-soul-panel');
const soulBarEl = document.getElementById('player-soul-bar');
const soulTextEl = document.getElementById('player-soul-text');
const soulTipEl = document.getElementById('player-soul-tip');
const spiritBarEl = document.getElementById('player-spirit-bar');
const spiritTextEl = document.getElementById('player-spirit-text');
const battleActiveFormationWrapper = document.getElementById('battle-active-formation-wrapper');
const battleActiveFormationList = document.getElementById('battle-active-formation-list');
const battleActiveFormationTitle = document.getElementById('battle-active-formation-title');
const spellBarEl = document.getElementById('spell-bar');

let lastActiveFormationIds = null;

const visibleStates = new Set(['PLAYING', 'PAUSED', 'AFFIX_SELECTION']);

function syncPanelVisibility() {
    const shouldShow = visibleStates.has(state.gameState);

    if (panelEl) {
        panelEl.classList.toggle('hidden', !shouldShow);
    }
    if (soulPanelEl) {
        soulPanelEl.classList.toggle('hidden', !shouldShow);
    }

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

    // Shield Update
    if (shieldBarContainer && shieldBarEl) {
        const shield = state.player.shield || 0;
        
        // Always show container (it acts as a placeholder now)
        shieldBarContainer.classList.remove('hidden');

        if (shield > 0) {
            const maxShield = state.player.maxShield || shield;
            const shieldRatio = Math.min(1, shield / maxShield);
            shieldBarEl.style.width = `${shieldRatio * 100}%`;
            
            if (shieldTextEl) {
                shieldTextEl.textContent = `(护盾: ${Math.ceil(shield)})`;
                shieldTextEl.classList.remove('hidden');
            }
        } else {
            shieldBarEl.style.width = '0%';
            if (shieldTextEl) {
                shieldTextEl.classList.add('hidden');
            }
        }
    }

    // 灵魂条与提示（竖直条：用高度来表示进度）
    if (soulBarEl && soulTextEl) {
        const capacity = Math.max(1, state.soulCapacity || 1);
        const soulCount = Math.max(0, state.soulCount || 0);
        const soulRatio = Math.min(1, soulCount / capacity);
        // 竖直灵魂条：使用 height 百分比，而不是 width
        soulBarEl.style.height = `${(soulRatio * 100).toFixed(1)}%`;
        soulBarEl.classList.toggle('ready', !!state.soulReady);
        if (soulBarEl.parentElement) {
            soulBarEl.parentElement.classList.toggle('ready', !!state.soulReady);
        }
        soulTextEl.textContent = `${soulCount.toFixed(1)} / ${capacity}`;
        if (soulTipEl) {
            // F键始终显示，未满时为灰色，满了之后为黄色
            soulTipEl.classList.toggle('ready', !!state.soulReady);
        }
    }

    // 灵力条（蓝色） - 使用 getPlayerStats().spiritualPower 作为参考上限
    if (spiritBarEl && spiritTextEl) {
        const maxMana = Math.max(1, derivedStats?.maxMana || 100);
        const currentMana = Math.max(0, state.player.mana || 0);
        const manaRatio = Math.min(1, currentMana / maxMana);
        spiritBarEl.style.width = `${(manaRatio * 100).toFixed(1)}%`;
        spiritTextEl.textContent = `${Math.floor(currentMana)} / ${Math.floor(maxMana)}`;
    }

    // 战斗阵法列表 - 显示所有激活的战斗阵法
    updateBattleActiveFormationDisplay();
}

function updateBattleActiveFormationDisplay() {
    if (!battleActiveFormationWrapper || !battleActiveFormationList) return;

    const activeCombatFormations = [];
    if (state.activeFormations) {
        Object.keys(state.activeFormations).forEach(id => {
            if (!state.activeFormations[id]) return;
            const formation = formationConfig[id];
            if (formation && formation.type === 'combat') {
                activeCombatFormations.push(formation);
            }
        });
    }

    const limitValue = state.maxCombatFormations || 0;
    const limitText = limitValue > 0 ? limitValue : '∞';
    if (battleActiveFormationTitle) {
        battleActiveFormationTitle.textContent = `已启用战斗阵法 (${activeCombatFormations.length}/${limitText})`;
    }

    // Check if formations have changed to avoid unnecessary DOM updates (which kill tooltips)
    const currentIds = activeCombatFormations.map(f => f.id).sort().join(',');
    if (currentIds === lastActiveFormationIds) return;
    lastActiveFormationIds = currentIds;

    battleActiveFormationList.innerHTML = '';

    // Always show wrapper to reserve space
    battleActiveFormationWrapper.classList.remove('hidden');

    if (activeCombatFormations.length === 0) {
        return;
    }

    activeCombatFormations.forEach(formation => {
        const el = document.createElement('div');
        // Use icon if available, otherwise first char of name
        const iconText = formation.icon || formation.name.charAt(0);
        el.textContent = iconText;
        
        // Style similar to buff icons but distinct for formations
        el.style.cssText = `
            width: 28px; 
            height: 28px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            border: 1px solid #FFD700; 
            border-radius: 6px; 
            color: #FFD700; 
            font-size: 16px; 
            background: rgba(0, 0, 0, 0.6); 
            cursor: pointer;
            user-select: none;
            transition: all 0.2s;
        `;

        // Hover effect
        el.addEventListener('mouseenter', (e) => {
            el.style.background = 'rgba(255, 215, 0, 0.2)';
            el.style.boxShadow = '0 0 8px rgba(255, 215, 0, 0.4)';
            
            const tooltip = document.getElementById('game-tooltip');
            if (tooltip) {
                tooltip.textContent = `[阵法] ${formation.name}\n${formation.description}`;
                tooltip.classList.remove('hidden');
                // Anchor bottom-left (appear top-right of cursor)
                tooltip.style.transform = 'translateY(-100%)';
                tooltip.style.left = e.clientX + 12 + 'px';
                tooltip.style.top = e.clientY - 8 + 'px';
            }
        });

        el.addEventListener('mousemove', (e) => {
            const tooltip = document.getElementById('game-tooltip');
            if (tooltip) {
                tooltip.style.transform = 'translateY(-100%)';
                tooltip.style.left = e.clientX + 12 + 'px';
                tooltip.style.top = e.clientY - 8 + 'px';
            }
        });

        el.addEventListener('mouseleave', () => {
            el.style.background = 'rgba(0, 0, 0, 0.6)';
            el.style.boxShadow = 'none';

            const tooltip = document.getElementById('game-tooltip');
            if (tooltip) {
                tooltip.classList.add('hidden');
                tooltip.style.transform = ''; // Reset transform
            }
        });

        // Click to open formation screen
        el.addEventListener('click', () => {
            if (window.openCombatFormationScreen) {
                window.openCombatFormationScreen();
            } else if (window.openFormationScreen) {
                window.openFormationScreen('combat');
            } else {
                const formationBtn = document.getElementById('formation-btn');
                if (formationBtn) formationBtn.click();
                if (window.switchFormationTab) window.switchFormationTab('combat');
            }
        });

        battleActiveFormationList.appendChild(el);
    });
}

export function updateSpellBar() {
    if (!spellBarEl) return;
    
    const shouldShow = visibleStates.has(state.gameState);
    spellBarEl.classList.toggle('hidden', !shouldShow);
    
    if (!shouldShow) return;
    
    spellBarEl.innerHTML = '';
    
    for (let i = 0; i < 3; i++) {
        const spellId = state.equippedSpells[i];
        const slot = document.createElement('div');
        slot.style.cssText = `
            width: 50px;
            height: 50px;
            background: rgba(0,0,0,0.6);
            border: 2px solid #555;
            border-radius: 5px;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 24px;
            color: #fff;
        `;
        
        const keyLabel = document.createElement('div');
        keyLabel.textContent = i + 1;
        keyLabel.style.cssText = `
            position: absolute;
            top: -10px;
            left: -5px;
            background: #333;
            border: 1px solid #777;
            border-radius: 3px;
            font-size: 10px;
            padding: 1px 4px;
            color: #fff;
        `;
        slot.appendChild(keyLabel);
        
        if (spellId) {
            const spell = spellConfig[spellId];
            if (spell) {
                const iconSpan = document.createElement('span');
                iconSpan.textContent = spell.icon || '🔮';
                slot.appendChild(iconSpan);
                slot.title = spell.name;
                
                const cd = state.spellCooldowns[spellId];
                if (cd > 0) {
                    const ratio = cd / spell.cooldown;
                    const overlay = document.createElement('div');
                    overlay.style.cssText = `
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        height: ${ratio * 100}%;
                        background: rgba(0, 0, 0, 0.7);
                        transition: height 0.1s linear;
                    `;
                    slot.appendChild(overlay);
                    
                    const cdText = document.createElement('div');
                    cdText.textContent = (cd / 1000).toFixed(1);
                    cdText.style.cssText = `
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 14px;
                        font-weight: bold;
                        text-shadow: 1px 1px 2px black;
                    `;
                    slot.appendChild(cdText);
                }
            }
        }
        
        spellBarEl.appendChild(slot);
    }
}

