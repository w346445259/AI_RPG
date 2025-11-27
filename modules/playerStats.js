import { state } from './state.js';
import { playerConfig } from '../config/playerConfig.js';
import { bodyRefiningConfig, realmBaseConfig, qiCondensationConfig, bodyStrengtheningConfig } from '../config/cultivationConfig.js';

export function getPlayerStats() {
    let bonusStrength = 0;
    let bonusAgility = 0;
    let bonusComprehension = 0;
    let bonusPhysique = 0;
    let bonusDefense = 0;
    let bonusSpiritualPower = 0;

    // 境界基础加成 (Realm Base Stats)
    for (const stageStr in realmBaseConfig) {
        const stageThreshold = parseInt(stageStr);
        if (state.cultivationStage >= stageThreshold) {
            const bonus = realmBaseConfig[stageThreshold].stats;
            bonusStrength += (bonus.strength || 0);
            bonusAgility += (bonus.agility || 0);
            bonusComprehension += (bonus.comprehension || 0);
            bonusPhysique += (bonus.physique || 0);
            bonusDefense += (bonus.defense || 0);
            bonusSpiritualPower += (bonus.spiritualPower || 0);
        }
    }

    // 锻体期加成 (Stage 1-9)
    if (state.cultivationStage >= 1) {
        // 如果超过9阶，固定为9阶的加成 (因为后续有练气期的叠加)
        const tier = Math.min(state.cultivationStage, 9);
        const tierData = bodyRefiningConfig.tiers[tier];
        if (tierData) {
            bonusStrength += (tierData.strength || 0);
            bonusAgility += (tierData.agility || 0);
            // bonusComprehension += (tierData.comprehension || 0);
            bonusPhysique += (tierData.physique || 0);
            bonusDefense += (tierData.defense || 0);
        }
    }

    // 练气期加成 (Stage 10+)
    if (state.cultivationStage >= 10) {
        // 练气期层数 = 总阶数 - 9
        const qiTier = Math.min(state.cultivationStage - 9, qiCondensationConfig.maxTier);
        const qiData = qiCondensationConfig.tiers[qiTier];
        if (qiData) {
            bonusStrength += (qiData.strength || 0);
            bonusAgility += (qiData.agility || 0);
            bonusComprehension += (qiData.comprehension || 0);
            bonusPhysique += (qiData.physique || 0);
            bonusSpiritualPower += (qiData.spiritualPower || 0);
            // bonusDefense += (qiData.defense || 0);
        }
    }

    // 气血锻体加成 (额外体魄、力量、敏捷)
    if (state.bodyStrengtheningLevel > 0) {
        // 假设每级增加 5 体魄, 2 力量, 1 敏捷
        bonusPhysique += state.bodyStrengtheningLevel * bodyStrengtheningConfig.physiquePerLevel;
        bonusStrength += state.bodyStrengtheningLevel * 2;
        bonusAgility += state.bodyStrengtheningLevel * 1;
    }

    const totalPhysique = playerConfig.physique + bonusPhysique;
    const maxHp = playerConfig.maxHp + (totalPhysique * 10);
    const hpRegen = totalPhysique * 0.1;

    return {
        strength: playerConfig.strength + bonusStrength,
        agility: playerConfig.agility + bonusAgility,
        comprehension: playerConfig.comprehension + bonusComprehension,
        defense: playerConfig.defense + bonusDefense,
        physique: totalPhysique,
        spiritualPower: bonusSpiritualPower, // 灵力 (新增属性)
        maxHp: maxHp,
        hpRegen: hpRegen
    };
}
