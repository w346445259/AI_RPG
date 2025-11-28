import { state } from '../state.js';
import { playerConfig } from '../../config/playerConfig.js';
import { levelConfig } from '../../config/spawnConfig.js';
import { itemConfig } from '../../config/itemConfig.js';
import { getPlayerStats } from '../playerStats.js';
import { showNotification } from './common.js';
import { bodyRefiningConfig, realmBaseConfig, qiCondensationConfig, bodyStrengtheningConfig } from '../../config/cultivationConfig.js';
import { formationConfig } from '../../config/formationConfig.js';

// UI Elements
const spiritStonesDisplay = document.getElementById('gold-display');
const reikiDisplay = document.getElementById('reiki-display');
const spiritualPowerDisplay = document.getElementById('spiritual-power-display');
const expDisplay = document.getElementById('exp-display');
const expArrow = document.getElementById('exp-arrow');
const reikiArrow = document.getElementById('reiki-arrow');
const formationIcon = document.getElementById('formation-icon');
const meditationRateDisplay = document.getElementById('meditation-rate');
const meditationBonusDisplay = document.getElementById('meditation-bonus');
const nextLevelExpDisplay = document.getElementById('next-level-exp-display');
const levelList = document.getElementById('level-list');
const formationBtn = document.getElementById('formation-btn');
const activeFormationWrapper = document.getElementById('active-formation-wrapper');
const activeFormationList = document.getElementById('active-formation-list');
const activeFormationTitle = document.getElementById('active-formation-title');

let currentLevelTab = 'body-refining';

