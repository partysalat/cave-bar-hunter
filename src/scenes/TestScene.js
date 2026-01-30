import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Dinosaur from '../entities/Dinosaur.js';
import Projectile from '../entities/Projectile.js';
import CombatSystem from '../systems/CombatSystem.js';
import ScoreManager from '../systems/ScoreManager.js';
import HUD from '../ui/HUD.js';
import { worldToScreen, screenToWorldDirection } from '../systems/CoordinateSystem.js';
import InputManager from '../systems/InputManager.js';
import { sphereVsSphere } from '../systems/PhysicsManager.js';
import CameraController from '../systems/CameraController.js';

// Animation frame rate constants
const ANIM_FRAMERATE_FIGHT_STANCE = 10; // fps
const ANIM_FRAMERATE_CLUB_SWING = 25; // fps (16 frames over ~650ms attack duration)

/**
 * Test scene for Phase 1 development
 * Renders isometric ground grid and test entities
 */
export default class TestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TestScene' });
    }

    preload() {
        // Load player character sprite sheets
        // Each sprite sheet contains all animations for one character color
        const playerColors = ['red', 'blue', 'yellow', 'green'];

        playerColors.forEach((color) => {
            this.load.atlas(
                `${color}-hero`,
                `/assets/generated/spritesheets/${color}-hero.png`,
                `/assets/generated/spritesheets/${color}-hero.json`
            );
        });
    }

    create() {
        // Create player animations
        this.createPlayerAnimations();

        // Draw isometric ground grid for visualization
        this.drawGroundGrid();

        // Create test player at arena center
        this.player = new Player(this, 0, 15, 12, 0);

        // Equip weapon (weapons are baked into animations)
        this.player.setWeaponEquipped(true);

        // Create test dinosaur
        this.testDino = new Dinosaur(this, 'compy', 20, 15, 0);

        // Setup input
        this.inputManager = new InputManager(this);
        this.inputManager.setupKeyboard(); // For testing without gamepad

        // Track button states for attack (press once, not hold)
        this.lastAttackButton = false;

        // Setup camera controller
        this.cameraController = new CameraController(this.cameras.main);

        // Setup combat system
        this.combatSystem = new CombatSystem();

        // Setup score manager
        this.scoreManager = new ScoreManager();

        // Track projectiles
        this.projectiles = [];

        // Create HUD
        this.hud = new HUD(this);
    }

    update(time, delta) {
        if (this.player) {
            // Get input for player 0
            const input = this.inputManager.getPlayerInputWithKeyboard(0);

            if (input) {
                const screenDirection = this.inputManager.getDPadDirection(input.dpad);

                if (screenDirection.x !== 0 || screenDirection.y !== 0) {
                    // Convert screen-space input to world-space direction
                    const worldDirection = screenToWorldDirection(screenDirection.x, screenDirection.y);
                    this.player.move(worldDirection.x, worldDirection.y);
                } else {
                    this.player.stop();
                }

                // Club attack (B button) - press once per attack
                if (input.buttons.b && !this.lastAttackButton) {
                    this.player.startAttack();
                }
                this.lastAttackButton = input.buttons.b;

                // Spear throwing (RT button)
                if (input.buttons.rt && this.player.canThrowSpear()) {
                    const throwData = this.player.throwSpear(
                        this.player.facingX,
                        this.player.facingY
                    );

                    if (throwData) {
                        const projectile = new Projectile(
                            this,
                            this.player.playerNumber,
                            throwData.worldX,
                            throwData.worldY,
                            throwData.worldZ,
                            throwData.dirX,
                            throwData.dirY,
                            throwData.dirZ,
                            throwData.damageMultiplier // Pass buff multiplier
                        );
                        this.projectiles.push(projectile);
                    }
                }

                // Dodge roll (LT button)
                if (input.buttons.lt && this.player.canDodge()) {
                    this.player.startDodge();
                }
            }

            this.player.update(delta);

            // Update projectiles and check collisions
            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const proj = this.projectiles[i];
                proj.update(delta);

                // Check hit on test dinosaur weak points
                if (this.testDino && !this.testDino.isDead) {
                    for (const wp of this.testDino.weakPoints) {
                        const result = this.combatSystem.checkProjectileHit(proj, wp);

                        if (result.hit) {
                            const broke = wp.takeDamage(result.damage);
                            proj.onHit();

                            // Award points for weak point hit
                            this.scoreManager.awardWeakPointHit(proj.ownerPlayerNumber, result.damage);

                            console.log(`Hit ${wp.type}! Damage: ${result.damage.toFixed(1)} | Score: ${this.scoreManager.getScore(0)}`);
                            if (broke) {
                                console.log(`${wp.type} weak point BROKEN!`);
                            }
                        }
                    }

                    // Check body hit if no weak point hit
                    if (!proj.isExpired) {
                        const result = this.combatSystem.checkProjectileHitDinosaur(proj, this.testDino);
                        if (result.hit) {
                            this.testDino.takeDamage(result.damage);
                            proj.onHit();

                            // Award points for regular damage
                            this.scoreManager.awardDamagePoints(proj.ownerPlayerNumber, result.damage);

                            console.log(`Body hit! Damage: ${result.damage} | Score: ${this.scoreManager.getScore(0)}`);

                            // Check if dinosaur died
                            if (this.testDino.health <= 0 && !this.testDino.isDead) {
                                this.testDino.isDead = true;
                                console.log('DINOSAUR DEFEATED!');
                                // Phase 3 will add death animations, scoring bonuses, etc.
                            }
                        }
                    }
                }

                if (proj.isExpired) {
                    proj.destroy();
                    this.projectiles.splice(i, 1);
                }
            }

            // Check club attack hits
            if (this.player.attackPhase === 'swing' && this.testDino && !this.testDino.isDead) {
                const clubHit = this.combatSystem.checkClubHit(this.player, this.testDino);

                if (clubHit.hit) {
                    // Mark as hit this swing
                    if (!this.player.hitEnemiesThisSwing.includes(this.testDino.id)) {
                        this.player.hitEnemiesThisSwing.push(this.testDino.id);

                        this.testDino.takeDamage(clubHit.damage);
                        this.scoreManager.awardDamagePoints(this.player.playerNumber, clubHit.damage);

                        // TODO: Replace with proper debug UI or remove before production
                        console.log(`Club hit! Damage: ${clubHit.damage} | Score: ${this.scoreManager.getScore(0)}`);

                        if (this.testDino.health <= 0 && !this.testDino.isDead) {
                            this.testDino.isDead = true;
                            console.log('DINOSAUR DEFEATED!');
                        }
                    }
                }
            }

            // Constrain to arena (30x25 world units from design doc)
            this.player.constrainToArena(0, 30, 0, 25);

            // Check collision with dinosaur
            if (this.testDino && !this.testDino.isDead) {
                if (sphereVsSphere(this.player, this.testDino)) {
                    // Phase 1: Just log collision
                    // Later: damage, knockback, etc.
                    console.log('Player collided with dinosaur!');
                }
            }
        }

        if (this.testDino) {
            this.testDino.update(delta);
        }

        // Update camera to follow player
        this.cameraController.update([this.player]);

        // Update HUD
        if (this.player) {
            this.hud.update(
                this.player,
                this.scoreManager.getScore(0),
                this.testDino
            );
        }
    }

    /**
     * Creates player animations for all directions and all players
     */
    createPlayerAnimations() {
        const directions = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
        const playerColors = ['red', 'blue', 'yellow', 'green'];

        for (let playerIndex = 0; playerIndex < 4; playerIndex++) {
            const atlasKey = `${playerColors[playerIndex]}-hero`;

            directions.forEach(direction => {
                // Create running animation (8 frames, 12 fps)
                this.anims.create({
                    key: `player-${playerIndex}-run-${direction}`,
                    frames: this.anims.generateFrameNames(atlasKey, {
                        prefix: `player-${playerIndex}-run-${direction}-`,
                        start: 0,
                        end: 7
                    }),
                    frameRate: 12,
                    repeat: -1 // Loop forever
                });

                // Create idle animation (4 frames, 6 fps for slower breathing)
                this.anims.create({
                    key: `player-${playerIndex}-idle-${direction}`,
                    frames: this.anims.generateFrameNames(atlasKey, {
                        prefix: `player-${playerIndex}-idle-${direction}-`,
                        start: 0,
                        end: 3
                    }),
                    frameRate: 6,
                    repeat: -1 // Loop forever
                });

                // Create fight stance idle animation (8 frames)
                this.anims.create({
                    key: `player-${playerIndex}-fight-stance-${direction}`,
                    frames: this.anims.generateFrameNames(atlasKey, {
                        prefix: `player-${playerIndex}-fight-stance-${direction}-`,
                        start: 0,
                        end: 7
                    }),
                    frameRate: ANIM_FRAMERATE_FIGHT_STANCE,
                    repeat: -1 // Loop forever
                });

                // Create club swing attack animation (16 frames)
                this.anims.create({
                    key: `player-${playerIndex}-club-swing-${direction}`,
                    frames: this.anims.generateFrameNames(atlasKey, {
                        prefix: `player-${playerIndex}-club-swing-${direction}-`,
                        start: 0,
                        end: 15
                    }),
                    frameRate: ANIM_FRAMERATE_CLUB_SWING,
                    repeat: 0 // Play once, don't loop
                });
            });
        }
    }

    /**
     * Draws isometric grid for ground visualization
     * Helps verify coordinate system accuracy
     */
    drawGroundGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x00ff00, 0.3);

        // Draw grid lines for 30x25 world units
        for (let x = 0; x <= 30; x += 5) {
            const start = worldToScreen(x, 0, 0);
            const end = worldToScreen(x, 25, 0);
            graphics.lineBetween(start.x, start.y, end.x, end.y);
        }

        for (let y = 0; y <= 25; y += 5) {
            const start = worldToScreen(0, y, 0);
            const end = worldToScreen(30, y, 0);
            graphics.lineBetween(start.x, start.y, end.x, end.y);
        }

        graphics.setDepth(-1000);
    }
}
