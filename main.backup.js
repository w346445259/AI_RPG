import { playerConfig } from './config/playerConfig.js';
import { monsterConfig } from './config/monsterConfig.js';
import { levelConfig } from './config/spawnConfig.js';
import { weaponConfig } from './config/weaponConfig.js';
import { monsterWeaponConfig } from './config/monsterWeaponConfig.js';
import { bodyRefiningConfig, realmBaseConfig } from './config/cultivationConfig.js';
import { itemConfig } from './config/itemConfig.js';
import { oreConfig } from './config/oreConfig.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI 元素
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const victoryScreen = document.getElementById('victory-screen');
const startBtn = document.getElementById('start-btn');
const levelSelectionScreen = document.getElementById('level-selection-screen');
const levelList = document.getElementById('level-list');
const btnBackLobbyLevels = document.getElementById('btn-back-lobby-levels');
const restartBtn = document.getElementById('restart-btn');
const lobbyBtn = document.getElementById('lobby-btn');
// const continueBtn = document.getElementById('continue-btn'); // 已废弃
// const victoryLobbyBtn = document.getElementById('victory-lobby-btn'); // 已废弃
const levelClearedOverlay = document.getElementById('level-cleared-overlay');
const overlayLobbyBtn = document.getElementById('overlay-lobby-btn');
const overlayNextLevelBtn = document.getElementById('overlay-next-level-btn');
const levelRewardDisplay = document.getElementById('level-reward-display');

const goldDisplay = document.getElementById('gold-display');
const reikiDisplay = document.getElementById('reiki-display');
const expDisplay = document.getElementById('exp-display');
const nextLevelExpDisplay = document.getElementById('next-level-exp-display');
const lossGoldDisplay = document.getElementById('loss-gold-display');
const winGoldDisplay = document.getElementById('win-gold-display');

// 测试 UI 元素
const testExpInput = document.getElementById('test-exp-input');
const testAddExpBtn = document.getElementById('test-add-exp-btn');
const debugItemSelect = document.getElementById('debug-item-select');
const debugItemCount = document.getElementById('debug-item-count');
const debugAddItemBtn = document.getElementById('debug-add-item-btn');
const debugUnlockLevelsBtn = document.getElementById('debug-unlock-levels-btn');

// 强化 UI 元素
const upgradeScreen = document.getElementById('upgrade-screen');
const upgradeBtn = document.getElementById('upgrade-btn');
const clearDataBtn = document.getElementById('clear-data-btn');
const btnBackLobby = document.getElementById('btn-back-lobby');

// 锻造 UI 元素
const forgingScreen = document.getElementById('forging-screen');
const forgingBtn = document.getElementById('forging-btn');
const btnBackLobbyForging = document.getElementById('btn-back-lobby-forging');

// 凡人阶段 UI
const btnBreakthroughMortal = document.getElementById('btn-breakthrough-mortal');
const mortalProcessDiv = document.getElementById('mortal-process');
const mortalCompletedDiv = document.getElementById('mortal-completed');

// 锻体阶段 UI
const contentBodyRefining = document.getElementById('content-body-refining');

