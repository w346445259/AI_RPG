import { state } from './state.js';
import { weaponConfig } from '../config/weaponConfig.js';
import { playerConfig } from '../config/playerConfig.js';
import { getNearestMonster } from './utils.js';
import { getPlayerStats } from './ui.js';
import { handleMonsterDeath } from './monster.js';

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
    let weapon = weaponConfig[state.equippedWeaponId];

    if (!weapon) {
        console.warn(`Equipped weapon ID ${state.equippedWeaponId} not found. Resetting.`);
        state.equippedWeaponId = 4;
        localStorage.setItem('equippedWeaponId', 4);
        weapon = weaponConfig[4];
        if (!weapon) return;
    }

    if (weapon.type === 'melee-sweep' || weapon.type === 'melee-thrust' || weapon.type === 'melee-smash') {
        const stats = getPlayerStats();
        // Agility affects attack speed (Non-linear formula)
        // Multiplier = 1 + (MaxBonus * Agility) / (Agility + HalfwayPoint)
        // MaxBonus = 4 (Max 5x speed), HalfwayPoint = 500 (Slower curve)
        const agilityMultiplier = 1 + (4 * stats.agility) / (stats.agility + 500);
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
                    const damage = Math.floor(stats.strength * weapon.damageMultiplier);

                    targetsToHit.forEach(t => {
                        const actualDamage = Math.max(1, damage - (t.defense || 0));
                        t.hp -= actualDamage;
                        state.floatingTexts.push({
                            x: t.x,
                            y: t.y - 20,
                            text: `-${actualDamage}`,
                            life: 0.5,
                            color: '#fff'
                        });

                        if (t.hp <= 0) handleMonsterDeath(t);
                    });
                }
            }
        }
        return;
    }

    const stats = getPlayerStats();
    // Agility affects attack speed (Non-linear formula)
    const agilityMultiplier = 1 + (4 * stats.agility) / (stats.agility + 500);
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
                shootTarget(target);
                state.burstShotsRemaining--;
                state.lastBurstTime = timestamp;
            } else {
                state.burstShotsRemaining = 0;
            }
        }
    }
}

function shootTarget(target) {
    if (!target) return;
    const stats = getPlayerStats();
    const weapon = weaponConfig[state.equippedWeaponId];
    const finalDamage = stats.strength * weapon.damageMultiplier;

    if (weapon.type === 'bounce') {
        state.bullets.push({
            type: 'bounce',
            x: state.player.x,
            y: state.player.y,
            speed: (weapon.speed || 12) * 60, // Convert old frame speed to px/s if needed, or assume config is updated. Let's assume config needs update or we scale here. 
            // Wait, weaponConfig wasn't fully updated for speed. 
            // If I change logic to expect px/s, I should ensure weapon.speed is px/s.
            // Default 12 * 60 = 720.
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
        const dx = target.x - state.player.x;
        const dy = target.y - state.player.y;
        const angle = Math.atan2(dy, dx);

        for (let i = 0; i < weapon.projectileCount; i++) {
            let spreadAngle = 0;
            if (weapon.projectileCount > 1) {
                const spread = 0.2;
                spreadAngle = -spread/2 + (spread / (weapon.projectileCount - 1)) * i;
            }

            const vx = Math.cos(angle + spreadAngle) * playerConfig.bulletSpeed;
            const vy = Math.sin(angle + spreadAngle) * playerConfig.bulletSpeed;

            state.bullets.push({
                type: 'penetrate',
                x: state.player.x,
                y: state.player.y,
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
