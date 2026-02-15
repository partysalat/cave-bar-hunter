import { describe, it, expect, beforeEach } from 'vitest';
import Entity from '../src/entities/Entity.js';
import { PIXELS_PER_UNIT, SCREEN_FLOOR_Y, DEPTH_LAYERS } from '../src/systems/CoordinateSystem.js';

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
        const entity = new Entity(mockScene, 10, 5);
        expect(entity.worldX).toBe(10);
        expect(entity.worldY).toBe(5);
        expect(entity.onGround).toBe(false);
    });

    it('sets onGround true when initialized at ground level', () => {
        const entity = new Entity(mockScene, 10, 0);
        expect(entity.onGround).toBe(true);
    });

    it('updates screen position from world position', () => {
        const entity = new Entity(mockScene, 10, 5);
        entity.updateScreenPosition();

        // Sidescroller: screenX = worldX * PIXELS_PER_UNIT, screenY = SCREEN_FLOOR_Y - worldY * PIXELS_PER_UNIT
        expect(entity.sprite.x).toBe(10 * PIXELS_PER_UNIT);
        expect(entity.sprite.y).toBe(SCREEN_FLOOR_Y - 5 * PIXELS_PER_UNIT);
    });

    it('updates depth based on world position', () => {
        const entity = new Entity(mockScene, 0, 10);
        const depth = entity.getDepth();
        // Sidescroller: all entities share the same depth layer
        expect(depth).toBe(DEPTH_LAYERS.ENTITIES);
    });
});
