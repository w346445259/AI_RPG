export const levelConfig = {
    // 1-5: 新手村 (只产木头)
    1: { spawnRate: 1500, winKillCount: 10, winExp: 50, resourceMin: 3, resourceMax: 5, resourceTypes: [2], monsterTypes: [1] },
    2: { spawnRate: 1400, winKillCount: 12, winExp: 60, resourceMin: 3, resourceMax: 5, resourceTypes: [2], monsterTypes: [1] },
    3: { spawnRate: 1300, winKillCount: 15, winExp: 70, resourceMin: 4, resourceMax: 6, resourceTypes: [2], monsterTypes: [1] },
    4: { spawnRate: 1200, winKillCount: 18, winExp: 80, resourceMin: 4, resourceMax: 6, resourceTypes: [2], monsterTypes: [1, 2] },
    5: { spawnRate: 1100, winKillCount: 20, winExp: 100, resourceMin: 5, resourceMax: 8, resourceTypes: [2], monsterTypes: [1, 2] },
    
    // 6-10: 凡铁时代 (产木头、凡铁)
    6: { spawnRate: 1000, winKillCount: 25, winExp: 150, resourceMin: 5, resourceMax: 8, resourceTypes: [2, 1] },
    7: { spawnRate: 950, winKillCount: 28, winExp: 180, resourceMin: 6, resourceMax: 9, resourceTypes: [2, 1] },
    8: { spawnRate: 900, winKillCount: 32, winExp: 210, resourceMin: 6, resourceMax: 9, resourceTypes: [2, 1] },
    9: { spawnRate: 850, winKillCount: 36, winExp: 250, resourceMin: 7, resourceMax: 10, resourceTypes: [2, 1] },
    10: { spawnRate: 800, winKillCount: 40, winExp: 300, resourceMin: 7, resourceMax: 10, resourceTypes: [2, 1] },

    // 11-20: 凡铜时代 (产木头、凡铁) - 暂时移除凡铜，专注精铁路线
    11: { spawnRate: 750, winKillCount: 45, winExp: 350, resourceMin: 8, resourceMax: 12, resourceTypes: [2, 1] },
    12: { spawnRate: 700, winKillCount: 50, winExp: 400, resourceMin: 8, resourceMax: 12, resourceTypes: [2, 1] },
    13: { spawnRate: 650, winKillCount: 55, winExp: 450, resourceMin: 9, resourceMax: 13, resourceTypes: [2, 1] },
    14: { spawnRate: 600, winKillCount: 60, winExp: 500, resourceMin: 9, resourceMax: 13, resourceTypes: [2, 1] },
    15: { spawnRate: 550, winKillCount: 65, winExp: 600, resourceMin: 10, resourceMax: 14, resourceTypes: [2, 1] },
    16: { spawnRate: 500, winKillCount: 70, winExp: 700, resourceMin: 10, resourceMax: 14, resourceTypes: [2, 1] },
    17: { spawnRate: 480, winKillCount: 75, winExp: 800, resourceMin: 11, resourceMax: 15, resourceTypes: [2, 1] },
    18: { spawnRate: 460, winKillCount: 80, winExp: 900, resourceMin: 11, resourceMax: 15, resourceTypes: [2, 1] },
    19: { spawnRate: 440, winKillCount: 85, winExp: 1000, resourceMin: 12, resourceMax: 16, resourceTypes: [2, 1] },
    20: { spawnRate: 420, winKillCount: 90, winExp: 1200, resourceMin: 12, resourceMax: 16, resourceTypes: [2, 1] },

    // 21-30: 炼狱模式 (高密度刷怪)
    21: { spawnRate: 400, winKillCount: 100, winExp: 1500, resourceMin: 15, resourceMax: 20, resourceTypes: [2, 1] },
    22: { spawnRate: 380, winKillCount: 110, winExp: 1800, resourceMin: 15, resourceMax: 20, resourceTypes: [2, 1] },
    23: { spawnRate: 360, winKillCount: 120, winExp: 2100, resourceMin: 15, resourceMax: 20, resourceTypes: [2, 1] },
    24: { spawnRate: 340, winKillCount: 130, winExp: 2500, resourceMin: 15, resourceMax: 20, resourceTypes: [2, 1] },
    25: { spawnRate: 320, winKillCount: 140, winExp: 3000, resourceMin: 15, resourceMax: 20, resourceTypes: [2, 1] },
    26: { spawnRate: 300, winKillCount: 150, winExp: 3500, resourceMin: 15, resourceMax: 20, resourceTypes: [2, 1] },
    27: { spawnRate: 280, winKillCount: 160, winExp: 4000, resourceMin: 15, resourceMax: 20, resourceTypes: [2, 1] },
    28: { spawnRate: 260, winKillCount: 180, winExp: 4500, resourceMin: 15, resourceMax: 20, resourceTypes: [2, 1] },
    29: { spawnRate: 240, winKillCount: 200, winExp: 5000, resourceMin: 15, resourceMax: 20, resourceTypes: [2, 1] },
    30: { spawnRate: 200, winKillCount: 250, winExp: 6000, resourceMin: 20, resourceMax: 30, resourceTypes: [2, 1] },
};
