import Entity from './Entity.js';

/**
 * Bartender NPC Entity
 *
 * The bartender character who serves cocktails and reacts to player actions.
 * Features 4 animation states: idle, serving, victory, and disapproval.
 *
 * Animations:
 * - idle: Default state, cleaning mugs
 * - serving: Triggered when player purchases a drink
 * - victory: Celebrates when high-scoring player makes purchase
 * - disapproval: Reacts when low-scoring player tries to purchase
 */
export default class Bartender extends Entity {
    /**
     * @param {Phaser.Scene} scene - The scene this bartender belongs to
     * @param {number} worldX - World X position
     * @param {number} worldY - World Y position
     * @param {number} worldZ - World Z position (height)
     */
    constructor(scene, worldX, worldY, worldZ) {
        super(scene, worldX, worldY, worldZ);

        // Bartender state
        this.currentAnimation = 'idle';
        this.currentDirection = 'south'; // Default facing direction
        this.isAnimating = false;

        // Start with idle animation (this will set the texture from the atlas)
        this.playAnimation('idle', this.currentDirection);
    }

    /**
     * Play a bartender animation
     * @param {string} animationKey - Animation key (idle, serving, victory, disapproval)
     * @param {string} direction - Direction (south, south-east, etc.)
     */
    playAnimation(animationKey, direction = this.currentDirection) {
        const animKey = `bartender-${animationKey}-${direction}`;

        // Check if animation exists in scene's global AnimationManager
        if (this.scene.anims.exists(animKey)) {
            this.currentAnimation = animationKey;
            this.currentDirection = direction;
            this.sprite.play(animKey);
        } else {
            console.warn(`⚠️  Animation ${animKey} not found for bartender`);
        }
    }

    /**
     * Trigger serving animation, then return to idle
     */
    serveDrink() {
        if (this.isAnimating) return; // Don't interrupt current animation

        this.isAnimating = true;
        this.playAnimation('serving', this.currentDirection);

        // Return to idle after serving animation completes
        this.sprite.once('animationcomplete', () => {
            this.isAnimating = false;
            this.playAnimation('idle', this.currentDirection);
        });
    }

    /**
     * Trigger victory/celebration animation
     */
    celebrate() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.playAnimation('victory', this.currentDirection);

        // Return to idle after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            this.isAnimating = false;
            this.playAnimation('idle', this.currentDirection);
        });
    }

    /**
     * Trigger disapproval animation
     */
    disapprove() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.playAnimation('disapproval', this.currentDirection);

        // Return to idle after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            this.isAnimating = false;
            this.playAnimation('idle', this.currentDirection);
        });
    }

    /**
     * Update bartender (called every frame)
     * @param {number} time - Game time
     * @param {number} delta - Time since last frame
     */
    update(time, delta) {
        // Call parent update to handle screen position and depth
        super.update(time, delta);

        // Bartender is stationary, no movement logic needed
        // Animation state management happens via event-driven methods above
    }
}
