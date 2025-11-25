import { playerConfig } from './config/playerConfig.js';
import { monsterConfig } from './config/monsterConfig.js';
import { levelConfig } from './config/spawnConfig.js';
import { weaponConfig } from './config/weaponConfig.js';
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

// 强化 UI 元素
const upgradeScreen = document.getElementById('upgrade-screen');
const upgradeBtn = document.getElementById('upgrade-btn');
const clearDataBtn = document.getElementById('clear-data-btn');
const btnBackLobby = document.getElementById('btn-back-lobby');

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
        <p>本阶段累计属性: 攻击 +${baseBonus.damage}, 生命 +${baseBonus.maxHp}, 防御 +${baseBonus.defense}</p>
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
            damage: (baseStats.damage || 0) + (tierStats.damage || 0),
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
            <p>本阶段累计属性: 攻击 +${total.damage}, 生命 +${total.maxHp}, 防御 +${total.defense}</p>
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
        <p>本阶段累计属性: 攻击 +${currentTotal.damage}, 生命 +${currentTotal.maxHp}, 防御 +${currentTotal.defense}</p>
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
                <p>升级后累计属性: 攻击 +${nextTotal.damage}, 生命 +${nextTotal.maxHp}, 防御 +${nextTotal.defense}</p>
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
                <p>筑基加成: 攻击 +${bonus.damage}, 生命 +${bonus.maxHp}, 防御 +${bonus.defense}</p>
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
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 移除所有按钮的激活状态
        tabBtns.forEach(b => b.classList.remove('active'));
        // 添加当前按钮的激活状态
        btn.classList.add('active');

        // 隐藏所有内容
        tabContents.forEach(c => c.classList.add('hidden'));
        // 显示选中内容
        const tabId = btn.getAttribute('data-tab');
        const content = document.getElementById(`content-${tabId}`);
        if (content) {
            content.classList.remove('hidden');
        }
    });
});

// 武器 UI 元素
const weaponScreen = document.getElementById('weapon-screen');
const weaponBtn = document.getElementById('weapon-btn');
const btnWeaponBackLobby = document.getElementById('btn-weapon-back-lobby');
const weaponList = document.getElementById('weapon-list');

// 背包 UI 元素
const inventoryScreen = document.getElementById('inventory-screen');
const inventoryBtn = document.getElementById('inventory-btn');
const btnInventoryBackLobby = document.getElementById('btn-inventory-back-lobby');
const inventoryList = document.getElementById('inventory-list');

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

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 游戏状态
let gameState = 'LOBBY'; // LOBBY (大厅), PLAYING (游戏中), GAMEOVER (游戏结束), VICTORY (胜利), UPGRADE (强化), WEAPON (武器库), INVENTORY (背包), PAUSED (暂停)

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
let equippedWeaponId = parseInt(localStorage.getItem('equippedWeaponId')) || 1;
let inventory = JSON.parse(localStorage.getItem('inventory')) || {}; // { itemId: count }

let currentLevel = 1;
let killCount = 0;
let monstersSpawned = 0;
const MONSTERS_PER_LEVEL = 50;
let hasWon = false;

