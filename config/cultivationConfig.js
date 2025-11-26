export const bodyRefiningConfig = {
    maxTier: 9,
    // 每一阶的累积加成属性 (大幅提升，让修炼更有成就感)
    tiers: {
        1: { strength: 5, agility: 2, maxHp: 50, defense: 2 },
        2: { strength: 10, agility: 4, maxHp: 100, defense: 4 },
        3: { strength: 15, agility: 6, maxHp: 150, defense: 6 },
        4: { strength: 25, agility: 10, maxHp: 250, defense: 10 }, // 中期小爆发
        5: { strength: 35, agility: 14, maxHp: 350, defense: 14 },
        6: { strength: 45, agility: 18, maxHp: 450, defense: 18 },
        7: { strength: 60, agility: 25, maxHp: 600, defense: 25 }, // 后期大爆发
        8: { strength: 75, agility: 32, maxHp: 750, defense: 32 },
        9: { strength: 100, agility: 40, maxHp: 1000, defense: 40 }
    },
    // 计算提升到下一阶（targetTier）所需的经验
    // 曲线更平滑但呈指数增长: 100, 150, 225, 337...
    getCost: (targetTier) => Math.floor(100 * Math.pow(1.5, targetTier - 1))
};

export const realmBaseConfig = {
    1: { // 凡人 -> 锻体期
        name: "锻体期",
        cost: 50, // 入门门槛稍高
        stats: { strength: 0, agility: 0, comprehension: 0, maxHp: 0, defense: 0 } // 初始无额外加成，全靠锻体阶数
    },
    10: { // 锻体9阶 -> 筑基期
        name: "筑基期",
        cost: 5000, // 突破瓶颈
        stats: { strength: 150, agility: 60, comprehension: 20, maxHp: 2000, defense: 80 } // 质变
    }
};
