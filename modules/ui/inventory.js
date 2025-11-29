import { state } from '../state.js';
import { weaponConfig } from '../../config/weaponConfig.js';
import { itemConfig } from '../../config/itemConfig.js';
import { smeltingConfig } from '../../config/smeltingConfig.js';

// UI Elements
const inventoryList = document.getElementById('inventory-list');
const inventoryWeaponList = document.getElementById('inventory-weapon-list');

export function updateForgingUI() {
    // Get active tab
    const activeTabBtn = document.querySelector('.forging-tabs .tab-btn.active');
    const activeTab = activeTabBtn ? activeTabBtn.getAttribute('data-tab') : 'wood';

    // Map tab to category
    const category = activeTab; // 'wood', 'iron', 'refined-iron'

    const listId = `forging-list-${category}`;
    const list = document.getElementById(listId);
    if (!list) return;
    
    list.innerHTML = '';
    
    for (const id in weaponConfig) {
        const weapon = weaponConfig[id];
        const weaponId = parseInt(id);
        
        // Filter by category
        if (weapon.category !== category) continue;

        // Skip if already owned? Or show "Owned"?
        const isOwned = state.ownedWeapons.includes(weaponId);
        
        // Only show weapons that have crafting info
        if (!weapon.crafting) continue; 
        
        const div = document.createElement('div');
        div.className = 'upgrade-item';
        
        let materialHtml = '<div style="margin: 10px 0; text-align: left; background: rgba(0,0,0,0.3); padding: 5px; border-radius: 5px;">';
        let canCraft = true;
        
        for (const matId in weapon.crafting.materials) {
            const required = weapon.crafting.materials[matId];
            const owned = state.inventory[matId] || 0;
            const matName = itemConfig[matId] ? itemConfig[matId].name : `未知物品${matId}`;
            const color = owned >= required ? '#4CAF50' : '#f44336';
            
            materialHtml += `<p style="color: ${color}; margin: 2px 0;">${matName}: ${owned}/${required}</p>`;
            if (owned < required) canCraft = false;
        }
        materialHtml += '</div>';
        
        let btnHtml = '';
        if (isOwned) {
            btnHtml = `<button disabled style="background-color: #555;">已拥有</button>`;
        } else {
            btnHtml = `<button ${canCraft ? '' : 'disabled'} onclick="window.forgeWeapon(${id})" style="background-color: ${canCraft ? '#FF9800' : '#555'};">
                ${canCraft ? '锻造' : '材料不足'}
            </button>`;
        }
        
        div.innerHTML = `
            <h2>${weapon.name}</h2>
            <p style="color: #B0BEC5; font-size: 14px; margin: -5px 0 10px 0;">[${weapon.grade || '凡品'}]</p>
            <div style="font-size: 48px; margin-bottom: 10px;">${weapon.icon || '⚔️'}</div>
            <p>伤害: 力量 x ${(weapon.damageMultiplier * 100).toFixed(0)}%</p>
            ${materialHtml}
            ${btnHtml}
        `;
        list.appendChild(div);
    }
    
    if (list.children.length === 0) {
        list.innerHTML = '<p>暂无可锻造的物品。</p>';
    }
}

export function updateSmeltingUI() {
    const basicContainer = document.querySelector('.smelting-basic-container');
    const spiritContainer = document.querySelector('.smelting-spirit-container');

    // 兼容旧结构：如果找不到分页容器，则退回到原有单容器逻辑
    const legacyContainer = !basicContainer && !spiritContainer
        ? document.querySelector('.smelting-container .upgrade-container')
        : null;

    if (!basicContainer && !spiritContainer && !legacyContainer) return;

    if (basicContainer) basicContainer.innerHTML = '';
    if (spiritContainer) spiritContainer.innerHTML = '';
    if (legacyContainer) legacyContainer.innerHTML = '';

    const createSmeltingCard = (recipe, options = {}) => {
        const { showReiki = false } = options;
        const div = document.createElement('div');
        div.className = 'smelting-item';
        div.style.background = 'rgba(255,255,255,0.1)';
        div.style.padding = '20px';
        div.style.borderRadius = '10px';
        div.style.textAlign = 'center';
        div.style.width = '300px';
        div.style.margin = '10px';

        // Check material requirements
        let canSmelt = true;
        let reqText = '';
        for (const matId in recipe.input) {
            const required = recipe.input[matId];
            const owned = state.inventory[matId] || 0;
            const matName = itemConfig[matId] ? itemConfig[matId].name : `未知物品${matId}`;
            const color = owned >= required ? '#4CAF50' : '#f44336';
            reqText += `<p>消耗: ${matName} x${required} <span style="color: ${color}">(${owned})</span></p>`;
            if (owned < required) canSmelt = false;
        }

        let reikiText = '';
        if (showReiki && recipe.reikiCost) {
            const ownedReiki = state.totalReiki || 0;
            const color = ownedReiki >= recipe.reikiCost ? '#4CAF50' : '#f44336';
            reikiText += `<p>消耗: 灵气 x${recipe.reikiCost} <span style="color: ${color}">(当前: ${Math.floor(ownedReiki)})</span></p>`;
            if (ownedReiki < recipe.reikiCost) {
                canSmelt = false;
            }
        }

        let outText = '';
        for (const itemId in recipe.output) {
            const count = recipe.output[itemId];
            const itemName = itemConfig[itemId] ? itemConfig[itemId].name : `未知物品${itemId}`;
            outText += `<p>产出: ${itemName} x${count}</p>`;
        }

        div.innerHTML = `
            <h3>${recipe.name}</h3>
            ${reqText}
            ${reikiText}
            ${outText}
            <button onclick="window.smeltItem('${recipe.id}')" style="background-color: ${canSmelt ? '#FF5722' : '#555'}; margin-top: 10px;" ${canSmelt ? '' : 'disabled'}>
                ${canSmelt ? '熔炼' : '材料/灵气不足'}
            </button>
        `;
        return div;
    };

    for (const key in smeltingConfig) {
        const recipe = smeltingConfig[key];
        const category = recipe.category || 'basic';

        // 基础兼容模式：如果没有分页容器，则全部渲染到legacyContainer
        if (legacyContainer) {
            const card = createSmeltingCard(recipe, { showReiki: !!recipe.reikiCost });
            legacyContainer.appendChild(card);
            continue;
        }

        if (category === 'basic' && basicContainer) {
            const card = createSmeltingCard(recipe, { showReiki: false });
            basicContainer.appendChild(card);
        } else if (category === 'spirit' && spiritContainer) {
            const card = createSmeltingCard(recipe, { showReiki: true });
            spiritContainer.appendChild(card);
        }
    }

    if (basicContainer && basicContainer.children.length === 0) {
        basicContainer.innerHTML = '<p>暂无可熔炼的配方。</p>';
    }
    if (spiritContainer && spiritContainer.children.length === 0) {
        spiritContainer.innerHTML = '<p>暂无可注入灵气的配方。</p>';
    }
    if (legacyContainer && legacyContainer.children.length === 0) {
        legacyContainer.innerHTML = '<p>暂无可熔炼的物品。</p>';
    }
}

