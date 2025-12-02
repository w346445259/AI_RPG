export const monsterConfig = {
    // ID: 怪物属性
    1: {
        name: '游荡傀儡',
        hp: 20, // 削弱血量，避免初期过于刮痧
        speed: 100, // 稍慢
        radius: 20,
        color: '#81C784', // 浅绿色
        damage: 80, // 伤害提升
        defense: 0,
        spiritStonesMin: 1,
        spiritStonesMax: 3,
        weaponId: 4, // 木棍
        windUpTime: 1200 // 攻击前摇时间 (ms)
    },
    2: {
        name: '迅捷灵影',
        hp: 30, // 血量较低
        speed: 120, // 速度较快 -> 降低速度，方便追击
        radius: 15,
        color: '#E57373', // 浅红色
        damage: 40, // 伤害较高
        defense: 0,
        spiritStonesMin: 2,
        spiritStonesMax: 5,
        weaponId: 3, // 长弓
        windUpTime: 800 // 攻击前摇时间 (ms)
    }
};