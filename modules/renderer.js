import { state } from './state.js';
import { weaponConfig } from '../config/weaponConfig.js';
import { levelConfig } from '../config/spawnConfig.js';
import { monsterWeaponConfig } from '../config/monsterWeaponConfig.js';
import { cameraConfig } from '../config/cameraConfig.js';
import { getNearestMonster } from './utils.js';
import { getScaledKillRequirement } from './levelUtils.js';

function drawWeapon() {
    const weapon = weaponConfig[state.equippedWeaponId];
    if (!weapon || !weapon.visual) return;

    let angle = 0;
    // 确定指向的目标
    let target = null;
    
    // 如果正在连发，看向连发目标
    if (state.burstTargetId) {
        target = state.monsters.find(m => m.id === state.burstTargetId);
    }
    
    // 如果没有连发或连发目标丢失，看向最近的目标
    if (!target) {
        target = getNearestMonster();
    }

    if (target) {
        const dx = target.x - state.player.x;
        const dy = target.y - state.player.y;
        angle = Math.atan2(dy, dx);
    }

    state.ctx.save();
    state.ctx.translate(state.player.x, state.player.y);
    state.ctx.rotate(angle);
    
    state.ctx.fillStyle = weapon.visual.color;
    // 绘制代表武器的矩形
    // 稍微偏离中心，看起来像是被握着
    state.ctx.fillRect(0, -weapon.visual.width / 2, weapon.visual.length, weapon.visual.width);
    
    state.ctx.restore();
}

