import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Dinosaur from '../entities/Dinosaur.js';
import Projectile from '../entities/Projectile.js';
import InputManager from '../systems/InputManager.js';
import { applyPlayerPhysics } from '../systems/PhysicsManager.js';
import CameraController from '../systems/CameraController.js';
import CombatSystem from '../systems/CombatSystem.js';
import HUD from '../ui/HUD.js';
import { ARENA, FLOOR_Y, PIXELS_PER_UNIT, SCREEN_HEIGHT, worldToScreen } from '../systems/WorldConfig.js';
import { gameSession } from '../systems/SessionManager.js';
import PackCoordinator from '../ai/PackCoordinator.js';
import CompyAI from '../ai/CompyAI.js';
import { createTileBackdrop, loadCoreAssets } from '../systems/AssetLoader.js';

const PLATFORMS = [
    { x: 8, y: 2.5, width: 6 },
    { x: 20, y: 4.25, width: 5 },
    { x: 31, y: 3.25, width: 7 },
];

const HUNT_TIME_LIMIT = 40;

export default class HuntScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HuntScene' });
    }

    preload() {
        loadCoreAssets(this);
    }

    create() {
        this.inputManager = new InputManager(this);
        this.inputManager.setupKeyboard();
        this.cameraController = new CameraController(this.cameras.main);
        this.combatSystem = new CombatSystem();
        this.hud = new HUD(this);

        this.drawBackdrop();
        this.drawPlatforms();

        this.players = [new Player(this, 0, 4, 0)];
        gameSession.loadPlayerState(this.players);

        this.projectiles = [];
        this.compys = this.spawnCompys();
        this.jumpHeld = false;
        this.dodgeHeld = false;
        this.meleeHeld = false;
        this.throwHeld = false;
        this.huntTimeRemaining = HUNT_TIME_LIMIT;
        this.transitioning = false;

        this.huntBanner = this.add.text(24, 24, '', {
            color: '#ffe8a3',
            fontSize: '26px',
            fontFamily: 'monospace',
        }).setScrollFactor(0);

        this.resultOverlay = this.add.text(640, 180, '', {
            color: '#ffffff',
            fontSize: '42px',
            fontFamily: 'monospace',
            align: 'center',
            backgroundColor: '#000000aa',
            padding: { x: 18, y: 12 },
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setVisible(false);

        this.cameras.main.setBounds(0, 0, ARENA.width * PIXELS_PER_UNIT, SCREEN_HEIGHT);
    }

    drawBackdrop() {
        createTileBackdrop(this, 'tileset-jungle', (ARENA.width * PIXELS_PER_UNIT) / 2, SCREEN_HEIGHT / 2, ARENA.width * PIXELS_PER_UNIT, SCREEN_HEIGHT, 0x7a8f7a)
            .setOrigin?.(0.5, 0.5)
            .setAlpha?.(0.24);

        createTileBackdrop(this, 'tileset-savanna', (ARENA.width * PIXELS_PER_UNIT) / 2, FLOOR_Y + 48, ARENA.width * PIXELS_PER_UNIT, 96, 0xffffff)
            .setOrigin?.(0.5, 0.5)
            .setAlpha?.(0.55);
    }

    drawPlatforms() {
        PLATFORMS.forEach((platform) => {
            const left = worldToScreen(platform.x, platform.y);
            const width = platform.width * PIXELS_PER_UNIT;
            this.add.rectangle(left.x + width / 2, left.y, width, 16, 0x8a6d3b)
                .setOrigin(0.5, 0.5);
        });
    }

    spawnCompys() {
        const coordinator = new PackCoordinator();
        const slotDirections = coordinator.getSlotDirections(4);
        const spawnPositions = [16, 19, 23, 27];

        return spawnPositions.map((x, index) => {
            const compy = new Dinosaur(this, x, 0);
            compy.ai = new CompyAI(compy, slotDirections[index]);
            return compy;
        });
    }

    update(_time, delta) {
        const deltaSeconds = delta / 1000;
        if (this.transitioning) return;

        this.huntTimeRemaining = Math.max(0, this.huntTimeRemaining - deltaSeconds);

        const player = this.players[0];
        const input = this.inputManager.getPlayerInputWithKeyboard(0);
        if (input) {
            const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
            if (direction === 0) player.stop();
            else player.move(direction);

            if (input.jumpPressed && !this.jumpHeld) player.jump();
            if (input.dodgePressed && !this.dodgeHeld) player.startDodge(direction !== 0 ? direction : player.facing);
            if (input.meleePressed && !this.meleeHeld) {
                this.compys.forEach((compy) => {
                    if (compy.active) this.combatSystem.tryMeleeHit(player, compy);
                });
            }
            if (input.throwPressed && !this.throwHeld) this.throwProjectile(player);

            this.jumpHeld = input.jumpPressed;
            this.dodgeHeld = input.dodgePressed;
            this.meleeHeld = input.meleePressed;
            this.throwHeld = input.throwPressed;
        }

        player.update(deltaSeconds);
        applyPlayerPhysics(player, deltaSeconds, PLATFORMS, ARENA.width);
        player.updateScreenPosition();

        this.compys.forEach((compy) => {
            compy.ai.update(player);
            compy.update(deltaSeconds);
            this.combatSystem.tryEnemyTouchAttack(compy, player);
        });

        this.updateProjectiles(deltaSeconds);
        this.cameraController.update(this.players);
        this.updateHud();
        this.checkOutcome();
    }

    throwProjectile(player) {
        if (!player.startThrowAttack()) return;
        const projectile = new Projectile(this, player.worldX + player.facing * 0.7, player.worldY + player.height * 0.55, player.facing);
        this.projectiles.push(projectile);
    }

    updateProjectiles(deltaSeconds) {
        const player = this.players[0];
        this.projectiles = this.projectiles.filter((projectile) => {
            projectile.update(deltaSeconds, ARENA.width);
            if (!projectile.active) return false;

            for (const compy of this.compys) {
                if (!compy.active) continue;
                if (this.combatSystem.checkProjectileHit(projectile, compy)) {
                    compy.takeDamage(projectile.damage);
                    player.addScore(projectile.damage);
                    projectile.destroy();
                    return false;
                }
            }

            return true;
        });
    }

    updateHud() {
        const player = this.players[0];
        const aliveCompys = this.compys.filter((compy) => compy.active).length;

        this.huntBanner.setText(`Hunt ${gameSession.currentHunt}/${gameSession.totalHunts}`);
        this.hud.update([
            `HP ${player.health}/${player.maxHealth}   SCORE ${player.score}`,
            `COMPYS ${aliveCompys}   SPEARS ${this.projectiles.length}   TIME ${this.huntTimeRemaining.toFixed(1)}`,
            `MELEE ${player.meleeCooldownRemaining.toFixed(2)}   THROW ${player.throwCooldownRemaining.toFixed(2)}   DODGE ${player.dodgeCooldownRemaining.toFixed(2)}`,
        ]);
    }

    checkOutcome() {
        const player = this.players[0];
        const aliveCompys = this.compys.some((compy) => compy.active);

        if (!aliveCompys) {
            gameSession.completeHunt(this.players);
            if (gameSession.isSessionComplete()) {
                this.showResult('SESSION COMPLETE', 'Heading to Victory');
                this.scheduleSceneStart('VictoryScene');
            } else {
                this.showResult(`HUNT ${gameSession.currentHunt - 1} COMPLETE`, 'Heading to Cave Bar');
                this.scheduleSceneStart('CaveBarScene');
            }
            return;
        }

        if (player.health <= 0 || this.huntTimeRemaining <= 0) {
            gameSession.failHunt(this.players);
            this.showResult('HUNT FAILED', 'Heading to Game Over');
            this.scheduleSceneStart('GameOverScene');
        }
    }

    showResult(title, subtitle) {
        this.transitioning = true;
        this.resultOverlay.setText(`${title}\n${subtitle}`);
        this.resultOverlay.setVisible(true);
    }

    scheduleRestart() {
        this.time.delayedCall(1500, () => {
            this.scene.restart();
        });
    }

    scheduleSceneStart(key) {
        this.time.delayedCall(1500, () => {
            this.scene.start(key);
        });
    }
}
