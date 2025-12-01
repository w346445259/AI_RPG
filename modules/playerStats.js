import { state } from './state.js';
import { playerConfig } from '../config/playerConfig.js';
import { bodyRefiningConfig, realmBaseConfig, qiCondensationConfig, bodyStrengtheningConfig } from '../config/cultivationConfig.js';
import { buffConfig } from '../config/buffConfig.js';
import { formationConfig } from '../config/formationConfig.js';
import { affixConfig } from '../config/affixConfig.js';
import { weaponConfig } from '../config/weaponConfig.js';
import { getTechniqueBonuses } from './technique.js';
import { TechniqueBonus } from '../config/techniqueConfig.js';

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
    let bonusSpiritRegen = 0;
    let bonusSpellPower = 0;
    let bonusCultivationSpeed = 0;
    let bonusReikiRegen = 0;

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

    // Weapon Stats
    if (state.equippedWeaponId) {
        const weapon = weaponConfig[state.equippedWeaponId];
        if (weapon && weapon.stats) {
            if (weapon.stats.spellPower) bonusSpellPower += weapon.stats.spellPower;
            // Add other weapon stats here if needed in the future
        }
    }

    // Technique Bonuses (功法加成)
    const techniqueBonuses = getTechniqueBonuses();
    if (techniqueBonuses) {
        if (techniqueBonuses[TechniqueBonus.STRENGTH]) bonusStrength += techniqueBonuses[TechniqueBonus.STRENGTH];
        if (techniqueBonuses[TechniqueBonus.AGILITY]) bonusAgility += techniqueBonuses[TechniqueBonus.AGILITY];
        if (techniqueBonuses[TechniqueBonus.PHYSIQUE]) bonusPhysique += techniqueBonuses[TechniqueBonus.PHYSIQUE];
        if (techniqueBonuses[TechniqueBonus.COMPREHENSION]) bonusComprehension += techniqueBonuses[TechniqueBonus.COMPREHENSION];
        if (techniqueBonuses[TechniqueBonus.DEFENSE]) bonusDefense += techniqueBonuses[TechniqueBonus.DEFENSE];
        if (techniqueBonuses[TechniqueBonus.SPIRITUAL_POWER]) bonusSpiritualPower += techniqueBonuses[TechniqueBonus.SPIRITUAL_POWER];
        if (techniqueBonuses[TechniqueBonus.CRIT_CHANCE]) bonusCritChance += techniqueBonuses[TechniqueBonus.CRIT_CHANCE];
        if (techniqueBonuses[TechniqueBonus.CRIT_DAMAGE]) bonusCritDamage += techniqueBonuses[TechniqueBonus.CRIT_DAMAGE];
        if (techniqueBonuses[TechniqueBonus.CULTIVATION_SPEED]) bonusCultivationSpeed += techniqueBonuses[TechniqueBonus.CULTIVATION_SPEED];
        if (techniqueBonuses[TechniqueBonus.REIKI_REGEN]) bonusReikiRegen += techniqueBonuses[TechniqueBonus.REIKI_REGEN];
    }

    const totalPhysique = playerConfig.physique + bonusPhysique;
    let maxHp = playerConfig.maxHp + (totalPhysique * 10);
    let hpRegen = totalPhysique * 0.1;
    
    let finalStrength = playerConfig.strength + bonusStrength;
    let finalAgility = playerConfig.agility + bonusAgility;
    let finalComprehension = playerConfig.comprehension + bonusComprehension;
    let finalDefense = playerConfig.defense + bonusDefense;
    let finalSpiritualPower = (playerConfig.spiritualPower ?? 10) + bonusSpiritualPower;
    // let finalSpiritRegen = (playerConfig.spiritRegen ?? 1) + bonusSpiritRegen; // Deprecated
    let finalSpeed = playerConfig.speed;
    let finalCritChance = (playerConfig.critChance || 0) + bonusCritChance;
    let finalCritDamage = (playerConfig.critDamage || 2.0) + bonusCritDamage;
    let finalSoulAmp = (playerConfig.soulAmplification || 0) + bonusSoulAmp;
    let finalSpellPower = (playerConfig.spellPower || 0) + bonusSpellPower;

    // Mana Calculation
    // 1 Spiritual Power = 10 Max Mana + 0.1 Mana Regen
    let maxMana = (finalSpiritualPower * 10);
    let manaRegen = (finalSpiritualPower * 0.1) + bonusSpiritRegen;

    const createMultiplierBucket = () => ({
        strength: 0,
        defense: 0,
        agility: 0,
        speed: 0,
        hpRegen: 0,
        critChance: 0,
        critDamage: 0,
        soulAmp: 0,
        spiritualPower: 0,
        manaRegen: 0,
        spellPower: 0
    });

    const multiplierBuckets = {
        general: createMultiplierBucket(),
        formation: createMultiplierBucket(),
        affix: createMultiplierBucket()
    };

    const additiveBonuses = {
        critDamage: 0
    };

    const addLinearMultiplier = (stat, value, source = 'general') => {
        if (!stat || !multiplierBuckets[source]) return;
        if (multiplierBuckets[source][stat] === undefined) return;
        multiplierBuckets[source][stat] += value;
    };

    const addAdditiveBonus = (stat, value) => {
        if (additiveBonuses[stat] === undefined) return;
        additiveBonuses[stat] += value;
    };

    // Helper to apply buff stats
    const applyBuffStats = (config, source = 'general') => {
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
            if (config.stat === 'spiritualPower') finalSpiritualPower += value;
            if (config.stat === 'manaRegen') manaRegen += value;
            if (config.stat === 'spellPower') finalSpellPower += value;
        } else if (config.type === 'stat_multiplier') {
            if (config.stat === 'critDamage' && source === 'affix') {
                addAdditiveBonus('critDamage', value);
            } else {
                addLinearMultiplier(config.stat, value, source);
            }
        }
    };

    // Apply Buffs
    if (state.activeBuffs) {
        state.activeBuffs.forEach(buff => {
            const config = buffConfig[buff.id];
            if (config) applyBuffStats(config, 'general');
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
                            if (bConfig) applyBuffStats(bConfig, 'formation');
                        });
                    }
                }
            }
        }
    }

    if (state.activeAffixes && state.activeAffixes.length > 0) {
        state.activeAffixes.forEach(affixId => {
            const config = affixConfig[affixId];
            if (config) applyBuffStats(config, 'affix');
        });
    }

    const bucketValue = (bucket, key) => 1 + (multiplierBuckets[bucket][key] || 0);

    const applyBucket = (bucket) => {
        finalStrength *= bucketValue(bucket, 'strength');
        finalDefense *= bucketValue(bucket, 'defense');
        finalAgility *= bucketValue(bucket, 'agility');
        finalSpeed *= bucketValue(bucket, 'speed');
        hpRegen *= bucketValue(bucket, 'hpRegen');
        finalCritChance *= bucketValue(bucket, 'critChance');
        finalCritDamage *= bucketValue(bucket, 'critDamage');
        finalSoulAmp *= bucketValue(bucket, 'soulAmp');
        finalSpiritualPower *= bucketValue(bucket, 'spiritualPower');
        manaRegen *= bucketValue(bucket, 'manaRegen');
        finalSpellPower *= bucketValue(bucket, 'spellPower');
    };

    // 记录乘算前的基础值 (Config + Realm + Flat Buffs)
    const baseBeforeLinear = {
        strength: Math.floor(finalStrength),
        defense: Math.floor(finalDefense),
        agility: Math.floor(finalAgility),
        speed: Math.floor(finalSpeed),
        hpRegen,
        critChance: finalCritChance,
        critDamage: finalCritDamage,
        soulAmp: finalSoulAmp,
        spiritualPower: finalSpiritualPower,
        manaRegen: manaRegen,
        spellPower: finalSpellPower
    };

    applyBucket('general');

    const applyRemainingBuckets = () => {
        applyBucket('formation');
        applyBucket('affix');
    };

    applyRemainingBuckets();

    finalCritDamage += additiveBonuses.critDamage || 0;

    const buildFormula = ({ base = 0, general = 0, formation = 0, affix = 0, affixAdd = 0 }) => ({
        base,
        general,
        formation,
        affix,
        affixAdd
    });

    const getBucketStat = (bucket, stat) => multiplierBuckets[bucket][stat] ?? 0;

    const statFormulas = {
        strength: buildFormula({ base: baseBeforeLinear.strength, general: getBucketStat('general', 'strength'), formation: getBucketStat('formation', 'strength'), affix: getBucketStat('affix', 'strength') }),
        defense: buildFormula({ base: baseBeforeLinear.defense, general: getBucketStat('general', 'defense'), formation: getBucketStat('formation', 'defense'), affix: getBucketStat('affix', 'defense') }),
        agility: buildFormula({ base: baseBeforeLinear.agility, general: getBucketStat('general', 'agility'), formation: getBucketStat('formation', 'agility'), affix: getBucketStat('affix', 'agility') }),
        speed: buildFormula({ base: baseBeforeLinear.speed, general: getBucketStat('general', 'speed'), formation: getBucketStat('formation', 'speed'), affix: getBucketStat('affix', 'speed') }),
        hpRegen: buildFormula({ base: baseBeforeLinear.hpRegen, general: getBucketStat('general', 'hpRegen'), formation: getBucketStat('formation', 'hpRegen'), affix: getBucketStat('affix', 'hpRegen') }),
        critChance: buildFormula({ base: baseBeforeLinear.critChance, general: getBucketStat('general', 'critChance'), formation: getBucketStat('formation', 'critChance'), affix: getBucketStat('affix', 'critChance') }),
        critDamage: buildFormula({
            base: baseBeforeLinear.critDamage,
            general: getBucketStat('general', 'critDamage'),
            formation: getBucketStat('formation', 'critDamage'),
            affix: getBucketStat('affix', 'critDamage'),
            affixAdd: additiveBonuses.critDamage
        }),
        soulAmplification: buildFormula({ base: baseBeforeLinear.soulAmp, general: getBucketStat('general', 'soulAmp'), formation: getBucketStat('formation', 'soulAmp'), affix: getBucketStat('affix', 'soulAmp') }),
        physique: buildFormula({ base: Math.floor(totalPhysique) }),
        comprehension: buildFormula({ base: Math.floor(finalComprehension) }),
        maxHp: buildFormula({ base: Math.floor(maxHp) }),
        spiritualPower: buildFormula({ base: baseBeforeLinear.spiritualPower, general: getBucketStat('general', 'spiritualPower'), formation: getBucketStat('formation', 'spiritualPower'), affix: getBucketStat('affix', 'spiritualPower') }),
        manaRegen: buildFormula({ base: baseBeforeLinear.manaRegen, general: getBucketStat('general', 'manaRegen'), formation: getBucketStat('formation', 'manaRegen'), affix: getBucketStat('affix', 'manaRegen') }),
        spellPower: buildFormula({ base: baseBeforeLinear.spellPower, general: getBucketStat('general', 'spellPower'), formation: getBucketStat('formation', 'spellPower'), affix: getBucketStat('affix', 'spellPower') })
    };

    const normalizedCritChance = Math.min(1, Math.max(0, finalCritChance));
    const normalizedCritDamage = Math.max(1, finalCritDamage);

    // Recalculate Max Mana based on final Spiritual Power
    maxMana = Math.floor(finalSpiritualPower * 10);

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
        soulAmplification: Math.max(0, finalSoulAmp),
        manaRegen: Math.max(0, manaRegen),
        maxMana: maxMana,
        spellPower: finalSpellPower,
        cultivationSpeed: bonusCultivationSpeed, // 修炼速度加成
        reikiRegen: bonusReikiRegen, // 灵气回复加成
        statFormulas
    };
}
