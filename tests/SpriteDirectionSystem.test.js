import { describe, it, expect, vi } from 'vitest';
import {
    getDirectionFromFacing,
    getPlayerAnimationKey,
    updatePlayerAnimation,
    updatePlayerSpriteDirection
} from '../src/systems/SpriteDirectionSystem.js';

function makeMockSprite() {
    return {
        setFlipX: vi.fn(),
        play: vi.fn(),
        anims: { currentAnim: null }
    };
}

describe('SpriteDirectionSystem', () => {
    describe('getDirectionFromFacing', () => {
        it('returns right for positive facingX', () => {
            expect(getDirectionFromFacing(1)).toBe('right');
            expect(getDirectionFromFacing(0.5)).toBe('right');
        });

        it('returns right for zero facingX (default facing)', () => {
            expect(getDirectionFromFacing(0)).toBe('right');
        });

        it('returns left for negative facingX', () => {
            expect(getDirectionFromFacing(-1)).toBe('left');
            expect(getDirectionFromFacing(-0.1)).toBe('left');
        });
    });

    describe('getPlayerAnimationKey', () => {
        it('builds key from player number and state', () => {
            expect(getPlayerAnimationKey(0, 'idle')).toBe('player-0-idle');
            expect(getPlayerAnimationKey(2, 'run')).toBe('player-2-run');
            expect(getPlayerAnimationKey(3, 'jump')).toBe('player-3-jump');
        });
    });

    describe('updatePlayerAnimation', () => {
        it('plays idle animation when not moving and on ground', () => {
            const sprite = makeMockSprite();
            updatePlayerAnimation(sprite, 0, 1, false, false, 0);
            expect(sprite.play).toHaveBeenCalledWith('player-0-idle');
        });

        it('plays run animation when moving on ground', () => {
            const sprite = makeMockSprite();
            updatePlayerAnimation(sprite, 1, 1, true, false, 0);
            expect(sprite.play).toHaveBeenCalledWith('player-1-run');
        });

        it('plays jump animation when airborne with positive velocity', () => {
            const sprite = makeMockSprite();
            updatePlayerAnimation(sprite, 0, 1, false, true, 10);
            expect(sprite.play).toHaveBeenCalledWith('player-0-jump');
        });

        it('plays fall animation when airborne with negative velocity', () => {
            const sprite = makeMockSprite();
            updatePlayerAnimation(sprite, 0, 1, false, true, -5);
            expect(sprite.play).toHaveBeenCalledWith('player-0-fall');
        });

        it('flips sprite for left-facing', () => {
            const sprite = makeMockSprite();
            updatePlayerAnimation(sprite, 0, -1, false, false, 0);
            expect(sprite.setFlipX).toHaveBeenCalledWith(true);
        });

        it('does not flip sprite for right-facing', () => {
            const sprite = makeMockSprite();
            updatePlayerAnimation(sprite, 0, 1, false, false, 0);
            expect(sprite.setFlipX).toHaveBeenCalledWith(false);
        });

        it('does not replay same animation', () => {
            const sprite = makeMockSprite();
            sprite.anims.currentAnim = { key: 'player-0-idle' };
            updatePlayerAnimation(sprite, 0, 1, false, false, 0);
            expect(sprite.play).not.toHaveBeenCalled();
        });
    });

    describe('updatePlayerSpriteDirection', () => {
        it('flips sprite for left-facing', () => {
            const sprite = makeMockSprite();
            updatePlayerSpriteDirection(sprite, -1);
            expect(sprite.setFlipX).toHaveBeenCalledWith(true);
        });

        it('does not flip for right-facing', () => {
            const sprite = makeMockSprite();
            updatePlayerSpriteDirection(sprite, 1);
            expect(sprite.setFlipX).toHaveBeenCalledWith(false);
        });
    });
});