// 通用提示框函数
function showNotification(message) {
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

// 辅助函数：获取各阶段所需的累计经验阈值
function getExpThresholds() {
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

// 根据当前总经验计算应该处于的境界
function calculateStageFromExp(exp) {
    const thresholds = getExpThresholds();
    let stage = 0;
    
    // 检查是否达到各阶段阈值
    for (let i = 1; i <= 10; i++) {
        if (exp >= thresholds[i]) {
            stage = i;
        } else {
            break;
        }
    }
    return stage;
}

// 更新经验和境界
function addExperience(amount) {
    totalExp += amount;
    const oldStage = cultivationStage;
    cultivationStage = calculateStageFromExp(totalExp);
    
    localStorage.setItem('totalExp', totalExp);
    localStorage.setItem('cultivationStage', cultivationStage);
    
    if (cultivationStage > oldStage) {
        showNotification(`境界提升！当前境界: ${getStageName(cultivationStage)}`);
    }
    
    updateCultivationUI();
    updatePlayerStatsDisplay();
}

function getStageName(stage) {
    if (stage === 0) return "凡人";
    if (stage >= 1 && stage <= 9) return `锻体期 ${stage}阶`;
    if (stage >= 10) return "筑基期";
    return "未知";
}

function updateCultivationUI() {
    updateGoldDisplay();

    // 更新修炼界面的灵气显示
    const cultivationReikiDisplay = document.getElementById('cultivation-reiki-display');
    if (cultivationReikiDisplay) {
        cultivationReikiDisplay.textContent = `当前经验: ${totalExp}`;
    }

    // 凡人阶段逻辑
    const thresholds = getExpThresholds();
    
    if (cultivationStage > 0) {
        mortalProcessDiv.classList.add('hidden');
        mortalCompletedDiv.classList.remove('hidden');
    } else {
        mortalProcessDiv.classList.remove('hidden');
        mortalCompletedDiv.classList.add('hidden');
        
        const cost = thresholds[1];
        // 移除按钮，改为显示进度
        mortalProcessDiv.innerHTML = `
            <h2>凡人阶段</h2>
            <p>肉体凡胎，未入仙途。</p>
            <p>本阶进度: ${totalExp} / ${cost}</p>
            <div style="width: 100%; background: #555; height: 10px; border-radius: 5px; margin-top: 5px;">
                <div style="width: ${Math.min(100, (totalExp / cost) * 100)}%; background: #FF9800; height: 100%; border-radius: 5px;"></div>
            </div>
            <p>${totalExp >= cost ? '已达标 (自动突破)' : '经验不足'}</p>
        `;
    }

    // 锻体阶段逻辑
    updateBodyRefiningUI();
    
    // 筑基阶段逻辑
    updateFoundationUI();
}

const contentFoundation = document.getElementById('content-foundation');

function updateFoundationUI() {
    if (!contentFoundation) return;
    contentFoundation.innerHTML = '';

    if (cultivationStage < 10) {
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

function updateBodyRefiningUI() {
    contentBodyRefining.innerHTML = ''; // 清空内容

    if (cultivationStage === 0) {
        contentBodyRefining.innerHTML = '<p>请先完成凡人阶段的修炼。</p>';
        return;
    }

    const currentTier = cultivationStage;
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
        const currentStageExp = Math.max(0, totalExp - prevThreshold);
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
        const currentStageExp = Math.max(0, totalExp - prevThreshold);
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

btnBreakthroughMortal.addEventListener('click', () => {
    const cost = realmBaseConfig[1].cost;
    if (cultivationStage === 0 && totalExp >= cost) {
        totalExp -= cost;
        cultivationStage = 1; // 进入锻体期 1阶
        localStorage.setItem('totalExp', totalExp);
        localStorage.setItem('cultivationStage', cultivationStage);
        updateCultivationUI();
        updatePlayerStatsDisplay(); // 更新大厅属性面板
        showNotification("恭喜！您已感应天地，踏入锻体期！");
    }
});

// 修炼标签页逻辑
const tabBtns = document.querySelectorAll('.tab-btn');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 找到当前按钮所在的容器 (cultivation-tabs 或 inventory-tabs)
        const container = btn.parentElement;
        const contentContainer = container.nextElementSibling; // 假设内容容器是兄弟元素
        
        // 在当前容器内移除激活状态
        const siblingBtns = container.querySelectorAll('.tab-btn');
        siblingBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 在内容容器内隐藏所有内容
        const siblingContents = contentContainer.querySelectorAll('.tab-content');
        siblingContents.forEach(c => c.classList.add('hidden'));
        
        // 显示选中内容
        const tabId = btn.getAttribute('data-tab');
        const content = document.getElementById(`content-${tabId}`);
        if (content) {
            content.classList.remove('hidden');
        }
    });
});

// 武器 UI 元素 (已移除独立屏幕，整合进背包)
// const weaponScreen = document.getElementById('weapon-screen');
// const weaponBtn = document.getElementById('weapon-btn');
// const btnWeaponBackLobby = document.getElementById('btn-weapon-back-lobby');
// const weaponList = document.getElementById('weapon-list');

// 背包 UI 元素
const inventoryScreen = document.getElementById('inventory-screen');
const inventoryBtn = document.getElementById('inventory-btn');
const btnInventoryBackLobby = document.getElementById('btn-inventory-back-lobby');
const inventoryList = document.getElementById('inventory-list');
const inventoryWeaponList = document.getElementById('inventory-weapon-list');

// 调试 UI 元素
const debugScreen = document.getElementById('debug-screen');
const debugBtn = document.getElementById('debug-btn');
const btnCloseDebug = document.getElementById('btn-close-debug');

// 暂停 UI 元素
const pauseBtn = document.getElementById('pause-btn');
const pauseScreen = document.getElementById('pause-screen');
const resumeBtn = document.getElementById('resume-btn');
const quitLobbyBtn = document.getElementById('quit-lobby-btn');
const confirmQuitModal = document.getElementById('confirm-quit-modal');
const confirmQuitYes = document.getElementById('confirm-quit-yes');
const confirmQuitNo = document.getElementById('confirm-quit-no');
const sessionItemsList = document.getElementById('session-items-list');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 游戏状态
let gameState = 'LOBBY'; // LOBBY (大厅), PLAYING (游戏中), GAMEOVER (游戏结束), VICTORY (胜利), UPGRADE (强化), WEAPON (武器库), INVENTORY (背包), PAUSED (暂停), LEVEL_SELECTION (关卡选择)

let totalGold = parseInt(localStorage.getItem('totalGold')) || 0;
let totalReiki;
if (localStorage.getItem('totalReiki') !== null) {
    totalReiki = parseInt(localStorage.getItem('totalReiki'));
} else {
    totalReiki = playerConfig.initialReiki || 0;
}
let totalExp;
if (localStorage.getItem('totalExp') !== null) {
    totalExp = parseInt(localStorage.getItem('totalExp'));
} else {
    totalExp = 0;
}
let cultivationStage = parseInt(localStorage.getItem('cultivationStage')) || 0; // 0: 凡人, 1: 锻体, ...
let sessionGold = 0; // 本局获得金币
let sessionInventory = {}; // 本局获得道具
let equippedWeaponId = parseInt(localStorage.getItem('equippedWeaponId')) || 4;
let inventory = JSON.parse(localStorage.getItem('inventory')) || {}; // { itemId: count }
let ownedWeapons = JSON.parse(localStorage.getItem('ownedWeapons')) || [4]; // 默认拥有 ID 4 的武器

let currentLevel = 1;
let maxUnlockedLevel = parseInt(localStorage.getItem('maxUnlockedLevel')) || 1;
let killCount = 0;
let monstersSpawned = 0;
// const MONSTERS_PER_LEVEL = 50; // Removed in favor of levelConfig
let hasWon = false;

function getPlayerStats() {
    let bonusStrength = 0;
    let bonusAgility = 0;
    let bonusComprehension = 0;
    let bonusHp = 0;
    let bonusDefense = 0;

    // 境界基础加成 (Realm Base Stats)
    for (const stageStr in realmBaseConfig) {
        const stageThreshold = parseInt(stageStr);
        if (cultivationStage >= stageThreshold) {
            const bonus = realmBaseConfig[stageThreshold].stats;
            bonusStrength += (bonus.strength || 0);
            bonusAgility += (bonus.agility || 0);
            bonusComprehension += (bonus.comprehension || 0);
            bonusHp += (bonus.maxHp || 0);
            bonusDefense += (bonus.defense || 0);
        }
    }

    // 锻体期加成 (Stage 1-9)
    if (cultivationStage >= 1) {
        // 如果超过9阶，暂时按9阶算，或者后续扩展
        const tier = Math.min(cultivationStage, 9);
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

let player = {
    x: canvas.width * 0.7, // 大厅中的位置
    y: canvas.height * 0.6,
    radius: playerConfig.radius,
    speed: playerConfig.speed,
    color: playerConfig.color,
    hp: getPlayerStats().maxHp,
    maxHp: getPlayerStats().maxHp,
    defense: getPlayerStats().defense,
    lastHitTime: 0
};

let bullets = [];
let monsters = [];
let ores = []; // 矿石数组
let floatingTexts = [];
let attackVisuals = []; // 攻击特效
const keys = {};

let lastShotTime = 0;
let lastSpawnTime = 0;
let monsterIdCounter = 0;

// 连发状态
let burstShotsRemaining = 0;
let lastBurstTime = 0;
let burstTargetId = null;

function updateLevelSelectionUI() {
    if (!levelList) return;
    levelList.innerHTML = '';
    
    const levels = Object.keys(levelConfig).map(Number).sort((a, b) => a - b);
    
    levels.forEach(level => {
        const config = levelConfig[level];
        const isLocked = level > maxUnlockedLevel;
        
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

window.selectLevel = (level) => {
    currentLevel = level;
    levelSelectionScreen.classList.add('hidden');
    initGame();
    gameState = 'PLAYING';
    pauseBtn.classList.remove('hidden');
    levelClearedOverlay.classList.add('hidden');
};

function initGame() {
    const stats = getPlayerStats();
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.hp = stats.maxHp;
    player.maxHp = stats.maxHp;
    player.lastHitTime = 0;
    
    bullets = [];
    monsters = [];
    ores = [];
    floatingTexts = [];
    monsterIdCounter = 0;
    killCount = 0;
    monstersSpawned = 0;
    sessionGold = 0;
    sessionInventory = {};
    hasWon = false;
    
    spawnOres(); // 生成矿石

    // currentLevel = 1; // 不重置关卡，除非是完全重新开始游戏，这里 initGame 可能是重新开始或下一关
    
    // 重置连发状态
    burstShotsRemaining = 0;
    lastBurstTime = 0;
    burstTargetId = null;
    
    const now = performance.now();
    lastShotTime = now;
    lastSpawnTime = now;
}

function updateGoldDisplay() {
    goldDisplay.textContent = `金币: ${totalGold}`;
    reikiDisplay.textContent = `灵气: ${totalReiki}`;
    if (expDisplay) expDisplay.textContent = `经验: ${totalExp}`;

    if (nextLevelExpDisplay) {
        const thresholds = getExpThresholds();
        let nextCost = 0;
        let currentStageExp = 0;
        let stageTotalCost = 0;
        
        if (cultivationStage === 0) {
            nextCost = thresholds[1];
            currentStageExp = totalExp;
            stageTotalCost = nextCost;
            nextLevelExpDisplay.textContent = `本阶进度: ${currentStageExp} / ${stageTotalCost} (凡人 -> 锻体)`;
        } else if (cultivationStage >= 1 && cultivationStage < 9) {
            const prevThreshold = thresholds[cultivationStage];
            nextCost = thresholds[cultivationStage + 1];
            currentStageExp = Math.max(0, totalExp - prevThreshold);
            stageTotalCost = nextCost - prevThreshold;
            nextLevelExpDisplay.textContent = `本阶进度: ${currentStageExp} / ${stageTotalCost} (锻体 ${cultivationStage} -> ${cultivationStage + 1})`;
        } else if (cultivationStage === 9) {
            const prevThreshold = thresholds[9];
            nextCost = thresholds[10];
            currentStageExp = Math.max(0, totalExp - prevThreshold);
            stageTotalCost = nextCost - prevThreshold;
            nextLevelExpDisplay.textContent = `本阶进度: ${currentStageExp} / ${stageTotalCost} (锻体 -> 筑基)`;
        } else {
            nextLevelExpDisplay.textContent = `已达当前版本上限`;
        }
    }
}

function updatePlayerStatsDisplay() {
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

function updateForgingUI() {
    const list = document.getElementById('forging-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    for (const id in weaponConfig) {
        const weapon = weaponConfig[id];
        const weaponId = parseInt(id);
        
        // Skip if already owned? Or show "Owned"?
        const isOwned = ownedWeapons.includes(weaponId);
        
        // Only show weapons that have crafting info
        if (!weapon.crafting) continue; 
        
        const div = document.createElement('div');
        div.className = 'upgrade-item';
        
        let materialHtml = '<div style="margin: 10px 0; text-align: left; background: rgba(0,0,0,0.3); padding: 5px; border-radius: 5px;">';
        let canCraft = true;
        
        for (const matId in weapon.crafting.materials) {
            const required = weapon.crafting.materials[matId];
            const owned = inventory[matId] || 0;
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
        list.innerHTML = '<p>暂无可锻造的凡器。</p>';
    }
}

window.forgeWeapon = (id) => {
    const weapon = weaponConfig[id];
    if (!weapon || !weapon.crafting) return;
    
    // Check materials again
    for (const matId in weapon.crafting.materials) {
        const required = weapon.crafting.materials[matId];
        const owned = inventory[matId] || 0;
        if (owned < required) {
            showNotification('材料不足！');
            return;
        }
    }
    
    // Consume materials
    for (const matId in weapon.crafting.materials) {
        const required = weapon.crafting.materials[matId];
        inventory[matId] -= required;
    }
    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    // Add weapon
    ownedWeapons.push(parseInt(id));
    localStorage.setItem('ownedWeapons', JSON.stringify(ownedWeapons));
    
    showNotification(`锻造成功: ${weapon.name}`);
    updateForgingUI();
    // 如果背包界面开着，也更新一下
    if (typeof updateInventoryUI === 'function') updateInventoryUI();
};

// 将装备函数暴露给 window 以便 onclick 调用
window.equipWeapon = (id) => {
    equippedWeaponId = id;
    localStorage.setItem('equippedWeaponId', id);
    updateInventoryUI(); // 更新背包界面
    updatePlayerStatsDisplay();
};

if (testAddExpBtn) {
    testAddExpBtn.addEventListener('click', () => {
        const amount = parseInt(testExpInput.value);
        if (!isNaN(amount) && amount > 0) {
            addExperience(amount);
            showNotification(`测试: 增加了 ${amount} 经验`);
            testExpInput.value = '';
        } else {
            showNotification('请输入有效的经验数值');
        }
    });
}

if (debugUnlockLevelsBtn) {
    debugUnlockLevelsBtn.addEventListener('click', () => {
        maxUnlockedLevel = 30;
        localStorage.setItem('maxUnlockedLevel', maxUnlockedLevel);
        showNotification('已解锁所有关卡 (30关)');
    });
}

// 初始化调试道具下拉框
if (debugItemSelect) {
    for (const id in itemConfig) {
        const item = itemConfig[id];
        const option = document.createElement('option');
        option.value = id;
        option.textContent = item.name;
        debugItemSelect.appendChild(option);
    }
}

if (debugAddItemBtn) {
    debugAddItemBtn.addEventListener('click', () => {
        const itemId = parseInt(debugItemSelect.value);
        const count = parseInt(debugItemCount.value);
        
        if (!isNaN(itemId) && !isNaN(count) && count > 0) {
            addItem(itemId, count);
            updateInventoryUI(); // 确保 UI 及时更新
            showNotification(`测试: 添加了 ${count} 个 ${itemConfig[itemId].name}`);
        } else {
            showNotification('请输入有效的数量');
        }
    });
}

// UI 事件监听器
startBtn.addEventListener('click', () => {
    gameState = 'LEVEL_SELECTION';
    startScreen.classList.add('hidden');
    levelSelectionScreen.classList.remove('hidden');
    updateLevelSelectionUI();
});

btnBackLobbyLevels.addEventListener('click', () => {
    gameState = 'LOBBY';
    levelSelectionScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

upgradeBtn.addEventListener('click', () => {
    gameState = 'UPGRADE';
    startScreen.classList.add('hidden');
    upgradeScreen.classList.remove('hidden');
    updateCultivationUI();

    // 自动切换到当前境界的标签页
    let targetTab = 'mortal';
    if (cultivationStage >= 1 && cultivationStage <= 9) {
        targetTab = 'body-refining';
    } else if (cultivationStage >= 10) {
        targetTab = 'foundation';
    }
    
    const targetBtn = document.querySelector(`.tab-btn[data-tab="${targetTab}"]`);
    if (targetBtn) {
        targetBtn.click();
    }
});

forgingBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    forgingScreen.classList.remove('hidden');
    updateForgingUI();
});

// weaponBtn.addEventListener('click', () => {
//     gameState = 'WEAPON';
//     startScreen.classList.add('hidden');
//     weaponScreen.classList.remove('hidden');
//     updateWeaponUI();
// });

inventoryBtn.addEventListener('click', () => {
    gameState = 'INVENTORY';
    startScreen.classList.add('hidden');
    inventoryScreen.classList.remove('hidden');
    updateInventoryUI(); 
    
    // 默认选中第一个标签页
    const firstTab = inventoryScreen.querySelector('.tab-btn');
    if (firstTab) firstTab.click();
});

debugBtn.addEventListener('click', () => {
    // 不改变 gameState，只显示弹窗
    debugScreen.classList.remove('hidden');
});

if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
        if (confirm('确定要清除所有存档数据吗？这将重置游戏进度！')) {
            localStorage.clear();
            location.reload();
        }
    });
}

btnBackLobby.addEventListener('click', () => {
    gameState = 'LOBBY';
    upgradeScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    
    // 更新玩家预览属性
    const stats = getPlayerStats();
    player.maxHp = stats.maxHp;
    player.hp = stats.maxHp;
    updatePlayerStatsDisplay();
});

btnBackLobbyForging.addEventListener('click', () => {
    forgingScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

btnInventoryBackLobby.addEventListener('click', () => {
    gameState = 'LOBBY';
    inventoryScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    updatePlayerStatsDisplay();
});

btnCloseDebug.addEventListener('click', () => {
    debugScreen.classList.add('hidden');
});

// 加载时初始化金币显示
updateGoldDisplay();
updatePlayerStatsDisplay();

restartBtn.addEventListener('click', () => {
    currentLevel = 1;
    initGame();
    gameState = 'PLAYING';
    gameOverScreen.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    levelClearedOverlay.classList.add('hidden');
});

    lobbyBtn.addEventListener('click', () => {
    gameState = 'LOBBY';
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    levelClearedOverlay.classList.add('hidden');
    updateGoldDisplay();
    updatePlayerStatsDisplay();
    
    // 重置大厅玩家位置
    const stats = getPlayerStats();
    player.x = canvas.width * 0.7;
    player.y = canvas.height * 0.6;
    player.hp = stats.maxHp;
    player.maxHp = stats.maxHp;
});

    overlayNextLevelBtn.addEventListener('click', () => {
    currentLevel++;
    // 保留当前状态，只重置关卡相关数据
    monsters = [];
    bullets = [];
    ores = [];
    floatingTexts = [];
    killCount = 0;
    monstersSpawned = 0;
    hasWon = false;
    sessionGold = 0; 
    sessionInventory = {};
    
    spawnOres(); // 新关卡生成矿石

    levelClearedOverlay.classList.add('hidden');    // 恢复玩家血量？通常过关会恢复一点或者不恢复。这里暂时不恢复，或者回满？
    // 简单起见，回满血
    const stats = getPlayerStats();
    player.hp = stats.maxHp;
    player.maxHp = stats.maxHp;
    
    showNotification(`进入第 ${currentLevel} 关`);
});

overlayLobbyBtn.addEventListener('click', () => {
    gameState = 'LOBBY';
    levelClearedOverlay.classList.add('hidden');
    startScreen.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    updateGoldDisplay();
    updatePlayerStatsDisplay();

    // 重置大厅玩家位置
    const stats = getPlayerStats();
    player.x = canvas.width * 0.7;
    player.y = canvas.height * 0.6;
    player.hp = stats.maxHp;
    player.maxHp = stats.maxHp;
});// 暂停逻辑
function togglePause() {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        pauseScreen.classList.remove('hidden');
    } else if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        pauseScreen.classList.add('hidden');
        confirmQuitModal.classList.add('hidden'); // 确保模态框关闭
    }
}

pauseBtn.addEventListener('click', togglePause);

resumeBtn.addEventListener('click', () => {
    gameState = 'PLAYING';
    pauseScreen.classList.add('hidden');
});

quitLobbyBtn.addEventListener('click', () => {
    // 显示本局获得的道具列表
    sessionItemsList.innerHTML = '';
    
    const sessionItemIds = Object.keys(sessionInventory);
    const sessionGoldAmount = sessionGold;
    
    if (sessionItemIds.length === 0 && sessionGoldAmount === 0) {
        sessionItemsList.innerHTML = '<p style="color: #888; text-align: center;">本局暂无获得任何道具或金币</p>';
    } else {
        let itemsHTML = '<div style="color: #fff;">';
        
        // 显示金币
        if (sessionGoldAmount > 0) {
            itemsHTML += `<div style="margin: 5px 0; padding: 5px; background: #444; border-radius: 3px;">`;
            itemsHTML += `<span style="color: #ffd700;">💰 金币</span>: <span style="color: #ffd700;">${sessionGoldAmount}</span>`;
            itemsHTML += `</div>`;
        }
        
        // 显示道具
        sessionItemIds.forEach(itemId => {
            const item = itemConfig[itemId];
            const count = sessionInventory[itemId];
            if (item && count > 0) {
                itemsHTML += `<div style="margin: 5px 0; padding: 5px; background: #444; border-radius: 3px;">`;
                itemsHTML += `<span>${item.icon || '📦'} ${item.name}</span>: <span style="color: #4CAF50;">×${count}</span>`;
                itemsHTML += `</div>`;
            }
        });
        
        itemsHTML += '</div>';
        sessionItemsList.innerHTML = itemsHTML;
    }
    
    confirmQuitModal.classList.remove('hidden');
});

confirmQuitNo.addEventListener('click', () => {
    confirmQuitModal.classList.add('hidden');
});

confirmQuitYes.addEventListener('click', () => {
    gameState = 'LOBBY';
    pauseScreen.classList.add('hidden');
    confirmQuitModal.classList.add('hidden');
    startScreen.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    
    // 重置游戏状态但不保存本局金币
    sessionGold = 0;
    sessionInventory = {};
    updateGoldDisplay();
    updatePlayerStatsDisplay();
    
    // 重置大厅玩家位置
    const stats = getPlayerStats();
    player.x = canvas.width * 0.7;
    player.y = canvas.height * 0.6;
    player.hp = stats.maxHp;
    player.maxHp = stats.maxHp;
});

// 输入处理
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (gameState === 'PLAYING' || gameState === 'PAUSED') {
            togglePause();
        }
    }
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (gameState === 'LOBBY') {
        player.x = canvas.width * 0.7;
        player.y = canvas.height * 0.6;
    }
});

// 游戏逻辑
function update(timestamp) {
    if (gameState !== 'PLAYING') return;

    updatePlayerMovement();
    updateSpawning(timestamp);
    updateShooting(timestamp);
    updateBullets();
    updateMonsters(timestamp);
    updateOres(timestamp); // 更新矿石逻辑
    updateFloatingTexts();
}

function updatePlayerMovement() {
    if (keys['w']) player.y -= player.speed;
    if (keys['s']) player.y += player.speed;
    if (keys['a']) player.x -= player.speed;
    if (keys['d']) player.x += player.speed;

    // 保持玩家在边界内
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
}

function updateSpawning(timestamp) {
    // 检查是否已达到本关最大生成数量
    const config = levelConfig[currentLevel] || levelConfig[1];
    const maxMonsters = config.winKillCount || 50;
    if (monstersSpawned >= maxMonsters) return;

    if (timestamp - lastSpawnTime > config.spawnRate) {
        spawnMonster();
        lastSpawnTime = timestamp;
    }
}

function updateShooting(timestamp) {
    // 自动射击
    let weapon = weaponConfig[equippedWeaponId];

    // 安全检查：如果武器不存在（例如存档数据不匹配），重置为默认武器
    if (!weapon) {
        console.warn(`Equipped weapon ID ${equippedWeaponId} not found in config. Resetting to default.`);
        equippedWeaponId = 4; // 默认为木棍
        localStorage.setItem('equippedWeaponId', equippedWeaponId);
        weapon = weaponConfig[equippedWeaponId];
        
        // 如果仍然不存在（配置损坏），直接返回
        if (!weapon) return;
    }

    if (weapon.type === 'melee-sweep' || weapon.type === 'melee-thrust' || weapon.type === 'melee-smash') {
        if (timestamp - lastShotTime > weapon.fireRate) {
            const target = getNearestMonster();
            if (target) {
                const dx = target.x - player.x;
                const dy = target.y - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const facingAngle = Math.atan2(dy, dx);
                
                // Melee range check (primary target)
                // For smash, we check if target is within (range + radius) roughly, or just use range
                if (dist <= (weapon.range || 100) + (weapon.type === 'melee-smash' ? 50 : 0)) {
                    lastShotTime = timestamp;
                    
                    // Define attack properties
                    const range = weapon.range || 100;
                    
                    // Find all targets in area
                    const targetsToHit = [];

                    if (weapon.type === 'melee-sweep') {
                        const sweepAngle = (weapon.angle || 0) * (Math.PI / 180); // Convert to radians
                        
                        // Visual effect for sweep
                        attackVisuals.push({
                            type: 'sweep',
                            x: player.x,
                            y: player.y,
                            angle: facingAngle,
                            radius: range,
                            sweepAngle: sweepAngle,
                            life: 0.2, // duration in seconds
                            maxLife: 0.2
                        });

                        // Sweep logic
                        for (const m of monsters) {
                            const mdx = m.x - player.x;
                            const mdy = m.y - player.y;
                            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                            
                            if (mDist <= range) {
                                const mAngle = Math.atan2(mdy, mdx);
                                let angleDiff = mAngle - facingAngle;
                                
                                // Normalize angle difference to -PI to PI
                                while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                                while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                                
                                if (Math.abs(angleDiff) <= sweepAngle / 2) {
                                    targetsToHit.push(m);
                                }
                            }
                        }
                    } else if (weapon.type === 'melee-thrust') {
                        const width = weapon.width || 40;

                        // Visual effect for thrust
                        attackVisuals.push({
                            type: 'thrust',
                            x: player.x,
                            y: player.y,
                            angle: facingAngle,
                            length: range,
                            width: width,
                            life: 0.2,
                            maxLife: 0.2
                        });

                        // Thrust logic (Rectangle check)
                        // Transform monster pos to local space relative to player facing
                        const cos = Math.cos(-facingAngle);
                        const sin = Math.sin(-facingAngle);
                        
                        for (const m of monsters) {
                            const mdx = m.x - player.x;
                            const mdy = m.y - player.y;
                            
                            // Rotate point
                            const rx = mdx * cos - mdy * sin;
                            const ry = mdx * sin + mdy * cos;
                            
                            // Check if within rectangle (0 to range, -width/2 to width/2)
                            if (rx >= 0 && rx <= range && ry >= -width/2 && ry <= width/2) {
                                targetsToHit.push(m);
                            }
                        }
                    } else if (weapon.type === 'melee-smash') {
                        // Smash logic: Circular area in front of player
                        // Center is at player + facing * range (so the circle is tangent to player? or centered at range?)
                        // User said "in front of character circular area".
                        // Let's assume the circle's center is at distance R from player, and radius is R.
                        // So it covers the area in front.
                        const smashRadius = range;
                        const smashDist = range; // Center distance
                        
                        const smashX = player.x + Math.cos(facingAngle) * smashDist;
                        const smashY = player.y + Math.sin(facingAngle) * smashDist;

                        // Visual effect
                        attackVisuals.push({
                            type: 'smash',
                            x: smashX,
                            y: smashY,
                            radius: smashRadius,
                            life: 0.2,
                            maxLife: 0.2
                        });

                        for (const m of monsters) {
                            const mdx = m.x - smashX;
                            const mdy = m.y - smashY;
                            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                            
                            if (mDist <= smashRadius) {
                                targetsToHit.push(m);
                            }
                        }
                    }

                    const stats = getPlayerStats();
                    const damage = Math.floor(stats.strength * weapon.damageMultiplier);

                    targetsToHit.forEach(t => {
                        const actualDamage = Math.max(1, damage - (t.defense || 0));
                        t.hp -= actualDamage;

                        // Visual feedback
                        floatingTexts.push({
                            x: t.x,
                            y: t.y - 20,
                            text: `-${actualDamage}`,
                            life: 0.5,
                            color: '#fff'
                        });

                        // Death logic
                        if (t.hp <= 0) {
                            const mIndex = monsters.indexOf(t);
                            if (mIndex > -1) {
                                monsters.splice(mIndex, 1);
                                
                                const goldDrop = Math.floor(Math.random() * (t.goldMax - t.goldMin + 1)) + t.goldMin;
                                sessionGold += goldDrop;
                                
                                floatingTexts.push({
                                    x: t.x,
                                    y: t.y,
                                    text: `+${goldDrop}`,
                                    life: 1.0,
                                    color: 'gold'
                                });
                                
                                killCount++;
                                
                                const config = levelConfig[currentLevel] || levelConfig[1];
                                const winKillCount = config.winKillCount || 50;
                                if (!hasWon && killCount >= winKillCount) {
                                    hasWon = true;
                                    if (currentLevel === maxUnlockedLevel) {
                                        maxUnlockedLevel++;
                                        localStorage.setItem('maxUnlockedLevel', maxUnlockedLevel);
                                    }
                                    totalGold += sessionGold;
                                    localStorage.setItem('totalGold', totalGold);
                                    const winExp = config.winExp || 0;
                                    addExperience(winExp);
                                    
                                    let itemRewardStr = "";
                                    const sessionItemIds = Object.keys(sessionInventory);
                                    if (sessionItemIds.length > 0) {
                                        itemRewardStr = " | 获得道具: ";
                                        const items = [];
                                        sessionItemIds.forEach(id => {
                                            const count = sessionInventory[id];
                                            const item = itemConfig[id];
                                            items.push(`${item.name} x${count}`);
                                        });
                                        itemRewardStr += items.join(", ");
                                    }
                                    persistSessionItems();
                                    levelRewardDisplay.textContent = `获得金币: ${sessionGold} | 获得经验: ${winExp}${itemRewardStr}`;
                                    levelClearedOverlay.classList.remove('hidden');
                                }
                            }
                        }
                    });
                }
            }
        }
        return;
    }

    if (timestamp - lastShotTime > weapon.fireRate) {
        const target = getNearestMonster();
        if (target) {
            burstTargetId = target.id;
            burstShotsRemaining = weapon.burstCount || 1;
            lastShotTime = timestamp;
        }
    }

    // 处理连发
    if (burstShotsRemaining > 0) {
        const burstDelay = weapon.burstDelay || 100;
        if (timestamp - lastBurstTime > burstDelay) {
            // 尝试找到锁定的目标
            let target = monsters.find(m => m.id === burstTargetId);
            
            // 如果锁定目标死亡/消失，寻找新的最近目标
            if (!target) {
                target = getNearestMonster();
                if (target) {
                    burstTargetId = target.id;
                }
            }

            if (target) {
                shootTarget(target);
                burstShotsRemaining--;
                lastBurstTime = timestamp;
            } else {
                // 根本没有目标
                burstShotsRemaining = 0;
            }
        }
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];

        if (b.type === 'bounce') {
            updateBounceBullet(b, i);
        } else {
            updatePenetrateBullet(b, i);
        }
    }
}

function updateBounceBullet(b, i) {
    // 如果目标存活，更新目标位置
    const target = monsters.find(m => m.id === b.targetId);
    if (target) {
        b.targetX = target.x;
        b.targetY = target.y;
    }

    // 向 targetX, targetY 移动
    const dx = b.targetX - b.x;
    const dy = b.targetY - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= b.speed) {
        // 到达目的地
        b.x = b.targetX;
        b.y = b.targetY;

        // 检查是否击中目标
        if (target) {
            handleBulletHit(b, target, i);
            
            // 弹射逻辑
            if (b.bounceCount > 0) {
                b.bounceCount--;
                b.hitIds.push(target.id);
                
                // 寻找新目标
                const newTarget = getNearestMonsterExcluding(b.x, b.y, b.hitIds);
                if (newTarget) {
                    b.targetId = newTarget.id;
                    b.targetX = newTarget.x;
                    b.targetY = newTarget.y;
                    // 子弹继续存在
                } else {
                    bullets.splice(i, 1);
                }
            } else {
                bullets.splice(i, 1);
            }
        } else {
            // 到达时目标已死亡
            bullets.splice(i, 1);
        }
    } else {
        // 移动
        b.x += (dx / dist) * b.speed;
        b.y += (dy / dist) * b.speed;
    }
}