export function draw(timestamp) {
    const ctx = state.ctx;
    const canvas = state.canvas;
    
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (state.gameState === 'PLAYING' || state.gameState === 'GAMEOVER' || state.gameState === 'LOBBY' || state.gameState === 'VICTORY' || state.gameState === 'PAUSED' || state.gameState === 'AFFIX_SELECTION') {
        
        if (state.gameState !== 'LOBBY') {
            ctx.save();
            // Apply zoom (scale)
            const zoomLevel = cameraConfig.zoomLevel;
            ctx.scale(zoomLevel, zoomLevel);
            
            // Adjust translation to center camera with zoom
            // The camera position (state.camera.x, state.camera.y) is the top-left corner of the view in world coordinates.
            // When scaling, we need to adjust the translation so the camera still points to the correct location.
            // However, typically camera logic calculates top-left based on screen size.
            // If we scale the context, the "screen size" in world units effectively halves.
            // So we just translate by the camera position, but we might need to adjust the camera logic itself if it assumes 1:1 mapping.
            // Let's try simple translation first, but scaled.
            
            // Actually, if we scale, we should translate first?
            // Standard transform: translate(center), scale(zoom), translate(-center) - translate(camera)
            
            // Let's stick to: Scale -> Translate
            // If we scale by 2, everything is drawn 2x bigger.
            // To draw the world at (camX, camY), we translate by (-camX, -camY).
            ctx.translate(-state.camera.x, -state.camera.y);

            // Draw Grid
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            const gridSize = 100;
            
            // Calculate visible grid range optimization
            const startX = Math.floor(state.camera.x / gridSize) * gridSize;
            const startY = Math.floor(state.camera.y / gridSize) * gridSize;
            const endX = startX + canvas.width + gridSize;
            const endY = startY + canvas.height + gridSize;

            ctx.beginPath();
            for (let x = startX; x <= endX; x += gridSize) {
                if (x > state.worldWidth) break;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, state.worldHeight);
            }
            for (let y = startY; y <= endY; y += gridSize) {
                if (y > state.worldHeight) break;
                ctx.moveTo(0, y);
                ctx.lineTo(state.worldWidth, y);
            }
            ctx.stroke();

            // Draw World Borders
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 5;
            ctx.strokeRect(0, 0, state.worldWidth, state.worldHeight);

            // Layer 1: Ores (Bottom)
            for (const ore of state.ores) {
                if (!ore) continue;
                const range = ore.miningRange || 60;

                // 采集范围圈 (半透明)
                ctx.beginPath();
                ctx.arc(ore.x, ore.y, range, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.closePath();

                // 矿石本体 (正方形)
                ctx.fillStyle = ore.color || '#888';
                ctx.fillRect(ore.x - ore.size / 2, ore.y - ore.size / 2, ore.size, ore.size);
                
                ctx.strokeStyle = '#5D4037';
                ctx.lineWidth = 2;
                ctx.strokeRect(ore.x - ore.size / 2, ore.y - ore.size / 2, ore.size, ore.size);

                // 剩余次数文字
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${ore.capacity}`, ore.x, ore.y);

                // 采集进度条
                if (ore.isMining && ore.miningProgress > 0) {
                    const barWidth = 40;
                    const barHeight = 6;
                    const progress = Math.min(1, ore.miningProgress / ore.miningTime);
                    
                    ctx.fillStyle = '#333';
                    ctx.fillRect(ore.x - barWidth/2, ore.y - ore.size / 2 - 15, barWidth, barHeight);
                    
                    ctx.fillStyle = '#4CAF50';
                    ctx.fillRect(ore.x - barWidth/2, ore.y - ore.size / 2 - 15, barWidth * progress, barHeight);
                }
            }

            // Layer 2: Monsters
            for (const m of state.monsters) {
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
                ctx.fillStyle = m.color;
                ctx.fill();
                ctx.closePath();
                
                // 绘制怪物武器
                if (m.weaponId) {
                    const weapon = monsterWeaponConfig[m.weaponId];
                    if (weapon && weapon.visual) {
                        const dx = state.player.x - m.x;
                        const dy = state.player.y - m.y;
                        const angle = Math.atan2(dy, dx);
                        
                        ctx.save();
                        ctx.translate(m.x, m.y);
                        ctx.rotate(angle);
                        ctx.fillStyle = weapon.visual.color;
                        ctx.fillRect(0, -weapon.visual.width / 2, weapon.visual.length, weapon.visual.width);
                        ctx.restore();
                    }
                }

                // 绘制生命值
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(Math.ceil(m.hp), m.x, m.y);

                // 绘制攻击前摇条
                if (m.isWindingUp) {
                    const barWidth = 40;
                    const barHeight = 6;
                    const windUpDuration = m.windUpTime || 1000;
                    const progress = Math.min(1, (m.windUpElapsed || 0) / windUpDuration);

                    ctx.fillStyle = '#333';
                    ctx.fillRect(m.x - barWidth / 2, m.y - m.radius - 15, barWidth, barHeight);

                    ctx.fillStyle = '#FFFFFF'; // 白色表示攻击蓄力
                    ctx.fillRect(m.x - barWidth / 2, m.y - m.radius - 15, barWidth * progress, barHeight);
                }
            }

            // Layer 3: Bullets
            for (const b of state.bullets) {
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fillStyle = b.color;
                ctx.fill();
                ctx.closePath();
            }

            // Layer 3.5: Attack Visuals
            for (let i = state.attackVisuals.length - 1; i >= 0; i--) {
                const v = state.attackVisuals[i];
                
                const color = v.isEnemy ? `rgba(255, 0, 0, ${v.life / v.maxLife * 0.5})` : `rgba(255, 255, 255, ${v.life / v.maxLife * 0.5})`;

                if (v.type === 'sweep') {
                    ctx.beginPath();
                    ctx.moveTo(v.x, v.y);
                    ctx.arc(v.x, v.y, v.radius, v.angle - v.sweepAngle / 2, v.angle + v.sweepAngle / 2);
                    ctx.lineTo(v.x, v.y);
                    ctx.fillStyle = color;
                    ctx.fill();
                } else if (v.type === 'thrust') {
                    ctx.save();
                    ctx.translate(v.x, v.y);
                    ctx.rotate(v.angle);
                    ctx.fillStyle = color;
                    // Draw rectangle starting from player center outwards
                    ctx.fillRect(0, -v.width / 2, v.length, v.width);
                    ctx.restore();
                } else if (v.type === 'smash') {
                    ctx.beginPath();
                    ctx.arc(v.x, v.y, v.radius, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                }
                
                v.life -= 0.016; // approx per frame
                if (v.life <= 0) state.attackVisuals.splice(i, 1);
            }

        // Layer 4: Player (Top)
        ctx.beginPath();
        ctx.arc(state.player.x, state.player.y, state.player.radius, 0, Math.PI * 2);
        ctx.fillStyle = state.player.color;
        ctx.fill();
        ctx.closePath();

        // 绘制武器
        drawWeapon();

        // 绘制玩家生命值
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`生命: ${Math.ceil(state.player.hp)}/${state.player.maxHp}`, state.player.x, state.player.y - state.player.radius - 5);

        // Layer 5: Floating Texts (Highest Priority in World Space)
        for (const ft of state.floatingTexts) {
            ctx.globalAlpha = Math.max(0, ft.life);
            ctx.fillStyle = ft.color || 'white';
            const fontSize = ft.fontSize || 24;
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            
            // 添加描边，使文字更清晰
            ctx.strokeStyle = ft.strokeStyle || 'black';
            ctx.lineWidth = ft.lineWidth || 3;
            if (ft.shadowColor) {
                ctx.shadowColor = ft.shadowColor;
                ctx.shadowBlur = ft.shadowBlur || 15;
            } else {
                ctx.shadowBlur = 0;
            }
            ctx.strokeText(ft.text, ft.x, ft.y);
            
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;
        }

        ctx.restore(); // Restore context for UI
        }

        // Layer 6: UI Overlay (Screen Space)
        if (state.gameState !== 'LOBBY') {
            const config = levelConfig[state.currentLevel] || levelConfig[1];
            const maxKills = getScaledKillRequirement(config);
            // 绘制击杀数
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`击杀: ${state.killCount} / ${maxKills} (关卡 ${state.currentLevel})`, 20, 20);

            // 绘制本局灵石
            ctx.fillStyle = '#87CEEB';
            ctx.fillText(`灵石: ${state.sessionSpiritStones}`, 20, 50);

            // 绘制灵魂收集进度
            const soulCapacity = state.soulCapacity || 20;
            const soulCount = state.soulCount || 0;
            const soulRatio = Math.max(0, Math.min(1, soulCapacity > 0 ? (soulCount / soulCapacity) : 0));
            const barX = 20;
            const barY = 80;
            const barW = 320;
            const barH = 24;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(barX - 8, barY - 12, barW + 70, barH + 34);
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = state.soulReady ? '#FFD54F' : '#BA68C8';
            ctx.fillRect(barX, barY, barW * soulRatio, barH);
            ctx.strokeStyle = '#FFFDE7';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barW, barH);

            ctx.fillStyle = '#FFFDE7';
            ctx.font = '18px "Microsoft YaHei"';
            ctx.textBaseline = 'middle';
            ctx.fillText(`灵魂 ${soulCount.toFixed(1)} / ${soulCapacity}`, barX + 10, barY + barH / 2);

            if (state.soulReady && state.gameState === 'PLAYING') {
                ctx.textBaseline = 'top';
                ctx.fillStyle = '#FFD54F';
                ctx.font = '18px Arial';
                ctx.fillText('按 F 释放灵魂唤醒', barX, barY + barH + 25);
            }
        }
    }
}
