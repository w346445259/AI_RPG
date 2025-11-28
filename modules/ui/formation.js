import { state } from '../state.js';
import { formationConfig } from '../../config/formationConfig.js';
import { buffConfig } from '../../config/buffConfig.js';
import { showNotification } from './common.js';
import { updatePlayerStatsDisplay } from './lobby.js';
import { updateBuffUI } from './buff.js';

// UI Elements
const formationList = document.getElementById('formation-list');
let currentFormationTab = 'gathering';

export function switchFormationTab(tab) {
    currentFormationTab = tab;
    
    // Update tab styles
    document.querySelectorAll('.formation-tabs .tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    updateFormationUI();
}

export function updateFormationUI() {
    if (!formationList) return;
    
    formationList.innerHTML = '';
    
    Object.values(formationConfig).forEach(formation => {
        // Filter by tab
        if (currentFormationTab === 'gathering' && formation.type !== 'gathering') return;
        if (currentFormationTab === 'combat' && formation.type !== 'combat') return;

        const isActive = state.activeFormations && state.activeFormations[formation.id];
        
        const div = document.createElement('div');
        div.className = 'upgrade-item';
        div.style.width = '100%';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '15px';
        div.style.marginBottom = '10px';
        div.style.backgroundColor = isActive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(0, 0, 0, 0.6)';
        div.style.border = isActive ? '1px solid #4CAF50' : '1px solid #555';
        
        let effectText = "";
        if (formation.type === 'gathering') {
            effectText = `灵气获取 +${Math.round((formation.effectMultiplier - 1) * 100)}%`;
        } else if (formation.type === 'combat') {
            if (formation.buffIds) {
                const effects = [];
                formation.buffIds.forEach(buffId => {
                    const buff = buffConfig[buffId];
                    if (buff) {
                        effects.push(buff.description);
                    }
                });
                effectText = effects.join(', ');
            } else if (formation.buffEffects) {
                const effects = [];
                formation.buffEffects.forEach(effect => {
                    let statName = effect.stat;
                    if (statName === 'strength') statName = '攻击';
                    if (statName === 'defense') statName = '防御';
                    if (statName === 'speed') statName = '移速';
                    if (statName === 'hpRegen') statName = '生命恢复';
                    
                    const val = (effect.type === 'multiplier' || effect.type === 'stat_multiplier') 
                        ? `+${Math.round(effect.value * 100)}%` 
                        : `+${effect.value}`;
                    effects.push(`${statName} ${val}`);
                });
                effectText = effects.join(', ');
            } else if (formation.stat) {
                // Fallback for legacy single stat
                const val = formation.valueType === 'multiplier' ? `+${Math.round(formation.value * 100)}%` : `+${formation.value}`;
                let statName = formation.stat;
                if (statName === 'strength') statName = '攻击';
                if (statName === 'defense') statName = '防御';
                if (statName === 'speed') statName = '移速';
                if (statName === 'hpRegen') statName = '生命恢复';
                effectText = `${statName} ${val}`;
            }
        }

        let costText = "";
        if (formation.costPerSecond > 0) {
            costText = `消耗: ${formation.costPerSecond} 灵石/秒`;
        } else if (formation.costPerBattle > 0) {
            costText = `消耗: ${formation.costPerBattle} 灵石/次`;
        } else {
            costText = "消耗: 无";
        }

        div.innerHTML = `
            <div style="flex: 1; text-align: left;">
                <h3 style="margin: 0 0 5px 0; color: ${isActive ? '#4CAF50' : '#fff'};">${formation.name}</h3>
                <p style="margin: 0; font-size: 14px; color: #ccc;">${formation.description}</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #87CEEB;">
                    ${costText} | 效果: ${effectText}
                </p>
            </div>
            <button onclick="window.toggleFormation(${formation.id})" style="width: auto; background-color: ${isActive ? '#f44336' : '#4CAF50'}; min-width: 80px; padding: 8px 16px; font-size: 16px; margin: 0 0 0 15px;">
                ${isActive ? '关闭' : '开启'}
            </button>
        `;
        
        formationList.appendChild(div);
    });
}

window.switchFormationTab = switchFormationTab;

window.toggleFormation = function(id) {
    if (!state.activeFormations) state.activeFormations = {};
    
    const targetFormation = formationConfig[id];
    if (!targetFormation) return;

    const isActive = state.activeFormations[id];
    
    if (isActive) {
        // 关闭
        state.activeFormations[id] = false;
        showNotification("阵法已关闭");
    } else {
        // 开启前检查同类型互斥
        for (const otherId in state.activeFormations) {
            if (state.activeFormations[otherId]) {
                const otherFormation = formationConfig[otherId];
                if (otherFormation && otherFormation.type === targetFormation.type) {
                    state.activeFormations[otherId] = false;
                }
            }
        }

        // 开启
        // 检查灵石是否足够 (仅聚灵阵需要)
        if (targetFormation.costPerSecond > 0) {
            if (state.totalSpiritStones > 0) {
                state.activeFormations[id] = true;
                showNotification("阵法已开启");
            } else {
                showNotification("灵石不足，无法开启阵法");
                return;
            }
        } else {
            // 免费阵法
            state.activeFormations[id] = true;
            showNotification("阵法已开启");
        }
    }
    
    localStorage.setItem('activeFormations', JSON.stringify(state.activeFormations));
    updateFormationUI();
    updatePlayerStatsDisplay();
    updateBuffUI();
    
    // 如果是聚灵阵，可能需要更新大厅UI
    if (id === 1) {
        // updateReikiDisplay is called in loop, so it will update automatically
    }
};
