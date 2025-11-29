export const smeltingConfig = {
    'iron': {
        id: 'iron',
        name: '凡铁锭',
        category: 'basic', // basic smelting with ore
        input: { 1: 2 }, // 凡铁矿 x2
        output: { 4: 1 }, // 凡铁锭 x1
        description: "消耗: 凡铁矿 x2"
    },
    'copper': {
        id: 'copper',
        name: '凡铜锭',
        category: 'basic',
        input: { 3: 2 }, // 凡铜矿 x2
        output: { 5: 1 }, // 凡铜锭 x1
        description: "消耗: 凡铜矿 x2"
    },
    'refined-iron': {
        id: 'refined-iron',
        name: '精铁锭',
        category: 'basic',
        input: { 4: 2 }, // 凡铁锭 x2
        output: { 6: 1 }, // 精铁锭 x1
        description: "消耗: 凡铁锭 x2"
    },
    // Spirit infusion recipes (灵气注入)
    'spirit-iron': {
        id: 'spirit-iron',
        name: '注灵凡铁锭',
        category: 'spirit',
        input: { 4: 1 }, // 凡铁锭 x1
        reikiCost: 1000, // 灵气消耗
        output: { 7: 1 }, // 注灵凡铁锭 x1
        description: "消耗: 凡铁锭 x1 + 1000 灵气"
    },
    'spirit-copper': {
        id: 'spirit-copper',
        name: '注灵凡铜锭',
        category: 'spirit',
        input: { 5: 1 }, // 凡铜锭 x1
        reikiCost: 2000,
        output: { 8: 1 }, // 注灵凡铜锭 x1
        description: "消耗: 凡铜锭 x1 + 2000 灵气"
    },
    'spirit-refined-iron': {
        id: 'spirit-refined-iron',
        name: '注灵精铁锭',
        category: 'spirit',
        input: { 6: 1 }, // 精铁锭 x1
        reikiCost: 10000,
        output: { 9: 1 }, // 注灵精铁锭 x1
        description: "消耗: 精铁锭 x1 + 10000 灵气"
    }
};
