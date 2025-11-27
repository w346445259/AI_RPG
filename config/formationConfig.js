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
        stat: "strength",
        value: 0.15, // +15% 攻击
        valueType: "multiplier",
        icon: "杀"
    },
    3: {
        id: 3,
        name: "初级护阵",
        type: "combat",
        description: "增强防御力。",
        costPerSecond: 0,
        costPerBattle: 5,
        stat: "defense",
        value: 15, // +15 防御
        valueType: "flat",
        icon: "护"
    },
    4: {
        id: 4,
        name: "初级风行阵",
        type: "combat",
        description: "提升移动速度。",
        costPerSecond: 0,
        costPerBattle: 5,
        stat: "speed",
        value: 0.2, // +20% 移速
        valueType: "multiplier",
        icon: "风"
    },
    5: {
        id: 5,
        name: "初级回春阵",
        type: "combat",
        description: "持续恢复生命值。",
        costPerSecond: 0,
        costPerBattle: 5,
        stat: "hpRegen",
        value: 10, // +10 HP/s
        valueType: "flat",
        icon: "回"
    }
};