export function switchLevelTab(tab) {
    currentLevelTab = tab;
    
    // Update tab styles
    document.querySelectorAll('.level-tabs .tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    updateLevelSelectionUI();
}

export function updateReikiDisplay() {
    if (reikiDisplay && state.cultivationStage >= 10) {
        reikiDisplay.textContent = `灵气: ${Math.floor(state.totalReiki)}`;
        reikiDisplay.style.display = 'block'; // Ensure it's visible in the new layout
    }
    
    // Check for Reiki upgrade arrow (Qi Condensation)
    if (reikiArrow && state.cultivationStage >= 10) {
        const currentQiTier = state.cultivationStage - 9;
        if (currentQiTier < qiCondensationConfig.maxTier) {
            const nextTier = currentQiTier + 1;
            const cost = qiCondensationConfig.getCost(nextTier);
            if (state.totalReiki >= cost) {
                reikiArrow.style.display = 'block';
            } else {
                reikiArrow.style.display = 'none';
            }
        } else {
            reikiArrow.style.display = 'none';
        }
    }

    // Check for Formation Icon & Rate Update
    const stats = getPlayerStats();
    const baseRate = 0; 
    let gainPerSecond = baseRate + (stats.comprehension * 0.1);
    let bonusPercent = 0;
    let isFormationActive = false;

    const formationId = 1;
    if (state.activeFormations && state.activeFormations[formationId]) {
        isFormationActive = true;
        const formation = formationConfig[formationId];
        bonusPercent = Math.round((formation.effectMultiplier - 1) * 100);
        gainPerSecond *= formation.effectMultiplier;
    }

    if (meditationRateDisplay) {
        meditationRateDisplay.textContent = `+${gainPerSecond.toFixed(2)}`;
    }

    if (meditationBonusDisplay) {
        if (isFormationActive) {
            meditationBonusDisplay.textContent = `(+${bonusPercent}%)`;
            meditationBonusDisplay.style.display = 'inline';
        } else {
            meditationBonusDisplay.style.display = 'none';
        }
    }

    if (formationIcon) {
        if (isFormationActive) {
            formationIcon.style.display = 'block';
        } else {
            formationIcon.style.display = 'none';
        }
    }
}

export function updateSpiritStonesDisplay() {
    if (spiritStonesDisplay) {
        if (state.totalSpiritStones > 0 && !state.hasUnlockedSpiritStones) {
            state.hasUnlockedSpiritStones = true;
            localStorage.setItem('hasUnlockedSpiritStones', 'true');
        }

        if (state.hasUnlockedSpiritStones) {
            spiritStonesDisplay.style.display = 'block';
            spiritStonesDisplay.textContent = `灵石: ${Math.floor(state.totalSpiritStones)}`;
        } else {
            spiritStonesDisplay.style.display = 'none';
        }
    }

    if (formationBtn) {
        if (state.cultivationStage >= 10) {
            formationBtn.style.display = 'inline-block';
        } else {
            formationBtn.style.display = 'none';
        }
    }

    // reikiDisplay logic moved to updateReikiDisplay mostly, but we handle visibility here too
    if (reikiDisplay) {
        // In the new layout, reikiDisplay is inside meditation-panel, which is toggled by updateMeditationUI
        // So we don't need to toggle reikiDisplay itself, just update text if visible
    }
    
    if (spiritualPowerDisplay) {
        // 灵力现在作为属性显示在右侧面板，顶部资源栏不再显示，改为显示灵气
        spiritualPowerDisplay.style.display = 'none';
    }
    if (expDisplay) expDisplay.textContent = `气血: ${state.totalExp}`;

    if (expArrow) {
        let showArrow = false;
        if (state.cultivationStage === 0) {
            // 凡人 -> 锻体
            if (state.totalExp >= realmBaseConfig[1].cost) showArrow = true;
        } else if (state.cultivationStage >= 1 && state.cultivationStage < 9) {
            // 锻体期升级
            if (state.totalExp >= bodyRefiningConfig.getCost(state.cultivationStage + 1)) showArrow = true;
        } else if (state.cultivationStage === 9) {
            // 锻体 -> 练气
            if (state.totalExp >= realmBaseConfig[10].cost) showArrow = true;
        } else if (state.cultivationStage >= 10) {
            // 练气期及以后: 气血锻体
            const cost = bodyStrengtheningConfig.getCost(state.bodyStrengtheningLevel);
            if (state.totalExp >= cost) showArrow = true;
        }
        expArrow.style.display = showArrow ? 'block' : 'none';
    }

    if (nextLevelExpDisplay) {
        nextLevelExpDisplay.style.display = 'none';
    }
}

export function updatePlayerStatsDisplay() {
    const stats = getPlayerStats();
    
    const hpEl = document.getElementById('stat-hp');
    const physiqueEl = document.getElementById('stat-physique');
    const strengthEl = document.getElementById('stat-strength');
    const agilityEl = document.getElementById('stat-agility');
    const comprehensionEl = document.getElementById('stat-comprehension');
    const defenseEl = document.getElementById('stat-defense');
    const spiritualPowerEl = document.getElementById('stat-spiritualPower');
    const speedEl = document.getElementById('stat-speed');
    const critChanceEl = document.getElementById('stat-critChance');
    const critDamageEl = document.getElementById('stat-critDamage');
    const soulAmpEl = document.getElementById('stat-soulAmp');

    if (hpEl) {
        let currentHp = Math.floor(state.player.hp || stats.maxHp);
        if (state.gameState !== 'PLAYING') {
            currentHp = stats.maxHp;
        }
        currentHp = Math.min(currentHp, stats.maxHp);
        hpEl.textContent = `${currentHp} / ${stats.maxHp} (+${stats.hpRegen.toFixed(1)}/s)`;
    }
    if (physiqueEl) physiqueEl.textContent = stats.physique;
    if (strengthEl) strengthEl.textContent = stats.strength;
    if (agilityEl) agilityEl.textContent = stats.agility;
    if (comprehensionEl) comprehensionEl.textContent = stats.comprehension;
    if (defenseEl) defenseEl.textContent = stats.defense;
        if (spiritualPowerEl) spiritualPowerEl.textContent = stats.spiritualPower;
        if (speedEl) speedEl.textContent = stats.speed;
        if (critChanceEl) critChanceEl.textContent = `${(stats.critChance * 100).toFixed(1)}%`;
        if (critDamageEl) critDamageEl.textContent = `${(stats.critDamage * 100).toFixed(0)}%`;
        if (soulAmpEl) soulAmpEl.textContent = `${(stats.soulAmplification * 100).toFixed(1)}%`;

    // 如果有灵力属性显示需求，可以在这里添加，但目前 HTML 结构里没有预留灵力属性的行
    // 暂时只在顶部栏显示灵力
        updateActiveFormationDisplay();

}

export function updateLevelSelectionUI() {
    if (!levelList) return;
    levelList.innerHTML = '';
    
    const levels = Object.keys(levelConfig).map(Number).sort((a, b) => a - b);
    
    levels.forEach(level => {
        // Filter based on tab
        if (currentLevelTab === 'body-refining') {
            if (level > 30) return;
        } else if (currentLevelTab === 'qi-refining') {
            if (level <= 30 || level > 60) return;
        }

        const config = levelConfig[level];
        const isLocked = level > state.maxUnlockedLevel;
        
        const div = document.createElement('div');
        div.className = 'upgrade-item';
        // Grid item styles
        div.style.width = 'auto'; 
        div.style.height = '100%';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '10px';
        div.style.textAlign = 'center';
        div.style.backgroundColor = isLocked ? 'rgba(50, 50, 50, 0.8)' : 'rgba(0, 0, 0, 0.6)';
        
        // Resource info
        let resourceInfo = '可能掉落:<br>';
        if (config.resourceTypes && config.resourceTypes.length > 0) {
            resourceInfo += config.resourceTypes.map(id => itemConfig[id] ? itemConfig[id].name : '未知').join(', ');
        } else {
            resourceInfo += '无';
        }
        
        // Show Spirit Stone drop info for Qi Refining
        if (config.spiritStonesMultiplier && config.spiritStonesMultiplier > 1) {
            resourceInfo += `<br><span style="color: #87CEEB">灵石掉落 x${config.spiritStonesMultiplier}</span>`;
        }

        div.innerHTML = `
            <div style="width: 100%;">
                <h2 style="margin: 0 0 10px 0; font-size: 20px;">第 ${level} 关</h2>
                <p style="margin: 0 0 10px 0; font-size: 12px; color: #ccc; line-height: 1.3; min-height: 32px;">${resourceInfo}</p>
            </div>
            <button ${isLocked ? 'disabled' : ''} onclick="window.selectLevel(${level})" style="background-color: ${isLocked ? '#555' : '#4CAF50'}; margin-top: 5px; width: 100%; padding: 8px 0;">
                ${isLocked ? '未解锁' : '挑战'}
            </button>
        `;
        levelList.appendChild(div);
    });
}

function updateActiveFormationDisplay() {
    if (!activeFormationWrapper || !activeFormationList) return;

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
    if (activeFormationTitle) {
        activeFormationTitle.textContent = `已启用战斗阵法 (${activeCombatFormations.length}/${limitText})`;
    }

    activeFormationList.innerHTML = '';

    if (activeCombatFormations.length === 0) {
        activeFormationWrapper.classList.add('hidden');
        return;
    }

    activeFormationWrapper.classList.remove('hidden');

    activeCombatFormations.forEach(formation => {
        const btn = document.createElement('button');
        btn.textContent = formation.name;
        btn.addEventListener('click', () => {
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
        btn.addEventListener('click', event => event.stopPropagation());
        activeFormationList.appendChild(btn);
    });
}

export function setupStatInteractions() {
    const statRows = document.querySelectorAll('.stat-card[data-stat]');
    statRows.forEach(row => {
        row.addEventListener('click', () => {
            const stat = row.getAttribute('data-stat');
            showStatDetails(stat);
        });
    });
}

function showStatDetails(stat) {
    const stats = getPlayerStats();
    let msg = "";
    switch(stat) {
        case 'hp':
            msg = `【生命值】: ${stats.maxHp}。决定了你能承受多少伤害。归零则游戏结束。当前回复速度: ${stats.hpRegen.toFixed(1)}/秒。`;
            break;
        case 'physique':
            msg = `【体魄】: ${stats.physique}。每点体魄增加10点生命上限和0.1点/秒生命回复。`;
            break;
        case 'strength':
            msg = `【力量】: ${stats.strength}。增加攻击造成的伤害。`;
            break;
        case 'agility':
            const multiplier = 1 + (4 * stats.agility) / (stats.agility + 500);
            msg = `【敏捷】: ${stats.agility}。增加攻击速度。当前攻速加成: ${multiplier.toFixed(2)}倍 (极限5倍)。`;
            break;
        case 'comprehension':
            msg = `【悟性】: ${stats.comprehension}。每点悟性增加0.1点/秒的灵气获取速率。`;
            break;
        case 'defense':
            msg = `【防御】: ${stats.defense}。直接减少受到的伤害点数。`;
            break;
        case 'spiritualPower':
            msg = `【灵力】: ${stats.spiritualPower}。修仙者的核心力量，随境界提升。`;
            break;
        case 'speed':
            msg = `【速度】: ${playerConfig.speed}。移动速度。`;
            break;
        case 'critChance':
            msg = `【暴击率】: ${(stats.critChance * 100).toFixed(1)}%。越高越容易打出暴击。`;
            break;
        case 'critDamage':
            msg = `【暴击伤害】: ${(stats.critDamage * 100).toFixed(0)}%。暴击时造成该倍率的伤害。`;
            break;
        case 'soulAmp':
            msg = `【灵魂增幅】: ${(stats.soulAmplification * 100).toFixed(1)}%。直接按百分比提升每次击杀获得的灵魂数量。`;
            break;
    }
    showNotification(msg);
}
