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
                    setTint: () => ({}),
                    setTexture: () => ({}),
                    play: () => ({}),
                    setScale: () => ({}),
                    anims: {
                        currentAnim: null
                    }
                })
            },
            anims: {
                create: () => ({})
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

describe('Player - Club Attack', () => {
    let mockScene;

    beforeEach(() => {
        mockScene = {
            add: {
                sprite: () => ({
                    setOrigin: () => ({}),
                    setDepth: () => ({}),
                    play: () => ({}),
                    setScale: () => ({}),
                    anims: {
                        currentAnim: null
                    }
                })
            },
            anims: {
                create: () => ({})
            }
        };
    });

    it('can start attack when not on cooldown', () => {
        const player = new Player(mockScene, 0, 10, 10, 0);

        expect(player.canAttack()).toBe(true);

        player.startAttack();

        expect(player.isAttacking).toBe(true);
        expect(player.attackPhase).toBe('windup');
    });

    it('cannot attack when already attacking', () => {
        const player = new Player(mockScene, 0, 10, 10, 0);

        player.startAttack();
        const canAttackAgain = player.canAttack();

        expect(canAttackAgain).toBe(false);
    });

    it('cannot attack when on cooldown', () => {
        const player = new Player(mockScene, 0, 10, 10, 0);

        player.attackCooldown = 500; // Still on cooldown

        expect(player.canAttack()).toBe(false);
    });

    it('cannot attack when downed', () => {
        const player = new Player(mockScene, 0, 10, 10, 0);

        player.isDowned = true;

        expect(player.canAttack()).toBe(false);
    });

    it('progresses through attack phases over time', () => {
        const player = new Player(mockScene, 0, 10, 10, 0);

        player.startAttack();
        expect(player.attackPhase).toBe('windup');

        // Advance past windup (150ms)
        player.update(160);
        expect(player.attackPhase).toBe('swing');

        // Advance past swing (300ms)
        player.update(310);
        expect(player.attackPhase).toBe('recovery');

        // Advance past recovery (200ms)
        player.update(210);
        expect(player.attackPhase).toBe('none');
        expect(player.isAttacking).toBe(false);
    });

    it('starts cooldown after attack completes', () => {
        const player = new Player(mockScene, 0, 10, 10, 0);

        player.startAttack();

        // Complete entire attack (650ms)
        player.update(660);

        expect(player.attackCooldown).toBeGreaterThan(0);
        expect(player.attackCooldown).toBeLessThanOrEqual(1000);
    });

    it('clears hit enemies list when starting new attack', () => {
        const player = new Player(mockScene, 0, 10, 10, 0);

        player.hitEnemiesThisSwing = ['enemy1', 'enemy2'];
        player.startAttack();

        expect(player.hitEnemiesThisSwing).toEqual([]);
    });

    it('moves slower while attacking', () => {
        const player = new Player(mockScene, 0, 10, 10, 0);

        // Move normally first to get baseline speed
        player.move(1, 0);
        const normalSpeed = player.velocityX;

        // Now attack and move
        player.startAttack();
        player.move(1, 0);

        // Speed should be 50% of normal
        expect(player.velocityX).toBeGreaterThan(0);
        expect(player.velocityX).toBe(normalSpeed * 0.5);
    });
});
