// Constants from design doc (2K Resolution - 2× Scale)
export const TILE_WIDTH = 128; // 2× for 2560×1440
export const TILE_HEIGHT = 64; // 2× for 2560×1440
export const HEIGHT_SCALE = 100; // pixels per world unit in Z axis (2× scaled)
export const SCREEN_CENTER_X = 1280; // 2560 / 2
export const SCREEN_CENTER_Y = 720; // 1440 / 2

/**
 * Converts 3D world coordinates to 2D isometric screen coordinates
 * @param {number} worldX - Horizontal world position (0-30)
 * @param {number} worldY - Depth world position (0-25)
 * @param {number} worldZ - Height world position (0-10+)
 * @returns {{x: number, y: number}} Screen coordinates
 */
export function worldToScreen(worldX, worldY, worldZ) {
    const screenX = (worldX - worldY) * (TILE_WIDTH / 2) + SCREEN_CENTER_X;
    const screenY = (worldX + worldY) * (TILE_HEIGHT / 2) - (worldZ * HEIGHT_SCALE) + SCREEN_CENTER_Y;

    return { x: screenX, y: screenY };
}

/**
 * Converts 2D screen coordinates back to world coordinates (assumes Z=0)
 * @param {number} screenX - Screen X position
 * @param {number} screenY - Screen Y position
 * @returns {{worldX: number, worldY: number}} World coordinates at ground level
 */
export function screenToWorld(screenX, screenY) {
    // Offset from center
    const offsetX = screenX - SCREEN_CENTER_X;
    const offsetY = screenY - SCREEN_CENTER_Y;

    // Inverse isometric transformation
    const worldX = (offsetX / (TILE_WIDTH / 2) + offsetY / (TILE_HEIGHT / 2)) / 2;
    const worldY = (offsetY / (TILE_HEIGHT / 2) - offsetX / (TILE_WIDTH / 2)) / 2;

    return { worldX, worldY };
}

/**
 * Calculates depth value for sprite sorting
 * Objects further "back" (higher worldY) render in front
 * @param {number} worldY - World Y position
 * @param {number} worldZ - World Z position
 * @returns {number} Depth value for Phaser sprite sorting
 */
export function calculateDepth(worldY, worldZ) {
    return worldY * 1000 + worldZ * 10;
}
