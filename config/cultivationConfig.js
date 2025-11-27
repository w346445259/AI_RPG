export const bodyRefiningConfig = {
    maxTier: 9,
    // 每一阶的累积加成属性 (大幅提升，让修炼更有成就感)
    tiers: {
        1: { strength: 5, agility: 2, physique: 5 },
        2: { strength: 10, agility: 4, physique: 10 },
        3: { strength: 15, agility: 6, physique: 15 },
        4: { strength: 25, agility: 10, physique: 25 }, // 中期小爆发
        5: { strength: 35, agility: 14, physique: 35 },
        6: { strength: 45, agility: 18, physique: 45 },
        7: { strength: 60, agility: 25, physique: 60 }, // 后期大爆发
        8: { strength: 75, agility: 32, physique: 75 },
        9: { strength: 100, agility: 40, physique: 100 }
    },
    // 计算提升到下一阶（targetTier）所需的气血
    // 曲线更平滑但呈指数增长: 100, 150, 225, 337...
    getCost: (targetTier) => Math.floor(100 * Math.pow(1.5, targetTier - 1))
};

export const realmBaseConfig = {
    1: { // 凡人 -> 锻体期
        name: "锻体期",
        cost: 50, // 入门门槛稍高
        stats: { strength: 0, agility: 0, comprehension: 0, physique: 0, defense: 0 } // 初始无额外加成，全靠锻体阶数
    },
    10: { // 锻体9阶 -> 练气期
        name: "练气期",
        cost: 5000, // 突破瓶颈 (气血)
        stats: { strength: 150, agility: 60, comprehension: 20, physique: 200, defense: 80 } // 质变
    }
};

export const qiCondensationConfig = {
    maxTier: 9, // 练气 1-9 层
    // 练气期每层加成 (主要提升灵力、悟性、以及少量基础属性)
    tiers: {
        1: { strength: 10, agility: 5, comprehension: 5, physique: 10, spiritualPower: 100 },
        2: { strength: 20, agility: 10, comprehension: 10, physique: 20, spiritualPower: 200 },
        3: { strength: 30, agility: 15, comprehension: 15, physique: 30, spiritualPower: 350 },
        4: { strength: 45, agility: 20, comprehension: 20, physique: 45, spiritualPower: 550 },
        5: { strength: 60, agility: 25, comprehension: 25, physique: 60, spiritualPower: 800 },
        6: { strength: 80, agility: 30, comprehension: 30, physique: 80, spiritualPower: 1100 },
        7: { strength: 100, agility: 40, comprehension: 40, physique: 100, spiritualPower: 1500 },
        8: { strength: 125, agility: 50, comprehension: 50, physique: 125, spiritualPower: 2000 },
        9: { strength: 150, agility: 60, comprehension: 60, physique: 150, spiritualPower: 3000 }
    },
    // 练气期升级消耗的是灵气 (Reiki)
    getCost: (targetTier) => Math.floor(1000 * Math.pow(1.6, targetTier - 1))
};

// 气血锻体配置 (练气期及以后可用)
export const bodyStrengtheningConfig = {
    // 消耗气血 = 基础消耗 * (1.2 ^ 等级)
    getCost: (level) => Math.floor(500 * Math.pow(1.2, level)),
    // 每级增加体魄
    physiquePerLevel: 5
};
