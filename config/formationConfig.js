export const formationConfig = {
    1: {
        id: 1,
        name: "初级聚灵阵",
        type: "gathering",
        description: "消耗灵石汇聚天地灵气，提升修炼速度。",
        costPerSecond: 1, // 每秒消耗1灵石
        effectMultiplier: 1.3, // 提升30%灵气获取
        icon: "聚"
    },
    2: {
        id: 2,
        name: "初级杀阵",
        type: "combat",
        description: "增强攻击力。",
        costPerSecond: 0,
        costPerBattle: 5, // 每次战斗消耗5灵石
        buffIds: [4],
        icon: "杀"
    },
    3: {
        id: 3,
        name: "初级护阵",
        type: "combat",
        description: "增强防御力。",
        costPerSecond: 0,
        costPerBattle: 5,
        buffIds: [5],
        icon: "护"
    },
    4: {
        id: 4,
        name: "初级风行阵",
        type: "combat",
        description: "提升移动速度。",
        costPerSecond: 0,
        costPerBattle: 5,
        buffIds: [6],
        icon: "风"
    },
    5: {
        id: 5,
        name: "初级回春阵",
        type: "combat",
        description: "持续恢复生命值。",
        costPerSecond: 0,
        costPerBattle: 5,
        buffIds: [7],
        icon: "回"
    },
    6: {
        id: 6,
        name: "破空阵",
        type: "combat",
        description: "聚焦弱点，提升暴击率。",
        costPerSecond: 0,
        costPerBattle: 8,
        buffIds: [8],
        icon: "爆"
    },
    7: {
        id: 7,
        name: "灭世阵",
        type: "combat",
        description: "爆发极限，提升暴击伤害。",
        costPerSecond: 0,
        costPerBattle: 8,
        buffIds: [9],
        icon: "烈"
    },
    8: {
        id: 8,
        name: "摄魂阵",
        type: "combat",
        description: "引导魂力，提升灵魂增幅。",
        costPerSecond: 0,
        costPerBattle: 8,
        buffIds: [10],
        icon: "魂"
    }
};