function updatePenetrateBullet(b, i) {
    b.x += b.vx;
    b.y += b.vy;

    // 如果超出边界则移除
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
        bullets.splice(i, 1);
        return;
    }

    if (b.isEnemy) {
        // 敌方子弹：检测玩家碰撞
        const dx = b.x - player.x;
        const dy = b.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < player.radius + b.radius) {
            // 击中玩家
            const actualDamage = Math.max(1, b.damage - (player.defense || 0));
            player.hp -= actualDamage;
            
            floatingTexts.push({
                x: player.x,
                y: player.y - 20,
                text: `-${actualDamage.toFixed(1)}`,
                life: 0.5,
                color: 'red'
            });

            if (player.hp <= 0) {
                gameState = 'GAMEOVER';
                lossGoldDisplay.textContent = `损失金币: ${sessionGold}`;
                gameOverScreen.classList.remove('hidden');
            }

            // 敌方子弹击中玩家后消失 (穿透0)
            bullets.splice(i, 1);
        }
    } else {
        // 玩家子弹：检测怪物碰撞
        let bulletRemoved = false;
        for (let j = monsters.length - 1; j >= 0; j--) {
            const m = monsters[j];
            const dx = b.x - m.x;
            const dy = b.y - m.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < m.radius + b.radius) {
                if (b.hitIds.includes(m.id)) continue; // 已经击中过该怪物

                handleBulletHit(b, m, i);

                if (b.penetration > 0) {
                    b.penetration--;
                    // 子弹继续
                } else {
                    bullets.splice(i, 1); // 移除子弹
                    bulletRemoved = true;
                    break; // 子弹击中物体并消失
                }
            }
        }
    }
}

