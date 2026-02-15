// Sidescroller coordinate system - simple linear 2D mapping
// worldX = horizontal position, worldY = vertical height (0 = ground)
export const SCREEN_WIDTH = 2560;
export const SCREEN_HEIGHT = 1440;
export const PIXELS_PER_UNIT = 64;  // 1 world unit = 64 pixels
export const SCREEN_FLOOR_Y = 1100; // screen Y pixel where worldY=0 (ground level)

/**
 * Converts 2D world coordinates to screen coordinates
 * @param {number} worldX - Horizontal world position
 * @param {number} worldY - Vertical height (0 = ground, positive = up)
 * @returns {{x: number, y: number}} Screen coordinates
 */
export function worldToScreen(worldX, worldY) {
    return {
        x: worldX * PIXELS_PER_UNIT,
        y: SCREEN_FLOOR_Y - worldY * PIXELS_PER_UNIT
    };
}

/**
 * Converts screen coordinates back to world coordinates
 * @param {number} screenX - Screen X position
 * @param {number} screenY - Screen Y position
 * @returns {{worldX: number, worldY: number}} World coordinates
 */
export function screenToWorld(screenX, screenY) {
    return {
        worldX: screenX / PIXELS_PER_UNIT,
        worldY: (SCREEN_FLOOR_Y - screenY) / PIXELS_PER_UNIT
    };
}

/**
 * Calculates depth value for sprite layer sorting.
 * In a sidescroller, entities share the same visual plane.
 * Use the layer constants below rather than per-entity depth calculation.
 * @returns {number} Depth value for Phaser sprite sorting
 */
export function calculateDepth() {
    return DEPTH_LAYERS.ENTITIES;
}

export const DEPTH_LAYERS = {
    BACKGROUND: 0,
    PLATFORMS:  5,
    ENTITIES:   10,  // players, enemies, projectiles
    FOREGROUND: 20,
    UI:         100,
};
