import { describe, expect, it } from 'vitest';
import { AttackZoneResolver } from '../../../src/logic/dino/AttackZoneResolver.js';

describe('AttackZoneResolver', () => {
    it('returns the affected zones for spit and clones the positions', () => {
        const resolver = new AttackZoneResolver();
        const attack = {
            type: 'spit',
            affectedZones: [
                { zone: 'mid', flank: 'left' },
                { zone: 'mid', flank: 'center' },
                { zone: 'mid', flank: 'right' },
            ],
            qteType: 'timing',
            damage: 4,
        } as const;

        const zones = resolver.getAffectedZones(attack);

        expect(zones).toEqual(attack.affectedZones);
        expect(zones).not.toBe(attack.affectedZones);
    });

    it('hits every player in the mid zone for spit', () => {
        const resolver = new AttackZoneResolver();
        const attack = {
            type: 'spit',
            affectedZones: [
                { zone: 'mid', flank: 'left' },
                { zone: 'mid', flank: 'center' },
                { zone: 'mid', flank: 'right' },
            ],
            qteType: 'timing',
            damage: 4,
        } as const;

        const players = {
            0: { zone: 'close', flank: 'left' },
            1: { zone: 'mid', flank: 'center' },
            2: { zone: 'far', flank: 'right' },
            3: { zone: 'mid', flank: 'right' },
        } as const;

        expect(resolver.getAffectedPlayers(attack, players)).toEqual([1, 3]);
    });

    it('targets only the chosen close-zone player for bite', () => {
        const resolver = new AttackZoneResolver();
        const attack = {
            type: 'bite',
            affectedZones: [{ zone: 'close', flank: 'center' }],
            qteType: 'smash',
            damage: 6,
        } as const;

        const players = {
            0: { zone: 'close', flank: 'center' },
            1: { zone: 'close', flank: 'right' },
            2: { zone: 'mid', flank: 'left' },
            3: { zone: 'far', flank: 'center' },
        } as const;

        expect(resolver.getAffectedPlayers(attack, players)).toEqual([0]);
    });

    it('resolves bite against the exact telegraphed position', () => {
        const resolver = new AttackZoneResolver();
        const attack = {
            type: 'bite',
            affectedZones: [{ zone: 'mid', flank: 'left' }],
            qteType: 'smash',
            damage: 6,
        } as const;

        const players = {
            0: { zone: 'mid', flank: 'left' },
            1: { zone: 'close', flank: 'right' },
            2: { zone: 'far', flank: 'left' },
            3: { zone: 'far', flank: 'center' },
        } as const;

        expect(resolver.getAffectedPlayers(attack, players)).toEqual([0]);
    });
});
