export const KILL_REQUIREMENT_MULTIPLIER = 10;

export function getScaledKillRequirement(config) {
    const baseRequirement = config && config.winKillCount ? config.winKillCount : 50;
    return Math.ceil(baseRequirement * KILL_REQUIREMENT_MULTIPLIER);
}
