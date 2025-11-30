import { state } from './state.js';
import { levelConfig } from '../config/spawnConfig.js';
import { monsterConfig } from '../config/monsterConfig.js';
import { monsterWeaponConfig } from '../config/monsterWeaponConfig.js';
import { cameraConfig } from '../config/cameraConfig.js';
import { handleVictory, handleGameOver } from './gameLogic.js';
import { getScaledKillRequirement } from './levelUtils.js';
import { gainSoulFromKill } from './affixSystem.js';
import { getPlayerStats } from './playerStats.js';

export function updateSpawning(timestamp) {
    const config = levelConfig[state.currentLevel] || levelConfig[1];
    const maxMonsters = getScaledKillRequirement(config);
    if (state.monstersSpawned >= maxMonsters) return;

    if (timestamp - state.lastSpawnTime > config.spawnRate) {
        spawnMonster();
        state.lastSpawnTime = timestamp;
    }
}

export function spawnMonster() {
    let x, y;
    const cam = state.camera;
    // Adjust spawn logic for 2x zoom
    const zoomLevel = cameraConfig.zoomLevel;
    const viewW = state.canvas.width / zoomLevel;
    const viewH = state.canvas.height / zoomLevel;
    const worldW = state.worldWidth;
    const worldH = state.worldHeight;
    const margin = 50; // Distance from camera edge
    const spawnBand = 400; // Width of the area to spawn in

    const validSides = [];
    
    // Check Top
    if (cam.y - margin > 0) validSides.push('top');
    // Check Bottom
    if (cam.y + viewH + margin < worldH) validSides.push('bottom');
    // Check Left
    if (cam.x - margin > 0) validSides.push('left');
    // Check Right
    if (cam.x + viewW + margin < worldW) validSides.push('right');
    
    if (validSides.length === 0) {
        // Fallback: random world position
        x = Math.random() * worldW;
        y = Math.random() * worldH;
    } else {
        const side = validSides[Math.floor(Math.random() * validSides.length)];
        
        // Helper for random range
        const rand = (min, max) => Math.random() * (max - min) + min;
        
        // Extended range for the other axis (so they can spawn in corners)
        const xMin = Math.max(0, cam.x - margin);
        const xMax = Math.min(worldW, cam.x + viewW + margin);
        const yMin = Math.max(0, cam.y - margin);
        const yMax = Math.min(worldH, cam.y + viewH + margin);

        switch(side) {
            case 'top':
                x = rand(xMin, xMax);
                y = rand(Math.max(0, cam.y - margin - spawnBand), cam.y - margin);
                break;
            case 'bottom':
                x = rand(xMin, xMax);
                y = rand(cam.y + viewH + margin, Math.min(worldH, cam.y + viewH + margin + spawnBand));
                break;
            case 'left':
                x = rand(Math.max(0, cam.x - margin - spawnBand), cam.x - margin);
                y = rand(yMin, yMax);
                break;
            case 'right':
                x = rand(cam.x + viewW + margin, Math.min(worldW, cam.x + viewW + margin + spawnBand));
                y = rand(yMin, yMax);
                break;
        }
    }

    const config = levelConfig[state.currentLevel] || levelConfig[1];
    const allowedTypes = config.monsterTypes || [1, 2];
    const typeId = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    
    const stats = monsterConfig[typeId];
    // Base HP multiplier from level progression (existing logic)
    let hpMultiplier = 1 + 0.1 * state.currentLevel;
    
    // Apply difficulty multiplier from level config (new logic)
    const difficultyMultiplier = config.difficultyMultiplier || 1;
    hpMultiplier *= difficultyMultiplier;

    const damageMultiplier = difficultyMultiplier;
    const spiritStonesMultiplier = config.spiritStonesMultiplier || 1;

    state.monstersSpawned++;

    state.monsters.push({
        id: state.monsterIdCounter++,
        x: x,
        y: y,
        radius: stats.radius,
        hp: stats.hp * hpMultiplier,
        maxHp: stats.hp * hpMultiplier,
        speed: stats.speed,
        color: stats.color,
        damage: stats.damage * damageMultiplier,
        defense: stats.defense * difficultyMultiplier,
        spiritStonesMin: Math.floor(stats.spiritStonesMin * spiritStonesMultiplier),
        spiritStonesMax: Math.floor(stats.spiritStonesMax * spiritStonesMultiplier),
        typeId: typeId,
        weaponId: stats.weaponId,
        lastAttackTime: performance.now()
    });
}

import { takeDamage } from './player.js';

