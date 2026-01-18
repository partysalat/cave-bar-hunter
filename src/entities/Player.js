import Entity from './Entity.js';

// Player color mapping from design doc
const PLAYER_COLORS = [
    0xff0000, // Player 1: Red
    0x0000ff, // Player 2: Blue
    0xffff00, // Player 3: Yellow
    0x00ff00  // Player 4: Green
];

/**
 * Player entity - represents one of 1-4 caveman hunters
 */
export default class Player extends Entity {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} playerNumber - 0-3 player index
     * @param {number} worldX
     * @param {number} worldY
     * @param {number} worldZ
     */
    constructor(scene, playerNumber, worldX, worldY, worldZ) {
        super(scene, worldX, worldY, worldZ);

        this.playerNumber = playerNumber;
        this.color = PLAYER_COLORS[playerNumber];

        // Combat stats
        this.health = 2; // Takes 2 hits before downed
        this.maxHealth = 2;
        this.isDowned = false;

        // Equipment
        this.weapon = 'stone-spear'; // Starting weapon
        this.passiveAbilities = [];
        this.cocktailBuffs = [];

        // Score tracking
        this.score = 0;

        // Movement stats
        this.moveSpeed = 8; // world units per second

        // Collision
        this.radius = 0.5; // world units

        // Apply color tint to sprite
        this.sprite.setTint(this.color);
    }

    /**
     * Moves player based on D-pad input direction
     * @param {number} dirX - X direction (-1, 0, 1)
     * @param {number} dirY - Y direction (-1, 0, 1)
     */
    move(dirX, dirY) {
        // Normalize diagonal movement
        if (dirX !== 0 && dirY !== 0) {
            const length = Math.sqrt(dirX * dirX + dirY * dirY);
            dirX /= length;
            dirY /= length;
        }

        this.velocityX = dirX * this.moveSpeed;
        this.velocityY = dirY * this.moveSpeed;
    }

    /**
     * Stops player movement
     */
    stop() {
        this.velocityX = 0;
        this.velocityY = 0;
    }

    /**
     * Takes damage from dinosaur attack
     * @param {number} damage - Amount of damage (usually 1)
     */
    takeDamage(damage) {
        if (this.isDowned) return;

        this.health -= damage;

        if (this.health <= 0) {
            this.health = 0;
            this.isDowned = true;
        }
    }

    /**
     * Revives downed player
     */
    revive() {
        this.isDowned = false;
        this.health = 1; // Revive with partial health
    }

    /**
     * Adds points to player score
     * @param {number} points
     */
    addScore(points) {
        this.score += points;
    }

    /**
     * Constrains player position to arena boundaries
     * @param {number} minX - Min world X
     * @param {number} maxX - Max world X
     * @param {number} minY - Min world Y
     * @param {number} maxY - Max world Y
     */
    constrainToArena(minX, maxX, minY, maxY) {
        this.worldX = Math.max(minX, Math.min(maxX, this.worldX));
        this.worldY = Math.max(minY, Math.min(maxY, this.worldY));
    }
}
