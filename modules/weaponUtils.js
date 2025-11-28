import { weaponConfig } from '../config/weaponConfig.js';
import { affixConfig } from '../config/affixConfig.js';
import { state } from './state.js';

export function getActiveWeaponConfig() {
    const baseWeapon = weaponConfig[state.equippedWeaponId];
    if (!baseWeapon) return null;
    return applyWeaponAffixes(baseWeapon);
}

function applyWeaponAffixes(baseWeapon) {
    if (!state.activeAffixes || state.activeAffixes.length === 0) {
        return baseWeapon;
    }

    const modifiedWeapon = { ...baseWeapon };

    for (const affixId of state.activeAffixes) {
        const config = affixConfig[affixId];
        if (!config || !config.weaponModifier) continue;

        const { targetTypes, changes } = config.weaponModifier;
        if (Array.isArray(targetTypes) && targetTypes.length > 0) {
            if (!targetTypes.includes(baseWeapon.type)) continue;
        }
        if (!Array.isArray(changes)) continue;

        for (const change of changes) {
            const stat = change.stat;
            if (!stat) continue;
            const mode = change.mode || 'add';
            const value = change.value ?? 0;
            const defaultBase = change.defaultBase;
            const current = (modifiedWeapon[stat] !== undefined)
                ? modifiedWeapon[stat]
                : (defaultBase !== undefined ? defaultBase : 0);

            if (mode === 'add') {
                modifiedWeapon[stat] = current + value;
            } else if (mode === 'mul') {
                modifiedWeapon[stat] = current * (1 + value);
            } else if (mode === 'set') {
                modifiedWeapon[stat] = value;
            }
        }
    }

    return modifiedWeapon;
}
