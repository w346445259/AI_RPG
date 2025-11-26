import { state, initState } from './modules/state.js';
import { draw } from './modules/renderer.js';
import { 
    updateGoldDisplay, updatePlayerStatsDisplay, updateForgingUI, updateInventoryUI, 
    updateLevelSelectionUI, updateCultivationUI, showNotification,
    getExpThresholds, getStageName, getPlayerStats
} from './modules/ui.js';
import { 
    addExperience, initGame, selectLevel, handleGameOver 
} from './modules/gameLogic.js';
import { forgeWeapon, equipWeapon, addItem } from './modules/inventory.js';
import { updatePlayerMovement, updateShooting } from './modules/player.js';
import { updateSpawning, updateMonsters } from './modules/monster.js';
import { updateBullets } from './modules/bullet.js';
import { updateOres } from './modules/ore.js';
import { itemConfig } from './config/itemConfig.js';
import { realmBaseConfig } from './config/cultivationConfig.js';
import { cameraConfig } from './config/cameraConfig.js';

// Initialize State
state.canvas = document.getElementById('gameCanvas');
state.ctx = state.canvas.getContext('2d');
state.canvas.width = 1920;
state.canvas.height = 1080;
state.worldWidth = 1920 * 2;
state.worldHeight = 1080 * 2;
initState();

// Resize Logic
function resizeGame() {
    const container = document.getElementById('game-container');
    const scaleX = window.innerWidth / 1920;
    const scaleY = window.innerHeight / 1080;
    const scale = Math.min(scaleX, scaleY);
    container.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', resizeGame);
resizeGame(); // Initial call

// Attach Globals
window.forgeWeapon = forgeWeapon;
window.equipWeapon = equipWeapon;
window.selectLevel = selectLevel;

// UI Elements (Querying here to bind events)
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const levelSelectionScreen = document.getElementById('level-selection-screen');
const btnBackLobbyLevels = document.getElementById('btn-back-lobby-levels');
const restartBtn = document.getElementById('restart-btn');
const lobbyBtn = document.getElementById('lobby-btn');
const levelClearedOverlay = document.getElementById('level-cleared-overlay');
const overlayLobbyBtn = document.getElementById('overlay-lobby-btn');
const overlayNextLevelBtn = document.getElementById('overlay-next-level-btn');
const pauseBtn = document.getElementById('pause-btn');
const pauseScreen = document.getElementById('pause-screen');
const resumeBtn = document.getElementById('resume-btn');
const quitLobbyBtn = document.getElementById('quit-lobby-btn');
const confirmQuitModal = document.getElementById('confirm-quit-modal');
const confirmQuitYes = document.getElementById('confirm-quit-yes');
const confirmQuitNo = document.getElementById('confirm-quit-no');
const sessionItemsList = document.getElementById('session-items-list');
const upgradeScreen = document.getElementById('upgrade-screen');
const upgradeBtn = document.getElementById('upgrade-btn');
const clearDataBtn = document.getElementById('clear-data-btn');
const btnBackLobby = document.getElementById('btn-back-lobby');
const btnBreakthroughMortal = document.getElementById('btn-breakthrough-mortal');
const forgingScreen = document.getElementById('forging-screen');
const forgingBtn = document.getElementById('forging-btn');
const btnBackLobbyForging = document.getElementById('btn-back-lobby-forging');
const inventoryScreen = document.getElementById('inventory-screen');
const inventoryBtn = document.getElementById('inventory-btn');
const btnInventoryBackLobby = document.getElementById('btn-inventory-back-lobby');
const debugScreen = document.getElementById('debug-screen');
const debugBtn = document.getElementById('debug-btn');
const btnCloseDebug = document.getElementById('btn-close-debug');

// Test UI
const testExpInput = document.getElementById('test-exp-input');
const testAddExpBtn = document.getElementById('test-add-exp-btn');
const debugItemSelect = document.getElementById('debug-item-select');
const debugItemCount = document.getElementById('debug-item-count');
const debugAddItemBtn = document.getElementById('debug-add-item-btn');
const debugUnlockLevelsBtn = document.getElementById('debug-unlock-levels-btn');

// Game Loop
let lastTime = 0;
function loop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    
    // Prevent huge dt jumps (e.g. tab switching)
    if (dt < 0.1) {
        update(timestamp, dt);
    }
    
    draw(timestamp);
    requestAnimationFrame(loop);
}

