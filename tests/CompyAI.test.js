import { describe, expect, it } from 'vitest';
import CompyAI from '../src/ai/CompyAI.js';

describe('CompyAI', () => {
    it('keeps flank slots close enough for melee pressure', () => {
        const compy = {
            active: true,
            worldX: 8,
            velocityX: 0,
            moveSpeed: 5,
        };
        const ai = new CompyAI(compy, 1);
        const player = { worldX: 5 };

        ai.update(player);

        expect(ai.desiredDistance).toBeLessThanOrEqual(1.2);
        expect(compy.velocityX).toBeLessThan(0);
    });

    it('stops moving when it reaches its pressure slot', () => {
        const compy = {
            active: true,
            worldX: 6.08,
            velocityX: 3,
            moveSpeed: 5,
        };
        const ai = new CompyAI(compy, 1);
        const player = { worldX: 5 };

        ai.update(player);

        expect(compy.velocityX).toBe(0);
    });
});
