import Phaser from 'phaser';
import { worldToScreen, PIXELS_PER_UNIT, SCREEN_WIDTH, SCREEN_HEIGHT, DEPTH_LAYERS } from '../systems/CoordinateSystem.js';
import { updatePlayerAnimation } from '../systems/SpriteDirectionSystem.js';
import { applyGravity, checkPlatform } from '../systems/PhysicsManager.js';
import CombatSystem from '../systems/CombatSystem.js';
import Player from '../entities/Player.js';
import Dinosaur from '../entities/Dinosaur.js';
import Projectile from '../entities/Projectile.js';
import InputManager from '../systems/InputManager.js';
import CameraController from '../systems/CameraController.js';
import PackCoordinator from '../ai/PackCoordinator.js';
import CompyAI from '../ai/CompyAI.js';
import HUD from '../ui/HUD.js';
import { gameSession } from '../systems/SessionManager.js';

/**
 * Jungle arena layout in world units.
 * worldX = horizontal, worldY = vertical height (0 = ground level)
 */
export const JUNGLE_ARENA = {
    width: 80,
    platforms: [
        { x: 10, y: 5, width: 8 },
        { x: 35, y: 8, width: 6 },
        { x: 60, y: 5, width: 8 },
    ],
    spawnPoints: [
        { x: 15, y: 0 },
        { x: 20, y: 0 },
        { x: 25, y: 0 },
        { x: 30, y: 0 },
    ],
    enemySpawnPoints: [
        { x: 5,  y: 0 },
        { x: 75, y: 0 },
    ],
};

const REVIVE_RADIUS = 1.5; // world units to trigger revive

