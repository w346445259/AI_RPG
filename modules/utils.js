import { state } from './state.js';

export function getNearestMonster() {
    if (state.monsters.length === 0) return null;

    let nearest = null;
    let minDist = Infinity;

    for (const m of state.monsters) {
        const dx = m.x - state.player.x;
        const dy = m.y - state.player.y;
        const dist = dx * dx + dy * dy; // 距离平方足以用于比较
        if (dist < minDist) {
            minDist = dist;
            nearest = m;
        }
    }
    return nearest;
}

export function getNearestMonsterExcluding(x, y, excludeIds) {
    if (state.monsters.length === 0) return null;

    let nearest = null;
    let minDist = Infinity;

    for (const m of state.monsters) {
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