export function updateMonsters(timestamp, dt) {
    for (let i = 0; i < state.monsters.length; i++) {
        const m = state.monsters[i];
        const dx = state.player.x - m.x;
        const dy = state.player.y - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const weapon = monsterWeaponConfig[m.weaponId];

        let moveX = 0;
        let moveY = 0;

        // 如果正在前摇，停止移动
        if (m.isWindingUp) {
            moveX = 0;
            moveY = 0;
        } else if (weapon) {
            if (weapon.type === 'melee-sweep' || weapon.type === 'melee-thrust') {
                if (dist > weapon.range * 0.8) {
                    moveX = (dx / dist) * m.speed;
                    moveY = (dy / dist) * m.speed;
                }
            } else {
                const safeDist = 200;
                const attackDist = 400;
                if (dist < safeDist) {
                    moveX = -(dx / dist) * m.speed;
                    moveY = -(dy / dist) * m.speed;
                } else if (dist > attackDist) {
                    moveX = (dx / dist) * m.speed;
                    moveY = (dy / dist) * m.speed;
                }
            }
        } else {
            if (dist > 0) {
                moveX = (dx / dist) * m.speed;
                moveY = (dy / dist) * m.speed;
            }
        }

        m.x += moveX * dt;
        m.y += moveY * dt;
        m.x = Math.max(m.radius, Math.min(state.worldWidth - m.radius, m.x));
        m.y = Math.max(m.radius, Math.min(state.worldHeight - m.radius, m.y));

        if (weapon) {
            // 如果正在前摇
            if (m.isWindingUp) {
                const windUpDuration = m.windUpTime || 1000;
                m.windUpElapsed = (m.windUpElapsed || 0) + dt * 1000;
                
                if (m.windUpElapsed >= windUpDuration) {
                    // 前摇结束，执行攻击
                    monsterAttack(m, weapon, timestamp);
                    m.isWindingUp = false;
                    m.windUpElapsed = 0;
                    m.lastAttackTime = timestamp;
                }
                // 前摇期间不移动，也不进行新的攻击判定
                continue;
            }

            const cooldown = (weapon.type === 'penetrate' || weapon.type === 'bounce') ? 3000 : weapon.fireRate;
            if (timestamp - m.lastAttackTime > cooldown) {
                const attackRange = (weapon.type === 'penetrate' || weapon.type === 'bounce') ? 500 : weapon.range;
                if (dist <= attackRange) {
                    // 开始前摇
                    m.isWindingUp = true;
                    m.windUpElapsed = 0;
                    m.windUpTime = monsterConfig[m.typeId].windUpTime || 1000;
                }
            }
        }

        if (dist < state.player.radius + m.radius) {
            if (timestamp - state.player.lastHitTime > 1000) {
                const stats = getPlayerStats();
                const actualDamage = Math.max(1, m.damage - (stats.defense || 0));
                takeDamage(actualDamage);
                state.player.lastHitTime = timestamp;
                state.floatingTexts.push({
                    x: state.player.x,
                    y: state.player.y - 20,
                    text: `-${actualDamage.toFixed(1)}`,
                    life: 0.5,
                    color: 'red'
                });
                if (state.player.hp <= 0) handleGameOver();
            }
        }
    }
}

export function monsterAttack(monster, weapon, timestamp) {
    const dx = state.player.x - monster.x;
    const dy = state.player.y - monster.y;
    const angle = Math.atan2(dy, dx);

    if (weapon.type === 'melee-sweep' || weapon.type === 'melee-thrust') {
        if (weapon.type === 'melee-sweep') {
             state.attackVisuals.push({
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
             state.attackVisuals.push({
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

        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist <= weapon.range + state.player.radius) {
             const actualDamage = Math.max(1, (monster.damage * weapon.damageMultiplier) - state.player.defense);
             takeDamage(actualDamage);
             state.floatingTexts.push({
                x: state.player.x,
                y: state.player.y - 20,
                text: `-${actualDamage.toFixed(1)}`,
                life: 0.5,
                color: 'red'
            });
             if (state.player.hp <= 0) handleGameOver();
        }
    } else {
        const bulletSpeed = 240; // 4 * 60
        const vx = Math.cos(angle) * bulletSpeed;
        const vy = Math.sin(angle) * bulletSpeed;
        state.bullets.push({
            type: 'penetrate',
            x: monster.x,
            y: monster.y,
            vx: vx,
            vy: vy,
            radius: 5,
            color: 'red',
            penetration: 0,
            damage: monster.damage * weapon.damageMultiplier,
            hitIds: [],
            isEnemy: true
        });
    }
}

export function handleMonsterDeath(monster) {
    const mIndex = state.monsters.indexOf(monster);
    if (mIndex > -1) {
        state.monsters.splice(mIndex, 1);
        
        const spiritStonesDrop = Math.floor(Math.random() * (monster.spiritStonesMax - monster.spiritStonesMin + 1)) + monster.spiritStonesMin;
        state.sessionSpiritStones += spiritStonesDrop;
        
        state.floatingTexts.push({
            x: monster.x,
            y: monster.y,
            text: `+${spiritStonesDrop}`,
            life: 1.0,
            color: '#87CEEB'
        });
        
        state.killCount++;

        gainSoulFromKill();

        const config = levelConfig[state.currentLevel] || levelConfig[1];
        const winKillCount = getScaledKillRequirement(config);
        if (!state.hasWon && state.killCount >= winKillCount) {
            handleVictory();
            return;
        }
    }
}
