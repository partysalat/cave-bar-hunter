import { describe, it, expect, beforeEach } from 'vitest';
import Entity from '../src/entities/Entity.js';

describe('Entity', () => {
    let mockScene;

    beforeEach(() => {
        mockScene = {
            add: {
                sprite: () => ({
                    setOrigin: () => ({}),
                    setDepth: () => ({})
                })
            }
        };
    });

    it('initializes with world position', () => {
        const entity = new Entity(mockScene, 10, 15, 0);
        expect(entity.worldX).toBe(10);
        expect(entity.worldY).toBe(15);
        expect(entity.worldZ).toBe(0);
    });

    it('updates screen position from world position', () => {
        const entity = new Entity(mockScene, 10, 5, 0);
        entity.updateScreenPosition();

        // Should convert (10, 5, 0) to screen coords (2K resolution)
        expect(entity.sprite.x).toBe(1280 + (10 - 5) * 64); // TILE_WIDTH/2 = 64
        expect(entity.sprite.y).toBe(720 + (10 + 5) * 32);  // TILE_HEIGHT/2 = 32
    });

    it('updates depth based on world position', () => {
        const entity = new Entity(mockScene, 0, 10, 2);
        const depth = entity.getDepth();
        expect(depth).toBe(10 * 1000 + 2 * 10);
    });
});
