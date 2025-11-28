// UI Elements (Cached)
const levelClearedOverlay = document.getElementById('level-cleared-overlay');
const levelRewardDisplay = document.getElementById('level-reward-display');
const gameOverScreen = document.getElementById('game-over-screen');
const lossSpiritStonesDisplay = document.getElementById('loss-gold-display');
const levelSelectionScreen = document.getElementById('level-selection-screen');
const pauseBtn = document.getElementById('pause-btn');
const offlineRewardModal = document.getElementById('offline-reward-modal');
const offlineTimeDisplay = document.getElementById('offline-time-display');
const offlineGainDisplay = document.getElementById('offline-gain-display');
const btnClaimOffline = document.getElementById('btn-claim-offline');

export function showNotification(message) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.textContent = message;

    container.appendChild(toast);

    // 触发动画
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // 3秒后移除
    setTimeout(() => {
        toast.classList.remove('show');
        const removeToast = () => {
            if (toast.parentNode) {
                toast.remove();
            }
        };
        toast.addEventListener('transitionend', removeToast, { once: true });
        // 兜底处理，防止 transitionend 未触发
        setTimeout(removeToast, 500);
    }, 3000);
}

export function showGameOverScreen(lossSpiritStones) {
    if (lossSpiritStonesDisplay) lossSpiritStonesDisplay.textContent = `损失灵石: ${lossSpiritStones}`;
    if (gameOverScreen) gameOverScreen.classList.remove('hidden');
}

export function showLevelClearedOverlay(rewardText) {
    if (levelRewardDisplay) levelRewardDisplay.textContent = rewardText;
    if (levelClearedOverlay) levelClearedOverlay.classList.remove('hidden');
}

export function hideLevelClearedOverlay() {
    if (levelClearedOverlay) levelClearedOverlay.classList.add('hidden');
}

export function hideGameOverScreen() {
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
}

export function hideLevelSelectionScreen() {
    if (levelSelectionScreen) levelSelectionScreen.classList.add('hidden');
}

export function showPauseBtn() {
    if (pauseBtn) pauseBtn.classList.remove('hidden');
}

export function hidePauseBtn() {
    if (pauseBtn) pauseBtn.classList.add('hidden');
}

export function showOfflineRewardPopup(offlineTimeSeconds, gain) {
    if (!offlineRewardModal) return;
    
    // 格式化时间
    let timeStr = '';
    if (offlineTimeSeconds < 60) {
        timeStr = `${Math.floor(offlineTimeSeconds)}秒`;
    } else if (offlineTimeSeconds < 3600) {
        timeStr = `${Math.floor(offlineTimeSeconds / 60)}分${Math.floor(offlineTimeSeconds % 60)}秒`;
    } else {
        timeStr = `${Math.floor(offlineTimeSeconds / 3600)}小时${Math.floor((offlineTimeSeconds % 3600) / 60)}分`;
    }
    
    if (offlineTimeDisplay) offlineTimeDisplay.textContent = timeStr;
    if (offlineGainDisplay) offlineGainDisplay.textContent = `+${Math.floor(gain)}`;
    
    offlineRewardModal.classList.remove('hidden');
    
    if (btnClaimOffline) {
        btnClaimOffline.onclick = () => {
            offlineRewardModal.classList.add('hidden');
        };
    }
}
