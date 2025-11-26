export const weaponConfig = {
    4: {
        id: 4,
        type: 'melee-sweep',
        name: "木棍",
        damageMultiplier: 0.5,
        fireRate: 1000,
        range: 80,
        angle: 120, // 扇形角度
        offset: 20, // 攻击圆心偏移量
        visual: {
            color: '#8D6E63',
            width: 6,
            length: 34
        },
        icon: '🪵'
    },
    5: {
        id: 5,
        type: 'melee-thrust',
        name: "长剑",
        damageMultiplier: 0.7,
        fireRate: 800,
        range: 150, // 刺击距离
        width: 40, // 刺击宽度
        visual: {
            color: '#E0E0E0', // 银色
            width: 4,
            length: 60
        },
        crafting: {
            materials: { 1: 10, 2: 5 }, // 10 Iron, 5 Wood
            description: "需消耗: 凡铁矿 x10, 木头 x5"
        },
        icon: '🗡️'
    },
    3: {
        id: 3,
        type: 'penetrate',
        name: "长弓",
        damageMultiplier: 0.5,
        fireRate: 1000,
        projectileCount: 1,
        penetration: 0,
        visual: {
            color: '#8D6E63',
            width: 4,
            length: 30
        },
        crafting: {
            materials: { 1: 5, 2: 10, 3: 5 }, // 5 Iron, 10 Wood, 5 Copper
            description: "需消耗: 木头 x10, 凡铁矿 x5, 凡铜矿 x5"
        },
        icon: '🏹'
    },
    6: {
        id: 6,
        type: 'melee-smash',
        name: "木槌",
        damageMultiplier: 1.0,
        fireRate: 1500,
        range: 35, // 伤害半径
        offset: 60, // 攻击中心距离玩家的距离
        visual: {
            color: '#8D6E63',
            radius: 35
        },
        crafting: {
            materials: { 2: 30 }, // 30 Wood
            description: "需消耗: 木头 x30"
        },
        icon: '🔨'
    }
};
