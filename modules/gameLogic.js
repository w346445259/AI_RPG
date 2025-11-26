import { state } from './state.js';
import { 
    updateCultivationUI, updatePlayerStatsDisplay, showNotification, 
    getExpThresholds, getStageName, showGameOverScreen, showLevelClearedOverlay,
    hideLevelSelectionScreen, showPauseBtn, hideLevelClearedOverlay
} from './ui.js';
import { persistSessionItems } from './inventory.js';
import { spawnOres } from './ore.js';
import { levelConfig } from '../config/spawnConfig.js';
import { itemConfig } from '../config/itemConfig.js';
import { getPlayerStats } from './ui.js'; // Re-use getPlayerStats from UI or move it to utils/player? It's in UI now.

export function addExperience(amount) {
    state.totalExp += amount;
    const oldStage = state.cultivationStage;
    state.cultivationStage = calculateStageFromExp(state.totalExp);
    
    localStorage.setItem('totalExp', state.totalExp);
    localStorage.setItem('cultivationStage', state.cultivationStage);
    
    if (state.cultivationStage > oldStage) {
        showNotification(`境界提升！当前境界: ${getStageName(state.cultivationStage)}`);
    }
    
    updateCultivationUI();
    updatePlayerStatsDisplay();
}

export function calculateStageFromExp(exp) {
    const thresholds = getExpThresholds();
    let stage = 0;
    for (let i = 1; i <= 10; i++) {
        if (exp >= thresholds[i]) {
            stage = i;
        } else {
            break;
        }
    }
    return stage;
}

export function handleVictory() {
    state.hasWon = true;
    if (state.currentLevel === state.maxUnlockedLevel) {
        state.maxUnlockedLevel++;
        localStorage.setItem('maxUnlockedLevel', state.maxUnlockedLevel);
    }
    state.totalGold += state.sessionGold;
    localStorage.setItem('totalGold', state.totalGold);
    
    const config = levelConfig[state.currentLevel] || levelConfig[1];
    const winExp = config.winExp || 0;
    addExperience(winExp);
    
    let itemRewardStr = "";
    const sessionItemIds = Object.keys(state.sessionInventory);
    if (sessionItemIds.length > 0) {
        itemRewardStr = " | 获得道具: ";
        const items = [];
        sessionItemIds.forEach(id => {
            const count = state.sessionInventory[id];
            const item = itemConfig[id];
            items.push(`${item.name} x${count}`);
        });
        itemRewardStr += items.join(", ");
    }
    persistSessionItems();
    showLevelClearedOverlay(`获得金币: ${state.sessionGold} | 获得经验: ${winExp}${itemRewardStr}`);
}

export function handleGameOver() {
    state.gameState = 'GAMEOVER';
    showGameOverScreen(state.sessionGold);
}

export function initGame() {
    const stats = getPlayerStats();
    // Spawn player in the middle of the world
    state.player.x = state.worldWidth / 2;
    state.player.y = state.worldHeight / 2;
    
    // Center camera on player
    state.camera.x = Math.max(0, Math.min(state.player.x - state.canvas.width / 2, state.worldWidth - state.canvas.width));
    state.camera.y = Math.max(0, Math.min(state.player.y - state.canvas.height / 2, state.worldHeight - state.canvas.height));

    state.player.hp = stats.maxHp;
    state.player.maxHp = stats.maxHp;
    state.player.lastHitTime = 0;
    
    state.bullets = [];
    state.monsters = [];
    state.ores = [];
    state.floatingTexts = [];
    state.monsterIdCounter = 0;
    state.killCount = 0;
    state.monstersSpawned = 0;
    state.sessionGold = 0;
    state.sessionInventory = {};
    state.hasWon = false;
    
    spawnOres();

    state.burstShotsRemaining = 0;
    state.lastBurstTime = 0;
    state.burstTargetId = null;
    
    const now = performance.now();
    state.lastShotTime = now;
    state.lastSpawnTime = now;
}

export function selectLevel(level) {
    state.currentLevel = level;
    hideLevelSelectionScreen();
    initGame();
    state.gameState = 'PLAYING';
    showPauseBtn();
    hideLevelClearedOverlay();
}
