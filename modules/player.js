import { state } from './state.js';
import { getNearestMonster } from './utils.js';
import { getPlayerStats } from './ui.js';
import { handleMonsterDeath } from './monster.js';
import { getActiveWeaponConfig } from './weaponUtils.js';

export function takeDamage(amount) {
    if (amount <= 0) return;
    
    let remainingDamage = amount;
    
    // Shield absorption
    if (state.player.shield > 0) {
        if (state.player.shield >= remainingDamage) {
            state.player.shield -= remainingDamage;
            remainingDamage = 0;
        } else {
            remainingDamage -= state.player.shield;
            state.player.shield = 0;
        }
    }
    
    // Health damage
    if (remainingDamage > 0) {
        state.player.hp -= remainingDamage;
    }
}

function rollCriticalDamage(baseDamage, stats) {
    let damage = Math.floor(baseDamage);
    let isCrit = false;
    const critChance = stats.critChance || 0;
    const critDamage = stats.critDamage || 2;
    if (Math.random() < critChance) {
        isCrit = true;
        damage = Math.floor(damage * critDamage);
    }
    return { damage, isCrit };
}

function pushDamageFloatingText(target, damage, isCrit) {
    state.floatingTexts.push({
        x: target.x,
        y: target.y - 20,
        text: isCrit ? `暴击 -${damage}` : `-${damage}`,
        life: isCrit ? 0.8 : 0.5,
        color: isCrit ? '#FFD700' : '#fff',
        strokeStyle: isCrit ? '#FF4500' : 'black',
        lineWidth: isCrit ? 4 : 3,
        fontSize: isCrit ? 30 : 24,
        riseSpeed: isCrit ? 90 : 60,
        shadowColor: isCrit ? '#FFA500' : undefined,
        shadowBlur: isCrit ? 25 : undefined,
        isCrit
    });
}

export function updatePlayerMovement(dt) {
    const moveDist = state.player.speed * dt;
    if (state.keys['w']) state.player.y -= moveDist;
    if (state.keys['s']) state.player.y += moveDist;
    if (state.keys['a']) state.player.x -= moveDist;
    if (state.keys['d']) state.player.x += moveDist;

    state.player.x = Math.max(state.player.radius, Math.min(state.worldWidth - state.player.radius, state.player.x));
    state.player.y = Math.max(state.player.radius, Math.min(state.worldHeight - state.player.radius, state.player.y));
}

