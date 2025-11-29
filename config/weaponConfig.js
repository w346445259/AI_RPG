export const weaponConfig = {
    4: {
        id: 4,
        type: 'melee-sweep',
        name: "木棍",
        grade: "凡品",
        category: 'wood',
        damageMultiplier: 0.25,
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
        grade: "凡品",
        category: 'iron',
        damageMultiplier: 0.35,
        fireRate: 800,
        range: 150, // 刺击距离
        width: 40, // 刺击宽度
        visual: {
            color: '#E0E0E0', // 银色
            width: 4,
            length: 60
        },
        crafting: {
            materials: { 2: 2, 4: 5 }, // 2 Wood, 5 Iron Ingot
            description: "需消耗: 木头 x2, 凡铁锭 x5"
        },
        icon: '🗡️'
    },
    7: {
        id: 7,
        type: 'melee-thrust',
        name: "木剑",
        grade: "凡品",
        category: 'wood',
        damageMultiplier: 0.5,
        fireRate: 800,
        range: 150, // 刺击距离
        width: 40, // 刺击宽度
        visual: {
            color: '#8D6E63', // 木色
            width: 4,
            length: 60
        },
        crafting: {
            materials: { 2: 20 }, // 20 Wood
            description: "需消耗: 木头 x20"
        },
        icon: '🗡️'
    },
    3: {
        id: 3,
        type: 'penetrate',
        name: "长弓",
        grade: "凡品",
        category: 'wood',
        damageMultiplier: 0.5,
        fireRate: 1000,
        bulletSpeed: 360,
        projectileCount: 1,
        penetration: 0,
        visual: {
            color: '#8D6E63',
            width: 4,
            length: 30
        },
        crafting: {
            materials: { 2: 20 }, // 20 Wood
            description: "需消耗: 木头 x20"
        },
        icon: '🏹'
    },
    6: {
        id: 6,
        type: 'melee-smash',
        name: "木槌",
        grade: "凡品",
        category: 'wood',
        damageMultiplier: 0.5,
        fireRate: 1500,
        range: 35, // 伤害半径
        offset: 60, // 攻击中心距离玩家的距离
        visual: {
            color: '#8D6E63',
            radius: 35
        },
        crafting: {
            materials: { 2: 20 }, // 20 Wood
            description: "需消耗: 木头 x20"
        },
        icon: '🔨'
    },
    // Iron Weapons
    8: {
        id: 8,
        type: 'melee-sweep',
        name: "铁棍",
        grade: "凡品",
        category: 'iron',
        damageMultiplier: 0.7,
        fireRate: 1000,
        range: 80,
        angle: 120,
        offset: 20,
        visual: {
            color: '#757575',
            width: 6,
            length: 34
        },
        crafting: {
            materials: { 4: 5 }, // 5 Iron Ingot
            description: "需消耗: 凡铁锭 x5"
        },
        icon: '🦯'
    },
    9: {
        id: 9,
        type: 'penetrate',
        name: "铁弓",
        grade: "凡品",
        category: 'iron',
        damageMultiplier: 0.7,
        fireRate: 1000,
        bulletSpeed: 380,
        projectileCount: 1,
        penetration: 1,
        visual: {
            color: '#757575',
            width: 4,
            length: 30
        },
        crafting: {
            materials: { 2: 5, 4: 5 }, // 5 Wood, 5 Iron Ingot
            description: "需消耗: 木头 x5, 凡铁锭 x5"
        },
        icon: '🏹'
    },
    10: {
        id: 10,
        type: 'melee-smash',
        name: "铁锤",
        grade: "凡品",
        category: 'iron',
        damageMultiplier: 1.4,
        fireRate: 1500,
        range: 35,
        offset: 60,
        visual: {
            color: '#757575',
            radius: 35
        },
        crafting: {
            materials: { 2: 5, 4: 10 }, // 5 Wood, 10 Iron Ingot
            description: "需消耗: 木头 x5, 凡铁锭 x10"
        },
        icon: '🔨'
    },
    // Refined Iron Weapons
    11: {
        id: 11,
        type: 'melee-sweep',
        name: "精铁棍",
        grade: "凡品",
        category: 'refined-iron',
        damageMultiplier: 1.0,
        fireRate: 900,
        range: 90,
        angle: 130,
        offset: 20,
        visual: {
            color: '#CFD8DC',
            width: 6,
            length: 36
        },
        crafting: {
            materials: { 6: 5 }, // 5 Refined Iron Ingot
            description: "需消耗: 精铁锭 x5"
        },
        icon: '🦯'
    },
    12: {
        id: 12,
        type: 'melee-thrust',
        name: "精铁剑",
        grade: "凡品",
        category: 'refined-iron',
        damageMultiplier: 1.0,
        fireRate: 700,
        range: 160,
        width: 45,
        visual: {
            color: '#CFD8DC',
            width: 4,
            length: 65
        },
        crafting: {
            materials: { 2: 2, 6: 5 }, // 2 Wood, 5 Refined Iron Ingot
            description: "需消耗: 木头 x2, 精铁锭 x5"
        },
        icon: '🗡️'
    },
    13: {
        id: 13,
        type: 'penetrate',
        name: "精铁弓",
        grade: "凡品",
        category: 'refined-iron',
        damageMultiplier: 1.0,
        fireRate: 900,
        bulletSpeed: 400,
        projectileCount: 1,
        penetration: 2,
        visual: {
            color: '#CFD8DC',
            width: 4,
            length: 32
        },
        crafting: {
            materials: { 2: 5, 6: 5 }, // 5 Wood, 5 Refined Iron Ingot
            description: "需消耗: 木头 x5, 精铁锭 x5"
        },
        icon: '🏹'
    },
    14: {
        id: 14,
        type: 'melee-smash',
        name: "精铁锤",
        grade: "凡品",
        category: 'refined-iron',
        damageMultiplier: 2.0,
        fireRate: 1400,
        range: 40,
        offset: 65,
        visual: {
            color: '#CFD8DC',
            radius: 40
        },
        crafting: {
            materials: { 2: 5, 6: 10 }, // 5 Wood, 10 Refined Iron Ingot
            description: "需消耗: 木头 x5, 精铁锭 x10"
        },
        icon: '🔨'
    }
};
