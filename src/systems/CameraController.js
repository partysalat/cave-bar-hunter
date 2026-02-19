import { PIXELS_PER_UNIT, SCREEN_WIDTH } from './CoordinateSystem.js';

/**
 * Dynamic camera: keeps all players visible at all times.
 * Computes the bounding box (min/max worldX) of all players,
 * centers on the midpoint, and zooms to fit — instantly on zoom-out,
 * smoothly on zoom-in.
 */
export default class CameraController {
    constructor(camera) {
        this.camera = camera;
        this.lerpSpeed     = 0.08; // Smooth pan speed
        this.zoomLerpSpeed = 0.06; // Smooth zoom-in speed (zoom-out is instant)

        this.minZoom = 0.5;  // Max zoom-out: shows full 80-unit arena
        this.maxZoom = 1.2;  // Max zoom-in

        this.padding         = 8;  // World units of padding around player group
        this.minVisibleWidth = 40; // Never zoom in tighter than this (world units)

        // Exposed bounds (world units), updated each frame
        this.leftBound  = 0;
        this.rightBound = 80;
    }

    /**
     * Updates camera to keep all players in frame.
     * @param {Array} players
     * @param {number} arenaWidth - World units
     */
    update(players, arenaWidth) {
        if (players.length === 0) return;

        // Bounding box of all players
        let minX = Infinity;
        let maxX = -Infinity;
        for (const p of players) {
            if (p.worldX < minX) minX = p.worldX;
            if (p.worldX > maxX) maxX = p.worldX;
        }

        // Padded range, clamped to arena
        const paddedLeft  = Math.max(0, minX - this.padding);
        const paddedRight = Math.min(arenaWidth * PIXELS_PER_UNIT / PIXELS_PER_UNIT, maxX + this.padding);
        const targetVisibleWidth = Math.max(this.minVisibleWidth, paddedRight - paddedLeft);
        const centerWorldX = (paddedLeft + paddedRight) / 2;

        // Zoom to fit
        const targetZoom  = SCREEN_WIDTH / (targetVisibleWidth * PIXELS_PER_UNIT);
        const clampedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, targetZoom));

        // Zoom out instantly, zoom in smoothly
        const currentZoom = this.camera.zoom || 1;
        const newZoom = clampedZoom < currentZoom
            ? clampedZoom
            : currentZoom + (clampedZoom - currentZoom) * this.zoomLerpSpeed;
        this.camera.setZoom(newZoom);

        // Scroll to center on midpoint, respecting arena bounds
        const visiblePixels = SCREEN_WIDTH / newZoom;
        const targetScrollX = centerWorldX * PIXELS_PER_UNIT - visiblePixels / 2;
        const maxScrollX    = arenaWidth * PIXELS_PER_UNIT - visiblePixels;
        const clampedScrollX = Math.max(0, Math.min(Math.max(0, maxScrollX), targetScrollX));

        const newScrollX = this.camera.scrollX + (clampedScrollX - this.camera.scrollX) * this.lerpSpeed;
        this.camera.setScroll(newScrollX, 0);

        // Expose visible bounds for external use
        this.leftBound  = newScrollX / PIXELS_PER_UNIT;
        this.rightBound = (newScrollX + visiblePixels) / PIXELS_PER_UNIT;
    }
}
