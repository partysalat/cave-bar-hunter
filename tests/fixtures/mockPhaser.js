/**
 * Mock Phaser objects for testing
 */
import { vi } from 'vitest';

/**
 * Creates a mock Phaser Scene
 * @returns {Object} Mock scene with common Phaser scene methods
 */
export function createMockScene() {
    return {
        add: {
            graphics: () => ({
                fillStyle: () => ({}),
                fillCircle: () => ({}),
                fillRect: () => ({}),
                strokeStyle: () => ({}),
                strokeCircle: () => ({}),
                setDepth: () => ({})
            }),
            sprite: (x, y, texture) => ({
                x, y, texture,
                setOrigin: () => ({}),
                setDepth: () => ({}),
                setTint: () => ({}),
                setScale: () => ({}),
                play: () => ({}),
                anims: {
                    currentAnim: null
                }
            }),
            circle: (x, y, radius, color) => ({
                x, y, radius, color,
                setOrigin: () => ({}),
                setDepth: () => ({})
            }),
            text: (x, y, text, style) => ({
                x, y, text, style,
                setOrigin: () => ({}),
                setDepth: () => ({})
            })
        },
        anims: {
            create: () => ({}),
            generateFrameNames: () => []
        },
        load: {
            atlas: () => ({})
        },
        time: {
            delayedCall: (delay, callback) => ({
                delay,
                callback
            })
        },
        cameras: {
            main: {
                scrollX: 0,
                scrollY: 0,
                zoom: 1
            }
        }
    };
}

/**
 * Creates a mock Player entity
 * @param {number} playerNumber - Player index (0-3)
 * @param {number} worldX - World X position
 * @param {number} worldY - World Y position
 * @param {number} worldZ - World Z position
 * @returns {Object} Mock player with realistic properties
 */
export function createMockPlayer(playerNumber = 0, worldX = 15, worldY = 12, worldZ = 0) {
    const mockSprite = {
        setOrigin: () => ({}),
        setDepth: () => ({}),
        setTint: () => ({}),
        setScale: () => ({}),
        play: () => ({}),
        anims: { currentAnim: null }
    };

    return {
        playerNumber,
        worldX,
        worldY,
        worldZ,
        velocity: {
            x: 0,
            y: 0,
            z: 0
        },
        health: 2,
        maxHealth: 2,
        isDowned: false,
        isDead: false,
        facingX: 0,
        facingY: 1,
        isMoving: false,
        moveSpeed: 8,
        radius: 0.5,
        sprite: mockSprite,
        takeDamage(damage) {
            if (this.isDead || this.isDowned) return;
            this.health -= damage;
            if (this.health <= 0) {
                this.health = 0;
                this.isDowned = true;
            }
        },
        update(delta) {
            // Mock update logic
        }
    };
}

/**
 * Creates a mock Compy dinosaur entity
 * @param {number} worldX - World X position
 * @param {number} worldY - World Y position
 * @param {number} worldZ - World Z position
 * @returns {Object} Mock compy with realistic properties
 */
export function createMockCompy(worldX = 20, worldY = 15, worldZ = 0) {
    const mockSprite = {
        setOrigin: () => ({}),
        setDepth: () => ({}),
        setTint: () => ({})
    };

    return {
        type: 'compy',
        worldX,
        worldY,
        worldZ,
        velocity: {
            x: 0,
            y: 0,
            z: 0
        },
        health: 20,
        maxHealth: 20,
        isDead: false,
        ai: null,
        radius: 0.8,
        sprite: mockSprite,
        takeDamage(damage) {
            if (this.isDead) return;
            this.health -= damage;
            if (this.health <= 0) {
                this.health = 0;
                this.isDead = true;
            }
        },
        update: vi.fn()
    };
}
