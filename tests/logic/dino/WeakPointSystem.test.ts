import { describe, expect, it } from 'vitest';
import { WeakPointSystem } from '../../../src/logic/dino/WeakPointSystem.js';

describe('WeakPointSystem', () => {
    it('tracks accumulated damage per weak point', () => {
        const system = new WeakPointSystem();

        const result = system.applyDamage('head', 9);

        expect(result).toEqual({
            accumulatedDamage: 9,
            threshold: 15,
            thresholdReached: false,
        });
        expect(system.getAccumulatedDamage('head')).toBe(9);
        expect(system.getThreshold('head')).toBe(15);
    });

    it('reports threshold crossing and raises the next threshold', () => {
        const system = new WeakPointSystem();

        const result = system.applyDamage('legs', 20);

        expect(result).toEqual({
            accumulatedDamage: 20,
            threshold: 30,
            thresholdReached: true,
        });
        expect(system.getAccumulatedDamage('legs')).toBe(20);
        expect(system.getThreshold('legs')).toBe(30);
    });

    it('uses caller-provided thresholds when supplied', () => {
        const system = new WeakPointSystem({ head: 12 });

        expect(system.getThreshold('head')).toBe(12);
    });
});
