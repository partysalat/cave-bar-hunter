import { describe, expect, it, vi } from 'vitest';
import Player from '../src/entities/Player.js';

function createScene() {
    return {
        add: {
            rectangle: vi.fn(() => ({
                setOrigin: vi.fn().mockReturnThis(),
                setAlpha: vi.fn().mockReturnThis(),
            })),
        },
    };
}

describe('Player', () => {
    it('initializes with the expected player identity', () => {
        const player = new Player(createScene(), 0, 4, 0);

        expect(player.playerNumber).toBe(0);
        expect(player.worldX).toBe(4);
        expect(player.worldY).toBe(0);
        expect(player.onGround).toBe(true);
    });

    it('moves horizontally and updates facing', () => {
        const player = new Player(createScene(), 0, 4, 0);

        player.move(-1);

        expect(player.velocityX).toBeLessThan(0);
        expect(player.facing).toBe(-1);
    });

    it('can jump only when grounded', () => {
        const player = new Player(createScene(), 0, 4, 0);

        expect(player.jump()).toBe(true);
        expect(player.onGround).toBe(false);
        expect(player.velocityY).toBeGreaterThan(0);
        expect(player.jump()).toBe(false);
    });

    it('can start a dodge and then exits it after enough update time', () => {
        const player = new Player(createScene(), 0, 4, 0);

        expect(player.startDodge(1)).toBe(true);
        expect(player.isDodging).toBe(true);

        player.update(0.25);

        expect(player.isDodging).toBe(false);
        expect(player.canDodge()).toBe(false);
    });

    it('takes damage and gains temporary invincibility', () => {
        const player = new Player(createScene(), 0, 4, 0);

        expect(player.takeDamage(1)).toBe(true);
        expect(player.health).toBe(2);
        expect(player.isInvincible()).toBe(true);
        expect(player.takeDamage(1)).toBe(false);
        expect(player.health).toBe(2);
    });

    it('tracks melee and throw cooldowns', () => {
        const player = new Player(createScene(), 0, 4, 0);

        expect(player.startMeleeAttack()).toBe(true);
        expect(player.startThrowAttack()).toBe(true);
        expect(player.canMelee()).toBe(false);
        expect(player.canThrow()).toBe(false);

        player.update(1);

        expect(player.canMelee()).toBe(true);
        expect(player.canThrow()).toBe(true);
    });
});
