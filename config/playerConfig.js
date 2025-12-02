export const playerConfig = {
    radius: 12,
    speed: 200, // 基础移动速度
    color: '#2196F3', // 玩家颜色
    
    // 基础属性 (Base Stats)
    maxHp: 100,      // 基础生命值 (不包含体魄加成)
    physique: 10,    // 基础体魄 (1体魄 = 10生命 + 0.1回血/秒)
    strength: 50,    // 基础力量 (影响伤害)
    agility: 10,     // 基础敏捷 (影响移速/闪避 - 暂未完全实装)
    comprehension: 10, // 基础悟性 (影响气血获取 - 暂未完全实装)
    defense: 5,      // 基础防御 (直接减伤)
    critChance: 0,   // 基础暴击率 (0% => 0)
    critDamage: 2.0, // 基础暴击伤害倍率 (200%)
    soulAmplification: 0, // 灵魂增幅 (额外灵魂获取百分比)
    spellPower: 0, // 法术强度 (百分比加成，0 = +0%)

    // Elemental attack bonuses (percentage, 0 = +0%)
    metalAttack: 0,
    woodAttack: 0,
    waterAttack: 0,
    fireAttack: 0,
    earthAttack: 0,

    spiritualPower: 10, // 基础灵力 (1灵力 = 10法力 + 0.1回蓝/秒)
    spiritRegen: 0, // 基础法力回复 (每秒) - 由灵力属性决定
    
    // 法力 (Mana)
    mana: 100, // 初始法力
    maxMana: 100, // 初始最大法力
    manaRegen: 1, // 初始法力回复

    initialReiki: 0  // 初始灵气归零，从头开始
};