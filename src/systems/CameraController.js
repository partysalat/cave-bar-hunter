import { ARENA, PIXELS_PER_UNIT, SCREEN_WIDTH } from './WorldConfig.js';

export default class CameraController {
    constructor(camera) {
        this.camera = camera;
        this.minZoom = 0.85;
        this.maxZoom = 1.15;
        this.zoomLerp = 0.08;
    }

    update(players) {
        if (!players.length) return;

        let minX = Infinity;
        let maxX = -Infinity;
        for (const player of players) {
            minX = Math.min(minX, player.worldX);
            maxX = Math.max(maxX, player.worldX);
        }

        const span = Math.max(14, maxX - minX + 8);
        const targetZoom = SCREEN_WIDTH / (span * PIXELS_PER_UNIT);
        const clampedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, targetZoom));
        const currentZoom = this.camera.zoom || 1;
        const nextZoom = currentZoom + (clampedZoom - currentZoom) * this.zoomLerp;

        this.camera.setZoom(nextZoom);

        const centerX = (minX + maxX) / 2;
        const visibleWorldWidth = SCREEN_WIDTH / (nextZoom * PIXELS_PER_UNIT);
        const maxScrollX = Math.max(0, ARENA.width - visibleWorldWidth);
        const targetScrollX = Math.max(0, Math.min(maxScrollX, centerX - visibleWorldWidth / 2));
        this.camera.setScroll(targetScrollX * PIXELS_PER_UNIT, 0);
    }
}
