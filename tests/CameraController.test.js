import { describe, expect, it } from 'vitest';
import CameraController from '../src/systems/CameraController.js';

function createCamera() {
    return {
        zoom: 1,
        scrollX: 0,
        setZoom(value) {
            this.zoom = value;
        },
        setScroll(x) {
            this.scrollX = x;
        },
    };
}

describe('CameraController', () => {
    it('keeps a single player within arena bounds', () => {
        const camera = createCamera();
        const controller = new CameraController(camera);

        controller.update([{ worldX: 4 }]);

        expect(camera.scrollX).toBeGreaterThanOrEqual(0);
    });

    it('zooms out slightly when players are far apart', () => {
        const camera = createCamera();
        const controller = new CameraController(camera);

        controller.update([{ worldX: 4 }, { worldX: 30 }]);

        expect(camera.zoom).toBeLessThan(1);
    });
});
