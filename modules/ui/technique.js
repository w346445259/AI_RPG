import { state } from '../state.js';
import { techniqueConfig, getAvailableTechniques, canCultivateTechnique, TechniqueBonus } from '../../config/techniqueConfig.js';
import { getPlayerStats } from '../playerStats.js';
import { showNotification } from './common.js';

const techniqueListEl = document.getElementById('technique-list');

// 当前选中的功法等级页签
let currentTechniqueGrade = '黄阶';

// 格式化加成显示
function formatBonus(bonusType, value) {
    const bonusNames = {
        [TechniqueBonus.STRENGTH]: '力量',
        [TechniqueBonus.AGILITY]: '敏捷',
        [TechniqueBonus.PHYSIQUE]: '体魄',
        [TechniqueBonus.COMPREHENSION]: '悟性',
        [TechniqueBonus.DEFENSE]: '防御',
        [TechniqueBonus.SPIRITUAL_POWER]: '灵力',
        [TechniqueBonus.CRIT_CHANCE]: '暴击率',
        [TechniqueBonus.CRIT_DAMAGE]: '暴击伤害',
        [TechniqueBonus.CULTIVATION_SPEED]: '修炼速度',
        [TechniqueBonus.REIKI_REGEN]: '灵气回复'
    };
    
    const name = bonusNames[bonusType] || bonusType;
    let displayValue = value;
    
    // 百分比类型
    if (bonusType === TechniqueBonus.CRIT_CHANCE || 
        bonusType === TechniqueBonus.CULTIVATION_SPEED || 
        bonusType === TechniqueBonus.REIKI_REGEN) {
        displayValue = `${(value * 100).toFixed(1)}%`;
    } else if (bonusType === TechniqueBonus.CRIT_DAMAGE) {
        displayValue = `+${value.toFixed(1)}`;
    } else {
        displayValue = `+${value}`;
    }
    
    return `<span style="color: #4CAF50;">${name} ${displayValue}</span>`;
}

// 切换功法等级页签
export function switchTechniqueTab(grade) {
    currentTechniqueGrade = grade;
    
    // 更新页签样式
    const tabs = document.querySelectorAll('.technique-tab-btn');
    tabs.forEach(tab => {
        if (tab.dataset.grade === grade) {
            tab.classList.add('active');
            tab.style.opacity = '1';
            tab.style.transform = 'scale(1.05)';
        } else {
            tab.classList.remove('active');
            tab.style.opacity = '0.6';
            tab.style.transform = 'scale(1)';
        }
    });
    
    updateTechniqueUI();
}