function handleBulletHit(bullet, monster, bulletIndex) {
    const actualDamage = Math.max(1, bullet.damage - (monster.defense || 0));
    monster.hp -= actualDamage;
    bullet.hitIds.push(monster.id);

    // 显示伤害数字
    floatingTexts.push({
        x: monster.x,
        y: monster.y - 10,
        text: `-${actualDamage.toFixed(1)}`,
        life: 0.5,
        color: 'white'
    });

    if (monster.hp <= 0) {
        const mIndex = monsters.indexOf(monster);
        if (mIndex > -1) {
            monsters.splice(mIndex, 1); // 移除怪物
            
            // 随机掉落金币
            const goldDrop = Math.floor(Math.random() * (monster.goldMax - monster.goldMin + 1)) + monster.goldMin;
            sessionGold += goldDrop;
            
            // 添加浮动文字
            floatingTexts.push({
                x: monster.x,
                y: monster.y,
                text: `+${goldDrop}`,
                life: 1.0, // 秒
                color: 'gold'
            });
            
            killCount++;

            const config = levelConfig[currentLevel] || levelConfig[1];
            const winKillCount = config.winKillCount || 50;
            // 检查是否击杀所有怪物
            if (!hasWon && killCount >= winKillCount) {
                hasWon = true;
                
                // 更新最大解锁关卡
                if (currentLevel === maxUnlockedLevel) {
                    maxUnlockedLevel++;
                    localStorage.setItem('maxUnlockedLevel', maxUnlockedLevel);
                }

                // 存储金币
                totalGold += sessionGold;
                localStorage.setItem('totalGold', totalGold);

                // 奖励经验
                const winExp = config.winExp || 0;
                addExperience(winExp);

                // 结算道具并生成描述
                let itemRewardStr = "";
                const sessionItemIds = Object.keys(sessionInventory);
                if (sessionItemIds.length > 0) {
                    itemRewardStr = " | 获得道具: ";
                    const items = [];
                    sessionItemIds.forEach(id => {
                        const count = sessionInventory[id];
                        const item = itemConfig[id];
                        items.push(`${item.name} x${count}`);
                    });
                    itemRewardStr += items.join(", ");
                }
                
                persistSessionItems();
                
                levelRewardDisplay.textContent = `获得金币: ${sessionGold} | 获得经验: ${winExp}${itemRewardStr}`;
                levelClearedOverlay.classList.remove('hidden');
            }
        }
    }
}