export default class HuntScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HuntScene' });
    }

    preload() {
        const colors = ['red', 'blue', 'yellow', 'green'];
        colors.forEach((color, index) => {
            this.load.atlas(
                `player-${index}`,
                `/assets/generated/spritesheets/${color}-hero.png`,
                `/assets/generated/spritesheets/${color}-hero.json`
            );
        });

        this.load.atlas('compy', '/assets/generated/spritesheets/compy.png',
                                 '/assets/generated/spritesheets/compy.json');
    }

    create() {
        this.huntState       = 'active';
        this.huntEndTriggered = false;
        this.huntTimer       = 0;
        this.totalHuntTime   = 0;

        this.players     = [];
        this.compys      = [];
        this.projectiles = [];

        this.inputManager  = new InputManager(this);
        this.inputManager.setupKeyboard();
        this.combatSystem  = new CombatSystem();

        this.buildArena();
        this.spawnPlayers();
        this.createPlayerAnimations();
        this.createCompyAnimations();
        this.spawnCompys();

        this.hud = new HUD(this);
        this.cameraController = new CameraController(this.cameras.main);
    }

    // ─── Arena ───────────────────────────────────────────────────────────────

    buildArena() {
        const arenaScreenWidth = JUNGLE_ARENA.width * PIXELS_PER_UNIT;

        const bg = this.add.rectangle(arenaScreenWidth / 2, 0, arenaScreenWidth, 2000, 0x1a3d1a);
        bg.setDepth(DEPTH_LAYERS.BACKGROUND).setOrigin(0.5, 0);

        const groundScreenY = worldToScreen(0, 0).y;
        const ground = this.add.rectangle(arenaScreenWidth / 2, groundScreenY, arenaScreenWidth, 40, 0x5c3d1a);
        ground.setDepth(DEPTH_LAYERS.PLATFORMS).setOrigin(0.5, 0);

        for (const platform of JUNGLE_ARENA.platforms) {
            const leftX   = (platform.x - platform.width / 2) * PIXELS_PER_UNIT;
            const topY    = worldToScreen(0, platform.y).y;
            const pxWidth = platform.width * PIXELS_PER_UNIT;
            const rect = this.add.rectangle(leftX, topY, pxWidth, 20, 0x5c3d1a);
            rect.setDepth(DEPTH_LAYERS.PLATFORMS).setOrigin(0, 0.5);
        }
    }

    // ─── Spawning ─────────────────────────────────────────────────────────────

    spawnPlayers() {
        JUNGLE_ARENA.spawnPoints.forEach((sp, index) => {
            const player = new Player(this, index, sp.x, sp.y);
            player.moveSpeed = 8;
            this.players.push(player);
        });
        gameSession.loadPlayerState?.(this.players);
    }

    createPlayerAnimations() {
        for (let i = 0; i < 4; i++) {
            const defs = [
                { key: `player-${i}-idle`,   prefix: `player-${i}-idle-`,   end: 3,  fps: 6,  repeat: -1 },
                { key: `player-${i}-run`,    prefix: `player-${i}-run-`,    end: 7,  fps: 12, repeat: -1 },
                { key: `player-${i}-jump`,   prefix: `player-${i}-jump-`,   end: 3,  fps: 8,  repeat: 0  },
                { key: `player-${i}-fall`,   prefix: `player-${i}-fall-`,   end: 3,  fps: 8,  repeat: 0  },
                { key: `player-${i}-attack`, prefix: `player-${i}-attack-`, end: 7,  fps: 12, repeat: 0  },
            ];
            defs.forEach(({ key, prefix, end, fps, repeat }) => {
                if (!this.anims.exists(key)) {
                    this.anims.create({
                        key,
                        frames: this.anims.generateFrameNames(`player-${i}`, { prefix, start: 0, end }),
                        frameRate: fps,
                        repeat,
                    });
                }
            });
        }
    }

    createCompyAnimations() {
        [
            { key: 'compy-idle',   prefix: 'compy-idle-',   end: 3, fps: 6,  repeat: -1 },
            { key: 'compy-walk',   prefix: 'compy-walk-',   end: 3, fps: 8,  repeat: -1 },
            { key: 'compy-run',    prefix: 'compy-run-',    end: 3, fps: 12, repeat: -1 },
            { key: 'compy-attack', prefix: 'compy-attack-', end: 3, fps: 10, repeat: 0  },
            { key: 'compy-downed', prefix: 'compy-downed-', end: 3, fps: 8,  repeat: 0  },
        ].forEach(({ key, prefix, end, fps, repeat }) => {
            if (!this.anims.exists(key)) {
                this.anims.create({
                    key,
                    frames: this.anims.generateFrameNames('compy', { prefix, start: 0, end }),
                    frameRate: fps,
                    repeat,
                });
            }
        });
    }

    spawnCompys() {
        const spawnPositions = [
            { x: 5,  y: 0 },
            { x: 15, y: 0 },
            { x: 40, y: 0 },
            { x: 55, y: 0 },
            { x: 70, y: 0 },
        ];

        const aliveCount  = this.players.filter(p => !p.isDowned).length;
        const healthScale = [1.0, 1.2, 1.3, 1.4][aliveCount - 1] ?? 1.0;

        spawnPositions.forEach(pos => {
            const compy = new Dinosaur(this, 'compy', pos.x, pos.y, 0);
            compy.health    = Math.floor(compy.health * healthScale);
            compy.maxHealth = compy.health;
            this.compys.push(compy);
        });

        this.compys.forEach(compy => {
            compy.ai = new CompyAI(compy, this.compys, this.players);
        });

        this.packCoordinator = new PackCoordinator(this.compys, this.players);
    }

    // ─── Update ──────────────────────────────────────────────────────────────

    update(_time, delta) {
        this.huntTimer     += delta;
        this.totalHuntTime += delta;

        if (this.huntState !== 'active') return;

        this.packCoordinator?.update(delta);

        this.updatePlayers(delta);
        this.cameraController?.update(this.players, JUNGLE_ARENA.width);
        this.updateCompys(delta);
        this.updateProjectiles(delta);
        this.updateHUD();
        this.checkHuntCompletion();
    }

    updatePlayers(delta) {
        this.players.forEach(player => {
            const input = this.inputManager.getPlayerInputWithKeyboard(player.playerNumber);

            if (input) {
                if (player.isDowned) {
                    // Downed players can only crawl and be revived
                    const h = (input.dpad.right ? 1 : 0) - (input.dpad.left ? 1 : 0);
                    if (h !== 0) player.move(h);
                    else         player.stop();
                } else {
                    this.handlePlayerInput(player, input, delta);
                }
            }

            const prevY = player.worldY;
            player.update(delta);
            applyGravity(player, delta);

            for (const platform of JUNGLE_ARENA.platforms) {
                checkPlatform(player, platform, prevY);
            }

            player.worldX = Math.max(0, Math.min(JUNGLE_ARENA.width, player.worldX));
            player.updateScreenPosition();
        });
    }

    handlePlayerInput(player, input, _delta) {
        // Horizontal movement
        const h = (input.dpad.right ? 1 : 0) - (input.dpad.left ? 1 : 0);
        if (h !== 0) player.move(h);
        else         player.stop();

        // Jump (D-pad up)
        if (input.dpad.up) player.jump();

        // Spear throw (RT / mouse): edge-trigger
        const rtDown = input.buttons.rt;
        if (rtDown && !player._lastRt) this.throwSpear(player);
        player._lastRt = rtDown;

        // Club attack (B / Q): edge-trigger
        const bDown = input.buttons.b;
        if (bDown && !player._lastB) player.startAttack();
        player._lastB = bDown;

        // Dodge roll (LT / Shift): edge-trigger
        const ltDown = input.buttons.lt;
        if (ltDown && !player._lastLt) player.startDodge(player.facingX);
        player._lastLt = ltDown;

        // Revive (X / Space): edge-trigger
        const xDown = input.buttons.x;
            if (xDown && !player._lastX) this.tryRevive(player);
        player._lastX = xDown;

        // Club hit detection during swing
        if (player.isAttacking && player.attackPhase === 'swing') {
            this.checkClubHits(player);
        }
    }

    // ─── Combat ──────────────────────────────────────────────────────────────

    throwSpear(player) {
        if (!player.canThrowSpear()) return;

        const spearData = player.throwSpear(player.facingX, 0);
        if (!spearData) return;

        const proj = new Projectile(
            this,
            player.playerNumber,
            spearData.worldX, spearData.worldY, 0,
            spearData.dirX, 0, 0,
            spearData.damageMultiplier
        );
        this.projectiles.push(proj);
    }

    checkClubHits(player) {
        for (const compy of this.compys) {
            if (compy.isDead) continue;
            const result = this.combatSystem.checkClubHit(player, compy);
            if (result.hit) {
                compy.takeDamage(result.damage);
                player.hitEnemiesThisSwing.push(compy.id);
                player.addScore(1);
            }
        }
    }

    tryRevive(reviver) {
        for (const other of this.players) {
            if (!other.isDowned || other === reviver) continue;
            const dx = Math.abs(other.worldX - reviver.worldX);
            const dy = Math.abs(other.worldY - reviver.worldY);
            if (Math.sqrt(dx * dx + dy * dy) <= REVIVE_RADIUS) {
                other.revive();
                reviver.addScore(10);
                console.log(`Player ${reviver.playerNumber} revived Player ${other.playerNumber}`);
                return;
            }
        }
    }

    updateProjectiles(delta) {
        this.projectiles = this.projectiles.filter(proj => {
            if (proj.isExpired) {
                proj.destroy();
                return false;
            }

            proj.update(delta);

            for (const compy of this.compys) {
                if (compy.isDead) continue;
                const result = this.combatSystem.checkProjectileHitDinosaur(proj, compy);
                if (result.hit) {
                    compy.takeDamage(result.damage);
                    const shooter = this.players[proj.ownerPlayerNumber];
                    shooter?.addScore(1);
                    proj.onHit();
                    proj.destroy();
                    return false;
                }
            }

            return true;
        });
    }

    // ─── Compys ──────────────────────────────────────────────────────────────

    updateCompys(delta) {
        this.compys.forEach(compy => {
            if (compy.isDead) return;
            compy.update(delta);
            applyGravity(compy, delta);
            compy.worldX = Math.max(0, Math.min(JUNGLE_ARENA.width, compy.worldX));
            compy.updateScreenPosition();
        });
    }

    // ─── HUD ─────────────────────────────────────────────────────────────────

    updateHUD() {
        if (!this.hud) return;
        const p0      = this.players[0];
        const firstLive = this.compys.find(c => !c.isDead);
        this.hud.update(p0, p0.score, firstLive ?? null);
    }

    // ─── Completion ──────────────────────────────────────────────────────────

    checkHuntCompletion() {
        if (this.huntEndTriggered) return;

        if (this.compys.every(c => c.isDead)) {
            this.huntState = 'victory';
        } else if (this.players.every(p => p.isDowned)) {
            this.huntState = 'failure';
            console.log('FAILURE! All players downed!');
        }

        if (this.huntState !== 'active') {
            this.huntEndTriggered = true;
            this.showHuntEnd(this.huntState === 'victory');
        }
    }

    showHuntEnd(isVictory) {
        const msg   = isVictory ? 'HUNT COMPLETE!' : 'HUNT FAILED!';
        const color = isVictory ? '#ffcc00' : '#ff4444';

        gameSession.savePlayerState(this.players);
        if (isVictory) gameSession.advanceHunt('compy-pack');

        this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, msg, {
            fontSize: '72px', fontFamily: 'Arial', color,
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 10,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_LAYERS.UI + 100);

        const nextScene = isVictory ? 'CaveBarScene' : 'GameOverScene';

        this.time.delayedCall(3000, () => {
            this.cameras.main.fadeOut(800, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start(nextScene);
            });
        });
    }
}
