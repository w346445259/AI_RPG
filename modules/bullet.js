import { state } from './state.js';
import { takeDamage } from './player.js';
import { handleMonsterDeath } from './monster.js';
import { handleGameOver } from './gameLogic.js';
import { getNearestMonsterExcluding, calculateDamageAfterDefense } from './utils.js';
import { getPlayerStats } from './playerStats.js';

function calculateBulletDamage(bullet) {
    const critChance = bullet.critChance || 0;
    const critDamage = bullet.critDamage || 2;
    let damage = bullet.damage;
    let isCrit = false;
    if (!bullet.isEnemy && Math.random() < critChance) {
        isCrit = true;
        damage *= critDamage;
    }
    return { damage: Math.floor(damage), isCrit };
}

// 根据元素返回伤害跳字颜色（有元素时用元素色，否则沿用原来的暴击/普通颜色）
function getElementDamageColor(elements, isCrit) {
    if (elements) {
        const { metal, wood, water, fire, earth } = elements;
        if (fire) return '#FF5722';      // 火：橙红
        if (water) return '#00BFFF';     // 水：亮蓝
        if (wood) return '#4CAF50';      // 木：绿色
        if (metal) return '#F0E68C';     // 金：淡金
        if (earth) return '#BCAAA4';     // 土：土黄
    }
    // 没有任何属性时，保持原来的颜色逻辑
    return isCrit ? '#FFD700' : '#fff';
}

function pushPlayerDamageText(monster, damage, isCrit, elements) {
    const color = getElementDamageColor(elements, isCrit);
    state.floatingTexts.push({
        x: monster.x,
        y: monster.y - 10,
        text: isCrit ? `暴击 -${damage}` : `-${damage}`,
        life: isCrit ? 0.8 : 0.5,
        color,
        strokeStyle: isCrit ? '#FF4500' : 'black',
        lineWidth: isCrit ? 4 : 3,
        fontSize: isCrit ? 30 : 24,
        riseSpeed: isCrit ? 90 : 60,
        shadowColor: isCrit ? '#FFA500' : undefined,
        shadowBlur: isCrit ? 25 : undefined,
        isCrit
    });
}

export function updateBullets(dt) {
    for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];
        if (b.type === 'bounce') updateBounceBullet(b, i, dt);
        else updatePenetrateBullet(b, i, dt);
    }
}

function updateBounceBullet(b, i, dt) {
    const target = state.monsters.find(m => m.id === b.targetId);
    if (target) {
        b.targetX = target.x;
        b.targetY = target.y;
    }

    const dx = b.targetX - b.x;
    const dy = b.targetY - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moveDist = b.speed * dt;

    if (dist <= moveDist) {
        b.x = b.targetX;
        b.y = b.targetY;

        if (target) {
            handleBulletHit(b, target, i);
            if (b.bounceCount > 0) {
                b.bounceCount--;
                b.hitIds.push(target.id);
                const newTarget = getNearestMonsterExcluding(b.x, b.y, b.hitIds);
                if (newTarget) {
                    b.targetId = newTarget.id;
                    b.targetX = newTarget.x;
                    b.targetY = newTarget.y;
                } else {
                    state.bullets.splice(i, 1);
                }
            } else {
                state.bullets.splice(i, 1);
            }
        } else {
            state.bullets.splice(i, 1);
        }
    } else {
        b.x += (dx / dist) * moveDist;
        b.y += (dy / dist) * moveDist;
    }
}

function updatePenetrateBullet(b, i, dt) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    if (b.x < 0 || b.x > state.worldWidth || b.y < 0 || b.y > state.worldHeight) {
        state.bullets.splice(i, 1);
        return;
    }

    if (b.isEnemy) {
        const dx = b.x - state.player.x;
        const dy = b.y - state.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < state.player.radius + b.radius) {
            const stats = getPlayerStats();
            const actualDamage = calculateDamageAfterDefense(b.damage, stats.defense);
            takeDamage(actualDamage);
            state.floatingTexts.push({
                x: state.player.x,
                y: state.player.y - 20,
                text: `-${actualDamage.toFixed(1)}`,
                life: 0.5,
                color: 'red'
            });

            if (state.player.hp <= 0) handleGameOver();
            state.bullets.splice(i, 1);
        }
    } else {
        for (let j = state.monsters.length - 1; j >= 0; j--) {
            const m = state.monsters[j];
            const dx = b.x - m.x;
            const dy = b.y - m.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < m.radius + b.radius) {
                if (b.hitIds.includes(m.id)) continue;
                handleBulletHit(b, m, i);
                if (b.penetration > 0) {
                    b.penetration--;
                } else {
                    state.bullets.splice(i, 1);
                    break;
                }
            }
        }
    }
}

function handleBulletHit(bullet, monster, bulletIndex) {
    const { damage, isCrit } = calculateBulletDamage(bullet);
    const actualDamage = calculateDamageAfterDefense(damage, monster.defense);
    monster.hp -= actualDamage;
    bullet.hitIds.push(monster.id);

    pushPlayerDamageText(monster, actualDamage, isCrit, bullet.elements);

    if (monster.hp <= 0) handleMonsterDeath(monster);
}
