import { playerConfig } from './config/playerConfig.js';
import { monsterConfig } from './config/monsterConfig.js';
import { levelConfig } from './config/spawnConfig.js';
import { weaponConfig } from './config/weaponConfig.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const victoryScreen = document.getElementById('victory-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const lobbyBtn = document.getElementById('lobby-btn');
const continueBtn = document.getElementById('continue-btn');
const victoryLobbyBtn = document.getElementById('victory-lobby-btn');
const goldDisplay = document.getElementById('gold-display');
const lossGoldDisplay = document.getElementById('loss-gold-display');
const winGoldDisplay = document.getElementById('win-gold-display');

// Upgrade UI Elements
const upgradeScreen = document.getElementById('upgrade-screen');
const upgradeBtn = document.getElementById('upgrade-btn');
const btnBackLobby = document.getElementById('btn-back-lobby');
const upgradeGoldDisplay = document.getElementById('upgrade-gold-display');

// Weapon UI Elements
const weaponScreen = document.getElementById('weapon-screen');
const weaponBtn = document.getElementById('weapon-btn');
const btnWeaponBackLobby = document.getElementById('btn-weapon-back-lobby');
const weaponList = document.getElementById('weapon-list');

const atkLevelSpan = document.getElementById('atk-level');
const atkValSpan = document.getElementById('atk-val');
const atkNextSpan = document.getElementById('atk-next');
const atkCostSpan = document.getElementById('atk-cost');
const btnUpgradeAtk = document.getElementById('btn-upgrade-atk');

const hpLevelSpan = document.getElementById('hp-level');
const hpValSpan = document.getElementById('hp-val');
const hpNextSpan = document.getElementById('hp-next');
const hpCostSpan = document.getElementById('hp-cost');
const btnUpgradeHp = document.getElementById('btn-upgrade-hp');

// Pause UI Elements
const pauseBtn = document.getElementById('pause-btn');
const pauseScreen = document.getElementById('pause-screen');
const resumeBtn = document.getElementById('resume-btn');
const quitLobbyBtn = document.getElementById('quit-lobby-btn');
const confirmQuitModal = document.getElementById('confirm-quit-modal');
const confirmQuitYes = document.getElementById('confirm-quit-yes');
const confirmQuitNo = document.getElementById('confirm-quit-no');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game State
let gameState = 'LOBBY'; // LOBBY, PLAYING, GAMEOVER, VICTORY, UPGRADE, WEAPON, PAUSED

let totalGold = parseInt(localStorage.getItem('totalGold')) || 0;
let sessionGold = 0; // Gold earned in current session
let attackLevel = parseInt(localStorage.getItem('attackLevel')) || 0;
let hpLevel = parseInt(localStorage.getItem('hpLevel')) || 0;
let equippedWeaponId = parseInt(localStorage.getItem('equippedWeaponId')) || 1;

let currentLevel = 1;
let killCount = 0;
let hasWon = false;

function getPlayerStats() {
    return {
        damage: playerConfig.damage + attackLevel * 1,
        maxHp: playerConfig.maxHp + hpLevel * 2
    };
}

let player = {
    x: canvas.width * 0.7, // Position for Lobby
    y: canvas.height / 2,
    radius: playerConfig.radius,
    speed: playerConfig.speed,
    color: playerConfig.color,
    hp: getPlayerStats().maxHp,
    maxHp: getPlayerStats().maxHp,
    lastHitTime: 0
};

let bullets = [];
let monsters = [];
let floatingTexts = [];
const keys = {};

let lastShotTime = 0;
let lastSpawnTime = 0;
let monsterIdCounter = 0;

// Burst Fire State
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
    floatingTexts = [];
    monsterIdCounter = 0;
    killCount = 0;
    sessionGold = 0;
    hasWon = false;
    currentLevel = 1;
    
    // Reset burst state
    burstShotsRemaining = 0;
    lastBurstTime = 0;
    burstTargetId = null;
    
    const now = performance.now();
    lastShotTime = now;
    lastSpawnTime = now;
}

function updateGoldDisplay() {
    goldDisplay.textContent = `金币: ${totalGold}`;
    upgradeGoldDisplay.textContent = `金币: ${totalGold}`;
}

