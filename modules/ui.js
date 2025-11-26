import { state } from './state.js';
import { playerConfig } from '../config/playerConfig.js';
import { weaponConfig } from '../config/weaponConfig.js';
import { itemConfig } from '../config/itemConfig.js';
import { levelConfig } from '../config/spawnConfig.js';
import { smeltingConfig } from '../config/smeltingConfig.js';
import { bodyRefiningConfig, realmBaseConfig } from '../config/cultivationConfig.js';

// UI Elements (Cached)
const goldDisplay = document.getElementById('gold-display');
const reikiDisplay = document.getElementById('reiki-display');
const expDisplay = document.getElementById('exp-display');
const nextLevelExpDisplay = document.getElementById('next-level-exp-display');
const levelList = document.getElementById('level-list');
const contentBodyRefining = document.getElementById('content-body-refining');
const contentFoundation = document.getElementById('content-foundation');
const mortalProcessDiv = document.getElementById('mortal-process');
const mortalCompletedDiv = document.getElementById('mortal-completed');
const inventoryList = document.getElementById('inventory-list');
const inventoryWeaponList = document.getElementById('inventory-weapon-list');
const levelClearedOverlay = document.getElementById('level-cleared-overlay');
const levelRewardDisplay = document.getElementById('level-reward-display');
const gameOverScreen = document.getElementById('game-over-screen');
const lossGoldDisplay = document.getElementById('loss-gold-display');
const levelSelectionScreen = document.getElementById('level-selection-screen');
const pauseBtn = document.getElementById('pause-btn');

// Helper: Get Exp Thresholds
export function getExpThresholds() {
    const thresholds = {};
    let acc = 0;
    
    // Stage 1 (凡人 -> 锻体1阶)
    acc += realmBaseConfig[1].cost; // 20
    thresholds[1] = acc;

    // Stage 2 to 9 (锻体期各阶)
    for (let i = 2; i <= 9; i++) {
        acc += bodyRefiningConfig.getCost(i);
        thresholds[i] = acc;
    }

    // Stage 10 (锻体 -> 筑基)
    acc += realmBaseConfig[10].cost;
    thresholds[10] = acc;

    return thresholds;
}

export function getStageName(stage) {
    if (stage === 0) return "凡人";
    if (stage >= 1 && stage <= 9) return `锻体期 ${stage}阶`;
    if (stage >= 10) return "筑基期";
    return "未知";
}

export function getPlayerStats() {
    let bonusStrength = 0;
    let bonusAgility = 0;
    let bonusComprehension = 0;
    let bonusHp = 0;
    let bonusDefense = 0;

    // 境界基础加成 (Realm Base Stats)
    for (const stageStr in realmBaseConfig) {
        const stageThreshold = parseInt(stageStr);
        if (state.cultivationStage >= stageThreshold) {
            const bonus = realmBaseConfig[stageThreshold].stats;
            bonusStrength += (bonus.strength || 0);
            bonusAgility += (bonus.agility || 0);
            bonusComprehension += (bonus.comprehension || 0);
            bonusHp += (bonus.maxHp || 0);
            bonusDefense += (bonus.defense || 0);
        }
    }

    // 锻体期加成 (Stage 1-9)
    if (state.cultivationStage >= 1) {
        // 如果超过9阶，暂时按9阶算，或者后续扩展
        const tier = Math.min(state.cultivationStage, 9);
        const tierData = bodyRefiningConfig.tiers[tier];
        if (tierData) {
            bonusStrength += (tierData.strength || 0);
            bonusAgility += (tierData.agility || 0);
            // bonusComprehension += (tierData.comprehension || 0);
            bonusHp += tierData.maxHp;
            bonusDefense += (tierData.defense || 0);
        }
    }

    return {
        strength: playerConfig.strength + bonusStrength,
        agility: playerConfig.agility + bonusAgility,
        comprehension: playerConfig.comprehension + bonusComprehension,
        defense: playerConfig.defense + bonusDefense,
        maxHp: playerConfig.maxHp + bonusHp
    };
}

