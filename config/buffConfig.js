export const buffConfig = {
    1: {
        id: 1,
        name: "攻击强化",
        icon: "攻",
        description: "提升 20% 攻击力",
        type: "stat_multiplier",
        stat: "strength",
        value: 0.2, // +20%
    },
    2: {
        id: 2,
        name: "铁壁防御",
        icon: "防",
        description: "提升 10 点防御力",
        type: "stat_flat",
        stat: "defense",
        value: 10,
    },
    3: {
        id: 3,
        name: "神行步",
        icon: "速",
        description: "提升 30% 移动速度",
        type: "stat_multiplier",
        stat: "speed",
        value: 0.3,
    },
    4: {
        id: 4,
        name: "杀阵之力",
        icon: "杀",
        description: "阵法加持：提升 15% 攻击力",
        type: "stat_multiplier",
        stat: "strength",
        value: 0.15
    },
    5: {
        id: 5,
        name: "护阵之力",
        icon: "护",
        description: "阵法加持：提升 15 点防御力",
        type: "stat_flat",
        stat: "defense",
        value: 15
    },
    6: {
        id: 6,
        name: "风行阵力",
        icon: "风",
        description: "阵法加持：提升 20% 移动速度",
        type: "stat_multiplier",
        stat: "speed",
        value: 0.2
    },
    7: {
        id: 7,
        name: "回春阵力",
        icon: "回",
        description: "阵法加持：每秒恢复 10 点生命",
        type: "stat_flat",
        stat: "hpRegen",
        value: 10
    },
    8: {
        id: 8,
        name: "破空阵力",
        icon: "爆",
        description: "阵法加持：提升 10% 暴击率",
        type: "stat_flat",
        stat: "critChance",
        value: 0.10
    },
    9: {
        id: 9,
        name: "灭世阵力",
        icon: "烈",
        description: "阵法加持：提升 50% 暴击伤害",
        type: "stat_multiplier",
        stat: "critDamage",
        value: 0.5
    },
    10: {
        id: 10,
        name: "摄魂阵力",
        icon: "魂",
        description: "阵法加持：灵魂增幅 +20%",
        type: "stat_flat",
        stat: "soulAmp",
        value: 0.2
    }
};
