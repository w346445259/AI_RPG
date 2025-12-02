import { state } from './state.js';
import { bodyRefiningConfig, realmBaseConfig } from '../config/cultivationConfig.js';

export function getExpThresholds() {
    const thresholds = {};
    let acc = 0;
    
    // Stage 1 (凡人 -> 锻体1阶)
    acc += realmBaseConfig[1].cost; // 20
    thresholds[1] = acc;

    // Stage 2 to 9 (锻体期各阶)
    for (let i = 2; i <= 9; i++) {
        acc += bodyRefiningConfig.getCost(i);
        thresholds[i] = acc;
    }

    // Stage 10 (锻体 -> 筑基)
    acc += realmBaseConfig[10].cost;
    thresholds[10] = acc;

    return thresholds;
}

export function getStageName(stage) {
    if (stage === 0) return "凡人";
    if (stage >= 1 && stage <= 9) return `锻体期 ${stage}阶`;
    if (stage >= 10 && stage <= 18) return `练气期 ${stage - 9}层`;
    if (stage >= 19) return "筑基期";
    return "未知";
}

export function calculateStageFromExp(exp) {
    const thresholds = getExpThresholds();
    let stage = 0;
    for (let i = 1; i <= 10; i++) {
        if (exp >= thresholds[i]) {
            stage = i;
        } else {
            break;
        }
    }
    return stage;
}

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

const DEFENSE_SOFT_CAP = 400;

// 计算当前防御对应的百分比减伤
export function calculateDefenseReductionPercent(defenseValue) {
    const defense = Math.max(0, defenseValue || 0);
    const reduction = defense / (defense + DEFENSE_SOFT_CAP);
    return reduction * 100;
}

// 防御力减伤：采用非线性百分比，随着防御提升逐渐逼近100%但永远不会达到
export function calculateDamageAfterDefense(baseDamage, defenseValue) {
    if (baseDamage <= 0) return 0;
    const reductionPercent = calculateDefenseReductionPercent(defenseValue);
    const reductionRatio = reductionPercent / 100;
    const reducedDamage = baseDamage * (1 - reductionRatio);
    return Math.max(1, Math.round(reducedDamage));
}
