import { state } from './state.js';
import { updateCultivationUI } from './ui/cultivation.js';
import { updatePlayerStatsDisplay, updateReikiDisplay } from './ui/lobby.js';
import { showNotification, showOfflineRewardPopup } from './ui/common.js';
import { updateFormationUI } from './ui/formation.js';
import { getPlayerStats } from './playerStats.js';
import { bodyRefiningConfig, qiCondensationConfig, bodyStrengtheningConfig, realmBaseConfig } from '../config/cultivationConfig.js';
import { formationConfig } from '../config/formationConfig.js';
import { getExpThresholds, getStageName } from './utils.js';

export function calculateOfflineProgress() {
    // 只有练气期及以上才有离线收益
    if (state.cultivationStage < 10) return;

    const now = Date.now();
    const lastSave = state.lastSaveTime;
    
    if (lastSave > 0 && now > lastSave) {
        const offlineSeconds = (now - lastSave) / 1000;
        
        // 至少离线 10 秒才计算
        if (offlineSeconds > 10) {
            const stats = getPlayerStats();
            const baseRate = 0; 
            let gainPerSecond = baseRate + (stats.comprehension * 0.1);
            
            let totalGain = 0;
            let stonesConsumed = 0;

            // 检查聚灵阵
            const formationId = 1; // 初级聚灵阵 ID
            if (state.activeFormations && state.activeFormations[formationId]) {
                const formation = formationConfig[formationId];
                const costPerSecond = formation.costPerSecond;
                const multiplier = formation.effectMultiplier;
                
                // 计算灵石能支撑多久
                const maxDuration = state.totalSpiritStones / costPerSecond;
                
                if (maxDuration >= offlineSeconds) {
                    // 灵石足够支撑全程
                    totalGain = (gainPerSecond * multiplier) * offlineSeconds;
                    stonesConsumed = costPerSecond * offlineSeconds;
                } else {
                    // 灵石不够支撑全程
                    // 前段享受加成
                    totalGain += (gainPerSecond * multiplier) * maxDuration;
                    stonesConsumed = state.totalSpiritStones; // 消耗所有灵石
                    
                    // 后段无加成
                    const remainingTime = offlineSeconds - maxDuration;
                    totalGain += gainPerSecond * remainingTime;
                    
                    // 关闭阵法
                    state.activeFormations[formationId] = false;
                    localStorage.setItem('activeFormations', JSON.stringify(state.activeFormations));
                }
            } else {
                totalGain = gainPerSecond * offlineSeconds;
            }
            
            state.totalReiki += totalGain;
            state.totalSpiritStones -= stonesConsumed;
            if (state.totalSpiritStones < 0) state.totalSpiritStones = 0;

            // 保存
            localStorage.setItem('totalReiki', state.totalReiki);
            localStorage.setItem('totalSpiritStones', state.totalSpiritStones);
            
            showOfflineRewardPopup(offlineSeconds, totalGain);
        }
    }
    
    // 更新最后保存时间
    state.lastSaveTime = now;
    localStorage.setItem('lastSaveTime', state.lastSaveTime);
}

export function addExperience(amount) {
    state.totalExp += amount;
    localStorage.setItem('totalExp', state.totalExp);
    updateCultivationUI();
    updatePlayerStatsDisplay();
}

// 尝试突破锻体期境界 (手动调用)
export function attemptBodyRefiningBreakthrough() {
    // 只有在锻体期 (Stage < 10) 才能使用此方法突破
    if (state.cultivationStage >= 10) {
        showNotification("已达练气期，请通过打坐修炼提升。");
        return;
    }

    let cost = 0;
    let nextStage = state.cultivationStage + 1;

    // 凡人 -> 锻体1阶
    if (state.cultivationStage === 0) {
        cost = realmBaseConfig[1].cost;
    } 
    // 锻体1-8阶 -> 下一阶
    else if (state.cultivationStage < 9) {
        cost = bodyRefiningConfig.getCost(nextStage);
    }
    // 锻体9阶 -> 练气期 (Stage 10)
    else if (state.cultivationStage === 9) {
        cost = realmBaseConfig[10].cost;
    }

    if (state.totalExp >= cost) {
        state.totalExp -= cost;
        state.cultivationStage = nextStage;
        
        localStorage.setItem('totalExp', state.totalExp);
        localStorage.setItem('cultivationStage', state.cultivationStage);
        
        showNotification(`突破成功！晋升至 ${getStageName(state.cultivationStage)}`);
        updateCultivationUI();
        updatePlayerStatsDisplay();
    } else {
        showNotification(`气血不足，需要 ${cost} 气血`);
    }
}