export function updateGoldDisplay() {
    if (goldDisplay) goldDisplay.textContent = `金币: ${state.totalGold}`;
    if (reikiDisplay) reikiDisplay.textContent = `灵气: ${state.totalReiki}`;
    if (expDisplay) expDisplay.textContent = `经验: ${state.totalExp}`;

    if (nextLevelExpDisplay) {
        const thresholds = getExpThresholds();
        let nextCost = 0;
        let currentStageExp = 0;
        let stageTotalCost = 0;
        
        if (state.cultivationStage === 0) {
            nextCost = thresholds[1];
            currentStageExp = state.totalExp;
            stageTotalCost = nextCost;
            nextLevelExpDisplay.textContent = `本阶进度: ${currentStageExp} / ${stageTotalCost} (凡人 -> 锻体)`;
        } else if (state.cultivationStage >= 1 && state.cultivationStage < 9) {
            const prevThreshold = thresholds[state.cultivationStage];
            nextCost = thresholds[state.cultivationStage + 1];
            currentStageExp = Math.max(0, state.totalExp - prevThreshold);
            stageTotalCost = nextCost - prevThreshold;
            nextLevelExpDisplay.textContent = `本阶进度: ${currentStageExp} / ${stageTotalCost} (锻体 ${state.cultivationStage} -> ${state.cultivationStage + 1})`;
        } else if (state.cultivationStage === 9) {
            const prevThreshold = thresholds[9];
            nextCost = thresholds[10];
            currentStageExp = Math.max(0, state.totalExp - prevThreshold);
            stageTotalCost = nextCost - prevThreshold;
            nextLevelExpDisplay.textContent = `本阶进度: ${currentStageExp} / ${stageTotalCost} (锻体 -> 筑基)`;
        } else {
            nextLevelExpDisplay.textContent = `已达当前版本上限`;
        }
    }
}

export function updatePlayerStatsDisplay() {
    const stats = getPlayerStats();
    
    const hpEl = document.getElementById('stat-hp');
    const strengthEl = document.getElementById('stat-strength');
    const agilityEl = document.getElementById('stat-agility');
    const comprehensionEl = document.getElementById('stat-comprehension');
    const defenseEl = document.getElementById('stat-defense');
    const speedEl = document.getElementById('stat-speed');

    if (hpEl) hpEl.textContent = stats.maxHp;
    if (strengthEl) strengthEl.textContent = stats.strength;
    if (agilityEl) agilityEl.textContent = stats.agility;
    if (comprehensionEl) comprehensionEl.textContent = stats.comprehension;
    if (defenseEl) defenseEl.textContent = stats.defense;
    if (speedEl) speedEl.textContent = playerConfig.speed;
}

