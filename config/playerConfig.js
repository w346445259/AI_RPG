export const playerConfig = {
    radius: 12,
    speed: 200, // 基础移动速度
    color: '#2196F3', // 玩家颜色
    
    // 基础属性 (Base Stats)
    maxHp: 100,      // 基础生命值 (不包含体魄加成)
    physique: 10,    // 基础体魄 (1体魄 = 10生命 + 0.1回血/秒)
    strength: 30,    // 基础力量 (影响伤害)
    agility: 10,     // 基础敏捷 (影响移速/闪避 - 暂未完全实装)
    comprehension: 10, // 基础悟性 (影响气血获取 - 暂未完全实装)
    defense: 5,      // 基础防御 (直接减伤)
    
    initialReiki: 0  // 初始灵气归零，从头开始
};