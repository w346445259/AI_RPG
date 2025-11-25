export const bodyRefiningConfig = {
    // 每一阶的累积加成属性
    tiers: {
        1: { strength: 1, agility: 1, maxHp: 10, defense: 1 },
        2: { strength: 2, agility: 2, maxHp: 20, defense: 2 },
        3: { strength: 3, agility: 3, maxHp: 30, defense: 3 },
        4: { strength: 4, agility: 4, maxHp: 40, defense: 4 },
        5: { strength: 5, agility: 5, maxHp: 50, defense: 5 },
        6: { strength: 6, agility: 6, maxHp: 60, defense: 6 },
        7: { strength: 7, agility: 7, maxHp: 70, defense: 7 },
        8: { strength: 8, agility: 8, maxHp: 80, defense: 8 },
        9: { strength: 9, agility: 9, maxHp: 90, defense: 9 }
    },
    // 计算提升到下一阶（targetTier）所需的灵气
    // 公式：2^N * 10
    getCost: (targetTier) => Math.pow(2, targetTier) * 10
};

export const realmBaseConfig = {
    1: { // 锻体期起始
        name: "锻体期",
        cost: 20,
        stats: { strength: 5, agility: 5, comprehension: 0, maxHp: 50, defense: 0 }
    },
    10: { // 筑基期起始 (锻体9阶之后)
        name: "筑基期",
        cost: 10000,
        stats: { strength: 20, agility: 20, comprehension: 10, maxHp: 200, defense: 10 }
    }
};
