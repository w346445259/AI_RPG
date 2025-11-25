export const oreConfig = {
    1: {
        id: 1,
        name: "铁矿",
        color: '#9E9E9E', // 灰色
        size: 40, // 正方形边长
        productId: 1, // 产出物品ID (对应 itemConfig)
        miningTime: 2000, // 采集读条时间 (ms)
        maxCapacity: 3, // 最大采集次数
        miningRange: 60 // 采集范围半径
    },
    2: {
        id: 2,
        name: "树木",
        color: '#4CAF50', // 绿色
        size: 45,
        productId: 2, // 木头
        miningTime: 1500,
        maxCapacity: 5,
        miningRange: 60
    },
    3: {
        id: 3,
        name: "铜矿",
        color: '#D84315', // 铜色
        size: 40,
        productId: 3, // 凡铜矿
        miningTime: 2500,
        maxCapacity: 3,
        miningRange: 60
    }
};
