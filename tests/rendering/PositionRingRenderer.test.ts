import { describe, expect, it } from 'vitest';

import { playerRingColor } from '../../src/rendering/PositionRingRenderer.ts';

describe('playerRingColor', () => {
    it('returns distinct colors for all four players', () => {
        const colors = [0, 1, 2, 3].map((playerId) => playerRingColor(playerId as 0 | 1 | 2 | 3));
        expect(new Set(colors).size).toBe(4);
    });

    it('returns a valid 24-bit color for each player', () => {
        for (const playerId of [0, 1, 2, 3] as const) {
            const color = playerRingColor(playerId);
            expect(color).toBeGreaterThanOrEqual(0);
            expect(color).toBeLessThanOrEqual(0xffffff);
        }
    });
});
