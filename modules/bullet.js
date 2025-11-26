import { state } from './state.js';
import { handleMonsterDeath } from './monster.js';
import { handleGameOver } from './gameLogic.js';
import { getNearestMonsterExcluding } from './utils.js';

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
            const actualDamage = Math.max(1, b.damage - (state.player.defense || 0));
            state.player.hp -= actualDamage;
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
    const actualDamage = Math.max(1, bullet.damage - (monster.defense || 0));
    monster.hp -= actualDamage;
    bullet.hitIds.push(monster.id);

    state.floatingTexts.push({
        x: monster.x,
        y: monster.y - 10,
        text: `-${actualDamage.toFixed(1)}`,
        life: 0.5,
        color: 'white'
    });

    if (monster.hp <= 0) handleMonsterDeath(monster);
}
