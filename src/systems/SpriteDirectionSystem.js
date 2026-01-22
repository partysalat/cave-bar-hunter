/**
 * Sprite Direction System
 * Handles 8-directional sprite selection based on facing direction
 *
 * IMPORTANT: Sprite direction names (north, south, etc.) are in SCREEN SPACE,
 * but facing directions are stored in WORLD SPACE (isometric).
 * Always convert world directions to screen directions before determining sprite!
 */

import { worldToScreenDirection } from './CoordinateSystem.js';

/**
 * Converts screen-space facing direction to one of 8 cardinal directions
 * @param {number} screenFacingX - X component of SCREEN-SPACE facing direction
 * @param {number} screenFacingY - Y component of SCREEN-SPACE facing direction
 * @returns {string} Direction name (e.g., 'south', 'south-east', 'east', etc.)
 */
function getDirectionFromScreenFacing(screenFacingX, screenFacingY) {
    // Default to south if no facing direction
    if (screenFacingX === 0 && screenFacingY === 0) {
        return 'south';
    }

    // Calculate angle in radians (0 = east, counter-clockwise)
    const angle = Math.atan2(screenFacingY, screenFacingX);

    // Convert to degrees and normalize to 0-360
    let degrees = (angle * 180 / Math.PI);
    if (degrees < 0) degrees += 360;

    // Map to 8 directions (SCREEN SPACE)
    // Screen: East = 0°, South = 90°, West = 180°, North = 270°
    if (degrees >= 337.5 || degrees < 22.5) return 'east';
    if (degrees >= 22.5 && degrees < 67.5) return 'south-east';
    if (degrees >= 67.5 && degrees < 112.5) return 'south';
    if (degrees >= 112.5 && degrees < 157.5) return 'south-west';
    if (degrees >= 157.5 && degrees < 202.5) return 'west';
    if (degrees >= 202.5 && degrees < 247.5) return 'north-west';
    if (degrees >= 247.5 && degrees < 292.5) return 'north';
    if (degrees >= 292.5 && degrees < 337.5) return 'north-east';

    return 'south'; // Fallback
}

/**
 * Converts WORLD-SPACE facing direction to sprite direction name
 * @param {number} worldFacingX - X component of world-space facing direction
 * @param {number} worldFacingY - Y component of world-space facing direction
 * @returns {string} Direction name (e.g., 'south', 'south-east', 'east', etc.)
 */
export function getDirectionFromFacing(worldFacingX, worldFacingY) {
    // Convert world-space facing to screen-space
    const screenDir = worldToScreenDirection(worldFacingX, worldFacingY);

    // Get sprite direction from screen-space facing
    return getDirectionFromScreenFacing(screenDir.x, screenDir.y);
}

/**
 * Gets the sprite texture key for a player in a specific direction
 * @param {number} playerNumber - Player index (0-3)
 * @param {string} direction - Direction name (e.g., 'south', 'south-east')
 * @returns {string} Texture key
 */
export function getPlayerSpriteKey(playerNumber, direction) {
    return `player-${playerNumber}-${direction}`;
}

/**
 * Updates sprite texture based on entity's facing direction
 * @param {Phaser.GameObjects.Sprite} sprite - Phaser sprite to update
 * @param {number} playerNumber - Player index (0-3)
 * @param {number} facingX - X component of facing direction
 * @param {number} facingY - Y component of facing direction
 */
export function updatePlayerSpriteDirection(sprite, playerNumber, facingX, facingY) {
    const direction = getDirectionFromFacing(facingX, facingY);
    const key = getPlayerSpriteKey(playerNumber, direction);
    sprite.setTexture(key);
}

/**
 * Gets the animation key for a player in a specific direction and state
 * @param {number} playerNumber - Player index (0-3)
 * @param {string} direction - Direction name (e.g., 'south', 'south-east')
 * @param {boolean} isMoving - Whether the player is moving
 * @returns {string} Animation key
 */
export function getPlayerAnimationKey(playerNumber, direction, isMoving) {
    const state = isMoving ? 'run' : 'idle';
    return `player-${playerNumber}-${state}-${direction}`;
}

/**
 * Updates sprite animation based on entity's facing direction and movement state
 * @param {Phaser.GameObjects.Sprite} sprite - Phaser sprite to update
 * @param {number} playerNumber - Player index (0-3)
 * @param {number} facingX - X component of facing direction
 * @param {number} facingY - Y component of facing direction
 * @param {boolean} isMoving - Whether the player is moving
 */
export function updatePlayerAnimation(sprite, playerNumber, facingX, facingY, isMoving) {
    const direction = getDirectionFromFacing(facingX, facingY);
    const animKey = getPlayerAnimationKey(playerNumber, direction, isMoving);

    // Only play the animation if it's different from the current one
    if (sprite.anims.currentAnim?.key !== animKey) {
        sprite.play(animKey);
    }
}