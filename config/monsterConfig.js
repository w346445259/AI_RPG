export const monsterConfig = {
    // ID: 怪物属性
    1: {
        name: 'Basic Red',
        hp: 10,
        speed: 120, // Pixels per second (was 2)
        radius: 20,
        color: 'red',
        damage: 1,
        defense: 0,
        goldMin: 1,
        goldMax: 3,
        weaponId: 4, // 木棍
        windUpTime: 1000 // 攻击前摇时间 (ms)
    },
    2: {
        name: 'Ranged Blue',
        hp: 8,
        speed: 90, // Pixels per second (was 1.5)
        radius: 18,
        color: 'blue',
        damage: 1,
        defense: 0,
        goldMin: 2,
        goldMax: 4,
        weaponId: 3, // 长弓
        windUpTime: 1000 // 攻击前摇时间 (ms)
    }
};