function updateMonsters(timestamp) {
    for (let i = 0; i < monsters.length; i++) {
        const m = monsters[i];
        const dx = player.x - m.x;
        const dy = player.y - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const weapon = monsterWeaponConfig[m.weaponId];

        // 移动逻辑
        let moveX = 0;
        let moveY = 0;

        if (weapon) {
            if (weapon.type === 'melee-sweep' || weapon.type === 'melee-thrust') {
                // 近战：靠近玩家
                if (dist > weapon.range * 0.8) { // 稍微靠近一点
                    moveX = (dx / dist) * m.speed;
                    moveY = (dy / dist) * m.speed;
                }
            } else {
                // 远程：保持距离
                const safeDist = 200;
                const attackDist = 400;

                if (dist < safeDist) {
                    // 太近了，远离
                    moveX = -(dx / dist) * m.speed;
                    moveY = -(dy / dist) * m.speed;
                } else if (dist > attackDist) {
                    // 太远了，靠近
                    moveX = (dx / dist) * m.speed;
                    moveY = (dy / dist) * m.speed;
                }
                // 否则保持原地
            }
        } else {
            // 无武器（默认）：直接冲向玩家
            if (dist > 0) {
                moveX = (dx / dist) * m.speed;
                moveY = (dy / dist) * m.speed;
            }
        }

        m.x += moveX;
        m.y += moveY;

        // 限制在画布内
        m.x = Math.max(m.radius, Math.min(canvas.width - m.radius, m.x));
        m.y = Math.max(m.radius, Math.min(canvas.height - m.radius, m.y));

        // 攻击逻辑
        if (weapon) {
            // 攻击频率：远程固定3秒，近战使用武器频率
            const cooldown = (weapon.type === 'penetrate' || weapon.type === 'bounce') ? 3000 : weapon.fireRate;
            
            if (timestamp - m.lastAttackTime > cooldown) {
                // 检查攻击距离
                const attackRange = (weapon.type === 'penetrate' || weapon.type === 'bounce') ? 500 : weapon.range;
                
                if (dist <= attackRange) {
                    monsterAttack(m, weapon, timestamp);
                    m.lastAttackTime = timestamp;
                }
            }
        }

        // 玩家碰撞 (撞击伤害)
        if (dist < player.radius + m.radius) {
            if (timestamp - player.lastHitTime > 1000) { // 1秒无敌时间
                const actualDamage = Math.max(1, m.damage - (player.defense || 0));
                player.hp -= actualDamage;
                player.lastHitTime = timestamp;
                
                // 显示玩家受伤数字
                floatingTexts.push({
                    x: player.x,
                    y: player.y - 20,
                    text: `-${actualDamage.toFixed(1)}`,
                    life: 0.5,
                    color: 'red'
                });

                if (player.hp <= 0) {
                    gameState = 'GAMEOVER';
                    lossGoldDisplay.textContent = `损失金币: ${sessionGold}`;
                    gameOverScreen.classList.remove('hidden');
                }
            }
        }
    }
}