export function updateInventoryUI() {
    updateInventoryItemsUI();
    updateInventoryWeaponsUI();
}

function updateInventoryItemsUI() {
    if (!inventoryList) return;
    inventoryList.innerHTML = '';
    const itemIds = Object.keys(state.inventory);
    
    if (itemIds.length === 0) {
        inventoryList.innerHTML = '<p style="color: #aaa; font-size: 18px;">暂无道具</p>';
        return;
    }

    itemIds.forEach(id => {
        const count = state.inventory[id];
        if (count > 0) {
            const item = itemConfig[id];
            const div = document.createElement('div');
            div.className = 'upgrade-item'; // 复用样式
            div.style.display = 'flex';
            div.style.flexDirection = 'column';
            div.style.alignItems = 'center';
            div.innerHTML = `
                <div style="font-size: 32px; margin-bottom: 10px;">${item.icon}</div>
                <h3>${item.name} x${count}</h3>
                <p style="font-size: 12px; color: #ccc;">${item.description}</p>
                ${item.usable ? '<button>使用</button>' : '<button disabled style="background: #555; cursor: not-allowed;">不可使用</button>'}
            `;
            inventoryList.appendChild(div);
        }
    });
}

function updateInventoryWeaponsUI() {
    if (!inventoryWeaponList) return;
    inventoryWeaponList.innerHTML = '';
    
    for (const id in weaponConfig) {
        const weapon = weaponConfig[id];
        const weaponId = parseInt(id);
        
        // 仅显示已拥有的武器
        if (!state.ownedWeapons.includes(weaponId)) {
            continue;
        }

        const isEquipped = weaponId === state.equippedWeaponId;
        const isOwned = true; // 既然过滤了，这里肯定是 true
        
        let typeInfo = '';
        if (weapon.type === 'bounce') {
            typeInfo = `<p>类型: 弹射</p><p>弹射次数: ${weapon.bounceCount}</p>`;
        } else if (weapon.type === 'melee-sweep') {
            typeInfo = `<p>类型: 近战-横扫</p><p>范围: ${weapon.range || 100}</p>`;
        } else if (weapon.type === 'melee-thrust') {
            typeInfo = `<p>类型: 近战-刺击</p><p>范围: ${weapon.range || 100}</p>`;
        } else if (weapon.type === 'melee-smash') {
            typeInfo = `<p>类型: 近战-凿击</p><p>范围: ${weapon.range || 100}</p>`;
        } else {
            typeInfo = `<p>类型: 穿透</p><p>穿透次数: ${weapon.penetration}</p>`;
        }

        const div = document.createElement('div');
        div.className = 'upgrade-item';
        
        let buttonHtml = '';
        if (isOwned) {
            buttonHtml = `<button ${isEquipped ? 'disabled' : ''} onclick="window.equipWeapon(${id})">
                ${isEquipped ? '已装备' : '装备'}
            </button>`;
        } else {
            buttonHtml = `<button disabled style="background-color: #555;">未拥有 (请前往锻造)</button>`;
        }

        div.innerHTML = `
            <h2>${weapon.name}</h2>
            <p style="color: #B0BEC5; font-size: 14px; margin: -5px 0 10px 0;">[${weapon.grade || '凡品'}]</p>
            <div style="font-size: 48px; margin-bottom: 10px;">${weapon.icon || '⚔️'}</div>
            ${typeInfo}
            <p>伤害: 力量 x ${(weapon.damageMultiplier * 100).toFixed(0)}%</p>
            <p>射速: ${weapon.fireRate}ms</p>
            <p>弹丸数: ${weapon.projectileCount || '-'}</p>
            <p>连射数: ${weapon.burstCount || 1}</p>
            ${buttonHtml}
        `;
        inventoryWeaponList.appendChild(div);
    }
}
