import { worldToScreen, PIXELS_PER_UNIT, SCREEN_WIDTH } from './CoordinateSystem.js';

/**
 * Controls camera to follow players with smooth movement.
 * Sidescroller mode: horizontal-only follow, clamped to arena bounds.
 */
export default class CameraController {
    constructor(camera) {
        this.camera = camera;
        this.lerpSpeed = 0.05; // Smooth follow speed (0-1)
    }

    /**
     * Calculates center point of all active players
     * @param {Array} players - Array of player entities
     * @returns {{worldX: number, worldY: number}}
     */
    calculatePlayerCenter(players) {
        if (players.length === 0) {
            return { worldX: 40, worldY: 0 }; // Arena center fallback
        }

        let sumX = 0;
        let sumY = 0;

        for (const player of players) {
            sumX += player.worldX;
            sumY += player.worldY;
        }

        return {
            worldX: sumX / players.length,
            worldY: sumY / players.length
        };
    }

    /**
     * Updates camera to follow players horizontally.
     * Clamps scroll to prevent showing space past arena edges.
     * Y is fixed at 0 (ground at SCREEN_FLOOR_Y, top of arena visible above).
     * @param {Array} players - Array of player entities
     * @param {number} arenaWidth - Arena width in world units
     */
    update(players, arenaWidth) {
        const center = this.calculatePlayerCenter(players);

        // Convert player center to screen X
        const centerScreenX = center.worldX * PIXELS_PER_UNIT;

        // Target scroll: center camera on players
        // scrollX is the left edge of the visible area
        const targetScrollX = centerScreenX - SCREEN_WIDTH / 2;

        // Clamp to arena bounds: don't scroll past left or right edge
        const maxScrollX = arenaWidth * PIXELS_PER_UNIT - SCREEN_WIDTH;
        const clampedScrollX = Math.max(0, Math.min(maxScrollX, targetScrollX));

        // Smooth lerp to target X
        const currentX = this.camera.scrollX;
        const newScrollX = currentX + (clampedScrollX - currentX) * this.lerpSpeed;

        // Y is always 0: floor is at SCREEN_FLOOR_Y (1100px), view starts at y=0
        this.camera.setScroll(newScrollX, 0);
    }
}