function updateUpgradeUI() {
    updateGoldDisplay();

    // Attack UI
    atkLevelSpan.textContent = attackLevel;
    const currentAtk = playerConfig.damage + attackLevel * 1;
    atkValSpan.textContent = currentAtk;
    
    if (attackLevel >= 10) {
        atkNextSpan.textContent = "已满级";
        atkCostSpan.textContent = "-";
        btnUpgradeAtk.disabled = true;
        btnUpgradeAtk.textContent = "已满级";
    } else {
        const nextAtk = currentAtk + 1;
        const cost = attackLevel + 1; // Cost = Next Level (e.g. 0->1 costs 1)
        atkNextSpan.textContent = nextAtk;
        atkCostSpan.textContent = cost;
        btnUpgradeAtk.disabled = totalGold < cost;
        btnUpgradeAtk.textContent = `升级 (消耗: ${cost})`;
    }

    // HP UI
    hpLevelSpan.textContent = hpLevel;
    const currentHp = playerConfig.maxHp + hpLevel * 2;
    hpValSpan.textContent = currentHp;

    if (hpLevel >= 10) {
        hpNextSpan.textContent = "已满级";
        hpCostSpan.textContent = "-";
        btnUpgradeHp.disabled = true;
        btnUpgradeHp.textContent = "已满级";
    } else {
        const nextHp = currentHp + 2;
        const cost = hpLevel + 1;
        hpNextSpan.textContent = nextHp;
        hpCostSpan.textContent = cost;
        btnUpgradeHp.disabled = totalGold < cost;
        btnUpgradeHp.textContent = `升级 (消耗: ${cost})`;
    }
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

// Expose equip function to window for onclick
window.equipWeapon = (id) => {
    equippedWeaponId = id;
    localStorage.setItem('equippedWeaponId', id);
    updateWeaponUI();
};

// UI Event Listeners
startBtn.addEventListener('click', () => {
    initGame();
    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
});

upgradeBtn.addEventListener('click', () => {
    gameState = 'UPGRADE';
    startScreen.classList.add('hidden');
    upgradeScreen.classList.remove('hidden');
    updateUpgradeUI();
});

weaponBtn.addEventListener('click', () => {
    gameState = 'WEAPON';
    startScreen.classList.add('hidden');
    weaponScreen.classList.remove('hidden');
    updateWeaponUI();
});

btnBackLobby.addEventListener('click', () => {
    gameState = 'LOBBY';
    upgradeScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    
    // Update player preview stats
    const stats = getPlayerStats();
    player.maxHp = stats.maxHp;
    player.hp = stats.maxHp;
});

btnWeaponBackLobby.addEventListener('click', () => {
    gameState = 'LOBBY';
    weaponScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

btnUpgradeAtk.addEventListener('click', () => {
    const cost = attackLevel + 1;
    if (attackLevel < 10 && totalGold >= cost) {
        totalGold -= cost;
        attackLevel++;
        localStorage.setItem('totalGold', totalGold);
        localStorage.setItem('attackLevel', attackLevel);
        updateUpgradeUI();
    }
});

btnUpgradeHp.addEventListener('click', () => {
    const cost = hpLevel + 1;
    if (hpLevel < 10 && totalGold >= cost) {
        totalGold -= cost;
        hpLevel++;
        localStorage.setItem('totalGold', totalGold);
        localStorage.setItem('hpLevel', hpLevel);
        updateUpgradeUI();
    }
});

// Initialize gold display on load
updateGoldDisplay();

restartBtn.addEventListener('click', () => {
    initGame();
    gameState = 'PLAYING';
    gameOverScreen.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
});

    lobbyBtn.addEventListener('click', () => {
    gameState = 'LOBBY';
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    updateGoldDisplay();
    
    // Reset player position for lobby
    const stats = getPlayerStats();
    player.x = canvas.width * 0.7;
    player.y = canvas.height / 2;
    player.hp = stats.maxHp;
    player.maxHp = stats.maxHp;
});

continueBtn.addEventListener('click', () => {
    if (currentLevel < 3) {
        currentLevel++;
        killCount = 0;
        hasWon = false;
        gameState = 'PLAYING';
        victoryScreen.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        
        // Reset player position? Maybe keep it.
        // Clear monsters?
        monsters = [];
        bullets = [];
        floatingTexts = [];
    } else {
        // Endless or just continue
        gameState = 'PLAYING';
        victoryScreen.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
    }
});

victoryLobbyBtn.addEventListener('click', () => {
    gameState = 'LOBBY';
    victoryScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    updateGoldDisplay();

    // Reset player position for lobby
    const stats = getPlayerStats();
    player.x = canvas.width * 0.7;
    player.y = canvas.height / 2;
    player.hp = stats.maxHp;
    player.maxHp = stats.maxHp;
});// Pause Logic
function togglePause() {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        pauseScreen.classList.remove('hidden');
    } else if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        pauseScreen.classList.add('hidden');
        confirmQuitModal.classList.add('hidden'); // Ensure modal is closed
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
    
    // Reset game state but DO NOT save session gold
    sessionGold = 0;
    updateGoldDisplay();
    
    // Reset player position for lobby
    const stats = getPlayerStats();
    player.x = canvas.width * 0.7;
    player.y = canvas.height / 2;
    player.hp = stats.maxHp;
    player.maxHp = stats.maxHp;
});

// Input Handling
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
        player.y = canvas.height / 2;
    }
});

