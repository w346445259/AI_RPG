export const weaponConfig = {
    1: {
        id: 1,
        type: 'penetrate',
        name: "默认手枪",
        damageMultiplier: 0.7, // 70%
        fireRate: 1000, // 1秒
        projectileCount: 1,
        penetration: 1,
        burstCount: 2,
        burstDelay: 100, // 毫秒
        visual: {
            color: '#555',
            width: 8,
            length: 20
        },
        iconPath: 'assets/pistol.png'
    },
    2: {
        id: 2,
        type: 'bounce',
        name: "魔法法杖",
        damageMultiplier: 0.6,
        fireRate: 800,
        projectileCount: 1,
        bounceCount: 3,
        speed: 12,
        visual: {
            color: '#9C27B0',
            width: 6,
            length: 25
        },
        iconPath: 'assets/wand.png'
    }
};
