export const weaponConfig = {
    4: {
        id: 4,
        type: 'melee',
        name: "木棍",
        damageMultiplier: 0.5,
        fireRate: 1000,
        range: 120,
        angle: 120, // 扇形角度
        visual: {
            color: '#8D6E63',
            width: 6,
            length: 50
        },
        iconPath: 'assets/stick.png'
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
        }
    }
};