// Game Logic
function update(timestamp) {
    if (gameState !== 'PLAYING') return;

    updatePlayerMovement();
    updateSpawning(timestamp);
    updateShooting(timestamp);
    updateBullets();
    updateMonsters(timestamp);
    updateFloatingTexts();
}

function updatePlayerMovement() {
    if (keys['w']) player.y -= player.speed;
    if (keys['s']) player.y += player.speed;
    if (keys['a']) player.x -= player.speed;
    if (keys['d']) player.x += player.speed;

    // Keep player in bounds
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
}

function updateSpawning(timestamp) {
    const config = levelConfig[currentLevel] || levelConfig[3]; // Fallback to level 3
    if (timestamp - lastSpawnTime > config.spawnRate) {
        spawnMonster();
        lastSpawnTime = timestamp;
    }
}

function updateShooting(timestamp) {
    // Auto Shooting
    const weapon = weaponConfig[equippedWeaponId];
    if (timestamp - lastShotTime > weapon.fireRate) {
        const target = getNearestMonster();
        if (target) {
            burstTargetId = target.id;
            burstShotsRemaining = weapon.burstCount || 1;
            lastShotTime = timestamp;
        }
    }

    // Handle Burst Fire
    if (burstShotsRemaining > 0) {
        const burstDelay = weapon.burstDelay || 100;
        if (timestamp - lastBurstTime > burstDelay) {
            // Try to find the locked target
            let target = monsters.find(m => m.id === burstTargetId);
            
            // If locked target is dead/gone, find a new nearest target
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
                // No targets available at all
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
    // Update Target Position if target is alive
    const target = monsters.find(m => m.id === b.targetId);
    if (target) {
        b.targetX = target.x;
        b.targetY = target.y;
    }

    // Move towards targetX, targetY
    const dx = b.targetX - b.x;
    const dy = b.targetY - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= b.speed) {
        // Reached destination
        b.x = b.targetX;
        b.y = b.targetY;

        // Check if we hit the target
        if (target) {
            handleBulletHit(b, target, i);
            
            // Bounce Logic
            if (b.bounceCount > 0) {
                b.bounceCount--;
                b.hitIds.push(target.id);
                
                // Find new target
                const newTarget = getNearestMonsterExcluding(b.x, b.y, b.hitIds);
                if (newTarget) {
                    b.targetId = newTarget.id;
                    b.targetX = newTarget.x;
                    b.targetY = newTarget.y;
                    // Continue bullet life
                } else {
                    bullets.splice(i, 1);
                }
            } else {
                bullets.splice(i, 1);
            }
        } else {
            // Target was dead when we arrived
            bullets.splice(i, 1);
        }
    } else {
        // Move
        b.x += (dx / dist) * b.speed;
        b.y += (dy / dist) * b.speed;
    }
}

function updatePenetrateBullet(b, i) {
    b.x += b.vx;
    b.y += b.vy;

    // Remove if out of bounds
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
        bullets.splice(i, 1);
        return;
    }

    // Collision with Monsters
    let bulletRemoved = false;
    for (let j = monsters.length - 1; j >= 0; j--) {
        const m = monsters[j];
        const dx = b.x - m.x;
        const dy = b.y - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < m.radius + b.radius) {
            if (b.hitIds.includes(m.id)) continue; // Already hit this monster

            handleBulletHit(b, m, i);

            if (b.penetration > 0) {
                b.penetration--;
                // Bullet continues
            } else {
                bullets.splice(i, 1); // Remove bullet
                bulletRemoved = true;
                break; // Bullet hit something and died
            }
        }
    }
}

