import { state } from '../state.js';
import { bodyRefiningConfig, realmBaseConfig, qiCondensationConfig, bodyStrengtheningConfig } from '../../config/cultivationConfig.js';
import { getExpThresholds } from '../utils.js';
import { getPlayerStats } from '../playerStats.js';
import { updateSpiritStonesDisplay } from './lobby.js';

// UI Elements
const contentBodyRefining = document.getElementById('content-body-refining');
const contentQiRefining = document.getElementById('content-qi-refining');
const contentFoundation = document.getElementById('content-foundation');
const bodyStrengtheningPanel = document.getElementById('body-strengthening-panel');
const bodyStrLevelEl = document.getElementById('body-str-level');
const bodyStrBonusEl = document.getElementById('body-str-bonus');
const bodyStrProgressBar = document.getElementById('body-str-progress-bar');
const bodyStrProgressText = document.getElementById('body-str-progress-text');
const btnStrengthenBody = document.getElementById('btn-strengthen-body');
const mortalProcessDiv = document.getElementById('mortal-process');
const mortalCompletedDiv = document.getElementById('mortal-completed');
const meditationPanel = document.getElementById('meditation-panel');
const meditationRateDisplay = document.getElementById('meditation-rate');

export function updateCultivationUI() {
    updateSpiritStonesDisplay();
    updateMeditationUI(); // 更新打坐面板

    // 更新修炼界面的灵气显示
    const cultivationReikiDisplay = document.getElementById('cultivation-reiki-display');
    if (cultivationReikiDisplay) {
        cultivationReikiDisplay.textContent = `当前气血: ${state.totalExp}`;
    }

    // 凡人阶段逻辑
    // const thresholds = getExpThresholds(); // 不再使用累积阈值
    
    if (state.cultivationStage > 0) {
        if (mortalProcessDiv) mortalProcessDiv.classList.add('hidden');
        if (mortalCompletedDiv) mortalCompletedDiv.classList.remove('hidden');
    } else {
        if (mortalProcessDiv) mortalProcessDiv.classList.remove('hidden');
        if (mortalCompletedDiv) mortalCompletedDiv.classList.add('hidden');
        
        const cost = realmBaseConfig[1].cost;
        // 移除按钮，改为显示进度
        if (mortalProcessDiv) {
            const percentage = Math.min(100, (state.totalExp / cost) * 100);
            const canBreakthrough = state.totalExp >= cost;
            
            mortalProcessDiv.innerHTML = `
                <h2>凡人阶段</h2>
                <p>肉体凡胎，未入仙途。</p>
                <p>当前气血: ${state.totalExp} / ${cost}</p>
                <div style="width: 100%; background: #555; height: 10px; border-radius: 5px; margin-top: 5px;">
                    <div style="width: ${percentage}%; background: #FF9800; height: 100%; border-radius: 5px;"></div>
                </div>
                <button onclick="window.attemptBodyRefiningBreakthrough()" style="margin-top: 15px; background-color: ${canBreakthrough ? '#FF9800' : '#555'};" ${canBreakthrough ? '' : 'disabled'}>
                    ${canBreakthrough ? '感应天地 (消耗气血)' : '气血不足'}
                </button>
            `;
        }
    }

    // 锻体阶段逻辑
    updateBodyRefiningUI();
    
    // 练气阶段逻辑
    updateQiCondensationUI();
    
    // 筑基阶段逻辑
    updateFoundationUI();
    
    // 气血锻体面板 (常驻，但仅在练气期及以上显示)
    updateBodyStrengtheningPanel();
}

export function updateFoundationUI() {
    if (!contentFoundation) return;
    contentFoundation.innerHTML = '';

    if (state.cultivationStage < 19) { // 筑基期是 Stage 19 (练气9层之后)
        contentFoundation.innerHTML = '<p>需练气圆满方可窥探筑基之境。</p>';
        return;
    }

    // 筑基期逻辑 (暂未实现，先显示占位符)
    contentFoundation.innerHTML = `
        <h2>筑基期</h2>
        <p>大道之基，已然铸成。</p>
        <p>（后续境界待开放）</p>
    `;
}

