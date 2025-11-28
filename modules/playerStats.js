import { state } from './state.js';
import { playerConfig } from '../config/playerConfig.js';
import { bodyRefiningConfig, realmBaseConfig, qiCondensationConfig, bodyStrengtheningConfig } from '../config/cultivationConfig.js';
import { buffConfig } from '../config/buffConfig.js';
import { formationConfig } from '../config/formationConfig.js';
import { affixConfig } from '../config/affixConfig.js';

export function getPlayerStats() {
    let bonusStrength = 0;
    let bonusAgility = 0;
    let bonusComprehension = 0;
    let bonusPhysique = 0;
    let bonusDefense = 0;
    let bonusSpiritualPower = 0;
    let bonusCritChance = 0;
    let bonusCritDamage = 0;
    let bonusSoulAmp = 0;

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
    let maxHp = playerConfig.maxHp + (totalPhysique * 10);
    let hpRegen = totalPhysique * 0.1;
    
    let finalStrength = playerConfig.strength + bonusStrength;
    let finalAgility = playerConfig.agility + bonusAgility;
    let finalComprehension = playerConfig.comprehension + bonusComprehension;
    let finalDefense = playerConfig.defense + bonusDefense;
    let finalSpiritualPower = bonusSpiritualPower;
    let finalSpeed = playerConfig.speed;
    let finalCritChance = (playerConfig.critChance || 0) + bonusCritChance;
    let finalCritDamage = (playerConfig.critDamage || 2.0) + bonusCritDamage;
    let finalSoulAmp = (playerConfig.soulAmplification || 0) + bonusSoulAmp;

    // Helper to apply buff stats
    const applyBuffStats = (config) => {
        const value = config.value;
        if (config.type === 'stat_flat') {
            if (config.stat === 'strength') finalStrength += value;
            if (config.stat === 'defense') finalDefense += value;
            if (config.stat === 'agility') finalAgility += value;
            if (config.stat === 'speed') finalSpeed += value;
            if (config.stat === 'hpRegen') hpRegen += value;
            if (config.stat === 'critChance') finalCritChance += value;
            if (config.stat === 'critDamage') finalCritDamage += value;
            if (config.stat === 'soulAmp') finalSoulAmp += value;
        } else if (config.type === 'stat_multiplier') {
            if (config.stat === 'strength') finalStrength *= (1 + value);
            if (config.stat === 'defense') finalDefense *= (1 + value);
            if (config.stat === 'agility') finalAgility *= (1 + value);
            if (config.stat === 'speed') finalSpeed *= (1 + value);
            if (config.stat === 'hpRegen') hpRegen *= (1 + value);
            if (config.stat === 'critChance') finalCritChance *= (1 + value);
            if (config.stat === 'critDamage') finalCritDamage *= (1 + value);
            if (config.stat === 'soulAmp') finalSoulAmp *= (1 + value);
        }
    };

    // Apply Buffs
    if (state.activeBuffs) {
        state.activeBuffs.forEach(buff => {
            const config = buffConfig[buff.id];
            if (config) applyBuffStats(config);
        });
    }

    // Apply Combat Formations
    if (state.activeFormations) {
        for (const id in state.activeFormations) {
            if (state.activeFormations[id]) {
                const config = formationConfig[id];
                if (config && config.type === 'combat') {
                    // Handle buffIds
                    if (config.buffIds && Array.isArray(config.buffIds)) {
                        config.buffIds.forEach(buffId => {
                            const bConfig = buffConfig[buffId];
                            if (bConfig) applyBuffStats(bConfig);
                        });
                    }
                }
            }
        }
    }

    if (state.activeAffixes && state.activeAffixes.length > 0) {
        state.activeAffixes.forEach(affixId => {
            const config = affixConfig[affixId];
            if (config) applyBuffStats(config);
        });
    }

    const normalizedCritChance = Math.min(1, Math.max(0, finalCritChance));
    const normalizedCritDamage = Math.max(1, finalCritDamage);

    return {
        strength: Math.floor(finalStrength),
        agility: Math.floor(finalAgility),
        comprehension: Math.floor(finalComprehension),
        defense: Math.floor(finalDefense),
        physique: Math.floor(totalPhysique),
        spiritualPower: Math.floor(finalSpiritualPower),
        maxHp: Math.floor(maxHp),
        hpRegen: hpRegen,
        speed: Math.floor(finalSpeed),
        critChance: normalizedCritChance,
        critDamage: normalizedCritDamage,
        soulAmplification: Math.max(0, finalSoulAmp)
    };
}