function handleBulletHit(bullet, monster, bulletIndex) {
    monster.hp -= bullet.damage;
    bullet.hitIds.push(monster.id);

    if (monster.hp <= 0) {
        const mIndex = monsters.indexOf(monster);
        if (mIndex > -1) {
            monsters.splice(mIndex, 1); // Remove monster
            
            // Random gold drop
            const goldDrop = Math.floor(Math.random() * (monster.goldMax - monster.goldMin + 1)) + monster.goldMin;
            sessionGold += goldDrop;
            
            // Add floating text
            floatingTexts.push({
                x: monster.x,
                y: monster.y,
                text: `+${goldDrop}`,
                life: 1.0, // Seconds
                color: 'gold'
            });
            
            killCount++;

            const config = levelConfig[currentLevel] || levelConfig[3];
            if (!hasWon && killCount >= config.winKillCount) {
                hasWon = true;
                gameState = 'VICTORY';
                
                // Bank the gold
                totalGold += sessionGold;
                localStorage.setItem('totalGold', totalGold);
                
                winGoldDisplay.textContent = `获得金币: ${sessionGold}`;
                
                const victoryTitle = document.querySelector('#victory-screen h1');
                const continueBtn = document.getElementById('continue-btn');
                
                if (currentLevel < 3) {
                    victoryTitle.textContent = `第 ${currentLevel} 关完成!`;
                    continueBtn.textContent = "下一关";
                } else {
                    victoryTitle.textContent = "通关胜利!";
                    continueBtn.textContent = "继续游戏 (无尽)";
                }

                victoryScreen.classList.remove('hidden');
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

        // Player Collision
        if (dist < player.radius + m.radius) {
            if (timestamp - player.lastHitTime > 1000) { // 1 second invulnerability
                player.hp -= m.damage;
                player.lastHitTime = timestamp;
                
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
        ft.life -= 0.016; // Approx 60fps
        ft.y -= 0.5; // Float up
        
        if (ft.life <= 0) {
            floatingTexts.splice(i, 1);
        }
    }
}

function spawnMonster() {
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;

    switch (side) {
        case 0: x = Math.random() * canvas.width; y = -20; break;
        case 1: x = canvas.width + 20; y = Math.random() * canvas.height; break;
        case 2: x = Math.random() * canvas.width; y = canvas.height + 20; break;
        case 3: x = -20; y = Math.random() * canvas.height; break;
    }

    // For now, just spawn monster type 1
    const typeId = 1;
    const stats = monsterConfig[typeId];
    const hpMultiplier = 1 + 0.1 * currentLevel;

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
        const dist = dx * dx + dy * dy; // Squared distance is enough for comparison
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
        // Default Penetrate Type
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        
        // Calculate base angle
        const angle = Math.atan2(dy, dx);

        // Spawn multiple bullets if needed
        for (let i = 0; i < weapon.projectileCount; i++) {
            // Spread bullets slightly if more than 1
            let spreadAngle = 0;
            if (weapon.projectileCount > 1) {
                const spread = 0.2; // Total spread in radians
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
    // Determine target to point at
    let target = null;
    
    // If bursting, look at burst target
    if (burstTargetId) {
        target = monsters.find(m => m.id === burstTargetId);
    }
    
    // If not bursting or burst target lost, look at nearest
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
    // Draw rectangle representing weapon
    // Offset slightly from center so it looks like it's held
    ctx.fillRect(0, -weapon.visual.width / 2, weapon.visual.length, weapon.visual.width);
    
    ctx.restore();
}

// Rendering
function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'PLAYING' || gameState === 'GAMEOVER' || gameState === 'LOBBY' || gameState === 'VICTORY' || gameState === 'PAUSED') {
        // Draw Player
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.closePath();

        // Draw Weapon
        drawWeapon();

        // Draw Player HP
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`生命: ${Math.ceil(player.hp)}/${player.maxHp}`, player.x, player.y - player.radius - 5);

        if (gameState !== 'LOBBY') {
            // Draw Kill Count
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            const config = levelConfig[currentLevel] || levelConfig[3];
            ctx.fillText(`击杀: ${killCount} / ${config.winKillCount} (关卡 ${currentLevel})`, 20, 20);

            // Draw Session Gold
            ctx.fillStyle = 'gold';
            ctx.fillText(`金币: ${sessionGold}`, 20, 50);

            // Draw Monsters
            for (const m of monsters) {
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
                ctx.fillStyle = m.color;
                ctx.fill();
                ctx.closePath();
                
                // Draw HP (optional, for debugging/clarity)
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(Math.ceil(m.hp), m.x, m.y);
            }

            // Draw Bullets
            for (const b of bullets) {
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fillStyle = b.color;
                ctx.fill();
                ctx.closePath();
            }

            // Draw Floating Texts
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