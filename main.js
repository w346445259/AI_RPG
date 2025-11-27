import { state, initState } from './modules/state.js';
import { draw } from './modules/renderer.js';
import { 
    updateSpiritStonesDisplay, updatePlayerStatsDisplay, updateSmeltingUI, updateCultivationUI,
    switchLevelTab, getPlayerStats, updateBuffUI
} from './modules/ui.js';
import { 
    initGame, selectLevel
} from './modules/gameLogic.js';
import { forgeWeapon, equipWeapon, smeltItem } from './modules/inventory.js';
import { updatePlayerMovement, updateShooting } from './modules/player.js';
import { updateSpawning, updateMonsters } from './modules/monster.js';
import { updateBullets } from './modules/bullet.js';
import { updateOres } from './modules/ore.js';
import { updateCamera } from './modules/camera.js';
import { 
    calculateOfflineProgress, updateMeditation, strengthenBody, 
    attemptBodyRefiningBreakthrough, attemptQiBreakthrough 
} from './modules/cultivation.js';
import { setupUIEvents } from './modules/uiEvents.js';
import { updateBuffs, applyBuff } from './modules/buff.js';
import { updateFormations } from './modules/formationLogic.js';

// Initialize State
state.canvas = document.getElementById('gameCanvas');
state.ctx = state.canvas.getContext('2d');
state.canvas.width = 1920;
state.canvas.height = 1080;
state.worldWidth = 1920 * 2;
state.worldHeight = 1080 * 2;
initState();

// Calculate Offline Progress immediately after init
calculateOfflineProgress();

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
window.switchLevelTab = switchLevelTab;
window.strengthenBody = strengthenBody;
window.attemptBodyRefiningBreakthrough = attemptBodyRefiningBreakthrough;
window.attemptQiBreakthrough = attemptQiBreakthrough;
window.applyBuff = applyBuff;
window.smeltItem = (type) => {
    if (smeltItem(type)) {
        updateSmeltingUI();
    }
};

window.openCultivationScreen = () => {
    state.gameState = 'UPGRADE';
    const startScreen = document.getElementById('start-screen');
    const upgradeScreen = document.getElementById('upgrade-screen');
    if (startScreen) startScreen.classList.add('hidden');
    if (upgradeScreen) upgradeScreen.classList.remove('hidden');
    
    updateCultivationUI();
    
    let targetTab = 'mortal';
    if (state.cultivationStage >= 1 && state.cultivationStage <= 9) targetTab = 'body-refining';
    else if (state.cultivationStage >= 10) targetTab = 'qi-refining';
    
    const targetBtn = document.querySelector(`.tab-btn[data-tab="${targetTab}"]`);
    if (targetBtn) targetBtn.click();
};

// Setup UI Events
setupUIEvents();

// Initial UI Update
updateSpiritStonesDisplay();
updatePlayerStatsDisplay();

// Game Loop
let lastTime = 0;
let meditationTimer = 0;

function loop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    
    // Prevent huge dt jumps (e.g. tab switching)
    if (dt < 0.1) {
        update(timestamp, dt);

        // 打坐/挂机逻辑 (全天候运行，只要满足条件)
        updateMeditation(dt * 1000);

        // 每秒更新一次UI (如果在非战斗界面) 和保存
        meditationTimer += dt;
        if (meditationTimer >= 1.0) {
            meditationTimer = 0;
            if (state.cultivationStage >= 10) {
                // 只有在相关界面才需要频繁更新UI
                if (state.gameState === 'UPGRADE') {
                    updateCultivationUI();
                }
                // 如果在大厅，更新打坐面板
                if (state.gameState === 'LOBBY') {
                    updateCultivationUI(); // 这里包含了 updateMeditationUI
                }
                // 定期保存灵力
                localStorage.setItem('spiritualPower', state.spiritualPower);
                // 更新最后保存时间 (用于离线计算)
                state.lastSaveTime = Date.now();
                localStorage.setItem('lastSaveTime', state.lastSaveTime);
            }
        }
    }
    
    draw(timestamp);
    requestAnimationFrame(loop);
}

function update(timestamp, dt) {
    if (state.gameState !== 'PLAYING') return;

    // HP Regen
    const stats = getPlayerStats();
    if (state.player.hp < stats.maxHp && state.player.hp > 0) {
        state.player.hp += stats.hpRegen * dt;
        if (state.player.hp > stats.maxHp) state.player.hp = stats.maxHp;
    }

    updatePlayerMovement(dt);
    updateCamera();
    updateSpawning(timestamp);
    updateShooting(timestamp);
    updateBullets(dt);
    updateMonsters(timestamp, dt);
    updateOres(timestamp, dt);
    updateBuffs(dt);
    updateBuffUI();
    updateFormations(dt);
    
    // Floating texts update
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.life -= dt; // Use dt for life
        ft.y -= 60 * dt; // Speed 60 px/s (加快上浮速度)
        if (ft.life <= 0) state.floatingTexts.splice(i, 1);
    }
}

requestAnimationFrame(loop);