function monsterAttack(monster, weapon, timestamp) {
    const dx = player.x - monster.x;
    const dy = player.y - monster.y;
    const angle = Math.atan2(dy, dx);

    if (weapon.type === 'melee-sweep' || weapon.type === 'melee-thrust') {
        // 近战攻击特效
        if (weapon.type === 'melee-sweep') {
             attackVisuals.push({
                type: 'sweep',
                x: monster.x,
                y: monster.y,
                angle: angle,
                radius: weapon.range,
                sweepAngle: (weapon.angle || 120) * (Math.PI / 180),
                life: 0.2,
                maxLife: 0.2,
                isEnemy: true
            });
        } else {
             attackVisuals.push({
                type: 'thrust',
                x: monster.x,
                y: monster.y,
                angle: angle,
                length: weapon.range,
                width: weapon.width || 40,
                life: 0.2,
                maxLife: 0.2,
                isEnemy: true
            });
        }

        // 判定是否击中玩家
        // 简单判定：距离足够且角度对（这里简化为距离判定，因为怪物是瞄准玩家的）
        // 为了更精确，应该复用扇形/矩形检测。
        // 简化：如果距离 < range + player.radius，必中（因为怪物AI是瞄准的）
        // 但玩家可能移动。
        // 让我们做简单的距离检测 + 角度检测
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist <= weapon.range + player.radius) {
             // 造成伤害
             const actualDamage = Math.max(1, (monster.damage * weapon.damageMultiplier) - player.defense);
             player.hp -= actualDamage;
             
             floatingTexts.push({
                x: player.x,
                y: player.y - 20,
                text: `-${actualDamage.toFixed(1)}`,
                life: 0.5,
                color: 'red'
            });
             
             if (player.hp <= 0) {
                gameState = 'GAMEOVER';
                lossGoldDisplay.textContent = `损失金币: ${sessionGold}`;
                gameOverScreen.classList.remove('hidden');
            }
        }

    } else {
        // 远程攻击
        const vx = Math.cos(angle) * 4; // 怪物子弹速度慢一点? User didn't specify speed, assume standard or slower.
        const vy = Math.sin(angle) * 4;

        bullets.push({
            type: 'penetrate',
            x: monster.x,
            y: monster.y,
            vx: vx,
            vy: vy,
            radius: 5,
            color: 'red', // 敌方子弹颜色
            penetration: 0, // 穿透次数 0
            damage: monster.damage * weapon.damageMultiplier,
            hitIds: [],
            isEnemy: true // 标记为敌方子弹
        });
    }
}

