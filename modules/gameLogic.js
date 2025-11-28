import { state } from './state.js';
import { 
    showGameOverScreen, showLevelClearedOverlay,
    hideLevelSelectionScreen, showPauseBtn, hideLevelClearedOverlay,
    updateSpiritStonesDisplay, showNotification
} from './ui.js';
import { persistSessionItems } from './inventory.js';
import { spawnOres } from './ore.js';
import { levelConfig } from '../config/spawnConfig.js';
import { itemConfig } from '../config/itemConfig.js';
import { getPlayerStats } from './playerStats.js';
import { addExperience } from './cultivation.js';
import { formationConfig } from '../config/formationConfig.js';
import { applyQueuedBattleBuffs } from './buff.js';
import { initAffixSystem } from './affixSystem.js';
import { hideAffixSelection } from './ui/affix.js';

export function handleVictory() {
    state.hasWon = true;
    state.gameState = 'VICTORY';
    hideAffixSelection();
    if (state.currentLevel === state.maxUnlockedLevel) {
        state.maxUnlockedLevel++;
        localStorage.setItem('maxUnlockedLevel', state.maxUnlockedLevel);
    }
    state.totalSpiritStones += state.sessionSpiritStones;
    localStorage.setItem('totalSpiritStones', state.totalSpiritStones);
    
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
    showLevelClearedOverlay(`获得灵石: ${state.sessionSpiritStones} | 获得气血: ${winExp}${itemRewardStr}`);
}

export function handleGameOver() {
    state.gameState = 'GAMEOVER';
    hideAffixSelection();
    showGameOverScreen(state.sessionSpiritStones);
}

export function initGame() {
    const levelInfo = levelConfig[state.currentLevel] || levelConfig[1];

    // Check Formation Cost
    const activeFormationIds = Object.keys(state.activeFormations).filter(id => state.activeFormations[id]);
    let battleCost = 0;

    for (const id of activeFormationIds) {
        const config = formationConfig[id];
        if (config && config.costPerBattle) {
            battleCost += config.costPerBattle;
        }
    }

    if (battleCost > 0) {
        if (state.totalSpiritStones >= battleCost) {
            state.totalSpiritStones -= battleCost;
            localStorage.setItem('totalSpiritStones', state.totalSpiritStones);
            updateSpiritStonesDisplay();
            showNotification(`战斗阵法生效，消耗 ${battleCost} 灵石`);
        } else {
            // Deactivate combat formations
            activeFormationIds.forEach(id => {
                const config = formationConfig[id];
                if (config && config.costPerBattle) {
                    state.activeFormations[id] = false;
                }
            });
            showNotification(`灵石不足，战斗阵法已失效`);
        }
    }

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
    state.sessionSpiritStones = 0;
    state.sessionInventory = {};
    state.hasWon = false;
    state.activeBuffs = [];
    applyQueuedBattleBuffs();
    initAffixSystem();
    
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