function update(timestamp, dt) {
    if (state.gameState !== 'PLAYING') return;

    updatePlayerMovement(dt);
    updateCamera();
    updateSpawning(timestamp);
    updateShooting(timestamp);
    updateBullets(dt);
    updateMonsters(timestamp, dt);
    updateOres(timestamp, dt);
    
    // Floating texts update
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.life -= dt; // Use dt for life
        ft.y -= 30 * dt; // Speed 30 px/s
        if (ft.life <= 0) state.floatingTexts.splice(i, 1);
    }
}

function updateCamera() {
    // Deadzone logic: use config
    const safeW = state.canvas.width * cameraConfig.deadzoneRatio;
    const safeH = state.canvas.height * cameraConfig.deadzoneRatio;
    const marginX = (state.canvas.width - safeW) / 2;
    const marginY = (state.canvas.height - safeH) / 2;

    // Calculate camera target based on player position relative to current camera
    // If player is to the left of the safe zone
    if (state.player.x < state.camera.x + marginX) {
        state.camera.x = state.player.x - marginX;
    }
    // If player is to the right of the safe zone
    else if (state.player.x > state.camera.x + state.canvas.width - marginX) {
        state.camera.x = state.player.x - (state.canvas.width - marginX);
    }

    // If player is above the safe zone
    if (state.player.y < state.camera.y + marginY) {
        state.camera.y = state.player.y - marginY;
    }
    // If player is below the safe zone
    else if (state.player.y > state.camera.y + state.canvas.height - marginY) {
        state.camera.y = state.player.y - (state.canvas.height - marginY);
    }

    // Clamp camera to world bounds
    state.camera.x = Math.max(0, Math.min(state.camera.x, state.worldWidth - state.canvas.width));
    state.camera.y = Math.max(0, Math.min(state.camera.y, state.worldHeight - state.canvas.height));
}

// Event Listeners
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
        state.maxUnlockedLevel = 30;
        localStorage.setItem('maxUnlockedLevel', state.maxUnlockedLevel);
        showNotification('已解锁所有关卡 (30关)');
    });
}

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
            updateInventoryUI();
            showNotification(`测试: 添加了 ${count} 个 ${itemConfig[itemId].name}`);
        } else {
            showNotification('请输入有效的数量');
        }
    });
}

startBtn.addEventListener('click', () => {
    state.gameState = 'LEVEL_SELECTION';
    startScreen.classList.add('hidden');
    levelSelectionScreen.classList.remove('hidden');
    updateLevelSelectionUI();
});

btnBackLobbyLevels.addEventListener('click', () => {
    state.gameState = 'LOBBY';
    levelSelectionScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

upgradeBtn.addEventListener('click', () => {
    state.gameState = 'UPGRADE';
    startScreen.classList.add('hidden');
    upgradeScreen.classList.remove('hidden');
    updateCultivationUI();
    let targetTab = 'mortal';
    if (state.cultivationStage >= 1 && state.cultivationStage <= 9) targetTab = 'body-refining';
    else if (state.cultivationStage >= 10) targetTab = 'foundation';
    const targetBtn = document.querySelector(`.tab-btn[data-tab="${targetTab}"]`);
    if (targetBtn) targetBtn.click();
});

forgingBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    forgingScreen.classList.remove('hidden');
    updateForgingUI();
});

inventoryBtn.addEventListener('click', () => {
    state.gameState = 'INVENTORY';
    startScreen.classList.add('hidden');
    inventoryScreen.classList.remove('hidden');
    updateInventoryUI(); 
    const firstTab = inventoryScreen.querySelector('.tab-btn');
    if (firstTab) firstTab.click();
});

debugBtn.addEventListener('click', () => {
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
    state.gameState = 'LOBBY';
    upgradeScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    const stats = getPlayerStats();
    state.player.maxHp = stats.maxHp;
    state.player.hp = stats.maxHp;
    updatePlayerStatsDisplay();
});