export function updateShooting(timestamp) {
    let weapon = getActiveWeaponConfig();

    if (!weapon) {
        console.warn(`Equipped weapon ID ${state.equippedWeaponId} not found. Resetting.`);
        state.equippedWeaponId = 4;
        localStorage.setItem('equippedWeaponId', 4);
        weapon = getActiveWeaponConfig();
        if (!weapon) return;
    }

    if (weapon.type === 'melee-sweep' || weapon.type === 'melee-thrust' || weapon.type === 'melee-smash') {
        const stats = getPlayerStats();
        // 敏捷对攻速的收益放缓，需更高敏捷才能逼近 5 倍攻速
        const agilityMultiplier = 1 + (4 * stats.agility) / (stats.agility + 2000);
        const actualFireRate = weapon.fireRate / agilityMultiplier;

        if (timestamp - state.lastShotTime > actualFireRate) {
            const target = getNearestMonster();
            if (target) {
                const dx = target.x - state.player.x;
                const dy = target.y - state.player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const facingAngle = Math.atan2(dy, dx);
                
                if (dist <= (weapon.range || 100) + (weapon.type === 'melee-smash' ? 50 : 0)) {
                    state.lastShotTime = timestamp;
                    const range = weapon.range || 100;
                    const targetsToHit = [];

                    if (weapon.type === 'melee-sweep') {
                        const sweepAngle = (weapon.angle || 0) * (Math.PI / 180);
                        const offset = weapon.offset || 0;
                        const centerX = state.player.x + Math.cos(facingAngle) * offset;
                        const centerY = state.player.y + Math.sin(facingAngle) * offset;

                        state.attackVisuals.push({
                            type: 'sweep',
                            x: centerX,
                            y: centerY,
                            angle: facingAngle,
                            radius: range,
                            sweepAngle: sweepAngle,
                            life: 0.2,
                            maxLife: 0.2
                        });

                        for (const m of state.monsters) {
                            const mdx = m.x - centerX;
                            const mdy = m.y - centerY;
                            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                            
                            if (mDist <= range) {
                                const mAngle = Math.atan2(mdy, mdx);
                                let angleDiff = mAngle - facingAngle;
                                while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                                while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                                if (Math.abs(angleDiff) <= sweepAngle / 2) targetsToHit.push(m);
                            }
                        }
                    } else if (weapon.type === 'melee-thrust') {
                        const width = weapon.width || 40;
                        state.attackVisuals.push({
                            type: 'thrust',
                            x: state.player.x,
                            y: state.player.y,
                            angle: facingAngle,
                            length: range,
                            width: width,
                            life: 0.2,
                            maxLife: 0.2
                        });

                        const cos = Math.cos(-facingAngle);
                        const sin = Math.sin(-facingAngle);
                        
                        for (const m of state.monsters) {
                            const mdx = m.x - state.player.x;
                            const mdy = m.y - state.player.y;
                            const rx = mdx * cos - mdy * sin;
                            const ry = mdx * sin + mdy * cos;
                            if (rx >= 0 && rx <= range && ry >= -width/2 && ry <= width/2) targetsToHit.push(m);
                        }
                    } else if (weapon.type === 'melee-smash') {
                        const smashRadius = range;
                        const smashDist = weapon.offset !== undefined ? weapon.offset : range;
                        const smashX = state.player.x + Math.cos(facingAngle) * smashDist;
                        const smashY = state.player.y + Math.sin(facingAngle) * smashDist;

                        state.attackVisuals.push({
                            type: 'smash',
                            x: smashX,
                            y: smashY,
                            radius: smashRadius,
                            life: 0.2,
                            maxLife: 0.2
                        });

                        for (const m of state.monsters) {
                            const mdx = m.x - smashX;
                            const mdy = m.y - smashY;
                            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                            if (mDist <= smashRadius) targetsToHit.push(m);
                        }
                    }

                    const stats = getPlayerStats();
                    const baseDamage = stats.strength * weapon.damageMultiplier;

                    targetsToHit.forEach(t => {
                        const { damage, isCrit } = rollCriticalDamage(baseDamage, stats);
                        const actualDamage = Math.max(1, damage - (t.defense || 0));
                        t.hp -= actualDamage;
                        pushDamageFloatingText(t, actualDamage, isCrit);

                        if (t.hp <= 0) handleMonsterDeath(t);
                    });
                }
            }
        }
        return;
    }

    const stats = getPlayerStats();
    // 敏捷对攻速的收益放缓，需更高敏捷才能逼近 5 倍攻速
    const agilityMultiplier = 1 + (4 * stats.agility) / (stats.agility + 2000);
    const actualFireRate = weapon.fireRate / agilityMultiplier;

    if (timestamp - state.lastShotTime > actualFireRate) {
        const target = getNearestMonster();
        if (target) {
            state.burstTargetId = target.id;
            state.burstShotsRemaining = weapon.burstCount || 1;
            state.lastShotTime = timestamp;
        }
    }

    if (state.burstShotsRemaining > 0) {
        const burstDelay = weapon.burstDelay || 100;
        if (timestamp - state.lastBurstTime > burstDelay) {
            let target = state.monsters.find(m => m.id === state.burstTargetId);
            if (!target) {
                target = getNearestMonster();
                if (target) state.burstTargetId = target.id;
            }

            if (target) {
                shootTarget(target, weapon);
                state.burstShotsRemaining--;
                state.lastBurstTime = timestamp;
            } else {
                state.burstShotsRemaining = 0;
            }
        }
    }
}

function shootTarget(target, weapon) {
    if (!target) return;
    const stats = getPlayerStats();
    const baseDamage = stats.strength * weapon.damageMultiplier;

    if (weapon.type === 'bounce') {
        state.bullets.push({
            type: 'bounce',
            x: state.player.x,
            y: state.player.y,
            speed: (weapon.speed || 12) * 60, // 兼容旧版帧速配置，未设置时按12*60像素/秒处理
            targetId: target.id,
            targetX: target.x,
            targetY: target.y,
            damage: baseDamage,
            bounceCount: weapon.bounceCount,
            hitIds: [],
            radius: 5,
            color: 'cyan',
            critChance: stats.critChance,
            critDamage: stats.critDamage
        });
    } else {
        const dx = target.x - state.player.x;
        const dy = target.y - state.player.y;
        const angle = Math.atan2(dy, dx);

        const projectileCount = weapon.projectileCount || 1;
        const projectileSpeed = weapon.bulletSpeed || 360;
        const spread = weapon.projectileSpread ?? 0.2;
        let baseStart = -spread / 2;
        let step = 0;
        if (projectileCount > 1) {
            step = spread / (projectileCount - 1);
            if (projectileCount % 2 === 0) {
                const targetIndex = (projectileCount / 2) - 1; // N/2 弹道命中正前方
                const desiredAngle = baseStart + step * targetIndex;
                baseStart -= desiredAngle;
            }
        }

        for (let i = 0; i < projectileCount; i++) {
            let spreadAngle = 0;
            if (projectileCount > 1) {
                spreadAngle = baseStart + step * i;
            }

            const vx = Math.cos(angle + spreadAngle) * projectileSpeed;
            const vy = Math.sin(angle + spreadAngle) * projectileSpeed;

            state.bullets.push({
                type: 'penetrate',
                x: state.player.x,
                y: state.player.y,
                vx: vx,
                vy: vy,
                radius: 5,
                color: 'yellow',
                penetration: weapon.penetration,
                damage: baseDamage,
                hitIds: [],
                critChance: stats.critChance,
                critDamage: stats.critDamage
            });
        }
    }
}