export function updateBodyStrengtheningPanel() {
    if (!bodyStrengtheningPanel) return;

    // 只有练气期及以上才显示气血锻体
    if (state.cultivationStage < 10) {
        bodyStrengtheningPanel.classList.add('hidden');
        return;
    }

    bodyStrengtheningPanel.classList.remove('hidden');
    
    const level = state.bodyStrengtheningLevel;
    const cost = bodyStrengtheningConfig.getCost(level);
    const bonus = level * bodyStrengtheningConfig.physiquePerLevel;
    
    if (bodyStrLevelEl) bodyStrLevelEl.textContent = level;
    if (bodyStrBonusEl) bodyStrBonusEl.textContent = bonus;
    
    const percentage = Math.min(100, (state.totalExp / cost) * 100);
    if (bodyStrProgressBar) bodyStrProgressBar.style.width = `${percentage}%`;
    if (bodyStrProgressText) bodyStrProgressText.textContent = `${state.totalExp} / ${cost}`;
    
    if (btnStrengthenBody) {
        btnStrengthenBody.disabled = state.totalExp < cost;
        // 绑定事件 (注意防止重复绑定，最好在初始化时绑定，或者这里用 onclick 覆盖)
        btnStrengthenBody.onclick = window.strengthenBody;
    }
}

export function updateQiCondensationUI() {
    if (!contentQiRefining) return;
    
    const container = contentQiRefining;
    container.innerHTML = '';

    if (state.cultivationStage < 10) {
        container.innerHTML = '<p>需锻体圆满方可窥探练气之境。</p>';
        return;
    }

    const currentQiTier = state.cultivationStage - 9;
    const maxQiTier = qiCondensationConfig.maxTier;
    
    // 练气修炼面板 (打坐/灵力)
    let cultivationHtml = '';
    
    if (currentQiTier <= maxQiTier) {
        const nextQiTier = currentQiTier + 1;
        const cost = qiCondensationConfig.getCost(nextQiTier); // 需要灵气
        const currentReiki = state.totalReiki;
        
        const percentage = Math.min(100, (currentReiki / cost) * 100);
        
        // 计算打坐效率
        const stats = getPlayerStats();
        const meditationRate = 0 + (stats.comprehension * 0.1); // 基础0点/秒 + 悟性 * 0.1
        const canBreakthrough = currentReiki >= cost;

        cultivationHtml = `
            <div style="padding: 15px; background: rgba(50, 100, 150, 0.3); border-radius: 8px; border: 1px solid #2196F3;">
                <h3 style="color: #2196F3;">练气修炼 (第 ${currentQiTier} 层)</h3>
                <p>打坐吸纳天地灵气，凝聚灵力。</p>
                <p>当前灵气: ${Math.floor(currentReiki)} / ${cost}</p>
                <p>打坐效率: ${meditationRate.toFixed(2)} 灵气/秒 (受悟性加成)</p>
                <div style="width: 100%; background: #555; height: 10px; border-radius: 5px; margin-top: 5px;">
                    <div style="width: ${percentage}%; background: #2196F3; height: 100%; border-radius: 5px;"></div>
                </div>
                <button onclick="window.attemptQiBreakthrough()" style="margin-top: 15px; background-color: ${canBreakthrough ? '#2196F3' : '#555'};" ${canBreakthrough ? '' : 'disabled'}>
                    ${canBreakthrough ? `突破 (消耗 ${cost} 灵气)` : '灵气不足'}
                </button>
            </div>
        `;
    } else {
        cultivationHtml = `
            <div style="padding: 15px; background: rgba(255, 215, 0, 0.1); border-radius: 8px; border: 1px solid gold;">
                <h3 style="color: gold;">练气圆满</h3>
                <p>灵力化液，准备筑基 (后续版本开放)。</p>
            </div>
        `;
    }

    container.innerHTML = cultivationHtml;
}

