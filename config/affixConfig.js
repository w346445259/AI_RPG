export const affixConfig = {
    1: {
        id: 1,
        name: '猛虎之势',
        description: '力量+60',
        type: 'stat_flat',
        stat: 'strength',
        value: 60
    },
    2: {
        id: 2,
        name: '灵狐之影',
        description: '敏捷+40',
        type: 'stat_flat',
        stat: 'agility',
        value: 40
    },
    3: {
        id: 3,
        name: '玄龟护壳',
        description: '防御+50',
        type: 'stat_flat',
        stat: 'defense',
        value: 50
    },
    4: {
        id: 4,
        name: '迅风步',
        description: '移速+40',
        type: 'stat_flat',
        stat: 'speed',
        value: 40
    },
    5: {
        id: 5,
        name: '青木滋养',
        description: '生命回复+2',
        type: 'stat_flat',
        stat: 'hpRegen',
        value: 2
    },
    6: {
        id: 6,
        name: '裂空重击',
        description: '力量+15%',
        type: 'stat_multiplier',
        stat: 'strength',
        value: 0.15
    },
    7: {
        id: 7,
        name: '磐石护心',
        description: '防御+15%',
        type: 'stat_multiplier',
        stat: 'defense',
        value: 0.15
    },
    8: {
        id: 8,
        name: '疾雷身法',
        description: '移速+15%',
        type: 'stat_multiplier',
        stat: 'speed',
        value: 0.15
    },
    9: {
        id: 9,
        name: '寒星连射',
        description: '敏捷+15%',
        type: 'stat_multiplier',
        stat: 'agility',
        value: 0.15
    },
    10: {
        id: 10,
        name: '雷霆暴击',
        description: '暴击率+10%',
        type: 'stat_flat',
        stat: 'critChance',
        value: 0.1
    },
    11: {
        id: 11,
        name: '嗜血怒焰',
        description: '暴击伤害+30%',
        type: 'stat_multiplier',
        stat: 'critDamage',
        value: 0.3
    },
    12: {
        id: 12,
        name: '真龙心火',
        description: '生命回复+30%',
        type: 'stat_multiplier',
        stat: 'hpRegen',
        value: 0.3
    },
    13: {
        id: 13,
        name: '狂风拓域',
        description: '扫击半径+20',
        weaponModifier: {
            targetTypes: ['melee-sweep'],
            changes: [
                { stat: 'range', mode: 'add', value: 20 }
            ]
        }
    },
    14: {
        id: 14,
        name: '旋刃扩角',
        description: '扫击角度+20°',
        weaponModifier: {
            targetTypes: ['melee-sweep'],
            changes: [
                { stat: 'angle', mode: 'add', value: 20 }
            ]
        }
    },
    15: {
        id: 15,
        name: '破云延程',
        description: '刺击距离+30',
        weaponModifier: {
            targetTypes: ['melee-thrust'],
            changes: [
                { stat: 'range', mode: 'add', value: 30 }
            ]
        }
    },
    16: {
        id: 16,
        name: '穿梭拓宽',
        description: '刺击宽度+15%',
        weaponModifier: {
            targetTypes: ['melee-thrust'],
            changes: [
                { stat: 'width', mode: 'mul', value: 0.15 }
            ]
        }
    },
    17: {
        id: 17,
        name: '崩岳扩域',
        description: '重击爆破半径+12',
        weaponModifier: {
            targetTypes: ['melee-smash'],
            changes: [
                { stat: 'range', mode: 'add', value: 12 }
            ]
        }
    },
    18: {
        id: 18,
        name: '磐石推进',
        description: '重击落点距离+15%',
        weaponModifier: {
            targetTypes: ['melee-smash'],
            changes: [
                { stat: 'offset', mode: 'mul', value: 0.15 }
            ]
        }
    },
    19: {
        id: 19,
        name: '百羽增列',
        description: '远程齐射弹丸+1',
        weaponModifier: {
            targetTypes: ['penetrate'],
            changes: [
                { stat: 'projectileCount', mode: 'add', value: 1, defaultBase: 1 }
            ]
        }
    },
    20: {
        id: 20,
        name: '疾雨连弦',
        description: '远程连射次数+1',
        weaponModifier: {
            targetTypes: ['penetrate'],
            changes: [
                { stat: 'burstCount', mode: 'add', value: 1, defaultBase: 1 }
            ]
        }
    },
    22: {
        id: 22,
        name: '星链加弹',
        description: '弹射次数+1',
        weaponModifier: {
            targetTypes: ['bounce'],
            changes: [
                { stat: 'bounceCount', mode: 'add', value: 1, defaultBase: 0 }
            ]
        }
    },
    23: {
        id: 23,
        name: '噬魂之欲',
        description: '灵魂获取速度+10%',
        type: 'stat_flat',
        stat: 'soulAmp',
        value: 0.1
    }
};

export const affixPool = Object.values(affixConfig);
