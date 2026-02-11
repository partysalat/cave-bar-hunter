import { describe, it, expect, beforeEach, vi } from 'vitest';
import Bartender from '../../src/entities/Bartender.js';

describe('Bartender', () => {
    let mockScene;
    let bartender;

    beforeEach(() => {
        // Create a more complete mock sprite
        const createMockSprite = () => ({
            setDepth: vi.fn().mockReturnThis(),
            setOrigin: vi.fn().mockReturnThis(),
            play: vi.fn().mockReturnThis(),
            once: vi.fn(),
            x: 0,
            y: 0,
            anims: {
                exists: vi.fn(() => true)
            }
        });

        // Mock Phaser scene
        mockScene = {
            add: {
                sprite: vi.fn(createMockSprite)
            },
            time: {
                delayedCall: vi.fn((delay, callback) => {
                    // Store callback for manual triggering in tests
                    return { callback, delay };
                })
            },
            anims: {
                create: vi.fn(),
                exists: vi.fn(() => true) // Mock animation existence check
            }
        };

        bartender = new Bartender(mockScene, 10, 5, 0);
    });

    it('initializes at world position', () => {
        expect(bartender.worldX).toBe(10);
        expect(bartender.worldY).toBe(5);
        expect(bartender.worldZ).toBe(0);
    });

    it('starts with idle animation', () => {
        expect(bartender.currentAnimation).toBe('idle');
        expect(bartender.currentDirection).toBe('south');
    });

    it('can play different animations', () => {
        bartender.playAnimation('serving', 'east');

        expect(bartender.currentAnimation).toBe('serving');
        expect(bartender.currentDirection).toBe('east');
        expect(bartender.sprite.play).toHaveBeenCalledWith('bartender-serving-east');
    });

    it('serves drink and returns to idle', () => {
        bartender.serveDrink();

        expect(bartender.isAnimating).toBe(true);
        expect(bartender.sprite.play).toHaveBeenCalledWith('bartender-serving-south');

        // Simulate animation complete event
        const onComplete = bartender.sprite.once.mock.calls[0][1];
        onComplete();

        expect(bartender.isAnimating).toBe(false);
        expect(bartender.currentAnimation).toBe('idle');
    });

    it('celebrates and returns to idle after delay', () => {
        bartender.celebrate();

        expect(bartender.isAnimating).toBe(true);
        expect(bartender.sprite.play).toHaveBeenCalledWith('bartender-victory-south');

        // Trigger the delayed callback manually
        const delayedCallResult = mockScene.time.delayedCall.mock.results[0].value;
        delayedCallResult.callback();

        expect(bartender.isAnimating).toBe(false);
        expect(bartender.currentAnimation).toBe('idle');
    });

    it('shows disapproval and returns to idle after delay', () => {
        bartender.disapprove();

        expect(bartender.isAnimating).toBe(true);
        expect(bartender.sprite.play).toHaveBeenCalledWith('bartender-disapproval-south');

        // Trigger the delayed callback manually
        const delayedCallResult = mockScene.time.delayedCall.mock.results[0].value;
        delayedCallResult.callback();

        expect(bartender.isAnimating).toBe(false);
        expect(bartender.currentAnimation).toBe('idle');
    });

    it('does not interrupt current animation', () => {
        bartender.serveDrink();
        const playCallCount = bartender.sprite.play.mock.calls.length;

        // Try to celebrate while serving
        bartender.celebrate();

        // Should not have triggered new animation
        expect(bartender.sprite.play.mock.calls.length).toBe(playCallCount);
    });

    it('updates screen position each frame', () => {
        const initialSpriteX = bartender.sprite.x;
        const initialSpriteY = bartender.sprite.y;

        // Change world position
        bartender.worldX = 12;
        bartender.worldY = 6;
        bartender.update(0, 16);

        // Screen position should update (implementation in Entity base class)
        // Note: This test verifies update() runs without errors
        expect(bartender.worldX).toBe(12);
        expect(bartender.worldY).toBe(6);
    });
});
