import { describe, it, expect, beforeEach } from 'vitest';
import Player from '../src/entities/Player.js';

describe('Player', () => {
    let mockScene;

    beforeEach(() => {
        mockScene = {
            add: {
                sprite: () => ({
                    setOrigin: () => ({}),
                    setDepth: () => ({}),
                    setTint: () => ({})
                })
            }
        };
    });

    it('initializes with player number and color', () => {
        const player = new Player(mockScene, 0, 15, 12, 0);
        expect(player.playerNumber).toBe(0);
        expect(player.color).toBe(0xff0000); // Red
    });

    it('assigns correct colors to player numbers', () => {
        const p0 = new Player(mockScene, 0, 0, 0, 0);
        const p1 = new Player(mockScene, 1, 0, 0, 0);
        const p2 = new Player(mockScene, 2, 0, 0, 0);
        const p3 = new Player(mockScene, 3, 0, 0, 0);

        expect(p0.color).toBe(0xff0000); // Red
        expect(p1.color).toBe(0x0000ff); // Blue
        expect(p2.color).toBe(0xffff00); // Yellow
        expect(p3.color).toBe(0x00ff00); // Green
    });

    it('initializes with starting weapon', () => {
        const player = new Player(mockScene, 0, 0, 0, 0);
        expect(player.weapon).toBe('stone-spear');
        expect(player.health).toBe(2);
    });

    it('constrains position to arena bounds', () => {
        const player = new Player(mockScene, 0, 0, 0, 0);

        // Try to move out of bounds
        player.worldX = -5;
        player.worldY = -5;
        player.constrainToArena(0, 30, 0, 25);

        expect(player.worldX).toBe(0);
        expect(player.worldY).toBe(0);

        player.worldX = 35;
        player.worldY = 30;
        player.constrainToArena(0, 30, 0, 25);

        expect(player.worldX).toBe(30);
        expect(player.worldY).toBe(25);
    });

    it('throws spear with cooldown', () => {
        const player = new Player(mockScene, 0, 15, 12, 0);

        expect(player.canThrowSpear()).toBe(true);

        player.throwSpear(1, 0); // Throw right

        expect(player.canThrowSpear()).toBe(false); // Cooldown active
    });

    it('performs dodge roll with cooldown', () => {
        const player = new Player(mockScene, 0, 15, 12, 0);

        expect(player.canDodge()).toBe(true);

        player.startDodge();

        expect(player.isDodging).toBe(true);
        expect(player.canDodge()).toBe(false); // Cooldown active
    });

    it('has invincibility frames during dodge', () => {
        const player = new Player(mockScene, 0, 15, 12, 0);

        player.startDodge();

        expect(player.isInvincible()).toBe(true);
    });

    it('ends dodge after duration', () => {
        const player = new Player(mockScene, 0, 15, 12, 0);

        player.startDodge();
        expect(player.isDodging).toBe(true);

        player.updateDodge(600); // 0.6 seconds (exceeds 0.5s dodge duration)

        expect(player.isDodging).toBe(false);
    });

    it('enters downed state at 0 health', () => {
        const player = new Player(mockScene, 0, 15, 12, 0);

        player.takeDamage(2); // Full damage

        expect(player.health).toBe(0);
        expect(player.isDowned).toBe(true);
    });

    it('can crawl while downed at reduced speed', () => {
        const player = new Player(mockScene, 0, 15, 12, 0);
        player.isDowned = true;

        player.move(1, 0);

        expect(player.velocityX).toBeGreaterThan(0);
        expect(player.velocityX).toBeLessThan(player.moveSpeed); // Slower than normal
    });

    it('can be revived by teammate', () => {
        const player = new Player(mockScene, 0, 15, 12, 0);
        player.isDowned = true;
        player.health = 0;

        player.revive();

        expect(player.isDowned).toBe(false);
        expect(player.health).toBe(1); // Partial health on revive
    });
});
