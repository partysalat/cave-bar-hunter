import { describe, expect, it } from 'vitest';

import { positionToScreen } from '../../src/rendering/positionToScreen.ts';

describe('positionToScreen', () => {
    const width = 1000;
    const height = 800;

    it('maps far < mid < close on the x axis', () => {
        const far = positionToScreen({ zone: 'far', flank: 'center' }, width, height);
        const mid = positionToScreen({ zone: 'mid', flank: 'center' }, width, height);
        const close = positionToScreen({ zone: 'close', flank: 'center' }, width, height);

        expect(far.x).toBeLessThan(mid.x);
        expect(mid.x).toBeLessThan(close.x);
    });

    it('maps left < center < right on the y axis', () => {
        const left = positionToScreen({ zone: 'mid', flank: 'left' }, width, height);
        const center = positionToScreen({ zone: 'mid', flank: 'center' }, width, height);
        const right = positionToScreen({ zone: 'mid', flank: 'right' }, width, height);

        expect(left.y).toBeLessThan(center.y);
        expect(center.y).toBeLessThan(right.y);
    });

    it('scales proportionally with screen dimensions', () => {
        const original = positionToScreen({ zone: 'far', flank: 'left' }, 1000, 800);
        const doubled = positionToScreen({ zone: 'far', flank: 'left' }, 2000, 1600);

        expect(doubled.x).toBeCloseTo(original.x * 2);
        expect(doubled.y).toBeCloseTo(original.y * 2);
    });

    it('keeps all positions left of the dino area', () => {
        for (const zone of ['far', 'mid', 'close'] as const) {
            const position = positionToScreen({ zone, flank: 'center' }, width, height);
            expect(position.x).toBeLessThan(width * 0.72);
        }
    });
});
