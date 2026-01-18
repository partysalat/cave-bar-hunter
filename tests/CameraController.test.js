import { describe, it, expect, beforeEach } from 'vitest';
import CameraController from '../src/systems/CameraController.js';

describe('CameraController', () => {
    let mockCamera;

    beforeEach(() => {
        mockCamera = {
            scrollX: 0,
            scrollY: 0,
            setScroll: function(x, y) {
                this.scrollX = x;
                this.scrollY = y;
            }
        };
    });

    it('calculates center point of single player', () => {
        const players = [{ worldX: 10, worldY: 15 }];
        const controller = new CameraController(mockCamera);

        const center = controller.calculatePlayerCenter(players);
        expect(center.worldX).toBe(10);
        expect(center.worldY).toBe(15);
    });

    it('calculates center point of multiple players', () => {
        const players = [
            { worldX: 10, worldY: 10 },
            { worldX: 20, worldY: 20 }
        ];
        const controller = new CameraController(mockCamera);

        const center = controller.calculatePlayerCenter(players);
        expect(center.worldX).toBe(15);
        expect(center.worldY).toBe(15);
    });
});
