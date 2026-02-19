import { describe, it, expect, beforeEach } from 'vitest';
import CameraController from '../src/systems/CameraController.js';

describe('CameraController', () => {
    let mockCamera;

    beforeEach(() => {
        mockCamera = {
            scrollX: 0,
            scrollY: 0,
            zoom: 1,
            setZoom: function(z) { this.zoom = z; },
            setScroll: function(x, y) {
                this.scrollX = x;
                this.scrollY = y;
            }
        };
    });

    it('centers on a single player', () => {
        const controller = new CameraController(mockCamera);
        controller.update([{ worldX: 40, worldY: 0 }], 80);
        // Player at x=40, arena center — scroll should be near 0 (camera centered)
        expect(mockCamera.scrollX).toBeGreaterThanOrEqual(0);
    });

    it('zooms out when players are far apart', () => {
        const controller = new CameraController(mockCamera);
        // Players at opposite ends of arena
        controller.update([{ worldX: 5, worldY: 0 }, { worldX: 75, worldY: 0 }], 80);
        expect(mockCamera.zoom).toBeLessThan(1);
    });

    it('does not zoom in beyond maxZoom', () => {
        const controller = new CameraController(mockCamera);
        // Players very close together
        controller.update([{ worldX: 20, worldY: 0 }, { worldX: 21, worldY: 0 }], 80);
        expect(mockCamera.zoom).toBeLessThanOrEqual(controller.maxZoom);
    });

    it('does not zoom out beyond minZoom', () => {
        const controller = new CameraController(mockCamera);
        // Players at extreme ends
        controller.update([{ worldX: 0, worldY: 0 }, { worldX: 80, worldY: 0 }], 80);
        expect(mockCamera.zoom).toBeGreaterThanOrEqual(controller.minZoom);
    });
});
