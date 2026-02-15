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
            rectangle: vi.fn((x, y, w, h, color) => ({
                x, y,
                setDepth: vi.fn().mockReturnThis(),
                setOrigin: vi.fn().mockReturnThis()
            })),
            sprite: (x, y, texture) => ({
                x, y, texture,
                setOrigin: vi.fn().mockReturnThis(),
                setDepth: vi.fn().mockReturnThis(),
                setTint: vi.fn().mockReturnThis(),
                setAlpha: vi.fn().mockReturnThis(),
                setScale: vi.fn().mockReturnThis(),
                setTexture: vi.fn().mockReturnThis(),
                play: vi.fn().mockReturnThis(),
                anims: {
                    currentAnim: null
                }
            }),
            image: (x, y, texture) => ({
                x, y, texture,
                setOrigin: vi.fn().mockReturnThis(),
                setDepth: vi.fn().mockReturnThis(),
                setScale: vi.fn().mockReturnThis(),
                setAlpha: vi.fn().mockReturnThis(),
                setTint: vi.fn().mockReturnThis()
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
            atlas: vi.fn(),
            image: vi.fn(),
            spritesheet: vi.fn()
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
                zoom: 1,
                centerOn: vi.fn(),
                fadeOut: vi.fn(),
                once: vi.fn(),
                setScroll: vi.fn(function(x, y) {
                    this.scrollX = x;
                    this.scrollY = y;
                })
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
        setOrigin: vi.fn().mockReturnThis(),
        setDepth: vi.fn().mockReturnThis(),
        setTint: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        setScale: vi.fn().mockReturnThis(),
        play: vi.fn().mockReturnThis(),
        anims: { currentAnim: null }
    };

    return {
        playerNumber,
        worldX,
        worldY,
        worldZ,
        velocityX: 0,
        velocityY: 0,
        velocityZ: 0,
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
        },
        updateScreenPosition() {
            // Mock - no-op
        },
        move: vi.fn(),
        stop: vi.fn(),
        jump: vi.fn()
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
        setOrigin: vi.fn().mockReturnThis(),
        setDepth: vi.fn().mockReturnThis(),
        setTint: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        setTexture: vi.fn().mockReturnThis(),
        setScale: vi.fn().mockReturnThis()
    };

    return {
        type: 'compy',
        worldX,
        worldY,
        worldZ,
        velocityX: 0,
        velocityY: 0,
        velocityZ: 0,
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
