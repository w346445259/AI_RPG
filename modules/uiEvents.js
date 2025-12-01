import { state } from './state.js';
import { 
    updateSpiritStonesDisplay, updatePlayerStatsDisplay, updateForgingUI, updateInventoryUI, 
    updateLevelSelectionUI, updateCultivationUI, updateSmeltingUI, updateFormationUI, showNotification,
    setupStatInteractions, updateBuffUI, updateSpellUI, updateSpellBar
} from './ui.js';
import { 
    addExperience, attemptBodyRefiningBreakthrough, updateMeditation
} from './cultivation.js';
import { cultivateTechnique } from './technique.js';
import { updateTechniqueUI } from './ui/technique.js';
import { initGame } from './gameLogic.js';
import { addItem } from './inventory.js';
import { getPlayerStats } from './playerStats.js';
import { itemConfig } from '../config/itemConfig.js';
import { realmBaseConfig } from '../config/cultivationConfig.js';
import { attemptSoulAwakening } from './affixSystem.js';
import { clearAllBuffs } from './buff.js';

export function setupUIEvents() {
    // UI Elements
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
    const smeltingScreen = document.getElementById('smelting-screen');
    const smeltingBtn = document.getElementById('smelting-btn');
    const btnBackLobbySmelting = document.getElementById('btn-back-lobby-smelting');
    const techniqueScreen = document.getElementById('technique-screen');
    const techniqueBtn = document.getElementById('technique-btn');
    const btnBackLobbyTechnique = document.getElementById('btn-back-lobby-technique');
    const formationScreen = document.getElementById('formation-screen');
    const formationBtn = document.getElementById('formation-btn');
    const btnBackLobbyFormation = document.getElementById('btn-back-lobby-formation');
    const inventoryScreen = document.getElementById('inventory-screen');
    const inventoryBtn = document.getElementById('inventory-btn');
    const btnInventoryBackLobby = document.getElementById('btn-inventory-back-lobby');
    const spellScreen = document.getElementById('spell-screen');
    const spellBtn = document.getElementById('spell-btn');
    const btnBackLobbySpell = document.getElementById('btn-back-lobby-spell');
    const debugScreen = document.getElementById('debug-screen');
    const debugBtn = document.getElementById('debug-btn');
    const btnCloseDebug = document.getElementById('btn-close-debug');

    // Test UI
    const testExpInput = document.getElementById('test-exp-input');
    const testAddExpBtn = document.getElementById('test-add-exp-btn');
    const testReikiInput = document.getElementById('test-reiki-input');
    const testAddReikiBtn = document.getElementById('test-add-reiki-btn');
    const testSpiritStonesInput = document.getElementById('test-gold-input');
    const testAddSpiritStonesBtn = document.getElementById('test-add-gold-btn');
    const debugItemSelect = document.getElementById('debug-item-select');
    const debugItemCount = document.getElementById('debug-item-count');
    const debugAddItemBtn = document.getElementById('debug-add-item-btn');
    const debugUnlockLevelsBtn = document.getElementById('debug-unlock-levels-btn');
    const debugStageSelect = document.getElementById('debug-stage-select');
    const debugSetStageBtn = document.getElementById('debug-set-stage-btn');

    // Event Listeners
    if (debugSetStageBtn) {
        debugSetStageBtn.addEventListener('click', () => {
            const stage = parseInt(debugStageSelect.value);
            if (!isNaN(stage)) {
                state.cultivationStage = stage;
                localStorage.setItem('cultivationStage', state.cultivationStage);
                updateCultivationUI();
                updatePlayerStatsDisplay();
                showNotification(`境界已设置为: ${debugStageSelect.options[debugStageSelect.selectedIndex].text}`);
            }
        });
    }

    if (testAddExpBtn) {
        testAddExpBtn.addEventListener('click', () => {
            const amount = parseInt(testExpInput.value);
            if (!isNaN(amount) && amount > 0) {
                addExperience(amount);
                showNotification(`测试: 增加了 ${amount} 气血`);
                testExpInput.value = '';
            } else {
                showNotification('请输入有效的气血数值');
            }
        });
    }

    if (testAddReikiBtn) {
        testAddReikiBtn.addEventListener('click', () => {
            const amount = parseInt(testReikiInput.value);
            if (!isNaN(amount) && amount > 0) {
                state.totalReiki += amount;
                localStorage.setItem('totalReiki', state.totalReiki);
                updateCultivationUI();
                showNotification(`测试: 增加了 ${amount} 灵气`);
                testReikiInput.value = '';
            } else {
                showNotification('请输入有效的灵气数值');
            }
        });
    }

    if (testAddSpiritStonesBtn) {
        testAddSpiritStonesBtn.addEventListener('click', () => {
            const amount = parseInt(testSpiritStonesInput.value);
            if (!isNaN(amount) && amount > 0) {
                state.totalSpiritStones += amount;
                localStorage.setItem('totalSpiritStones', state.totalSpiritStones);
                updateSpiritStonesDisplay();
                showNotification(`测试: 增加了 ${amount} 灵石`);
                testSpiritStonesInput.value = '';
            } else {
                showNotification('请输入有效的灵石数值');
            }
        });
    }

    if (debugUnlockLevelsBtn) {
        debugUnlockLevelsBtn.addEventListener('click', () => {
            state.maxUnlockedLevel = 60;
            localStorage.setItem('maxUnlockedLevel', state.maxUnlockedLevel);
            showNotification('已解锁所有关卡 (60关)');
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
        window.openCultivationScreen();
    });

    forgingBtn.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        forgingScreen.classList.remove('hidden');
        updateForgingUI();
    });

    smeltingBtn.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        smeltingScreen.classList.remove('hidden');
        updateSmeltingUI();
    });

    const openFormationScreen = (defaultTab = null) => {
        startScreen.classList.add('hidden');
        formationScreen.classList.remove('hidden');
        if (defaultTab && typeof window.switchFormationTab === 'function') {
            window.switchFormationTab(defaultTab);
        } else {
            updateFormationUI();
        }
    };

    if (formationBtn) {
        formationBtn.addEventListener('click', () => openFormationScreen());
    }

    window.openFormationScreen = openFormationScreen;
    window.openCombatFormationScreen = () => openFormationScreen('combat');

    if (techniqueBtn) {
        techniqueBtn.addEventListener('click', () => {
            state.gameState = 'TECHNIQUE';
            startScreen.classList.add('hidden');
            techniqueScreen.classList.remove('hidden');
            // 初始化页签为黄阶
            if (typeof window.switchTechniqueTab === 'function') {
                window.switchTechniqueTab('黄阶');
            } else {
                updateTechniqueUI();
            }
            updateTechniqueReikiDisplay();
        });
    }

    // Helper function to update reiki display in technique screen
    function updateTechniqueReikiDisplay() {
        const techniqueReikiDisplay = document.getElementById('technique-reiki-display');
        if (techniqueReikiDisplay) {
            techniqueReikiDisplay.textContent = Math.floor(state.totalReiki);
        }
    }

    // Export for use in technique.js
    window.updateTechniqueReikiDisplay = updateTechniqueReikiDisplay;

    // Global screen switch helper used by cultivation/technique buttons
    window.switchScreen = (target) => {
        if (target === 'technique') {
            // 先隐藏所有主界面，避免界面叠加
            if (startScreen) startScreen.classList.add('hidden');
            if (levelSelectionScreen) levelSelectionScreen.classList.add('hidden');
            if (upgradeScreen) upgradeScreen.classList.add('hidden');
            if (forgingScreen) forgingScreen.classList.add('hidden');
            if (smeltingScreen) smeltingScreen.classList.add('hidden');
            if (formationScreen) formationScreen.classList.add('hidden');
            if (inventoryScreen) inventoryScreen.classList.add('hidden');
            if (spellScreen) spellScreen.classList.add('hidden');
            if (gameOverScreen) gameOverScreen.classList.add('hidden');

            state.gameState = 'TECHNIQUE';
            if (techniqueScreen) techniqueScreen.classList.remove('hidden');
            // 初始化功法界面，默认黄阶
            if (typeof window.switchTechniqueTab === 'function') {
                window.switchTechniqueTab('黄阶');
            } else {
                updateTechniqueUI();
            }
            updateTechniqueReikiDisplay();
        }
    };

    if (btnBackLobbyTechnique) {
        btnBackLobbyTechnique.addEventListener('click', () => {
            techniqueScreen.classList.add('hidden');
            startScreen.classList.remove('hidden');
        });
    }

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
                // Explicitly remove all known keys to ensure clean reset
                const keysToRemove = [
                    'totalGold',
                    'totalSpiritStones',
                    'hasUnlockedSpiritStones', 
                    'totalReiki', 
                    'totalExp', 
                    'cultivationStage', 
                    'bodyStrengtheningLevel', 
                    'equippedWeaponId', 
                    'inventory', 
                    'ownedWeapons',
                    'learnedSpells', 
                    'equippedSpells', 
                    'activeFormations',
                    'maxCombatFormations', 
                    'maxUnlockedLevel', 
                    'lastSaveTime',
                    'techniqueStates',
                    'successfulTechniqueId',
                    'attackElements'
                ];                
                keysToRemove.forEach(key => localStorage.removeItem(key));
                localStorage.clear(); // Clear anything else
                
                // Force reload
                setTimeout(() => {
                    location.reload();
                }, 50);
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
        // Clear all buffs and reset spell cooldowns when returning to lobby
        clearAllBuffs();
        state.spellCooldowns = {};
        updatePlayerStatsDisplay();
        updateSpellUI();
    });

    btnBackLobbyForging.addEventListener('click', () => {
        forgingScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    });

    btnBackLobbySmelting.addEventListener('click', () => {
        smeltingScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    });

    btnBackLobbyFormation.addEventListener('click', () => {
        formationScreen.classList.add('hidden');
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
        // Clear all buffs and reset spell cooldowns when returning to lobby
        clearAllBuffs();
        state.spellCooldowns = {};
        updateSpiritStonesDisplay();
        updatePlayerStatsDisplay();
        updateBuffUI();
        updateSpellUI();
        updateSpellBar();
        const stats = getPlayerStats();
        state.player.x = state.canvas.width * 0.7;
        state.player.y = state.canvas.height * 0.6;
        state.player.hp = stats.maxHp;
        state.player.maxHp = stats.maxHp;
    });

    overlayNextLevelBtn.addEventListener('click', () => {
        state.currentLevel++;
        // 在进入下一关前清理所有 buff 和属性攻击，使每一局战斗互相独立
        clearAllBuffs();
        // Reset state for next level
        state.monsters = [];
        state.bullets = [];
        state.ores = [];
        state.floatingTexts = [];
        state.killCount = 0;
        state.monstersSpawned = 0;
        state.hasWon = false;
        state.sessionSpiritStones = 0; 
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
        // Clear all buffs and reset spell cooldowns when returning to lobby
        clearAllBuffs();
        state.spellCooldowns = {};
        updateSpiritStonesDisplay();
        updatePlayerStatsDisplay();
        updateBuffUI();
        updateSpellUI();
        updateSpellBar();
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
        const sessionSpiritStonesAmount = state.sessionSpiritStones;
        
        if (sessionItemIds.length === 0 && sessionSpiritStonesAmount === 0) {
            sessionItemsList.innerHTML = '<p style="color: #888; text-align: center;">本局暂无获得任何道具或灵石</p>';
        } else {
            let itemsHTML = '<div style="color: #fff;">';
            if (sessionSpiritStonesAmount > 0) {
                itemsHTML += `<div style="margin: 5px 0; padding: 5px; background: #444; border-radius: 3px;">`;
                itemsHTML += `<span style="color: #87CEEB;">💎 灵石</span>: <span style="color: #87CEEB;">${sessionSpiritStonesAmount}</span>`;
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
        state.sessionSpiritStones = 0;
        state.sessionInventory = {};
        // Clear all buffs and reset spell cooldowns when returning to lobby
        clearAllBuffs();
        state.spellCooldowns = {};
        updateSpiritStonesDisplay();
        updatePlayerStatsDisplay();
        updateBuffUI();
        updateSpellBar();
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
        if (e.key.toLowerCase() === 'f') {
            attemptSoulAwakening();
        }
        state.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
        state.keys[e.key.toLowerCase()] = false;
    });

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
        // Skip level selection tabs as they are handled by switchLevelTab
        if (btn.parentElement.classList.contains('level-tabs')) return;

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

            // Special handling for forging tabs to refresh the list
            if (container.classList.contains('forging-tabs')) {
                updateForgingUI();
            }
        });
    });

    if (spellBtn) {
        spellBtn.addEventListener('click', () => {
            state.gameState = 'SPELL';
            startScreen.classList.add('hidden');
            spellScreen.classList.remove('hidden');
            updateSpellUI();
            updateSpellBar();
        });
    }

    if (btnBackLobbySpell) {
        btnBackLobbySpell.addEventListener('click', () => {
            state.gameState = 'LOBBY';
            spellScreen.classList.add('hidden');
            startScreen.classList.remove('hidden');
            updateSpellBar();
        });
    }

    setupStatInteractions();
    updateSpellUI();
}
