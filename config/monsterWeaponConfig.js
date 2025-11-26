export const monsterWeaponConfig = {
    4: {
        id: 4,
        type: 'melee-sweep',
        name: "木棍",
        damageMultiplier: 0.5,
        fireRate: 1000,
        range: 80,
        angle: 120, // 扇形角度
        visual: {
            color: '#8D6E63',
            width: 6,
            length: 34
        },
        icon: '🪵'
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
        icon: '🏹'
    }
};