export function updateTechniqueUI() {
    if (!techniqueListEl) return;
    
    techniqueListEl.innerHTML = '';
    
    // 检查是否达到解锁条件
    if (state.cultivationStage < 9) {
        techniqueListEl.innerHTML = '<p style="color: #ccc; text-align: center; padding: 20px;">需锻体圆满后方可修炼功法</p>';
        return;
    }
    
    const stats = getPlayerStats();
    
    // 获取已成功修炼的功法等级
    const successfulGradeLevel = state.successfulTechniqueId ? 
        (techniqueConfig[state.successfulTechniqueId]?.gradeLevel || 0) : 0;
    
    // 获取当前页签的所有功法
    const allTechniques = Object.values(techniqueConfig).filter(tech => 
        tech.grade === currentTechniqueGrade
    );
    
    if (allTechniques.length === 0) {
        techniqueListEl.innerHTML = '<p style="color: #ccc; text-align: center; padding: 20px;">暂无功法</p>';
        return;
    }
    
    // 当前阶位是否已经有成功修炼的功法（用于隐藏同阶功法成功率）
    const hasSuccessInCurrentGrade = allTechniques.some(tech => {
        const techniqueState = state.techniqueStates[tech.id];
        return techniqueState && techniqueState.success;
    });
    
    // 将已成功修炼的功法排在前面
    const sortedTechniques = [...allTechniques].sort((a, b) => {
        const aState = state.techniqueStates[a.id];
        const bState = state.techniqueStates[b.id];
        const aSuccess = aState && aState.success;
        const bSuccess = bState && bState.success;
        if (aSuccess && !bSuccess) return -1;
        if (!aSuccess && bSuccess) return 1;
        return a.id - b.id;
    });
    
    // 显示当前等级的所有功法
    sortedTechniques.forEach(technique => {
        const techniqueState = state.techniqueStates[technique.id];
        const isSuccess = techniqueState && techniqueState.success;
        const attempts = techniqueState ? techniqueState.attempts : 0;
        const canContinue = canCultivateTechnique(technique, state.cultivationStage);
        const hasEnoughReiki = state.totalReiki >= technique.reikiCost;
        
        // 当前阶位已经有成功功法时，隐藏同阶功法成功率
        const showSuccessRate = !hasSuccessInCurrentGrade;
        
        // 判断是否因为等级限制无法修炼
        const isGradeTooLow = successfulGradeLevel > 0 && technique.gradeLevel <= successfulGradeLevel && !isSuccess;
            
        
        // 计算成功率（包含修炼速度加成）
        let successRate = technique.baseSuccessRate * (stats.comprehension / 10);
        if (stats.cultivationSpeed > 0) {
            successRate *= (1 + stats.cultivationSpeed);
        }
        successRate = Math.min(100, successRate * 100);
        
        const successRateHTML = showSuccessRate
            ? `<div style="color: #aaa;">成功率: <span style="color: ${successRate >= 50 ? '#4CAF50' : '#FFA500'};">${successRate.toFixed(1)}%</span></div>`
            : '<div style="color: #aaa;">已掌握同阶功法，不再显示成功率</div>';
        
        const div = document.createElement('div');
        div.className = 'technique-card';
        div.style.cssText = `
            background: ${isSuccess ? 'rgba(76, 175, 80, 0.15)' : isGradeTooLow ? 'rgba(80, 80, 80, 0.3)' : attempts > 0 ? 'rgba(100, 100, 150, 0.1)' : 'rgba(0, 0, 0, 0.6)'};
            border: 2px solid ${isSuccess ? '#4CAF50' : isGradeTooLow ? 'rgba(255, 82, 82, 0.5)' : 'rgba(255, 255, 255, 0.2)'};
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            transition: all 0.3s;
            ${isGradeTooLow ? 'opacity: 0.6;' : ''}
        `;
            
        
        
        // 构建加成显示
        let bonusesHTML = '';
        if (technique.bonuses) {
            const bonusItems = Object.entries(technique.bonuses).map(([type, value]) => 
                formatBonus(type, value)
            ).join(' | ');
            bonusesHTML = `
                <div style="margin: 10px 0; padding: 10px; background: ${isSuccess ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)'}; border-radius: 5px; border-left: 3px solid #4CAF50;">
                    <div style="color: #4CAF50; font-size: 12px; margin-bottom: 5px; font-weight: bold;">功法加成${isSuccess ? ' (已生效)' : ' (修炼成功后生效)'}</div>
                    <div style="font-size: 13px; line-height: 1.6;">${bonusItems}</div>
                </div>
            `;
        }
        
        // 构建状态提示
        let statusHTML = '';
        if (isSuccess) {
            statusHTML = '<span style="color: #4CAF50; font-weight: bold; font-size: 14px;">✓ 已成功修炼</span>';
        } else if (attempts > 0) {
            statusHTML = `<span style="color: #FFD700; font-size: 13px;">已尝试 ${attempts} 次</span>`;
        } else if (isGradeTooLow) {
            statusHTML = '<span style="color: #FF5252; font-size: 13px;">✗ 无法修炼同阶或低阶功法</span>';
        }
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 32px;">${technique.icon}</span>
                    <div>
                        <h3 style="margin: 0; color: ${technique.color}; font-size: 20px;">${technique.name}</h3>
                        <span style="color: ${technique.color}; font-size: 14px;">${technique.grade}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    ${statusHTML}
                </div>
            </div>
            
            <p style="color: #ccc; font-size: 14px; margin: 10px 0;">${technique.description}</p>
            
            ${isGradeTooLow ? `
                <div style="margin: 10px 0; padding: 10px; background: rgba(255, 82, 82, 0.1); border-radius: 5px; border-left: 3px solid #FF5252;">
                    <div style="color: #FF5252; font-size: 13px; font-weight: bold;">⚠️ 已成功修炼更高阶功法，无法修炼${technique.grade}功法</div>
                </div>
            ` : ''}
            
            ${bonusesHTML}
            
            <div style="margin: 10px 0; padding: 10px; background: ${isSuccess ? 'rgba(0, 191, 255, 0.2)' : 'rgba(0, 191, 255, 0.1)'}; border-radius: 5px; border-left: 3px solid #00BFFF;">
                <div style="color: #00BFFF; font-size: 12px; margin-bottom: 5px; font-weight: bold;">灵气获取${isSuccess ? ' (已生效)' : ' (修炼成功后生效)'}</div>
                <div style="font-size: 14px; color: #00BFFF;">+${technique.reikiPerSecond}/秒</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; font-size: 14px;">
                <div style="color: #aaa;">消耗灵气: <span style="color: #00BFFF;">${technique.reikiCost}</span></div>
                ${successRateHTML}
            </div>
            
            ${isSuccess ? `
                <div style="margin: 10px 0; padding: 10px; background: rgba(76, 175, 80, 0.15); border-radius: 5px; border-left: 3px solid #4CAF50;">
                    <div style="color: #4CAF50; font-size: 14px; font-weight: bold;">✓ 已成功修炼此功法！</div>
                    <div style="color: #aaa; font-size: 12px; margin-top: 5px;">修炼次数: ${attempts} 次</div>
                </div>
            ` : attempts > 0 ? `
                <div style="margin: 10px 0; padding: 10px; background: rgba(255, 215, 0, 0.1); border-radius: 5px; border-left: 3px solid #FFD700;">
                    <div style="color: #FFD700; font-size: 13px;">已尝试 ${attempts} 次，继续努力！</div>
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button onclick="window.cultivateTechnique(${technique.id})" 
                    ${isSuccess || isGradeTooLow || !canContinue || !hasEnoughReiki ? 'disabled' : ''}
                    style="flex: 1; background-color: ${isSuccess || isGradeTooLow || !canContinue || !hasEnoughReiki ? '#555' : '#4CAF50'}; padding: 10px; border: none; border-radius: 5px; color: white; cursor: ${isSuccess || isGradeTooLow || !canContinue || !hasEnoughReiki ? 'not-allowed' : 'pointer'}; font-size: 16px;">
                    ${isSuccess ? '已成功修炼' : isGradeTooLow ? '无法修炼' : !canContinue ? '已达上限' : !hasEnoughReiki ? '灵气不足' : '修炼此功法'}
                </button>
            </div>
        `;
        
        techniqueListEl.appendChild(div);
    });
}