function getPlayerStats() {
    let bonusDamage = 0;
    let bonusHp = 0;
    let bonusDefense = 0;

    // 境界基础加成 (Realm Base Stats)
    for (const stageStr in realmBaseConfig) {
        const stageThreshold = parseInt(stageStr);
        if (cultivationStage >= stageThreshold) {
            const bonus = realmBaseConfig[stageThreshold].stats;
            bonusDamage += (bonus.damage || 0);
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
            bonusDamage += tierData.damage;
            bonusHp += tierData.maxHp;
            bonusDefense += (tierData.defense || 0);
        }
    }

    return {
        damage: playerConfig.damage + bonusDamage,
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
const keys = {};

let lastShotTime = 0;
let lastSpawnTime = 0;
let monsterIdCounter = 0;

// 连发状态
let burstShotsRemaining = 0;
let lastBurstTime = 0;
let burstTargetId = null;

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
    const damageEl = document.getElementById('stat-damage');
    const defenseEl = document.getElementById('stat-defense');
    const speedEl = document.getElementById('stat-speed');

    if (hpEl) hpEl.textContent = stats.maxHp;
    if (damageEl) damageEl.textContent = stats.damage.toFixed(1);
    if (defenseEl) defenseEl.textContent = stats.defense;
    if (speedEl) speedEl.textContent = playerConfig.speed;
}

function updateWeaponUI() {
    weaponList.innerHTML = '';
    for (const id in weaponConfig) {
        const weapon = weaponConfig[id];
        const isEquipped = parseInt(id) === equippedWeaponId;
        
        let typeInfo = '';
        if (weapon.type === 'bounce') {
            typeInfo = `<p>类型: 弹射</p><p>弹射次数: ${weapon.bounceCount}</p>`;
        } else {
            typeInfo = `<p>类型: 穿透</p><p>穿透次数: ${weapon.penetration}</p>`;
        }

        const div = document.createElement('div');
        div.className = 'upgrade-item';
        div.innerHTML = `
            <h2>${weapon.name}</h2>
            ${weapon.iconPath ? `<img src="${weapon.iconPath}" alt="${weapon.name}" style="width: 64px; height: 64px; display: block; margin: 0 auto 10px auto;">` : ''}
            ${typeInfo}
            <p>伤害倍率: ${weapon.damageMultiplier * 100}%</p>
            <p>射速: ${weapon.fireRate}ms</p>
            <p>弹丸数: ${weapon.projectileCount}</p>
            <p>连射数: ${weapon.burstCount || 1}</p>
            <button ${isEquipped ? 'disabled' : ''} onclick="window.equipWeapon(${id})">
                ${isEquipped ? '已装备' : '装备'}
            </button>
        `;
        weaponList.appendChild(div);
    }
}

// 将装备函数暴露给 window 以便 onclick 调用
window.equipWeapon = (id) => {
    equippedWeaponId = id;
    localStorage.setItem('equippedWeaponId', id);
    updateWeaponUI();
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

// UI 事件监听器
startBtn.addEventListener('click', () => {
    currentLevel = 1; // 新游戏从第1关开始
    initGame();
    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    levelClearedOverlay.classList.add('hidden');
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

weaponBtn.addEventListener('click', () => {
    gameState = 'WEAPON';
    startScreen.classList.add('hidden');
    weaponScreen.classList.remove('hidden');
    updateWeaponUI();
});

inventoryBtn.addEventListener('click', () => {
    gameState = 'INVENTORY';
    startScreen.classList.add('hidden');
    inventoryScreen.classList.remove('hidden');
    updateInventoryUI(); 
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

btnWeaponBackLobby.addEventListener('click', () => {
    gameState = 'LOBBY';
    weaponScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    updatePlayerStatsDisplay();
});

btnInventoryBackLobby.addEventListener('click', () => {
    gameState = 'LOBBY';
    inventoryScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
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
    if (monstersSpawned >= MONSTERS_PER_LEVEL) return;

    const config = levelConfig[currentLevel] || levelConfig[3]; // 默认为第3关
    if (timestamp - lastSpawnTime > config.spawnRate) {
        spawnMonster();
        lastSpawnTime = timestamp;
    }
}

function updateShooting(timestamp) {
    // 自动射击
    const weapon = weaponConfig[equippedWeaponId];
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

    // 与怪物碰撞
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

            const config = levelConfig[currentLevel] || levelConfig[3];
            // 检查是否击杀所有怪物 (固定50只)
            if (!hasWon && killCount >= MONSTERS_PER_LEVEL) {
                hasWon = true;
                
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
        
        if (dist > 0) {
            m.x += (dx / dist) * m.speed;
            m.y += (dy / dist) * m.speed;
        }

        // 玩家碰撞
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

    // 目前只生成类型 1 的怪物
    const typeId = 1;
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
        typeId: typeId
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
    const finalDamage = stats.damage * weapon.damageMultiplier;

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
    // 每关随机生成 3-5 个铁矿
    const count = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < count; i++) {
        // 目前只生成 ID 为 1 的铁矿
        const config = oreConfig[1];
        ores.push({
            instanceId: i,
            configId: config.id,
            x: Math.random() * (canvas.width - 100) + 50,
            y: Math.random() * (canvas.height - 100) + 50,
            size: config.size,
            color: config.color,
            capacity: config.maxCapacity,
            maxCapacity: config.maxCapacity,
            miningProgress: 0,
            miningTime: config.miningTime,
            miningRange: config.miningRange || 60,
            productId: config.productId,
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

// 渲染
function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'PLAYING' || gameState === 'GAMEOVER' || gameState === 'LOBBY' || gameState === 'VICTORY' || gameState === 'PAUSED') {
        
        if (gameState !== 'LOBBY') {
            // Layer 1: Ores (Bottom)
            for (const ore of ores) {
                // 采集范围圈 (半透明)
                ctx.beginPath();
                ctx.arc(ore.x, ore.y, ore.miningRange, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.closePath();

                // 矿石本体 (正方形)
                ctx.fillStyle = ore.color;
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
            // 绘制击杀数
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`击杀: ${killCount} / ${MONSTERS_PER_LEVEL} (关卡 ${currentLevel})`, 20, 20);

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