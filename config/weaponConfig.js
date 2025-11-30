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
        damageMultiplier: 0.25,
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
        damageMultiplier: 0.35,
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
            materials: { 6: 5 }, // 5 Refined Iron Ingot
            description: "需消耗: 精铁锭 x5"
        },
        icon: '🗡️'
    },
    13: {
        id: 13,
        type: 'penetrate',
        name: "精铁弓",
        grade: "凡品",
        category: 'refined-iron',
        damageMultiplier: 0.5,
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
            materials: { 6: 5 }, // 5 Refined Iron Ingot
            description: "需消耗: 精铁锭 x5"
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
            materials: { 6: 10 }, // 10 Refined Iron Ingot
            description: "需消耗: 精铁锭 x10"
        },
        icon: '🔨'
    },
    // Spirit-Infused Iron Weapons
    15: {
        id: 15,
        type: 'melee-sweep',
        name: "注灵铁棍",
        grade: "凡品",
        category: 'spirit-iron',
        damageMultiplier: 1.25,
        fireRate: 900,
        range: 95,
        angle: 135,
        offset: 20,
        visual: {
            color: '#4FC3F7',
            width: 6,
            length: 38
        },
        crafting: {
            materials: { 7: 5 }, // 5 Spirit-Infused Iron Ingot
            description: "需消耗: 注灵凡铁锭 x5"
        },
        icon: '🦯'
    },
    16: {
        id: 16,
        type: 'melee-thrust',
        name: "注灵铁剑",
        grade: "凡品",
        category: 'spirit-iron',
        damageMultiplier: 1.25,
        fireRate: 650,
        range: 170,
        width: 48,
        visual: {
            color: '#4FC3F7',
            width: 4,
            length: 68
        },
        crafting: {
            materials: { 7: 5 }, // 5 Spirit-Infused Iron Ingot
            description: "需消耗: 注灵凡铁锭 x5"
        },
        icon: '🗡️'
    },
    17: {
        id: 17,
        type: 'penetrate',
        name: "注灵铁弓",
        grade: "凡品",
        category: 'spirit-iron',
        damageMultiplier: 0.625,
        fireRate: 850,
        bulletSpeed: 420,
        projectileCount: 1,
        penetration: 2,
        visual: {
            color: '#4FC3F7',
            width: 4,
            length: 34
        },
        crafting: {
            materials: { 7: 5 }, // 5 Spirit-Infused Iron Ingot
            description: "需消耗: 注灵凡铁锭 x5"
        },
        icon: '🏹'
    },
    18: {
        id: 18,
        type: 'melee-smash',
        name: "注灵铁锤",
        grade: "凡品",
        category: 'spirit-iron',
        damageMultiplier: 2.5,
        fireRate: 1350,
        range: 45,
        offset: 70,
        visual: {
            color: '#4FC3F7',
            radius: 45
        },
        crafting: {
            materials: { 7: 10 }, // 10 Spirit-Infused Iron Ingot
            description: "需消耗: 注灵凡铁锭 x10"
        },
        icon: '🔨'
    },
    // Spirit-Infused Refined Iron Weapons
    19: {
        id: 19,
        type: 'melee-sweep',
        name: "注灵精铁棍",
        grade: "凡品",
        category: 'spirit-refined-iron',
        damageMultiplier: 1.5,
        fireRate: 850,
        range: 100,
        angle: 140,
        offset: 20,
        visual: {
            color: '#00BCD4',
            width: 6,
            length: 40
        },
        crafting: {
            materials: { 9: 5 }, // 5 Spirit-Infused Refined Iron Ingot
            description: "需消耗: 注灵精铁锭 x5"
        },
        icon: '🦯'
    },
    20: {
        id: 20,
        type: 'melee-thrust',
        name: "注灵精铁剑",
        grade: "凡品",
        category: 'spirit-refined-iron',
        damageMultiplier: 1.5,
        fireRate: 600,
        range: 180,
        width: 50,
        visual: {
            color: '#00BCD4',
            width: 4,
            length: 70
        },
        crafting: {
            materials: { 9: 5 }, // 5 Spirit-Infused Refined Iron Ingot
            description: "需消耗: 注灵精铁锭 x5"
        },
        icon: '🗡️'
    },
    21: {
        id: 21,
        type: 'penetrate',
        name: "注灵精铁弓",
        grade: "凡品",
        category: 'spirit-refined-iron',
        damageMultiplier: 0.75,
        fireRate: 800,
        bulletSpeed: 450,
        projectileCount: 1,
        penetration: 3,
        visual: {
            color: '#00BCD4',
            width: 4,
            length: 36
        },
        crafting: {
            materials: { 9: 5 }, // 5 Spirit-Infused Refined Iron Ingot
            description: "需消耗: 注灵精铁锭 x5"
        },
        icon: '🏹'
    },
    22: {
        id: 22,
        type: 'melee-smash',
        name: "注灵精铁锤",
        grade: "凡品",
        category: 'spirit-refined-iron',
        damageMultiplier: 3.0,
        fireRate: 1300,
        range: 50,
        offset: 75,
        visual: {
            color: '#00BCD4',
            radius: 50
        },
        crafting: {
            materials: { 9: 10 }, // 10 Spirit-Infused Refined Iron Ingot
            description: "需消耗: 注灵精铁锭 x10"
        },
        icon: '🔨'
    },
    23: {
        id: 23,
        type: 'melee-sweep',
        name: "注灵铁杖",
        grade: "凡品",
        category: 'spirit-iron',
        damageMultiplier: 0.4,
        fireRate: 1100,
        range: 90,
        angle: 120,
        offset: 20,
        visual: {
            color: '#795548',
            width: 8,
            length: 40
        },
        stats: {
            spellPower: 0.3 // +30% 法术强度
        },
        crafting: {
            materials: { 2: 10, 7: 5 }, // 10 Wood, 5 Spirit-Infused Iron Ingot
            description: "需消耗: 木头 x10, 注灵凡铁锭 x5"
        },
        icon: '🦯'
    },
    24: {
        id: 24,
        type: 'melee-sweep',
        name: "注灵精铁杖",
        grade: "良品",
        category: 'spirit-refined-iron',
        damageMultiplier: 0.6,
        fireRate: 1000,
        range: 100,
        angle: 130,
        offset: 20,
        visual: {
            color: '#5D4037',
            width: 8,
            length: 45
        },
        stats: {
            spellPower: 0.6 // +60% 法术强度
        },
        crafting: {
            materials: { 2: 20, 9: 5 }, // 20 Wood, 5 Spirit-Infused Refined Iron Ingot
            description: "需消耗: 木头 x20, 注灵精铁锭 x5"
        },
        icon: '🪄'
    }
};
