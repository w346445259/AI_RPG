export const bodyRefiningConfig = {
    // 每一阶的累积加成属性
    tiers: {
        1: { damage: 1, maxHp: 10, defense: 1 },
        2: { damage: 2, maxHp: 20, defense: 2 },
        3: { damage: 3, maxHp: 30, defense: 3 },
        4: { damage: 4, maxHp: 40, defense: 4 },
        5: { damage: 5, maxHp: 50, defense: 5 },
        6: { damage: 6, maxHp: 60, defense: 6 },
        7: { damage: 7, maxHp: 70, defense: 7 },
        8: { damage: 8, maxHp: 80, defense: 8 },
        9: { damage: 9, maxHp: 90, defense: 9 }
    },
    // 计算提升到下一阶（targetTier）所需的灵气
    // 公式：2^N * 10
    getCost: (targetTier) => Math.pow(2, targetTier) * 10
};

export const realmBaseConfig = {
    1: { // 锻体期起始
        name: "锻体期",
        cost: 20,
        stats: { damage: 5, maxHp: 50, defense: 0 }
    },
    10: { // 筑基期起始 (锻体9阶之后)
        name: "筑基期",
        cost: 10000,
        stats: { damage: 20, maxHp: 200, defense: 10 }
    }
};