export function updateBodyRefiningUI() {
    if (!contentBodyRefining) return;
    contentBodyRefining.innerHTML = ''; // 清空内容

    if (state.cultivationStage === 0) {
        contentBodyRefining.innerHTML = '<p>请先完成凡人阶段的修炼。</p>';
        return;
    }

    const currentTier = state.cultivationStage;
    const maxTier = bodyRefiningConfig.maxTier || 9;
    const baseStats = realmBaseConfig[1].stats;
    const thresholds = getExpThresholds();

    // 辅助函数：计算总属性
    const getTotalStats = (tierStats) => {
        return {
            strength: (baseStats.strength || 0) + (tierStats.strength || 0),
            agility: (baseStats.agility || 0) + (tierStats.agility || 0),
            comprehension: (baseStats.comprehension || 0) + (tierStats.comprehension || 0),
            physique: (baseStats.physique || 0) + (tierStats.physique || 0),
            defense: (baseStats.defense || 0) + (tierStats.defense || 0)
        };
    };

    // 如果已经进入筑基期 (Stage >= 10)
    if (currentTier >= 10) {
        const maxTierStats = bodyRefiningConfig.tiers[maxTier];
        const total = getTotalStats(maxTierStats);
        contentBodyRefining.innerHTML = `
            <h2>锻体期 (圆满)</h2>
            <p>肉身已臻化境，已成功筑基。</p>
            <p>本阶段累计属性: 力量 +${total.strength}, 敏捷 +${total.agility}, 体魄 +${total.physique}</p>
        `;
        return;
    }

    // 当前是锻体期第 currentTier 阶
    const currentTierStats = bodyRefiningConfig.tiers[currentTier];
    const currentTotal = getTotalStats(currentTierStats);
    
    // 下一阶
    const nextTier = currentTier + 1;
    
    let html = `
        <h2>锻体期 第 ${currentTier} 阶</h2>
        <p>本阶段累计属性: 力量 +${currentTotal.strength}, 敏捷 +${currentTotal.agility}, 体魄 +${currentTotal.physique}</p>
    `;

    if (nextTier <= maxTier) {
        const nextTierStats = bodyRefiningConfig.tiers[nextTier];
        const nextTotal = getTotalStats(nextTierStats);
        const cost = bodyRefiningConfig.getCost(nextTier);
        
        const percentage = Math.min(100, (state.totalExp / cost) * 100);
        const canBreakthrough = state.totalExp >= cost;

        html += `
            <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <h3>下一阶: 第 ${nextTier} 阶</h3>
                <p>升级后累计属性: 力量 +${nextTotal.strength}, 敏捷 +${nextTotal.agility}, 体魄 +${nextTotal.physique}</p>
                <p>当前气血: ${state.totalExp} / ${cost}</p>
                <div style="width: 100%; background: #555; height: 10px; border-radius: 5px; margin-top: 5px;">
                    <div style="width: ${percentage}%; background: #FF5722; height: 100%; border-radius: 5px;"></div>
                </div>
                <button onclick="window.attemptBodyRefiningBreakthrough()" style="margin-top: 15px; background-color: ${canBreakthrough ? '#FF5722' : '#555'};" ${canBreakthrough ? '' : 'disabled'}>
                    ${canBreakthrough ? `突破 (消耗 ${cost} 气血)` : '气血不足'}
                </button>
            </div>
        `;
    } else {
        // 锻体9阶，准备突破到练气期
        const nextRealmConfig = realmBaseConfig[10]; // 练气期
        const cost = nextRealmConfig.cost; // 5000 气血
        const bonus = nextRealmConfig.stats;

        const percentage = Math.min(100, (state.totalExp / cost) * 100);
        const canBreakthrough = state.totalExp >= cost;

        html += `
            <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; border: 1px solid #03A9F4;">
                <h3 style="color: #03A9F4;">突破: 练气期</h3>
                <p>引气入体，踏入仙途。</p>
                <p>练气加成: 力量 +${bonus.strength}, 敏捷 +${bonus.agility}, 悟性 +${bonus.comprehension}, 体魄 +${bonus.physique}</p>
                <p>当前气血: ${state.totalExp} / ${cost}</p>
                <div style="width: 100%; background: #555; height: 10px; border-radius: 5px; margin-top: 5px;">
                    <div style="width: ${percentage}%; background: #03A9F4; height: 100%; border-radius: 5px;"></div>
                </div>
                <button onclick="window.attemptBodyRefiningBreakthrough()" style="margin-top: 15px; background-color: ${canBreakthrough ? '#03A9F4' : '#555'};" ${canBreakthrough ? '' : 'disabled'}>
                    ${canBreakthrough ? `突破至练气期 (消耗 ${cost} 气血)` : '气血不足'}
                </button>
            </div>
        `;
    }

    contentBodyRefining.innerHTML = html;
}

export function updateMeditationUI() {
    if (!meditationPanel) return;

    // 只有练气期及以上才显示打坐面板
    if (state.cultivationStage < 10) {
        meditationPanel.style.display = 'none';
        return;
    }

    meditationPanel.style.display = 'block';
    
    const stats = getPlayerStats();
    const baseRate = 0; 
    const gainPerSecond = baseRate + (stats.comprehension * 0.1);
    
    if (meditationRateDisplay) {
        meditationRateDisplay.textContent = `+${gainPerSecond.toFixed(2)}`;
    }
}
