import { describe, it, expect, beforeEach } from 'vitest';
import Dinosaur from '../src/entities/Dinosaur.js';

describe('Dinosaur', () => {
    let mockScene;

    beforeEach(() => {
        mockScene = {
            add: {
                sprite: () => ({
                    setOrigin: () => ({}),
                    setDepth: () => ({}),
                    setTint: () => ({})
                })
            }
        };
    });

    it('initializes with health and type', () => {
        const dino = new Dinosaur(mockScene, 'compy', 20, 15, 0);
        expect(dino.type).toBe('compy');
        expect(dino.health).toBeGreaterThan(0);
    });

    it('takes damage and dies at 0 health', () => {
        const dino = new Dinosaur(mockScene, 'compy', 20, 15, 0);
        const initialHealth = dino.health;

        dino.takeDamage(5);
        expect(dino.health).toBe(initialHealth - 5);
        expect(dino.isDead).toBe(false);

        dino.takeDamage(initialHealth);
        expect(dino.health).toBe(0);
        expect(dino.isDead).toBe(true);
    });
});
