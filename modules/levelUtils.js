export function getScaledKillRequirement(config) {
    const baseRequirement = config && config.winKillCount ? config.winKillCount : 50;
    return Math.ceil(baseRequirement);
}
