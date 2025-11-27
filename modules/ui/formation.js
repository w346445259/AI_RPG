import { state } from '../state.js';
import { formationConfig } from '../../config/formationConfig.js';
import { showNotification } from './common.js';

// UI Elements
const formationList = document.getElementById('formation-list');

export function updateFormationUI() {
    if (!formationList) return;
    
    formationList.innerHTML = '';
    
    Object.values(formationConfig).forEach(formation => {
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
        
        div.innerHTML = `
            <div style="flex: 1; text-align: left;">
                <h3 style="margin: 0 0 5px 0; color: ${isActive ? '#4CAF50' : '#fff'};">${formation.name}</h3>
                <p style="margin: 0; font-size: 14px; color: #ccc;">${formation.description}</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #87CEEB;">
                    消耗: ${formation.costPerSecond} 灵石/秒 | 效果: 灵气获取 +${Math.round((formation.effectMultiplier - 1) * 100)}%
                </p>
            </div>
            <button onclick="window.toggleFormation(${formation.id})" style="width: auto; background-color: ${isActive ? '#f44336' : '#4CAF50'}; min-width: 80px; padding: 8px 16px; font-size: 16px; margin: 0 0 0 15px;">
                ${isActive ? '关闭' : '开启'}
            </button>
        `;
        
        formationList.appendChild(div);
    });
}

window.toggleFormation = function(id) {
    if (!state.activeFormations) state.activeFormations = {};
    
    const isActive = state.activeFormations[id];
    
    if (isActive) {
        // 关闭
        state.activeFormations[id] = false;
        showNotification("阵法已关闭");
    } else {
        // 开启
        // 检查灵石是否足够
        if (state.totalSpiritStones > 0) {
            state.activeFormations[id] = true;
            showNotification("阵法已开启");
        } else {
            showNotification("灵石不足，无法开启阵法");
            return;
        }
    }
    
    localStorage.setItem('activeFormations', JSON.stringify(state.activeFormations));
    updateFormationUI();
};
