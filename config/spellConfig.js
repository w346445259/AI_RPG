export const spellConfig = {
    1: {
        id: 1,
        name: "火球术",
        description: "凝聚灵气化为火球，对单个敌人造成伤害。",
        reqStage: 10, // 练气一层
        cost: 100,
        manaCost: 10, // 消耗法力
        icon: "🔥",
        type: "active",
        cooldown: 3000,
        damageMultiplier: 5.0 // 灵力倍率
    },
    2: {
        id: 2,
        name: "灵盾术",
        description: "在周身凝聚一层灵气护盾，抵挡伤害。",
        reqStage: 11, // 练气二层
        cost: 200,
        manaCost: 20,
        icon: "🛡️",
        type: "buff",
        cooldown: 15000,
        duration: 5000,
        buffId: 102,
        shieldMultiplier: 5.0 // 护盾值 = 灵力 * 5
    },
    3: {
        id: 3,
        name: "轻身术",
        description: "身轻如燕，短时间内大幅提升移动速度。",
        reqStage: 12, // 练气三层
        cost: 300,
        manaCost: 15,
        icon: "🍃",
        type: "buff",
        cooldown: 10000,
        duration: 5000,
        buffId: 103
    },
    4: {
        id: 4,
        name: "金光指",
        description: "汇聚金锐之气于指尖，射出一道金光，穿透敌人。",
        reqStage: 13, // 练气四层
        cost: 500,
        manaCost: 30,
        icon: "👉",
        type: "active",
        cooldown: 5000,
        damageMultiplier: 8.0,
        penetration: 2
    },
    5: {
        id: 5,
        name: "回春术",
        description: "引动木灵气滋养肉身，持续恢复生命值。",
        reqStage: 14, // 练气五层
        cost: 800,
        manaCost: 40,
        icon: "🌿",
        type: "buff",
        cooldown: 20000,
        duration: 5000,
        buffId: 105
    },
    6: {
        id: 6,
        name: "地刺术",
        description: "操控土灵气，从地面突起尖刺，对范围内敌人造成伤害。",
        reqStage: 15, // 练气六层
        cost: 1200,
        manaCost: 50,
        icon: "⛰️",
        type: "active",
        cooldown: 8000,
        damageMultiplier: 4.0,
        area: 100
    },
    7: {
        id: 7,
        name: "冰锥术",
        description: "凝水成冰，化为尖锐冰锥，击中敌人可造成减速。",
        reqStage: 16, // 练气七层
        cost: 1600,
        manaCost: 35,
        icon: "❄️",
        type: "active",
        cooldown: 4000,
        damageMultiplier: 6.0,
        slowEffect: 0.5
    },
    8: {
        id: 8,
        name: "雷击术",
        description: "引动天雷轰击敌人，造成高额伤害并有几率麻痹。",
        reqStage: 18, // 练气九层
        cost: 2500,
        manaCost: 60,
        icon: "⚡",
        type: "active",
        cooldown: 10000,
        damageMultiplier: 10.0,
        stunChance: 0.3
    }
};
