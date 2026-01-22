import { describe, it, expect } from 'vitest';
import { getDirectionFromFacing, getPlayerSpriteKey } from '../src/systems/SpriteDirectionSystem.js';
import { screenToWorldDirection } from '../src/systems/CoordinateSystem.js';

describe('SpriteDirectionSystem', () => {
    describe('getDirectionFromFacing', () => {
        it('should return south for no movement', () => {
            expect(getDirectionFromFacing(0, 0)).toBe('south');
        });

        it('should correctly map world directions to screen sprite directions', () => {
            // When player presses W (screen north), world direction is (0 + -1, -0 + -1) = (0, -1)
            // Should show north sprite
            const worldNorth = screenToWorldDirection(0, -1);
            expect(getDirectionFromFacing(worldNorth.x, worldNorth.y)).toBe('north');

            // When player presses D (screen east), world direction is (1 + 0, -1 + 0) = (1, -1)
            // Should show east sprite
            const worldEast = screenToWorldDirection(1, 0);
            expect(getDirectionFromFacing(worldEast.x, worldEast.y)).toBe('east');

            // When player presses S (screen south), world direction is (0 + 1, -0 + 1) = (0, 1)
            // Should show south sprite
            const worldSouth = screenToWorldDirection(0, 1);
            expect(getDirectionFromFacing(worldSouth.x, worldSouth.y)).toBe('south');

            // When player presses A (screen west), world direction is (-1 + 0, 1 + 0) = (-1, 1)
            // Should show west sprite
            const worldWest = screenToWorldDirection(-1, 0);
            expect(getDirectionFromFacing(worldWest.x, worldWest.y)).toBe('west');
        });

        it('should correctly map diagonal world directions to screen sprite directions', () => {
            // Screen north-east → world (1, -1) → should show north-east sprite
            const worldNE = screenToWorldDirection(1, -1);
            expect(getDirectionFromFacing(worldNE.x, worldNE.y)).toBe('north-east');

            // Screen south-east → world (1, 1) → should show south-east sprite
            const worldSE = screenToWorldDirection(1, 1);
            expect(getDirectionFromFacing(worldSE.x, worldSE.y)).toBe('south-east');

            // Screen south-west → world (-1, 1) → should show south-west sprite
            const worldSW = screenToWorldDirection(-1, 1);
            expect(getDirectionFromFacing(worldSW.x, worldSW.y)).toBe('south-west');

            // Screen north-west → world (-1, -1) → should show north-west sprite
            const worldNW = screenToWorldDirection(-1, -1);
            expect(getDirectionFromFacing(worldNW.x, worldNW.y)).toBe('north-west');
        });
    });

    describe('getPlayerSpriteKey', () => {
        it('should generate correct sprite keys', () => {
            expect(getPlayerSpriteKey(0, 'south')).toBe('player-0-south');
            expect(getPlayerSpriteKey(1, 'north-east')).toBe('player-1-north-east');
            expect(getPlayerSpriteKey(2, 'west')).toBe('player-2-west');
            expect(getPlayerSpriteKey(3, 'south-west')).toBe('player-3-south-west');
        });
    });
});
