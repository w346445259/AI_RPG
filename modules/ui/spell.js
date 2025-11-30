import { state } from '../state.js';
import { spellConfig } from '../../config/spellConfig.js';
import { showNotification } from './common.js';
import { updatePlayerStatsDisplay } from './lobby.js';

const spellScreen = document.getElementById('spell-screen');
const spellList = document.getElementById('spell-list');
const spellBtn = document.getElementById('spell-btn');
const equippedSpellsContainer = document.getElementById('equipped-spells-container');

export function updateSpellUI() {
    // Check if spell button should be visible (Qi Condensation Stage 10+)
    if (spellBtn) {
        if (state.cultivationStage >= 10) {
            spellBtn.style.display = 'block';
        } else {
            spellBtn.style.display = 'none';
        }
    }
    
    updateEquippedSpellsDisplay();

    if (!spellList) return;
    spellList.innerHTML = '';

    const sortedSpells = Object.values(spellConfig).sort((a, b) => a.reqStage - b.reqStage);

    sortedSpells.forEach(spell => {
        const isLearned = state.learnedSpells && state.learnedSpells.includes(spell.id);
        const canLearn = !isLearned && state.cultivationStage >= spell.reqStage && state.totalReiki >= spell.cost;
        
        const div = document.createElement('div');
        div.className = 'upgrade-item';
        div.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid ${isLearned ? '#4CAF50' : 'rgba(255, 255, 255, 0.2)'};
            border-radius: 8px;
            padding: 15px;
            width: 200px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            position: relative;
        `;

        if (isLearned) {
            const learnedBadge = document.createElement('div');
            learnedBadge.textContent = '已习得';
            learnedBadge.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                background: #4CAF50;
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
            `;
            div.appendChild(learnedBadge);
        }

        const icon = document.createElement('div');
        icon.textContent = spell.icon || '📜';
        icon.style.fontSize = '40px';
        div.appendChild(icon);

        const name = document.createElement('h3');
        name.textContent = spell.name;
        name.style.margin = '0';
        name.style.color = isLearned ? '#4CAF50' : '#E0E0E0';
        div.appendChild(name);

        const req = document.createElement('p');
        const reqStageText = spell.reqStage >= 10 ? `练气${spell.reqStage - 9}层` : `锻体${spell.reqStage}层`;
        req.textContent = `需求: ${reqStageText}`;
        req.style.fontSize = '12px';
        req.style.color = state.cultivationStage >= spell.reqStage ? '#81C784' : '#E57373';
        req.style.margin = '0';
        div.appendChild(req);

        const desc = document.createElement('p');
        desc.textContent = spell.description;
        desc.style.fontSize = '12px';
        desc.style.color = '#B0BEC5';
        desc.style.textAlign = 'center';
        desc.style.margin = '0';
        desc.style.flex = '1';
        div.appendChild(desc);

        const cost = document.createElement('p');
        cost.textContent = `消耗灵气: ${spell.cost}`;
        cost.style.fontSize = '12px';
        cost.style.color = '#64B5F6';
        cost.style.margin = '0';
        div.appendChild(cost);

        const btn = document.createElement('button');
        if (isLearned) {
            const isEquipped = state.equippedSpells && state.equippedSpells.includes(spell.id);
            if (isEquipped) {
                btn.textContent = '卸下';
                btn.style.background = '#f44336';
                btn.onclick = () => unequipSpell(spell.id);
            } else {
                btn.textContent = '装备';
                const canEquip = state.equippedSpells.length < 3;
                btn.disabled = !canEquip;
                btn.style.background = canEquip ? '#2196F3' : '#555';
                btn.onclick = () => equipSpell(spell.id);
            }
        } else {
            btn.textContent = '参悟';
            btn.disabled = !canLearn;
            btn.style.background = canLearn ? '#673AB7' : '#555';
            btn.onclick = () => learnSpell(spell.id);
        }
        div.appendChild(btn);

        spellList.appendChild(div);
    });
}

import { updateSpellBar } from './hud.js';

function equipSpell(spellId) {
    if (state.equippedSpells.length >= 3) {
        showNotification("法术槽位已满！");
        return;
    }
    if (!state.equippedSpells.includes(spellId)) {
        state.equippedSpells.push(spellId);
        localStorage.setItem('equippedSpells', JSON.stringify(state.equippedSpells));
        updateSpellUI();
        updateSpellBar();
        showNotification("已装备法术");
    }
}

function unequipSpell(spellId) {
    const index = state.equippedSpells.indexOf(spellId);
    if (index > -1) {
        state.equippedSpells.splice(index, 1);
        localStorage.setItem('equippedSpells', JSON.stringify(state.equippedSpells));
        updateSpellUI();
        updateSpellBar();
        showNotification("已卸下法术");
    }
}

function learnSpell(spellId) {
    const spell = spellConfig[spellId];
    if (!spell) return;

    if (state.learnedSpells.includes(spellId)) return;
    if (state.cultivationStage < spell.reqStage) {
        showNotification("境界不足，无法参悟！");
        return;
    }
    if (state.totalReiki < spell.cost) {
        showNotification("灵气不足，无法参悟！");
        return;
    }

    state.totalReiki -= spell.cost;
    state.learnedSpells.push(spellId);
    localStorage.setItem('learnedSpells', JSON.stringify(state.learnedSpells));
    
    showNotification(`成功参悟法术：${spell.name}！`);
    updateSpellUI();
    updatePlayerStatsDisplay(); // Update reiki display
    
    // Save game logic should be triggered here or periodically
    if (window.saveGame) window.saveGame();
}

function updateEquippedSpellsDisplay() {
    if (!equippedSpellsContainer) return;
    equippedSpellsContainer.innerHTML = '';

    for (let i = 0; i < 3; i++) {
        const spellId = state.equippedSpells[i];
        const slot = document.createElement('div');
        slot.style.cssText = `
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid #555;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            cursor: pointer;
            transition: all 0.2s;
        `;
        
        // Slot Number
        const num = document.createElement('div');
        num.textContent = i + 1;
        num.style.cssText = `
            position: absolute;
            top: 5px;
            left: 5px;
            font-size: 12px;
            color: #888;
        `;
        slot.appendChild(num);

        if (spellId) {
            const spell = spellConfig[spellId];
            if (spell) {
                slot.style.borderColor = '#2196F3';
                slot.style.background = 'rgba(33, 150, 243, 0.2)';
                
                const icon = document.createElement('div');
                icon.textContent = spell.icon || '🔮';
                icon.style.fontSize = '32px';
                slot.appendChild(icon);
                
                const name = document.createElement('div');
                name.textContent = spell.name;
                name.style.fontSize = '12px';
                name.style.marginTop = '5px';
                name.style.color = '#fff';
                slot.appendChild(name);
                
                slot.title = '点击卸下';
                slot.onclick = () => unequipSpell(spellId);
            }
        } else {
            const emptyText = document.createElement('div');
            emptyText.textContent = '空闲';
            emptyText.style.color = '#555';
            emptyText.style.fontSize = '14px';
            slot.appendChild(emptyText);
        }

        equippedSpellsContainer.appendChild(slot);
    }
}
