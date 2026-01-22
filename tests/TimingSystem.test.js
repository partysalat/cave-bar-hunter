import { describe, it, expect } from 'vitest';
import TimingSystem from '../src/systems/TimingSystem.js';

describe('TimingSystem', () => {
    it('detects perfect dodge timing', () => {
        const timing = new TimingSystem();

        // Register incoming attack warning at 2.5s before hit
        const attackId = timing.registerAttackWarning(2500);

        // Dodge at 0.4s before hit (within 0.5s perfect window)
        const isPerfect = timing.checkPerfectDodge(attackId, 400);

        expect(isPerfect).toBe(true);
    });

    it('rejects early dodge as not perfect', () => {
        const timing = new TimingSystem();

        const attackId = timing.registerAttackWarning(2500);

        // Dodge at 1.0s before hit (too early)
        const isPerfect = timing.checkPerfectDodge(attackId, 1000);

        expect(isPerfect).toBe(false);
    });

    it('grants damage buff after perfect dodge', () => {
        const timing = new TimingSystem();

        const buffData = timing.createPerfectDodgeBuff();

        expect(buffData.damageMultiplier).toBe(1.5); // 50% damage buff
        expect(buffData.duration).toBe(3000); // 3 seconds
    });
});
