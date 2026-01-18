import { worldToScreen } from './CoordinateSystem.js';

/**
 * Controls camera to follow players with smooth movement
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
            return { worldX: 15, worldY: 12 }; // Arena center fallback
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
     * Updates camera to follow players smoothly
     * @param {Array} players - Array of player entities
     */
    update(players) {
        const center = this.calculatePlayerCenter(players);
        const screenPos = worldToScreen(center.worldX, center.worldY, 0);

        // Camera scroll targets the center
        // Subtract half screen dimensions to center on target
        const targetX = screenPos.x - 1920 / 2;
        const targetY = screenPos.y - 1080 / 2;

        // Smooth lerp to target
        const currentX = this.camera.scrollX;
        const currentY = this.camera.scrollY;

        this.camera.setScroll(
            currentX + (targetX - currentX) * this.lerpSpeed,
            currentY + (targetY - currentY) * this.lerpSpeed
        );
    }
}