function updateFloatingTexts() {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.life -= 0.016; // 大约 60fps
        ft.y -= 0.5; // 向上浮动
        
        if (ft.life <= 0) {
            floatingTexts.splice(i, 1);
        }
    }
}

function spawnMonster() {
    const side = Math.floor(Math.random() * 4); // 0: 上, 1: 右, 2: 下, 3: 左
    let x, y;

    switch (side) {
        case 0: x = Math.random() * canvas.width; y = -20; break;
        case 1: x = canvas.width + 20; y = Math.random() * canvas.height; break;
        case 2: x = Math.random() * canvas.width; y = canvas.height + 20; break;
        case 3: x = -20; y = Math.random() * canvas.height; break;
    }

    // 随机生成类型 1 或 2
    const typeId = Math.random() < 0.5 ? 1 : 2;
    const stats = monsterConfig[typeId];
    const hpMultiplier = 1 + 0.1 * currentLevel;

    monstersSpawned++; // 增加生成计数

    monsters.push({
        id: monsterIdCounter++,
        x: x,
        y: y,
        radius: stats.radius,
        hp: stats.hp * hpMultiplier,
        maxHp: stats.hp * hpMultiplier,
        speed: stats.speed,
        color: stats.color,
        damage: stats.damage,
        defense: stats.defense,
        goldMin: stats.goldMin,
        goldMax: stats.goldMax,
        typeId: typeId,
        weaponId: stats.weaponId, // 携带武器
        lastAttackTime: performance.now() // 初始化攻击时间
    });
}

function getNearestMonsterExcluding(x, y, excludeIds) {
    if (monsters.length === 0) return null;

    let nearest = null;
    let minDist = Infinity;

    for (const m of monsters) {
        if (excludeIds.includes(m.id)) continue;

        const dx = m.x - x;
        const dy = m.y - y;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
            minDist = dist;
            nearest = m;
        }
    }
    return nearest;
}

function getNearestMonster() {
    if (monsters.length === 0) return null;

    let nearest = null;
    let minDist = Infinity;

    for (const m of monsters) {
        const dx = m.x - player.x;
        const dy = m.y - player.y;
        const dist = dx * dx + dy * dy; // 距离平方足以用于比较
        if (dist < minDist) {
            minDist = dist;
            nearest = m;
        }
    }
    return nearest;
}

function shootTarget(target) {
    if (!target) return;

    const stats = getPlayerStats();
    const weapon = weaponConfig[equippedWeaponId];
    // 伤害计算：力量 * 武器倍率
    const finalDamage = stats.strength * weapon.damageMultiplier;

    if (weapon.type === 'bounce') {
        bullets.push({
            type: 'bounce',
            x: player.x,
            y: player.y,
            speed: weapon.speed || 12,
            targetId: target.id,
            targetX: target.x,
            targetY: target.y,
            damage: finalDamage,
            bounceCount: weapon.bounceCount,
            hitIds: [],
            radius: 5,
            color: 'cyan'
        });
    } else {
        // 默认穿透类型
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        
        // 计算基础角度
        const angle = Math.atan2(dy, dx);

        // 如果需要，生成多个子弹
        for (let i = 0; i < weapon.projectileCount; i++) {
            // 如果超过1个，稍微分散子弹
            let spreadAngle = 0;
            if (weapon.projectileCount > 1) {
                const spread = 0.2; // 总扩散弧度
                spreadAngle = -spread/2 + (spread / (weapon.projectileCount - 1)) * i;
            }

            const vx = Math.cos(angle + spreadAngle) * playerConfig.bulletSpeed;
            const vy = Math.sin(angle + spreadAngle) * playerConfig.bulletSpeed;

            bullets.push({
                type: 'penetrate',
                x: player.x,
                y: player.y,
                vx: vx,
                vy: vy,
                radius: 5,
                color: 'yellow',
                penetration: weapon.penetration,
                damage: finalDamage,
                hitIds: []
            });
        }
    }
}

function drawWeapon() {
    const weapon = weaponConfig[equippedWeaponId];
    if (!weapon || !weapon.visual) return;

    let angle = 0;
    // 确定指向的目标
    let target = null;
    
    // 如果正在连发，看向连发目标
    if (burstTargetId) {
        target = monsters.find(m => m.id === burstTargetId);
    }
    
    // 如果没有连发或连发目标丢失，看向最近的目标
    if (!target) {
        target = getNearestMonster();
    }

    if (target) {
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        angle = Math.atan2(dy, dx);
    }

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(angle);
    
    ctx.fillStyle = weapon.visual.color;
    // 绘制代表武器的矩形
    // 稍微偏离中心，看起来像是被握着
    ctx.fillRect(0, -weapon.visual.width / 2, weapon.visual.length, weapon.visual.width);
    
    ctx.restore();
}

// 矿石相关逻辑
function spawnOres() {
    let instanceIdCounter = 0;
    const config = levelConfig[currentLevel] || levelConfig[1];
    
    const min = config.resourceMin || 3;
    const max = config.resourceMax || 5;
    const types = config.resourceTypes || [1];

    const totalCount = Math.floor(Math.random() * (max - min + 1)) + min;

    for (let i = 0; i < totalCount; i++) {
        const typeId = types[Math.floor(Math.random() * types.length)];
        const oreConf = oreConfig[typeId];
        
        if (!oreConf) continue;

        ores.push({
            instanceId: instanceIdCounter++,
            configId: oreConf.id,
            x: Math.random() * (canvas.width - 100) + 50,
            y: Math.random() * (canvas.height - 100) + 50,
            size: oreConf.size,
            color: oreConf.color,
            capacity: oreConf.maxCapacity,
            maxCapacity: oreConf.maxCapacity,
            miningProgress: 0,
            miningTime: oreConf.miningTime,
            miningRange: oreConf.miningRange || 60,
            productId: oreConf.productId,
            isMining: false
        });
    }
}

