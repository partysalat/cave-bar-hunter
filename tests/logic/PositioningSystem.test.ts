import { describe, expect, it } from 'vitest';
import { PositioningSystem } from '../../src/logic/PositioningSystem.js';

describe('PositioningSystem', () => {
    it('starts players in stable default positions and returns copies', () => {
        const system = new PositioningSystem();

        expect(system.getPosition(0)).toEqual({ zone: 'close', flank: 'left' });
        expect(system.getPosition(3)).toEqual({ zone: 'mid', flank: 'center' });
    });

    it('rejects diagonal moves but allows single-axis movement', () => {
        const system = new PositioningSystem();

        expect(system.validateMove(0, { zone: 'mid', flank: 'center' })).toBe(false);
        expect(system.validateMove(0, { zone: 'mid', flank: 'left' })).toBe(true);
        expect(system.validateMove(0, { zone: 'close', flank: 'center' })).toBe(true);
    });

    it('applies reposition actions and finds players in matching zones', () => {
        const system = new PositioningSystem();

        system.applyAction(0, { type: 'reposition', moveTo: { zone: 'mid', flank: 'left' } });
        system.setPosition(2, { zone: 'far', flank: 'right' });

        expect(system.getPosition(0)).toEqual({ zone: 'mid', flank: 'left' });
        expect(system.getPlayersInZones([
            { zone: 'mid', flank: 'left' },
            { zone: 'far', flank: 'right' },
        ])).toEqual([0, 2]);
    });
});
