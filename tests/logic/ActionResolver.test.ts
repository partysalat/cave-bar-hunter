import { describe, expect, it } from 'vitest';

import type { PlayerId } from '../../src/core/types.js';
import ActionResolver from '../../src/logic/ActionResolver.js';
import PositioningSystem from '../../src/logic/PositioningSystem.js';

function createPlayerState(overrides: Partial<Record<PlayerId, { health: number; downed: boolean }>> = {}) {
    return {
        0: { health: 4, downed: false, ...overrides[0] },
        1: { health: 4, downed: false, ...overrides[1] },
        2: { health: 4, downed: false, ...overrides[2] },
        3: { health: 4, downed: false, ...overrides[3] },
    };
}

describe('ActionResolver', () => {
    it('applies reposition actions before damage is calculated', () => {
        const resolver = new ActionResolver();
        const positioning = new PositioningSystem({
            initialPositions: {
                0: { zone: 'close', flank: 'left' },
            },
        });

        const result = resolver.resolveRound({
            playerActions: {
                0: { type: 'reposition', moveTo: { zone: 'mid', flank: 'left' } },
                1: { type: 'attack' },
            },
            positioningSystem: positioning,
            attackDeclaration: {
                type: 'bite',
                affectedZones: [{ zone: 'close', flank: 'left' }],
                qteType: 'smash',
                damage: 6,
            },
            playerState: createPlayerState(),
        });

        expect(positioning.getPosition(0)).toEqual({ zone: 'mid', flank: 'left' });
        expect(result.damageDealt[1]).toBe(3);
    });

    it('records aimed strikes as weak-point hits and boosts damage during stagger', () => {
        const resolver = new ActionResolver();
        const positioning = new PositioningSystem({
            initialPositions: {
                0: { zone: 'close', flank: 'center' },
            },
        });

        const result = resolver.resolveRound({
            playerActions: {
                0: { type: 'aimed_strike', target: 'head' },
            },
            positioningSystem: positioning,
            attackDeclaration: {
                type: 'spit',
                affectedZones: [{ zone: 'mid', flank: 'left' }],
                qteType: 'timing',
                damage: 4,
            },
            playerState: createPlayerState(),
            staggerActive: true,
        });

        expect(result.damageDealt[0]).toBe(9);
        expect(result.weakPointHits).toEqual([
            { playerId: 0, weakPoint: 'head', damage: 9 },
        ]);
    });

    it('skips downed attackers and keeps brace markers available to the caller', () => {
        const resolver = new ActionResolver();
        const positioning = new PositioningSystem();

        const result = resolver.resolveRound({
            playerActions: {
                0: { type: 'attack' },
                1: { type: 'brace' },
                2: { type: 'attack' },
            },
            positioningSystem: positioning,
            attackDeclaration: {
                type: 'bite',
                affectedZones: [{ zone: 'close', flank: 'center' }],
                qteType: 'smash',
                damage: 6,
            },
            playerState: createPlayerState({
                2: { health: 0, downed: true },
            }),
        });

        expect(result.damageDealt[0]).toBe(3);
        expect(result.damageDealt[2]).toBe(0);
        expect(result.playersHit).toEqual([1]);
    });

    it('populates attackingPlayers with weaponType from playerState', () => {
        const resolver = new ActionResolver();
        const positioning = new PositioningSystem();

        const result = resolver.resolveRound({
            playerActions: {
                0: { type: 'attack' },
                1: { type: 'aimed_strike', target: 'head' },
                2: { type: 'brace' },
            },
            positioningSystem: positioning,
            attackDeclaration: {
                type: 'bite',
                affectedZones: [{ zone: 'close', flank: 'center' }],
                qteType: 'smash',
                damage: 6,
            },
            playerState: {
                0: { health: 4, downed: false, activeWeapon: 'bow' },
                1: { health: 4, downed: false, activeWeapon: 'club' },
                2: { health: 4, downed: false },
                3: { health: 4, downed: false },
            },
        });

        expect(result.attackingPlayers).toEqual([
            { playerId: 0, weaponType: 'bow', action: 'attack' },
            { playerId: 1, weaponType: 'club', action: 'aimed_strike' },
        ]);
    });

    it('excludes downed players from attackingPlayers', () => {
        const resolver = new ActionResolver();
        const positioning = new PositioningSystem();

        const result = resolver.resolveRound({
            playerActions: {
                0: { type: 'attack' },
            },
            positioningSystem: positioning,
            attackDeclaration: {
                type: 'bite',
                affectedZones: [],
                qteType: 'smash',
                damage: 6,
            },
            playerState: {
                0: { health: 0, downed: true },
                1: { health: 4, downed: false },
                2: { health: 4, downed: false },
                3: { health: 4, downed: false },
            },
        });

        expect(result.attackingPlayers).toEqual([]);
    });
});