function updateOres(timestamp) {
    // 找出所有在范围内的矿石
    let candidates = [];
    for (let i = 0; i < ores.length; i++) {
        const ore = ores[i];
        const dx = player.x - ore.x;
        const dy = player.y - ore.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // 采集范围
        if (dist < ore.miningRange) {
            candidates.push({ ore: ore, dist: dist, index: i });
        } else {
            // 不在范围内，重置
            ore.isMining = false;
            ore.miningProgress = 0;
        }
    }

    // 如果有候选矿石，只采集最近的一个
    if (candidates.length > 0) {
        // 按距离排序
        candidates.sort((a, b) => a.dist - b.dist);
        
        const target = candidates[0];
        const targetOre = target.ore;
        
        // 标记最近的为正在采集
        targetOre.isMining = true;
        targetOre.miningProgress += 16.6; // 假设 60fps

        // 其他候选者重置 (虽然在范围内，但因为不是最近的，所以不采集)
        for (let i = 1; i < candidates.length; i++) {
            candidates[i].ore.isMining = false;
            candidates[i].ore.miningProgress = 0;
        }

        if (targetOre.miningProgress >= targetOre.miningTime) {
            // 采集完成
            targetOre.capacity--;
            targetOre.miningProgress = 0;
            
            // 获得道具 (临时)
            addSessionItem(targetOre.productId, 1); 
            
            const product = itemConfig[targetOre.productId];
            floatingTexts.push({
                x: player.x,
                y: player.y - 30,
                text: `获得 ${product ? product.name : '未知物品'} x1`,
                life: 1.5,
                color: '#FFF'
            });

            if (targetOre.capacity <= 0) {
                ores.splice(target.index, 1);
            }
        }
    }
}

function addSessionItem(itemId, count) {
    if (!sessionInventory[itemId]) {
        sessionInventory[itemId] = 0;
    }
    sessionInventory[itemId] += count;
    // showNotification(`获得 ${itemConfig[itemId].name} x${count} (通关后结算)`);
}

function persistSessionItems() {
    for (const itemId in sessionInventory) {
        const count = sessionInventory[itemId];
        if (!inventory[itemId]) {
            inventory[itemId] = 0;
        }
        inventory[itemId] += count;
    }
    localStorage.setItem('inventory', JSON.stringify(inventory));
    sessionInventory = {}; // 清空
}

function addItem(itemId, count) {
    // 旧函数，保留以防万一，但现在主要用 addSessionItem
    if (!inventory[itemId]) {
        inventory[itemId] = 0;
    }
    inventory[itemId] += count;
    localStorage.setItem('inventory', JSON.stringify(inventory));
    showNotification(`获得 ${itemConfig[itemId].name} x${count}`);
}

function updateInventoryUI() {
    updateInventoryItemsUI();
    updateInventoryWeaponsUI();
}

function updateInventoryItemsUI() {
    inventoryList.innerHTML = '';
    const itemIds = Object.keys(inventory);
    
    if (itemIds.length === 0) {
        inventoryList.innerHTML = '<p style="color: #aaa; font-size: 18px;">暂无道具</p>';
        return;
    }

    itemIds.forEach(id => {
        const count = inventory[id];
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
        if (!ownedWeapons.includes(weaponId)) {
            continue;
        }

        const isEquipped = weaponId === equippedWeaponId;
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

// 渲染
function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'PLAYING' || gameState === 'GAMEOVER' || gameState === 'LOBBY' || gameState === 'VICTORY' || gameState === 'PAUSED') {
        
        if (gameState !== 'LOBBY') {
            // Layer 1: Ores (Bottom)
            for (const ore of ores) {
                if (!ore) continue;
                const range = ore.miningRange || 60;

                // 采集范围圈 (半透明)
                ctx.beginPath();
                ctx.arc(ore.x, ore.y, range, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.closePath();

                // 矿石本体 (正方形)
                ctx.fillStyle = ore.color || '#888';
                ctx.fillRect(ore.x - ore.size / 2, ore.y - ore.size / 2, ore.size, ore.size);
                
                ctx.strokeStyle = '#5D4037';
                ctx.lineWidth = 2;
                ctx.strokeRect(ore.x - ore.size / 2, ore.y - ore.size / 2, ore.size, ore.size);

                // 剩余次数文字
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${ore.capacity}`, ore.x, ore.y);

                // 采集进度条
                if (ore.isMining && ore.miningProgress > 0) {
                    const barWidth = 40;
                    const barHeight = 6;
                    const progress = Math.min(1, ore.miningProgress / ore.miningTime);
                    
                    ctx.fillStyle = '#333';
                    ctx.fillRect(ore.x - barWidth/2, ore.y - ore.size / 2 - 15, barWidth, barHeight);
                    
                    ctx.fillStyle = '#4CAF50';
                    ctx.fillRect(ore.x - barWidth/2, ore.y - ore.size / 2 - 15, barWidth * progress, barHeight);
                }
            }

            // Layer 2: Monsters
            for (const m of monsters) {
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
                ctx.fillStyle = m.color;
                ctx.fill();
                ctx.closePath();
                
                // 绘制怪物武器
                if (m.weaponId) {
                    const weapon = monsterWeaponConfig[m.weaponId];
                    if (weapon && weapon.visual) {
                        const dx = player.x - m.x;
                        const dy = player.y - m.y;
                        const angle = Math.atan2(dy, dx);
                        
                        ctx.save();
                        ctx.translate(m.x, m.y);
                        ctx.rotate(angle);
                        ctx.fillStyle = weapon.visual.color;
                        ctx.fillRect(0, -weapon.visual.width / 2, weapon.visual.length, weapon.visual.width);
                        ctx.restore();
                    }
                }

                // 绘制生命值
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(Math.ceil(m.hp), m.x, m.y);
            }

            // Layer 3: Bullets
            for (const b of bullets) {
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fillStyle = b.color;
                ctx.fill();
                ctx.closePath();
            }

            // Layer 3.5: Attack Visuals
            for (let i = attackVisuals.length - 1; i >= 0; i--) {
                const v = attackVisuals[i];
                
                const color = v.isEnemy ? `rgba(255, 0, 0, ${v.life / v.maxLife * 0.5})` : `rgba(255, 255, 255, ${v.life / v.maxLife * 0.5})`;

                if (v.type === 'sweep') {
                    ctx.beginPath();
                    ctx.moveTo(v.x, v.y);
                    ctx.arc(v.x, v.y, v.radius, v.angle - v.sweepAngle / 2, v.angle + v.sweepAngle / 2);
                    ctx.lineTo(v.x, v.y);
                    ctx.fillStyle = color;
                    ctx.fill();
                } else if (v.type === 'thrust') {
                    ctx.save();
                    ctx.translate(v.x, v.y);
                    ctx.rotate(v.angle);
                    ctx.fillStyle = color;
                    // Draw rectangle starting from player center outwards
                    ctx.fillRect(0, -v.width / 2, v.length, v.width);
                    ctx.restore();
                } else if (v.type === 'smash') {
                    ctx.beginPath();
                    ctx.arc(v.x, v.y, v.radius, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                }
                
                v.life -= 0.016; // approx per frame
                if (v.life <= 0) attackVisuals.splice(i, 1);
            }
        }

        // Layer 4: Player (Top)
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.closePath();

        // 绘制武器
        drawWeapon();

        // 绘制玩家生命值
        if (gameState !== 'LOBBY') {
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`生命: ${Math.ceil(player.hp)}/${player.maxHp}`, player.x, player.y - player.radius - 5);
        }

        // Layer 5: UI Overlay
        if (gameState !== 'LOBBY') {
            const config = levelConfig[currentLevel] || levelConfig[1];
            const maxKills = config.winKillCount || 50;
            // 绘制击杀数
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`击杀: ${killCount} / ${maxKills} (关卡 ${currentLevel})`, 20, 20);

            // 绘制本局金币
            ctx.fillStyle = 'gold';
            ctx.fillText(`金币: ${sessionGold}`, 20, 50);

            // 绘制浮动文字
            for (const ft of floatingTexts) {
                ctx.globalAlpha = Math.max(0, ft.life);
                ctx.fillStyle = ft.color;
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(ft.text, ft.x, ft.y);
                ctx.globalAlpha = 1.0;
            }
        }
    }
}

function loop(timestamp) {
    update(timestamp);
    draw();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
