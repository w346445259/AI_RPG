// 功法等级枚举
export const TechniqueGrade = {
    YELLOW: "黄阶",
    MYSTIC: "玄阶",
    EARTH: "地阶",
    HEAVEN: "天阶"
};

// 功法加成类型
export const TechniqueBonus = {
    STRENGTH: "strength",           // 力量
    AGILITY: "agility",             // 敏捷
    PHYSIQUE: "physique",           // 体魄
    COMPREHENSION: "comprehension", // 悟性
    DEFENSE: "defense",             // 防御
    SPIRITUAL_POWER: "spiritualPower", // 灵力
    CRIT_CHANCE: "critChance",      // 暴击率
    CRIT_DAMAGE: "critDamage",      // 暴击伤害
    CULTIVATION_SPEED: "cultivationSpeed", // 修炼速度
    REIKI_REGEN: "reikiRegen",      // 灵气回复（已废弃，使用reikiPerSecond）
    REIKI_PER_SECOND: "reikiPerSecond" // 灵气获取速率（每秒）
};

// 功法配置
export const techniqueConfig = {
    // ========== 黄阶功法 - 只能修炼到练气期圆满 ==========
    1: {
        id: 1,
        name: "基础吐纳术",
        grade: TechniqueGrade.YELLOW,
        gradeLevel: 1,
        color: "#CD853F",
        maxStage: 18,
        reikiCost: 100,
        baseSuccessRate: 0.1,
        description: "最基础的修炼功法，平衡发展。",
        unlockStage: 9,
        icon: "📜",
        reikiPerSecond: 1.0,
        bonuses: {
            [TechniqueBonus.STRENGTH]: 5,
            [TechniqueBonus.AGILITY]: 5,
            [TechniqueBonus.PHYSIQUE]: 5
        }
    },
    2: {
        id: 2,
        name: "烈焰心法",
        grade: TechniqueGrade.YELLOW,
        gradeLevel: 1,
        color: "#FF6347",
        maxStage: 18,
        reikiCost: 100,
        baseSuccessRate: 0.1,
        description: "火属性功法，大幅提升力量和暴击伤害。",
        unlockStage: 9,
        icon: "🔥",
        reikiPerSecond: 0.8,
        bonuses: {
            [TechniqueBonus.STRENGTH]: 15,
            [TechniqueBonus.CRIT_DAMAGE]: 0.2
        }
    },
    3: {
        id: 3,
        name: "疾风身法",
        grade: TechniqueGrade.YELLOW,
        gradeLevel: 1,
        color: "#87CEEB",
        maxStage: 18,
        reikiCost: 100,
        baseSuccessRate: 0.1,
        description: "风属性功法，大幅提升敏捷和暴击率。",
        unlockStage: 9,
        icon: "💨",
        reikiPerSecond: 0.8,
        bonuses: {
            [TechniqueBonus.AGILITY]: 15,
            [TechniqueBonus.CRIT_CHANCE]: 0.05
        }
    },
    4: {
        id: 4,
        name: "金刚体",
        grade: TechniqueGrade.YELLOW,
        gradeLevel: 1,
        color: "#DAA520",
        maxStage: 18,
        reikiCost: 100,
        baseSuccessRate: 0.1,
        description: "防御型功法，大幅提升体魄和防御。",
        unlockStage: 9,
        icon: "🛡️",
        reikiPerSecond: 0.7,
        bonuses: {
            [TechniqueBonus.PHYSIQUE]: 20,
            [TechniqueBonus.DEFENSE]: 10
        }
    },
    5: {
        id: 5,
        name: "悟道心经",
        grade: TechniqueGrade.YELLOW,
        gradeLevel: 1,
        color: "#9370DB",
        maxStage: 18,
        reikiCost: 100,
        baseSuccessRate: 0.1,
        description: "辅助型功法，提升悟性和修炼速度，灵气获取最快。",
        unlockStage: 9,
        icon: "📿",
        reikiPerSecond: 1.5,
        bonuses: {
            [TechniqueBonus.COMPREHENSION]: 10,
            [TechniqueBonus.CULTIVATION_SPEED]: 0.1
        }
    },
    
    // ========== 玄阶功法 - 可修炼到金丹期 ==========
    11: {
        id: 11,
        name: "玄元心法",
        grade: TechniqueGrade.MYSTIC,
        gradeLevel: 2,
        color: "#4169E1",
        maxStage: 27,
        reikiCost: 500,
        baseSuccessRate: 0.1,
        description: "玄阶基础功法，全面提升各项属性。",
        unlockStage: 9,
        icon: "📘",
        reikiPerSecond: 3.0,
        bonuses: {
            [TechniqueBonus.STRENGTH]: 20,
            [TechniqueBonus.AGILITY]: 20,
            [TechniqueBonus.PHYSIQUE]: 20,
            [TechniqueBonus.SPIRITUAL_POWER]: 10
        }
    },
    12: {
        id: 12,
        name: "九阳神功",
        grade: TechniqueGrade.MYSTIC,
        gradeLevel: 2,
        color: "#FF4500",
        maxStage: 27,
        reikiCost: 500,
        baseSuccessRate: 0.1,
        description: "至阳至刚，大幅提升力量和暴击伤害。",
        unlockStage: 9,
        icon: "☀️",
        reikiPerSecond: 2.5,
        bonuses: {
            [TechniqueBonus.STRENGTH]: 50,
            [TechniqueBonus.CRIT_DAMAGE]: 0.5,
            [TechniqueBonus.PHYSIQUE]: 20
        }
    },
    13: {
        id: 13,
        name: "凌波微步",
        grade: TechniqueGrade.MYSTIC,
        gradeLevel: 2,
        color: "#00CED1",
        maxStage: 27,
        reikiCost: 500,
        baseSuccessRate: 0.1,
        description: "身法绝学，极大提升敏捷和暴击率。",
        unlockStage: 9,
        icon: "🌊",
        reikiPerSecond: 2.5,
        bonuses: {
            [TechniqueBonus.AGILITY]: 50,
            [TechniqueBonus.CRIT_CHANCE]: 0.1,
            [TechniqueBonus.DEFENSE]: 15
        }
    },
    14: {
        id: 14,
        name: "不灭金身",
        grade: TechniqueGrade.MYSTIC,
        gradeLevel: 2,
        color: "#FFD700",
        maxStage: 27,
        reikiCost: 500,
        baseSuccessRate: 0.1,
        description: "防御至上，极大提升体魄和防御。",
        unlockStage: 9,
        icon: "🏛️",
        reikiPerSecond: 2.0,
        bonuses: {
            [TechniqueBonus.PHYSIQUE]: 60,
            [TechniqueBonus.DEFENSE]: 30
        }
    },
    15: {
        id: 15,
        name: "太上忘情诀",
        grade: TechniqueGrade.MYSTIC,
        gradeLevel: 2,
        color: "#BA55D3",
        maxStage: 27,
        reikiCost: 500,
        baseSuccessRate: 0.1,
        description: "悟道功法，大幅提升悟性、灵力和修炼速度，灵气获取最快。",
        unlockStage: 9,
        icon: "🧘",
        reikiPerSecond: 5.0,
        bonuses: {
            [TechniqueBonus.COMPREHENSION]: 30,
            [TechniqueBonus.SPIRITUAL_POWER]: 25,
            [TechniqueBonus.CULTIVATION_SPEED]: 0.2
        }
    },
    16: {
        id: 16,
        name: "雷霆万钧诀",
        grade: TechniqueGrade.MYSTIC,
        gradeLevel: 2,
        color: "#9400D3",
        maxStage: 27,
        reikiCost: 500,
        baseSuccessRate: 0.1,
        description: "雷属性功法，平衡提升力量、敏捷和暴击。",
        unlockStage: 9,
        icon: "⚡",
        reikiPerSecond: 2.8,
        bonuses: {
            [TechniqueBonus.STRENGTH]: 30,
            [TechniqueBonus.AGILITY]: 30,
            [TechniqueBonus.CRIT_CHANCE]: 0.08,
            [TechniqueBonus.CRIT_DAMAGE]: 0.3
        }
    },
    
    // ========== 地阶功法 - 可修炼到化神期 ==========
    21: {
        id: 21,
        name: "地煞真经",
        grade: TechniqueGrade.EARTH,
        gradeLevel: 3,
        color: "#9370DB",
        maxStage: 36,
        reikiCost: 2000,
        baseSuccessRate: 0.1,
        description: "地阶基础功法，全面大幅提升。",
        unlockStage: 9,
        icon: "📕",
        reikiPerSecond: 10.0,
        bonuses: {
            [TechniqueBonus.STRENGTH]: 60,
            [TechniqueBonus.AGILITY]: 60,
            [TechniqueBonus.PHYSIQUE]: 60,
            [TechniqueBonus.SPIRITUAL_POWER]: 30,
            [TechniqueBonus.COMPREHENSION]: 20
        }
    },
    22: {
        id: 22,
        name: "焚天煮海诀",
        grade: TechniqueGrade.EARTH,
        gradeLevel: 3,
        color: "#DC143C",
        maxStage: 36,
        reikiCost: 2000,
        baseSuccessRate: 0.1,
        description: "火系顶级功法，极致的攻击力。",
        unlockStage: 9,
        icon: "🌋",
        reikiPerSecond: 8.0,
        bonuses: {
            [TechniqueBonus.STRENGTH]: 150,
            [TechniqueBonus.CRIT_DAMAGE]: 1.0,
            [TechniqueBonus.SPIRITUAL_POWER]: 40
        }
    },
    23: {
        id: 23,
        name: "鲲鹏逍遥游",
        grade: TechniqueGrade.EARTH,
        gradeLevel: 3,
        color: "#1E90FF",
        maxStage: 36,
        reikiCost: 2000,
        baseSuccessRate: 0.1,
        description: "身法极致，速度与暴击的完美结合。",
        unlockStage: 9,
        icon: "🦅",
        reikiPerSecond: 8.0,
        bonuses: {
            [TechniqueBonus.AGILITY]: 150,
            [TechniqueBonus.CRIT_CHANCE]: 0.2,
            [TechniqueBonus.DEFENSE]: 40
        }
    },
    24: {
        id: 24,
        name: "混沌不灭体",
        grade: TechniqueGrade.EARTH,
        gradeLevel: 3,
        color: "#B8860B",
        maxStage: 36,
        reikiCost: 2000,
        baseSuccessRate: 0.1,
        description: "防御极致，近乎不死之身。",
        unlockStage: 9,
        icon: "🗿",
        reikiPerSecond: 6.0,
        bonuses: {
            [TechniqueBonus.PHYSIQUE]: 180,
            [TechniqueBonus.DEFENSE]: 80,
            [TechniqueBonus.STRENGTH]: 40
        }
    },
    25: {
        id: 25,
        name: "天机造化诀",
        grade: TechniqueGrade.EARTH,
        gradeLevel: 3,
        color: "#8A2BE2",
        maxStage: 36,
        reikiCost: 2000,
        baseSuccessRate: 0.1,
        description: "悟道至高功法，修炼速度极快，灵气获取最快。",
        unlockStage: 9,
        icon: "🔮",
        reikiPerSecond: 15.0,
        bonuses: {
            [TechniqueBonus.COMPREHENSION]: 80,
            [TechniqueBonus.SPIRITUAL_POWER]: 70,
            [TechniqueBonus.CULTIVATION_SPEED]: 0.4
        }
    },
    26: {
        id: 26,
        name: "阴阳无极功",
        grade: TechniqueGrade.EARTH,
        gradeLevel: 3,
        color: "#696969",
        maxStage: 36,
        reikiCost: 2000,
        baseSuccessRate: 0.1,
        description: "阴阳调和，攻防兼备的完美功法。",
        unlockStage: 9,
        icon: "☯️",
        reikiPerSecond: 9.0,
        bonuses: {
            [TechniqueBonus.STRENGTH]: 80,
            [TechniqueBonus.AGILITY]: 80,
            [TechniqueBonus.PHYSIQUE]: 80,
            [TechniqueBonus.CRIT_CHANCE]: 0.12,
            [TechniqueBonus.CRIT_DAMAGE]: 0.6
        }
    },
    27: {
        id: 27,
        name: "星辰炼体诀",
        grade: TechniqueGrade.EARTH,
        gradeLevel: 3,
        color: "#4B0082",
        maxStage: 36,
        reikiCost: 2000,
        baseSuccessRate: 0.1,
        description: "借星辰之力淀炼肉身，全面提升。",
        unlockStage: 9,
        icon: "⭐",
        reikiPerSecond: 8.5,
        bonuses: {
            [TechniqueBonus.STRENGTH]: 70,
            [TechniqueBonus.AGILITY]: 70,
            [TechniqueBonus.PHYSIQUE]: 100,
            [TechniqueBonus.SPIRITUAL_POWER]: 50
        }
    },    
    // ========== 天阶功法 - 可修炼到大乘期 ==========
    31: {
        id: 31,
        name: "天罡神诀",
        grade: TechniqueGrade.HEAVEN,
        gradeLevel: 4,
        color: "#FFD700",
        maxStage: 45,
        reikiCost: 10000,
        baseSuccessRate: 0.1,
        description: "天阶基础功法，全属性巨幅提升。",
        unlockStage: 9,
        icon: "📗",
        reikiPerSecond: 30.0,
        bonuses: {
            [TechniqueBonus.STRENGTH]: 150,
            [TechniqueBonus.AGILITY]: 150,
            [TechniqueBonus.PHYSIQUE]: 150,
            [TechniqueBonus.SPIRITUAL_POWER]: 80,
            [TechniqueBonus.COMPREHENSION]: 50,
            [TechniqueBonus.DEFENSE]: 50
        }
    },
    32: {
        id: 32,
        name: "帝炎焚世诀",
        grade: TechniqueGrade.HEAVEN,
        gradeLevel: 4,
        color: "#FF0000",
        maxStage: 45,
        reikiCost: 10000,
        baseSuccessRate: 0.1,
        description: "帝级火焰，毁天灭地的力量。",
        unlockStage: 9,
        icon: "🔥",
        reikiPerSecond: 25.0,
        bonuses: {
            [TechniqueBonus.STRENGTH]: 400,
            [TechniqueBonus.CRIT_DAMAGE]: 2.0,
            [TechniqueBonus.SPIRITUAL_POWER]: 100
        }
    },
    33: {
        id: 33,
        name: "虚空遁形术",
        grade: TechniqueGrade.HEAVEN,
        gradeLevel: 4,
        color: "#00FFFF",
        maxStage: 45,
        reikiCost: 10000,
        baseSuccessRate: 0.1,
        description: "穿梭虚空，速度与暴击的极致。",
        unlockStage: 9,
        icon: "🌌",
        reikiPerSecond: 25.0,
        bonuses: {
            [TechniqueBonus.AGILITY]: 400,
            [TechniqueBonus.CRIT_CHANCE]: 0.35,
            [TechniqueBonus.DEFENSE]: 100
        }
    },
    34: {
        id: 34,
        name: "盘古真身",
        grade: TechniqueGrade.HEAVEN,
        gradeLevel: 4,
        color: "#8B4513",
        maxStage: 45,
        reikiCost: 10000,
        baseSuccessRate: 0.1,
        description: "开天辟地之体，无敌的防御。",
        unlockStage: 9,
        icon: "⛰️",
        reikiPerSecond: 20.0,
        bonuses: {
            [TechniqueBonus.PHYSIQUE]: 500,
            [TechniqueBonus.DEFENSE]: 200,
            [TechniqueBonus.STRENGTH]: 150
        }
    },
    35: {
        id: 35,
        name: "鸿蒙造化经",
        grade: TechniqueGrade.HEAVEN,
        gradeLevel: 4,
        color: "#FF00FF",
        maxStage: 45,
        reikiCost: 10000,
        baseSuccessRate: 0.1,
        description: "鸿蒙初开，造化万物，悟道至高境界，灵气获取最快。",
        unlockStage: 9,
        icon: "🌟",
        reikiPerSecond: 50.0,
        bonuses: {
            [TechniqueBonus.COMPREHENSION]: 200,
            [TechniqueBonus.SPIRITUAL_POWER]: 180,
            [TechniqueBonus.CULTIVATION_SPEED]: 0.8
        }
    },
    36: {
        id: 36,
        name: "太极混元功",
        grade: TechniqueGrade.HEAVEN,
        gradeLevel: 4,
        color: "#000000",
        maxStage: 45,
        reikiCost: 10000,
        baseSuccessRate: 0.1,
        description: "太极生两仪，混元归一，完美平衡。",
        unlockStage: 9,
        icon: "⚫",
        reikiPerSecond: 28.0,
        bonuses: {
            [TechniqueBonus.STRENGTH]: 200,
            [TechniqueBonus.AGILITY]: 200,
            [TechniqueBonus.PHYSIQUE]: 200,
            [TechniqueBonus.CRIT_CHANCE]: 0.25,
            [TechniqueBonus.CRIT_DAMAGE]: 1.5,
            [TechniqueBonus.DEFENSE]: 80
        }
    },
    37: {
        id: 37,
        name: "万法归宗",
        grade: TechniqueGrade.HEAVEN,
        gradeLevel: 4,
        color: "#7B68EE",
        maxStage: 45,
        reikiCost: 10000,
        baseSuccessRate: 0.1,
        description: "万法归一，灵力与悟性的极致。",
        unlockStage: 9,
        icon: "✨",
        reikiPerSecond: 40.0,
        bonuses: {
            [TechniqueBonus.SPIRITUAL_POWER]: 250,
            [TechniqueBonus.COMPREHENSION]: 150,
            [TechniqueBonus.CULTIVATION_SPEED]: 0.6,
            [TechniqueBonus.CRIT_CHANCE]: 0.15
        }
    },
    38: {
        id: 38,
        name: "神魔霸体诀",
        grade: TechniqueGrade.HEAVEN,
        gradeLevel: 4,
        color: "#8B0000",
        maxStage: 45,
        reikiCost: 10000,
        baseSuccessRate: 0.1,
        description: "神魔之力，攻防一体的霸道功法。",
        unlockStage: 9,
        icon: "👹",
        reikiPerSecond: 26.0,
        bonuses: {
            [TechniqueBonus.STRENGTH]: 250,
            [TechniqueBonus.PHYSIQUE]: 250,
            [TechniqueBonus.DEFENSE]: 120,
            [TechniqueBonus.CRIT_DAMAGE]: 1.2
        }
    }
};

