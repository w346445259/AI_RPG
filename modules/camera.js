import { state } from './state.js';
import { cameraConfig } from '../config/cameraConfig.js';

export function updateCamera() {
    // Deadzone logic: use config
    // Since we are zoomed in by 2x, the effective viewport size in world coordinates is halved.
    const zoomLevel = cameraConfig.zoomLevel;
    const viewportWidth = state.canvas.width / zoomLevel;
    const viewportHeight = state.canvas.height / zoomLevel;

    const safeW = viewportWidth * cameraConfig.deadzoneRatio;
    const safeH = viewportHeight * cameraConfig.deadzoneRatio;
    const marginX = (viewportWidth - safeW) / 2;
    const marginY = (viewportHeight - safeH) / 2;

    // Calculate camera target based on player position relative to current camera
    // If player is to the left of the safe zone
    if (state.player.x < state.camera.x + marginX) {
        state.camera.x = state.player.x - marginX;
    }
    // If player is to the right of the safe zone
    else if (state.player.x > state.camera.x + viewportWidth - marginX) {
        state.camera.x = state.player.x - (viewportWidth - marginX);
    }

    // If player is above the safe zone
    if (state.player.y < state.camera.y + marginY) {
        state.camera.y = state.player.y - marginY;
    }
    // If player is below the safe zone
    else if (state.player.y > state.camera.y + viewportHeight - marginY) {
        state.camera.y = state.player.y - (viewportHeight - marginY);
    }

    // Clamp camera to world bounds
    // The camera shows a viewport of size (viewportWidth, viewportHeight).
    // So the max x is worldWidth - viewportWidth.
    state.camera.x = Math.max(0, Math.min(state.camera.x, state.worldWidth - viewportWidth));
    state.camera.y = Math.max(0, Math.min(state.camera.y, state.worldHeight - viewportHeight));
}
