import { state } from './state.js';
import { techniqueConfig, canCultivateTechnique } from '../config/techniqueConfig.js';
import { getPlayerStats } from './playerStats.js';
import { showNotification } from './ui/common.js';
import { updateTechniqueUI } from './ui/technique.js';
import { updateReikiDisplay } from './ui/lobby.js';

// 获取当前功法的加成（只有修炼成功的功法才提供加成）
export function getTechniqueBonuses() {
    if (!state.successfulTechniqueId) {
        return {};
    }
    
    const technique = techniqueConfig[state.successfulTechniqueId];
    if (!technique || !technique.bonuses) {
        return {};
    }
    
    return technique.bonuses;
}

// 获取已成功修炼的功法等级
export function getSuccessfulTechniqueGradeLevel() {
    if (!state.successfulTechniqueId) {
        return 0;
    }
    
    const technique = techniqueConfig[state.successfulTechniqueId];
    return technique ? technique.gradeLevel : 0;
}

// 修炼功法
export function cultivateTechnique(techniqueId) {
    const technique = techniqueConfig[techniqueId];
    if (!technique) {
        showNotification("功法不存在");
        return;
    }
    
    // 检查是否已达到解锁条件
    if (state.cultivationStage < technique.unlockStage) {
        showNotification(`需要达到${getStageName(technique.unlockStage)}才能修炼此功法`);
        return;
    }
    
    // 检查是否已达到功法上限
    if (!canCultivateTechnique(technique, state.cultivationStage)) {
        showNotification(`《${technique.name}》已无法继续提升您的境界`);
        return;
    }
    
    // 检查是否已有成功的功法，且等级不低于当前功法
    const successfulGradeLevel = getSuccessfulTechniqueGradeLevel();
    if (successfulGradeLevel > 0 && technique.gradeLevel <= successfulGradeLevel) {
        showNotification(`已成功修炼更高阶功法，无法修炼${technique.grade}功法`);
        return;
    }
    
    // 检查此功法是否已经修炼成功
    const techniqueState = state.techniqueStates[techniqueId];
    if (techniqueState && techniqueState.success) {
        showNotification(`《${technique.name}》已修炼成功，无需重复修炼`);
        return;
    }
    
    // 检查灵气是否足够
    if (state.totalReiki < technique.reikiCost) {
        showNotification(`灵气不足，需要 ${technique.reikiCost} 灵气`);
        return;
    }
    
    // 消耗灵气
    state.totalReiki -= technique.reikiCost;
    localStorage.setItem('totalReiki', state.totalReiki);
    
    // 初始化功法状态
    if (!state.techniqueStates[techniqueId]) {
        state.techniqueStates[techniqueId] = { success: false, attempts: 0 };
    }
    
    // 增加尝试次数
    state.techniqueStates[techniqueId].attempts++;
    
    // 计算成功率 (悟性影响 + 修炼速度加成)
    const stats = getPlayerStats();
    let successRate = technique.baseSuccessRate * (stats.comprehension / 10);
    
    // 应用修炼速度加成
    if (stats.cultivationSpeed > 0) {
        successRate *= (1 + stats.cultivationSpeed);
    }
    
    successRate = Math.min(1.0, successRate);
    
    // 判断是否成功
    const success = Math.random() < successRate;
    
    if (success) {
        // 修炼成功
        state.techniqueStates[techniqueId].success = true;
        state.successfulTechniqueId = techniqueId;
        
        // 保存状态
        localStorage.setItem('techniqueStates', JSON.stringify(state.techniqueStates));
        localStorage.setItem('successfulTechniqueId', techniqueId);
        
        showNotification(`🎉 恭喜！成功修炼《${technique.name}》，已掌握此功法！`);
        
        // 检查是否是锻体圆满（stage 9），如果是则自动突破到练气期
        if (state.cultivationStage === 9) {
            // 自动突破到练气期
            state.cultivationStage = 10;
            localStorage.setItem('cultivationStage', state.cultivationStage);
            
            // 延迟显示突破通知，让玩家先看到功法修炼成功的消息
            setTimeout(() => {
                showNotification(`🎉 突破成功！晋升至练气期 1层！`);
                // 更新UI显示
                if (typeof window.updateCultivationUI === 'function') {
                    window.updateCultivationUI();
                }
                if (typeof window.updatePlayerStatsDisplay === 'function') {
                    window.updatePlayerStatsDisplay();
                }
            }, 1500);
        }
    } else {
        // 修炼失败
        localStorage.setItem('techniqueStates', JSON.stringify(state.techniqueStates));
        showNotification(`修炼失败，继续努力！当前成功率: ${(successRate * 100).toFixed(1)}%`);
    }
    
    // 更新UI
    updateTechniqueUI();
    updateReikiDisplay();
    
    // Update technique screen reiki display if available
    if (typeof window.updateTechniqueReikiDisplay === 'function') {
        window.updateTechniqueReikiDisplay();
    }
}

// 获取境界名称 (简化版)
function getStageName(stage) {
    if (stage === 0) return "凡人";
    if (stage >= 1 && stage <= 9) return `锻体期 ${stage}阶`;
    if (stage >= 10 && stage <= 18) return `练气期 ${stage - 9}层`;
    if (stage >= 19) return "筑基期";
    return "未知";
}
