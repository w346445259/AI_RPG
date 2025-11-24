import { playerConfig } from './config/playerConfig.js';
import { monsterConfig } from './config/monsterConfig.js';
import { levelConfig } from './config/spawnConfig.js';
import { weaponConfig } from './config/weaponConfig.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI 元素
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

// 强化 UI 元素
const upgradeScreen = document.getElementById('upgrade-screen');
const upgradeBtn = document.getElementById('upgrade-btn');
const btnBackLobby = document.getElementById('btn-back-lobby');
const upgradeGoldDisplay = document.getElementById('upgrade-gold-display');

// 武器 UI 元素
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
let gameState = 'LOBBY'; // LOBBY (大厅), PLAYING (游戏中), GAMEOVER (游戏结束), VICTORY (胜利), UPGRADE (强化), WEAPON (武器库), PAUSED (暂停)

let totalGold = parseInt(localStorage.getItem('totalGold')) || 0;
let sessionGold = 0; // 本局获得金币
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
    x: canvas.width * 0.7, // 大厅中的位置
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
    floatingTexts = [];
    monsterIdCounter = 0;
    killCount = 0;
    sessionGold = 0;
    hasWon = false;
    currentLevel = 1;
    
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
    upgradeGoldDisplay.textContent = `金币: ${totalGold}`;
}

function updateUpgradeUI() {
    updateGoldDisplay();

    // 攻击力 UI
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
        const cost = attackLevel + 1; // 消耗 = 下一级 (例如 0->1 消耗 1)
        atkNextSpan.textContent = nextAtk;
        atkCostSpan.textContent = cost;
        btnUpgradeAtk.disabled = totalGold < cost;
        btnUpgradeAtk.textContent = `升级 (消耗: ${cost})`;
    }

    // 生命值 UI
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

// 将装备函数暴露给 window 以便 onclick 调用
window.equipWeapon = (id) => {
    equippedWeaponId = id;
    localStorage.setItem('equippedWeaponId', id);
    updateWeaponUI();
};

// UI 事件监听器
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
    
    // 更新玩家预览属性
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

// 加载时初始化金币显示
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
    
    // 重置大厅玩家位置
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
        
        // 重置玩家位置？也许保留。
        // 清除怪物？
        monsters = [];
        bullets = [];
        floatingTexts = [];
    } else {
        // 无尽模式或继续
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

    // 重置大厅玩家位置
    const stats = getPlayerStats();
    player.x = canvas.width * 0.7;
    player.y = canvas.height / 2;
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
    updateGoldDisplay();
    
    // 重置大厅玩家位置
    const stats = getPlayerStats();
    player.x = canvas.width * 0.7;
    player.y = canvas.height / 2;
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
        player.y = canvas.height / 2;
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
    monster.hp -= bullet.damage;
    bullet.hitIds.push(monster.id);

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
            if (!hasWon && killCount >= config.winKillCount) {
                hasWon = true;
                gameState = 'VICTORY';
                
                // 存储金币
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

        // 玩家碰撞
        if (dist < player.radius + m.radius) {
            if (timestamp - player.lastHitTime > 1000) { // 1秒无敌时间
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

// 渲染
function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'PLAYING' || gameState === 'GAMEOVER' || gameState === 'LOBBY' || gameState === 'VICTORY' || gameState === 'PAUSED') {
        // 绘制玩家
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.closePath();

        // 绘制武器
        drawWeapon();

        // 绘制玩家生命值
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`生命: ${Math.ceil(player.hp)}/${player.maxHp}`, player.x, player.y - player.radius - 5);

        if (gameState !== 'LOBBY') {
            // 绘制击杀数
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            const config = levelConfig[currentLevel] || levelConfig[3];
            ctx.fillText(`击杀: ${killCount} / ${config.winKillCount} (关卡 ${currentLevel})`, 20, 20);

            // 绘制本局金币
            ctx.fillStyle = 'gold';
            ctx.fillText(`金币: ${sessionGold}`, 20, 50);

            // 绘制怪物
            for (const m of monsters) {
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
                ctx.fillStyle = m.color;
                ctx.fill();
                ctx.closePath();
                
                // 绘制生命值 (可选，用于调试/清晰度)
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(Math.ceil(m.hp), m.x, m.y);
            }

            // 绘制子弹
            for (const b of bullets) {
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fillStyle = b.color;
                ctx.fill();
                ctx.closePath();
            }

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