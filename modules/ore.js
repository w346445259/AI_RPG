import { state } from './state.js';
import { levelConfig } from '../config/spawnConfig.js';
import { oreConfig } from '../config/oreConfig.js';
import { itemConfig } from '../config/itemConfig.js';
import { addSessionItem } from './inventory.js';

export function spawnOres() {
    let instanceIdCounter = 0;
    const config = levelConfig[state.currentLevel] || levelConfig[1];
    const min = config.resourceMin || 3;
    const max = config.resourceMax || 5;
    const types = config.resourceTypes || [1];
    const totalCount = Math.floor(Math.random() * (max - min + 1)) + min;

    for (let i = 0; i < totalCount; i++) {
        const typeId = types[Math.floor(Math.random() * types.length)];
        const oreConf = oreConfig[typeId];
        if (!oreConf) continue;
        state.ores.push({
            instanceId: instanceIdCounter++,
            configId: oreConf.id,
            x: Math.random() * (state.worldWidth - 100) + 50,
            y: Math.random() * (state.worldHeight - 100) + 50,
            size: oreConf.size,
            color: oreConf.color,
            capacity: oreConf.maxCapacity,
            maxCapacity: oreConf.maxCapacity,
            miningProgress: 0,
            miningTime: oreConf.miningTime,
            miningRange: oreConf.miningRange || 60,
            productId: oreConf.productId,
            isMining: false
        });
    }
}

export function updateOres(timestamp, dt) {
    let candidates = [];
    for (let i = 0; i < state.ores.length; i++) {
        const ore = state.ores[i];
        const dx = state.player.x - ore.x;
        const dy = state.player.y - ore.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ore.miningRange) {
            candidates.push({ ore: ore, dist: dist, index: i });
        } else {
            ore.isMining = false;
            ore.miningProgress = 0;
        }
    }

    if (candidates.length > 0) {
        candidates.sort((a, b) => a.dist - b.dist);
        const target = candidates[0];
        const targetOre = target.ore;
        targetOre.isMining = true;
        targetOre.miningProgress += dt * 1000;

        for (let i = 1; i < candidates.length; i++) {
            candidates[i].ore.isMining = false;
            candidates[i].ore.miningProgress = 0;
        }

        if (targetOre.miningProgress >= targetOre.miningTime) {
            targetOre.capacity--;
            targetOre.miningProgress = 0;
            addSessionItem(targetOre.productId, 1); 
            const product = itemConfig[targetOre.productId];
            state.floatingTexts.push({
                x: state.player.x,
                y: state.player.y - 30,
                text: `获得 ${product ? product.name : '未知物品'} x1`,
                life: 1.5,
                color: '#FFF'
            });
            if (targetOre.capacity <= 0) state.ores.splice(target.index, 1);
        }
    }
}