// 尝试突破练气期小境界 (手动调用)
export function attemptQiBreakthrough() {
    // 只有在练气期 (Stage >= 10) 才能使用此方法
    if (state.cultivationStage < 10) return;

    const currentQiTier = state.cultivationStage - 9;
    if (currentQiTier >= qiCondensationConfig.maxTier) {
        showNotification("练气期已圆满，请寻找筑基机缘。");
        return;
    }

    const nextTier = currentQiTier + 1;
    const cost = qiCondensationConfig.getCost(nextTier);
    
    if (state.totalReiki >= cost) {
        state.totalReiki -= cost;
        state.cultivationStage++;
        
        localStorage.setItem('totalReiki', state.totalReiki);
        localStorage.setItem('cultivationStage', state.cultivationStage);
        
        showNotification(`境界突破！晋升至 ${getStageName(state.cultivationStage)}`);
        updateCultivationUI();
        updatePlayerStatsDisplay();
        updateReikiDisplay();
    } else {
        showNotification(`灵气不足，需要 ${cost} 灵气`);
    }
}

// 气血锻体 (消耗气血提升体魄)
export function strengthenBody() {
    const cost = bodyStrengtheningConfig.getCost(state.bodyStrengtheningLevel);
    if (state.totalExp >= cost) {
        state.totalExp -= cost;
        state.bodyStrengtheningLevel++;
        
        localStorage.setItem('totalExp', state.totalExp);
        localStorage.setItem('bodyStrengtheningLevel', state.bodyStrengtheningLevel);
        
        showNotification(`锻体成功！气血锻体等级提升至 ${state.bodyStrengtheningLevel}`);
        updateCultivationUI();
        updatePlayerStatsDisplay();
    } else {
        showNotification('气血不足！');
    }
}

// 打坐/挂机逻辑 (每帧调用)
export function updateMeditation(deltaTime) {
    // 只有练气期及以上才能打坐
    if (state.cultivationStage < 10) return;
    
    // 计算灵气获取 (Reiki)
    // 基础速率: 0点/秒
    // 悟性加成: 1点悟性 + 0.1
    const stats = getPlayerStats();
    const baseRate = 0; 
    let gainPerSecond = baseRate + (stats.comprehension * 0.1);
    
    // 检查聚灵阵
    const formationId = 1;
    if (state.activeFormations && state.activeFormations[formationId]) {
        const formation = formationConfig[formationId];
        const costPerSecond = formation.costPerSecond;
        const cost = costPerSecond * (deltaTime / 1000);
        
        if (state.totalSpiritStones >= cost) {
            state.totalSpiritStones -= cost;
            gainPerSecond *= formation.effectMultiplier;
        } else {
            // 灵石不足，关闭阵法
            state.activeFormations[formationId] = false;
            localStorage.setItem('activeFormations', JSON.stringify(state.activeFormations));
            showNotification("灵石耗尽，聚灵阵已关闭");
            updateFormationUI(); // 更新阵法界面状态
        }
    }

    const gain = gainPerSecond * (deltaTime / 1000);
    
    state.totalReiki += gain;
    
    // 简单的节流保存
    if (!state.reikiSaveAccumulator) state.reikiSaveAccumulator = 0;
    state.reikiSaveAccumulator += gain;
    
    if (state.reikiSaveAccumulator >= 1) {
        localStorage.setItem('totalReiki', Math.floor(state.totalReiki));
        localStorage.setItem('totalSpiritStones', state.totalSpiritStones);
        state.reikiSaveAccumulator = 0;
        updateReikiDisplay(); // 更新UI显示
    }
    
    updateReikiDisplay();
}
