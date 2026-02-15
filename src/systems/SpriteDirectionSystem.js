/**
 * Sprite Direction System - Sidescroller version
 * Players face left or right. Direction is handled by sprite.setFlipX().
 * Animation state determines which clip plays (idle, run, jump, fall, attack, downed).
 */

/**
 * Returns facing direction string from horizontal facing value
 * @param {number} facingX - Positive = right, negative = left
 * @returns {'right'|'left'}
 */
export function getDirectionFromFacing(facingX) {
    return facingX >= 0 ? 'right' : 'left';
}

/**
 * Gets animation key for a player in a given state.
 * Direction is NOT part of the key - use sprite.setFlipX() for left-facing.
 * @param {number} playerNumber - 0-3
 * @param {string} state - 'idle' | 'run' | 'jump' | 'fall' | 'attack' | 'dodge' | 'downed'
 * @returns {string} Animation key
 */
export function getPlayerAnimationKey(playerNumber, state) {
    return `player-${playerNumber}-${state}`;
}

/**
 * Updates sprite animation and direction based on player state.
 * @param {Phaser.GameObjects.Sprite} sprite
 * @param {number} playerNumber - 0-3
 * @param {number} facingX - Positive = right, negative = left
 * @param {boolean} isMoving
 * @param {boolean} isAirborne - True if not on ground
 * @param {number} velocityY - Positive = rising, negative = falling
 */
export function updatePlayerAnimation(sprite, playerNumber, facingX, isMoving, isAirborne = false, velocityY = 0) {
    // Flip sprite for left-facing direction
    sprite.setFlipX(facingX < 0);

    let state;
    if (isAirborne) {
        state = velocityY >= 0 ? 'jump' : 'fall';
    } else if (isMoving) {
        state = 'run';
    } else {
        state = 'idle';
    }

    const animKey = getPlayerAnimationKey(playerNumber, state);
    if (sprite.anims.currentAnim?.key !== animKey) {
        sprite.play(animKey);
    }
}

/**
 * Updates sprite flip without changing animation (e.g. during attack)
 * @param {Phaser.GameObjects.Sprite} sprite
 * @param {number} facingX
 */
export function updatePlayerSpriteDirection(sprite, facingX) {
    sprite.setFlipX(facingX < 0);
}