export function updateLevelSelectionUI() {
    if (!levelList) return;
    levelList.innerHTML = '';
    
    const levels = Object.keys(levelConfig).map(Number).sort((a, b) => a - b);
    
    levels.forEach(level => {
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

export function updateForgingUI() {
    // Get active tab
    const activeTabBtn = document.querySelector('.forging-tabs .tab-btn.active');
    const activeTab = activeTabBtn ? activeTabBtn.getAttribute('data-tab') : 'wood';

    // Map tab to category
    const category = activeTab; // 'wood', 'iron', 'refined-iron'

    const listId = `forging-list-${category}`;
    const list = document.getElementById(listId);
    if (!list) return;
    
    list.innerHTML = '';
    
    for (const id in weaponConfig) {
        const weapon = weaponConfig[id];
        const weaponId = parseInt(id);
        
        // Filter by category
        if (weapon.category !== category) continue;

        // Skip if already owned? Or show "Owned"?
        const isOwned = state.ownedWeapons.includes(weaponId);
        
        // Only show weapons that have crafting info
        if (!weapon.crafting) continue; 
        
        const div = document.createElement('div');
        div.className = 'upgrade-item';
        
        let materialHtml = '<div style="margin: 10px 0; text-align: left; background: rgba(0,0,0,0.3); padding: 5px; border-radius: 5px;">';
        let canCraft = true;
        
        for (const matId in weapon.crafting.materials) {
            const required = weapon.crafting.materials[matId];
            const owned = state.inventory[matId] || 0;
            const matName = itemConfig[matId] ? itemConfig[matId].name : `未知物品${matId}`;
            const color = owned >= required ? '#4CAF50' : '#f44336';
            
            materialHtml += `<p style="color: ${color}; margin: 2px 0;">${matName}: ${owned}/${required}</p>`;
            if (owned < required) canCraft = false;
        }
        materialHtml += '</div>';
        
        let btnHtml = '';
        if (isOwned) {
            btnHtml = `<button disabled style="background-color: #555;">已拥有</button>`;
        } else {
            btnHtml = `<button ${canCraft ? '' : 'disabled'} onclick="window.forgeWeapon(${id})" style="background-color: ${canCraft ? '#FF9800' : '#555'};">
                ${canCraft ? '锻造' : '材料不足'}
            </button>`;
        }
        
        div.innerHTML = `
            <h2>${weapon.name}</h2>
            <div style="font-size: 48px; margin-bottom: 10px;">${weapon.icon || '⚔️'}</div>
            <p>伤害: 力量 x ${(weapon.damageMultiplier * 100).toFixed(0)}%</p>
            ${materialHtml}
            ${btnHtml}
        `;
        list.appendChild(div);
    }
    
    if (list.children.length === 0) {
        list.innerHTML = '<p>暂无可锻造的物品。</p>';
    }
}

export function updateSmeltingUI() {
    const container = document.querySelector('.smelting-container .upgrade-container');
    if (!container) return;
    
    container.innerHTML = '';

    for (const key in smeltingConfig) {
        const recipe = smeltingConfig[key];
        const div = document.createElement('div');
        div.className = 'smelting-item';
        div.style.background = 'rgba(255,255,255,0.1)';
        div.style.padding = '20px';
        div.style.borderRadius = '10px';
        div.style.textAlign = 'center';
        div.style.width = '300px';
        div.style.margin = '10px';

        // Check requirements
        let canSmelt = true;
        let reqText = '';
        for (const matId in recipe.input) {
            const required = recipe.input[matId];
            const owned = state.inventory[matId] || 0;
            const matName = itemConfig[matId] ? itemConfig[matId].name : `未知物品${matId}`;
            const color = owned >= required ? '#4CAF50' : '#f44336';
            reqText += `<p>消耗: ${matName} x${required} <span style="color: ${color}">(${owned})</span></p>`;
            if (owned < required) canSmelt = false;
        }

        let outText = '';
        for (const itemId in recipe.output) {
            const count = recipe.output[itemId];
            const itemName = itemConfig[itemId] ? itemConfig[itemId].name : `未知物品${itemId}`;
            outText += `<p>产出: ${itemName} x${count}</p>`;
        }

        div.innerHTML = `
            <h3>${recipe.name}</h3>
            ${reqText}
            ${outText}
            <button onclick="window.smeltItem('${key}')" style="background-color: ${canSmelt ? '#FF5722' : '#555'}; margin-top: 10px;" ${canSmelt ? '' : 'disabled'}>
                ${canSmelt ? '熔炼' : '材料不足'}
            </button>
        `;
        container.appendChild(div);
    }
}

export function updateInventoryUI() {
    updateInventoryItemsUI();
    updateInventoryWeaponsUI();
}

function updateInventoryItemsUI() {
    if (!inventoryList) return;
    inventoryList.innerHTML = '';
    const itemIds = Object.keys(state.inventory);
    
    if (itemIds.length === 0) {
        inventoryList.innerHTML = '<p style="color: #aaa; font-size: 18px;">暂无道具</p>';
        return;
    }

    itemIds.forEach(id => {
        const count = state.inventory[id];
        if (count > 0) {
            const item = itemConfig[id];
            const div = document.createElement('div');
            div.className = 'upgrade-item'; // 复用样式
            div.style.display = 'flex';
            div.style.flexDirection = 'column';
            div.style.alignItems = 'center';
            div.innerHTML = `
                <div style="font-size: 32px; margin-bottom: 10px;">${item.icon}</div>
                <h3>${item.name} x${count}</h3>
                <p style="font-size: 12px; color: #ccc;">${item.description}</p>
                ${item.usable ? '<button>使用</button>' : '<button disabled style="background: #555; cursor: not-allowed;">不可使用</button>'}
            `;
            inventoryList.appendChild(div);
        }
    });
}

function updateInventoryWeaponsUI() {
    if (!inventoryWeaponList) return;
    inventoryWeaponList.innerHTML = '';
    
    for (const id in weaponConfig) {
        const weapon = weaponConfig[id];
        const weaponId = parseInt(id);
        
        // 仅显示已拥有的武器
        if (!state.ownedWeapons.includes(weaponId)) {
            continue;
        }

        const isEquipped = weaponId === state.equippedWeaponId;
        const isOwned = true; // 既然过滤了，这里肯定是 true
        
        let typeInfo = '';
        if (weapon.type === 'bounce') {
            typeInfo = `<p>类型: 弹射</p><p>弹射次数: ${weapon.bounceCount}</p>`;
        } else if (weapon.type === 'melee-sweep') {
            typeInfo = `<p>类型: 近战-横扫</p><p>范围: ${weapon.range || 100}</p>`;
        } else if (weapon.type === 'melee-thrust') {
            typeInfo = `<p>类型: 近战-刺击</p><p>范围: ${weapon.range || 100}</p>`;
        } else if (weapon.type === 'melee-smash') {
            typeInfo = `<p>类型: 近战-凿击</p><p>范围: ${weapon.range || 100}</p>`;
        } else {
            typeInfo = `<p>类型: 穿透</p><p>穿透次数: ${weapon.penetration}</p>`;
        }

        const div = document.createElement('div');
        div.className = 'upgrade-item';
        
        let buttonHtml = '';
        if (isOwned) {
            buttonHtml = `<button ${isEquipped ? 'disabled' : ''} onclick="window.equipWeapon(${id})">
                ${isEquipped ? '已装备' : '装备'}
            </button>`;
        } else {
            buttonHtml = `<button disabled style="background-color: #555;">未拥有 (请前往锻造)</button>`;
        }

        div.innerHTML = `
            <h2>${weapon.name}</h2>
            <div style="font-size: 48px; margin-bottom: 10px;">${weapon.icon || '⚔️'}</div>
            ${typeInfo}
            <p>伤害: 力量 x ${(weapon.damageMultiplier * 100).toFixed(0)}%</p>
            <p>射速: ${weapon.fireRate}ms</p>
            <p>弹丸数: ${weapon.projectileCount || '-'}</p>
            <p>连射数: ${weapon.burstCount || 1}</p>
            ${buttonHtml}
        `;
        inventoryWeaponList.appendChild(div);
    }
}

export function updateCultivationUI() {
    updateGoldDisplay();

    // 更新修炼界面的灵气显示
    const cultivationReikiDisplay = document.getElementById('cultivation-reiki-display');
    if (cultivationReikiDisplay) {
        cultivationReikiDisplay.textContent = `当前经验: ${state.totalExp}`;
    }

    // 凡人阶段逻辑
    const thresholds = getExpThresholds();
    
    if (state.cultivationStage > 0) {
        if (mortalProcessDiv) mortalProcessDiv.classList.add('hidden');
        if (mortalCompletedDiv) mortalCompletedDiv.classList.remove('hidden');
    } else {
        if (mortalProcessDiv) mortalProcessDiv.classList.remove('hidden');
        if (mortalCompletedDiv) mortalCompletedDiv.classList.add('hidden');
        
        const cost = thresholds[1];
        // 移除按钮，改为显示进度
        if (mortalProcessDiv) {
            mortalProcessDiv.innerHTML = `
                <h2>凡人阶段</h2>
                <p>肉体凡胎，未入仙途。</p>
                <p>本阶进度: ${state.totalExp} / ${cost}</p>
                <div style="width: 100%; background: #555; height: 10px; border-radius: 5px; margin-top: 5px;">
                    <div style="width: ${Math.min(100, (state.totalExp / cost) * 100)}%; background: #FF9800; height: 100%; border-radius: 5px;"></div>
                </div>
                <p>${state.totalExp >= cost ? '已达标 (自动突破)' : '经验不足'}</p>
            `;
        }
    }

    // 锻体阶段逻辑
    updateBodyRefiningUI();
    
    // 筑基阶段逻辑
    updateFoundationUI();
}

export function updateFoundationUI() {
    if (!contentFoundation) return;
    contentFoundation.innerHTML = '';

    if (state.cultivationStage < 10) {
        contentFoundation.innerHTML = '<p>需锻体圆满方可窥探筑基之境。</p>';
        return;
    }

    const baseBonus = realmBaseConfig[10].stats;
    contentFoundation.innerHTML = `
        <h2>筑基期</h2>
        <p>大道之基，已然铸成。</p>
        <p>本阶段累计属性: 力量 +${baseBonus.strength}, 敏捷 +${baseBonus.agility}, 悟性 +${baseBonus.comprehension}, 生命 +${baseBonus.maxHp}, 防御 +${baseBonus.defense}</p>
        <p>（后续境界待开放）</p>
    `;
}

export function updateBodyRefiningUI() {
    if (!contentBodyRefining) return;
    contentBodyRefining.innerHTML = ''; // 清空内容

    if (state.cultivationStage === 0) {
        contentBodyRefining.innerHTML = '<p>请先完成凡人阶段的修炼。</p>';
        return;
    }

    const currentTier = state.cultivationStage;
    const maxTier = bodyRefiningConfig.maxTier || 9;
    const baseStats = realmBaseConfig[1].stats;
    const thresholds = getExpThresholds();

    // 辅助函数：计算总属性
    const getTotalStats = (tierStats) => {
        return {
            strength: (baseStats.strength || 0) + (tierStats.strength || 0),
            agility: (baseStats.agility || 0) + (tierStats.agility || 0),
            comprehension: (baseStats.comprehension || 0) + (tierStats.comprehension || 0),
            maxHp: (baseStats.maxHp || 0) + (tierStats.maxHp || 0),
            defense: (baseStats.defense || 0) + (tierStats.defense || 0)
        };
    };

    // 如果已经进入筑基期 (Stage >= 10)
    if (currentTier >= 10) {
        const maxTierStats = bodyRefiningConfig.tiers[maxTier];
        const total = getTotalStats(maxTierStats);
        contentBodyRefining.innerHTML = `
            <h2>锻体期 (圆满)</h2>
            <p>肉身已臻化境，已成功筑基。</p>
            <p>本阶段累计属性: 力量 +${total.strength}, 敏捷 +${total.agility}, 生命 +${total.maxHp}, 防御 +${total.defense}</p>
        `;
        return;
    }

    // 当前是锻体期第 currentTier 阶
    const currentTierStats = bodyRefiningConfig.tiers[currentTier];
    const currentTotal = getTotalStats(currentTierStats);
    
    // 下一阶
    const nextTier = currentTier + 1;
    
    let html = `
        <h2>锻体期 第 ${currentTier} 阶</h2>
        <p>本阶段累计属性: 力量 +${currentTotal.strength}, 敏捷 +${currentTotal.agility}, 生命 +${currentTotal.maxHp}, 防御 +${currentTotal.defense}</p>
    `;

    if (nextTier <= maxTier) {
        const nextTierStats = bodyRefiningConfig.tiers[nextTier];
        const nextTotal = getTotalStats(nextTierStats);
        const requiredExp = thresholds[nextTier];
        
        const prevThreshold = thresholds[currentTier];
        const currentStageExp = Math.max(0, state.totalExp - prevThreshold);
        const stageTotalCost = requiredExp - prevThreshold;
        const percentage = Math.min(100, Math.max(0, (currentStageExp / stageTotalCost) * 100));

        html += `
            <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <h3>下一阶: 第 ${nextTier} 阶</h3>
                <p>升级后累计属性: 力量 +${nextTotal.strength}, 敏捷 +${nextTotal.agility}, 生命 +${nextTotal.maxHp}, 防御 +${nextTotal.defense}</p>
                <p>本阶进度: ${currentStageExp} / ${stageTotalCost}</p>
                <div style="width: 100%; background: #555; height: 10px; border-radius: 5px; margin-top: 5px;">
                    <div style="width: ${percentage}%; background: #FF5722; height: 100%; border-radius: 5px;"></div>
                </div>
            </div>
        `;
    } else {
        // 锻体9阶，准备筑基
        const foundationConfig = realmBaseConfig[10];
        const requiredExp = thresholds[10];
        const bonus = foundationConfig.stats;

        const prevThreshold = thresholds[9];
        const currentStageExp = Math.max(0, state.totalExp - prevThreshold);
        const stageTotalCost = requiredExp - prevThreshold;
        const percentage = Math.min(100, Math.max(0, (currentStageExp / stageTotalCost) * 100));

        html += `
            <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; border: 1px solid gold;">
                <h3 style="color: gold;">突破: 筑基期</h3>
                <p>筑大道之基，脱胎换骨。</p>
                <p>筑基加成: 力量 +${bonus.strength}, 敏捷 +${bonus.agility}, 悟性 +${bonus.comprehension}, 生命 +${bonus.maxHp}, 防御 +${bonus.defense}</p>
                <p>本阶进度: ${currentStageExp} / ${stageTotalCost}</p>
                <div style="width: 100%; background: #555; height: 10px; border-radius: 5px; margin-top: 5px;">
                    <div style="width: ${percentage}%; background: gold; height: 100%; border-radius: 5px;"></div>
                </div>
            </div>
        `;
    }

    contentBodyRefining.innerHTML = html;
}

export function showNotification(message) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.textContent = message;

    container.appendChild(toast);

    // 触发动画
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // 3秒后移除
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, 3000);
}

export function showGameOverScreen(lossGold) {
    if (lossGoldDisplay) lossGoldDisplay.textContent = `损失金币: ${lossGold}`;
    if (gameOverScreen) gameOverScreen.classList.remove('hidden');
}

export function showLevelClearedOverlay(rewardText) {
    if (levelRewardDisplay) levelRewardDisplay.textContent = rewardText;
    if (levelClearedOverlay) levelClearedOverlay.classList.remove('hidden');
}

export function hideLevelClearedOverlay() {
    if (levelClearedOverlay) levelClearedOverlay.classList.add('hidden');
}

export function hideGameOverScreen() {
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
}

export function hideLevelSelectionScreen() {
    if (levelSelectionScreen) levelSelectionScreen.classList.add('hidden');
}

export function showPauseBtn() {
    if (pauseBtn) pauseBtn.classList.remove('hidden');
}

export function hidePauseBtn() {
    if (pauseBtn) pauseBtn.classList.add('hidden');
}