btnBackLobbyForging.addEventListener('click', () => {
    forgingScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

btnInventoryBackLobby.addEventListener('click', () => {
    state.gameState = 'LOBBY';
    inventoryScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    updatePlayerStatsDisplay();
});

btnCloseDebug.addEventListener('click', () => {
    debugScreen.classList.add('hidden');
});

restartBtn.addEventListener('click', () => {
    state.currentLevel = 1;
    initGame();
    state.gameState = 'PLAYING';
    gameOverScreen.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    levelClearedOverlay.classList.add('hidden');
});

lobbyBtn.addEventListener('click', () => {
    state.gameState = 'LOBBY';
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    levelClearedOverlay.classList.add('hidden');
    updateGoldDisplay();
    updatePlayerStatsDisplay();
    const stats = getPlayerStats();
    state.player.x = state.canvas.width * 0.7;
    state.player.y = state.canvas.height * 0.6;
    state.player.hp = stats.maxHp;
    state.player.maxHp = stats.maxHp;
});

overlayNextLevelBtn.addEventListener('click', () => {
    state.currentLevel++;
    // Reset state for next level
    state.monsters = [];
    state.bullets = [];
    state.ores = [];
    state.floatingTexts = [];
    state.killCount = 0;
    state.monstersSpawned = 0;
    state.hasWon = false;
    state.sessionGold = 0; 
    state.sessionInventory = {};
    
    initGame();
    state.gameState = 'PLAYING';
    
    levelClearedOverlay.classList.add('hidden');
    showNotification(`进入第 ${state.currentLevel} 关`);
});

overlayLobbyBtn.addEventListener('click', () => {
    state.gameState = 'LOBBY';
    levelClearedOverlay.classList.add('hidden');
    startScreen.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    updateGoldDisplay();
    updatePlayerStatsDisplay();
    const stats = getPlayerStats();
    state.player.x = state.canvas.width * 0.7;
    state.player.y = state.canvas.height * 0.6;
    state.player.hp = stats.maxHp;
    state.player.maxHp = stats.maxHp;
});

function togglePause() {
    if (state.gameState === 'PLAYING') {
        state.gameState = 'PAUSED';
        pauseScreen.classList.remove('hidden');
    } else if (state.gameState === 'PAUSED') {
        state.gameState = 'PLAYING';
        pauseScreen.classList.add('hidden');
        confirmQuitModal.classList.add('hidden');
    }
}

pauseBtn.addEventListener('click', togglePause);

resumeBtn.addEventListener('click', () => {
    state.gameState = 'PLAYING';
    pauseScreen.classList.add('hidden');
});

quitLobbyBtn.addEventListener('click', () => {
    sessionItemsList.innerHTML = '';
    const sessionItemIds = Object.keys(state.sessionInventory);
    const sessionGoldAmount = state.sessionGold;
    
    if (sessionItemIds.length === 0 && sessionGoldAmount === 0) {
        sessionItemsList.innerHTML = '<p style="color: #888; text-align: center;">本局暂无获得任何道具或金币</p>';
    } else {
        let itemsHTML = '<div style="color: #fff;">';
        if (sessionGoldAmount > 0) {
            itemsHTML += `<div style="margin: 5px 0; padding: 5px; background: #444; border-radius: 3px;">`;
            itemsHTML += `<span style="color: #ffd700;">💰 金币</span>: <span style="color: #ffd700;">${sessionGoldAmount}</span>`;
            itemsHTML += `</div>`;
        }
        sessionItemIds.forEach(itemId => {
            const item = itemConfig[itemId];
            const count = state.sessionInventory[itemId];
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
    state.gameState = 'LOBBY';
    pauseScreen.classList.add('hidden');
    confirmQuitModal.classList.add('hidden');
    startScreen.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    state.sessionGold = 0;
    state.sessionInventory = {};
    updateGoldDisplay();
    updatePlayerStatsDisplay();
    const stats = getPlayerStats();
    state.player.x = state.canvas.width * 0.7;
    state.player.y = state.canvas.height * 0.6;
    state.player.hp = stats.maxHp;
    state.player.maxHp = stats.maxHp;
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (state.gameState === 'PLAYING' || state.gameState === 'PAUSED') {
            togglePause();
        }
    }
    state.keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
    state.keys[e.key.toLowerCase()] = false;
});

// Removed old resize listener that changed canvas dimensions
// window.addEventListener('resize', () => { ... });

btnBreakthroughMortal.addEventListener('click', () => {
    const cost = realmBaseConfig[1].cost;
    if (state.cultivationStage === 0 && state.totalExp >= cost) {
        state.totalExp -= cost;
        state.cultivationStage = 1;
        localStorage.setItem('totalExp', state.totalExp);
        localStorage.setItem('cultivationStage', state.cultivationStage);
        updateCultivationUI();
        updatePlayerStatsDisplay();
        showNotification("恭喜！您已感应天地，踏入锻体期！");
    }
});

const tabBtns = document.querySelectorAll('.tab-btn');
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const container = btn.parentElement;
        const contentContainer = container.nextElementSibling;
        const siblingBtns = container.querySelectorAll('.tab-btn');
        siblingBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const siblingContents = contentContainer.querySelectorAll('.tab-content');
        siblingContents.forEach(c => c.classList.add('hidden'));
        const tabId = btn.getAttribute('data-tab');
        const content = document.getElementById(`content-${tabId}`);
        if (content) content.classList.remove('hidden');
    });
});

// Initial UI Update
updateGoldDisplay();
updatePlayerStatsDisplay();

requestAnimationFrame(loop);