// 获取当前可用的功法列表（排除已修炼过的同阶或更低阶功法）
export function getAvailableTechniques(cultivationStage, cultivatedTechniqueIds = []) {
    // 找出已修炼过的最高阶位
    let maxCultivatedGradeLevel = 0;
    cultivatedTechniqueIds.forEach(id => {
        const tech = techniqueConfig[id];
        if (tech && tech.gradeLevel > maxCultivatedGradeLevel) {
            maxCultivatedGradeLevel = tech.gradeLevel;
        }
    });
    
    return Object.values(techniqueConfig).filter(tech => {
        // 必须达到解锁条件
        if (cultivationStage < tech.unlockStage) return false;
        
        // 如果已经修炼过更高阶的功法，则不能选择同阶或更低阶的功法
        if (tech.gradeLevel <= maxCultivatedGradeLevel) return false;
        
        return true;
    });
}

// 检查功法是否可以继续修炼
export function canCultivateTechnique(technique, currentStage) {
    return currentStage < technique.maxStage;
}

// 根据等级获取功法列表
export function getTechniquesByGrade(grade) {
    return Object.values(techniqueConfig).filter(tech => tech.grade === grade);
}

// 检查是否可以选择该功法（等级限制）
export function canSelectTechnique(technique, cultivatedTechniqueIds = []) {
    // 找出已修炼过的最高阶位
    let maxCultivatedGradeLevel = 0;
    cultivatedTechniqueIds.forEach(id => {
        const tech = techniqueConfig[id];
        if (tech && tech.gradeLevel > maxCultivatedGradeLevel) {
            maxCultivatedGradeLevel = tech.gradeLevel;
        }
    });
    
    // 只能选择比已修炼过的最高阶位更高的功法
    return technique.gradeLevel > maxCultivatedGradeLevel;
}
