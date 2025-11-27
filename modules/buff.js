import { state } from './state.js';
import { buffConfig } from '../config/buffConfig.js';
import { showNotification } from './ui/common.js';
import { updateBuffUI } from './ui.js';

export function applyBuff(buffId, duration) {
    const config = buffConfig[buffId];
    if (!config) return;

    const existingBuff = state.activeBuffs.find(b => b.id === buffId);
    if (existingBuff) {
        existingBuff.duration = duration;
        existingBuff.maxDuration = duration;
    } else {
        state.activeBuffs.push({
            id: buffId,
            duration: duration,
            maxDuration: duration
        });
    }
    
    showNotification(`获得状态: ${config.name}`);
    updateBuffUI();
}

export function updateBuffs(dt) {
    if (state.activeBuffs.length === 0) return;

    let changed = false;
    for (let i = state.activeBuffs.length - 1; i >= 0; i--) {
        const buff = state.activeBuffs[i];
        buff.duration -= dt;
        if (buff.duration <= 0) {
            state.activeBuffs.splice(i, 1);
            changed = true;
        }
    }
    
    // 只有当buff消失或者每秒更新一次UI (为了倒计时)
    // 这里为了性能，我们可以在UI层做倒计时动画，或者每秒刷新一次
    // 暂时简单处理：每帧更新数据，UI层由主循环控制刷新频率
}
