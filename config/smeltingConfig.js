export const smeltingConfig = {
    'iron': {
        id: 'iron',
        name: '凡铁锭',
        input: { 1: 2 }, // 凡铁矿 x2
        output: { 4: 1 }, // 凡铁锭 x1
        description: "消耗: 凡铁矿 x2"
    },
    'copper': {
        id: 'copper',
        name: '凡铜锭',
        input: { 3: 2 }, // 凡铜矿 x2
        output: { 5: 1 }, // 凡铜锭 x1
        description: "消耗: 凡铜矿 x2"
    },
    'refined-iron': {
        id: 'refined-iron',
        name: '精铁锭',
        input: { 4: 2 }, // 凡铁锭 x2
        output: { 6: 1 }, // 精铁锭 x1
        description: "消耗: 凡铁锭 x2"
    }
};
