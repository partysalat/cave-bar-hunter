import { PIXELS_PER_UNIT, SCREEN_WIDTH } from './CoordinateSystem.js';

/**
 * Controls camera to follow players with smooth movement and dynamic zoom.
 * Sidescroller mode: horizontal-only follow, clamped to arena bounds.
 * Zoom adjusts so all alive players are always visible.
 */
export default class CameraController {
    constructor(camera) {
        this.camera = camera;
        this.lerpSpeed     = 0.05; // Smooth pan speed (0-1)
        this.zoomLerpSpeed = 0.03; // Smooth zoom speed (0-1)

        // Zoom bounds
        this.minZoom = 0.5;  // Max zoom-out: shows full 80-unit arena
        this.maxZoom = 1.2;  // Max zoom-in: slightly tighter than 1:1

        // Minimum visible world width at max zoom-in (world units)
        this.minVisibleWidth = 40;

        // Padding around player group (world units)
        this.zoomPadding = 8;
    }

    /**
     * Calculates center point of a set of players.
     */
    calculatePlayerCenter(players) {
        if (players.length === 0) return { worldX: 40, worldY: 0 };

        let sumX = 0;
        let sumY = 0;
        for (const player of players) {
            sumX += player.worldX;
            sumY += player.worldY;
        }
        return { worldX: sumX / players.length, worldY: sumY / players.length };
    }

    /**
     * Calculates the horizontal spread of a set of players in world units.
     */
    calculateSpread(players) {
        if (players.length <= 1) return 0;
        let minX = Infinity;
        let maxX = -Infinity;
        for (const player of players) {
            if (player.worldX < minX) minX = player.worldX;
            if (player.worldX > maxX) maxX = player.worldX;
        }
        return maxX - minX;
    }

    /**
     * Updates camera position and zoom to keep all alive players in frame.
     * @param {Array} players - Array of player entities
     * @param {number} arenaWidth - Arena width in world units
     */
    update(players, arenaWidth) {
        // Use alive players for zoom; fall back to all players if all downed
        const alive = players.filter(p => !p.isDowned);
        const activePlayers = alive.length > 0 ? alive : players;

        const center = this.calculatePlayerCenter(activePlayers);
        const spread = this.calculateSpread(activePlayers);

        // Target visible world width: at least minVisibleWidth, plus padding around spread
        const targetVisibleWidth = Math.max(
            this.minVisibleWidth,
            spread + this.zoomPadding
        );

        // zoom = screen pixels / target world pixels
        const targetZoom = SCREEN_WIDTH / (targetVisibleWidth * PIXELS_PER_UNIT);
        const clampedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, targetZoom));

        // Lerp zoom
        const currentZoom = this.camera.zoom || 1;
        const newZoom = currentZoom + (clampedZoom - currentZoom) * this.zoomLerpSpeed;
        this.camera.setZoom(newZoom);

        // Scroll: center on player group, accounting for current zoom
        // visiblePixelWidth = SCREEN_WIDTH / newZoom (world pixels visible at this zoom)
        const visiblePixels = SCREEN_WIDTH / newZoom;
        const centerPixelX = center.worldX * PIXELS_PER_UNIT;
        const targetScrollX = centerPixelX - visiblePixels / 2;

        const maxScrollX = arenaWidth * PIXELS_PER_UNIT - visiblePixels;
        const clampedScrollX = Math.max(0, Math.min(maxScrollX, targetScrollX));

        const currentX = this.camera.scrollX;
        const newScrollX = currentX + (clampedScrollX - currentX) * this.lerpSpeed;

        this.camera.setScroll(newScrollX, 0);
    }
}
