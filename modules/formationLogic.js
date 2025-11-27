import { state } from './state.js';
import { formationConfig } from '../config/formationConfig.js';
import { showNotification } from './ui/common.js';
import { updateFormationUI } from './ui/formation.js';

export function updateFormations(dt) {
    if (!state.activeFormations) return;

    // Loop through all active formations
    for (const id in state.activeFormations) {
        if (state.activeFormations[id]) {
            const config = formationConfig[id];
            if (!config) continue;

            // Skip gathering formations here if they are handled in cultivation.js
            // But ideally, we should centralize consumption.
            // For now, let's handle COMBAT formations here.
            // Gathering formation (ID 1) is handled in updateMeditation for now.
            if (config.type === 'combat') {
                const cost = config.costPerSecond * dt;
                
                if (cost > 0) {
                    if (state.totalSpiritStones >= cost) {
                        state.totalSpiritStones -= cost;
                    } else {
                        // Out of stones
                        state.activeFormations[id] = false;
                        showNotification(`灵石耗尽，${config.name}已关闭`);
                        updateFormationUI();
                    }
                }
            }
        }
    }
    
    // Save stones occasionally? Or rely on other save loops.
    // Let's rely on the main loop save or specific triggers.
    // But since this drains stones, we should probably update the display.
    // updateSpiritStonesDisplay() is called in main loop UI update.
}
