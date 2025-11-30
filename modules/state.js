import { playerConfig } from '../config/playerConfig.js';

export const state = {
    canvas: null,
    ctx: null,
    gameState: 'LOBBY', // LOBBY, PLAYING, GAMEOVER, VICTORY, UPGRADE, WEAPON, INVENTORY, PAUSED, LEVEL_SELECTION
    
    // Player
    player: {
        x: 0,
        y: 0,
        radius: playerConfig.radius,
        speed: playerConfig.speed,
        color: playerConfig.color,
        hp: 100,
        maxHp: 100,
        shield: 0, // 护盾值
        maxShield: 0, // 最大护盾值 (用于UI显示比例)
        defense: 0,
        mana: 100, // 法力值
        maxMana: 100, // 最大法力值
        lastHitTime: 0
    },
    
    // Entities
    bullets: [],
    monsters: [],
    ores: [],
    floatingTexts: [],
    attackVisuals: [],
    
    // Game Progress
    currentLevel: 1,
    maxUnlockedLevel: 1,
    killCount: 0,
    monstersSpawned: 0,
    hasWon: false,
    
    // Economy & Stats
    totalSpiritStones: 0,
    hasUnlockedSpiritStones: false,
    totalReiki: 0,
    // spiritualPower: 0, // Removed: Now a stat, mana is the resource
    totalExp: 0,
    cultivationStage: 0,
    bodyStrengtheningLevel: 0, // 气血锻体等级 (新增)
    sessionSpiritStones: 0,
    sessionInventory: {},
    
    // Inventory
    inventory: {},
    ownedWeapons: [4],
    equippedWeaponId: 4,
    activeFormations: {}, // { formationId: boolean }
    learnedSpells: [], // 已学习的法术ID列表
    equippedSpells: [], // 已装备的法术ID列表 (最大3个)
    spellCooldowns: {}, // { spellId: remainingTimeMs }
    activeBuffs: [], // { id, duration, maxDuration }
    maxCombatFormations: 2, // 战斗阵法上阵上限
    activeAffixes: [], // 战斗词缀
    pendingAffixChoices: [],
    soulCount: 0,
    soulCapacity: 20,
    soulReady: false,
    runAffixPool: [], // 本局可选词缀池
    pendingBattleBuffs: {}, // { buffId: duration }
    
    // Input
    keys: {},
    mouse: { x: 0, y: 0 },
    
    // Timers
    lastShotTime: 0,
    lastSpawnTime: 0,
    monsterIdCounter: 0,
    lastSaveTime: 0, // 上次保存时间 (用于离线收益)
    
    // Burst Fire
    burstShotsRemaining: 0,
    lastBurstTime: 0,
    burstTargetId: null,

    // World & Camera
    worldWidth: 1920,
    worldHeight: 1080,
    camera: { x: 0, y: 0 }
};

export function initState() {
    // Migration: Check for old 'totalGold' key
    const oldGold = localStorage.getItem('totalGold');
    if (oldGold !== null) {
        localStorage.setItem('totalSpiritStones', oldGold);
        localStorage.removeItem('totalGold');
    }

    state.totalSpiritStones = parseInt(localStorage.getItem('totalSpiritStones')) || 0;
    state.hasUnlockedSpiritStones = (localStorage.getItem('hasUnlockedSpiritStones') === 'true') || (state.totalSpiritStones > 0);
    state.totalReiki = parseInt(localStorage.getItem('totalReiki')) || playerConfig.initialReiki || 0;
    state.spiritualPower = parseFloat(localStorage.getItem('spiritualPower')) || 0;
    state.totalExp = parseInt(localStorage.getItem('totalExp')) || 0;
    state.cultivationStage = parseInt(localStorage.getItem('cultivationStage')) || 0;
    state.bodyStrengtheningLevel = parseInt(localStorage.getItem('bodyStrengtheningLevel')) || 0;
    state.equippedWeaponId = parseInt(localStorage.getItem('equippedWeaponId')) || 4;
    state.inventory = JSON.parse(localStorage.getItem('inventory')) || {};
    state.ownedWeapons = JSON.parse(localStorage.getItem('ownedWeapons')) || [4];
    state.learnedSpells = JSON.parse(localStorage.getItem('learnedSpells')) || [];
    state.equippedSpells = JSON.parse(localStorage.getItem('equippedSpells')) || [];
    state.activeFormations = JSON.parse(localStorage.getItem('activeFormations')) || {};
    const storedMaxCombat = parseInt(localStorage.getItem('maxCombatFormations'));
    state.maxCombatFormations = Number.isFinite(storedMaxCombat) ? storedMaxCombat : 2;
    if (!Number.isFinite(storedMaxCombat)) {
        localStorage.setItem('maxCombatFormations', state.maxCombatFormations);
    }
    state.maxUnlockedLevel = parseInt(localStorage.getItem('maxUnlockedLevel')) || 1;
    state.lastSaveTime = parseInt(localStorage.getItem('lastSaveTime')) || Date.now();
    state.pendingBattleBuffs = {};
    state.activeAffixes = [];
    state.pendingAffixChoices = [];
    state.soulCount = 0;
    state.soulCapacity = 20;
    state.soulReady = false;
    state.runAffixPool = [];
}
