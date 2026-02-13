import Phaser from 'phaser';
import { worldToScreen, calculateDepth, screenToWorldDirection } from '../systems/CoordinateSystem.js';
import { updatePlayerAnimation } from '../systems/SpriteDirectionSystem.js';
import Bartender from '../entities/Bartender.js';
import Player from '../entities/Player.js';
import InputManager from '../systems/InputManager.js';
import WeaponShopMenu from '../ui/WeaponShopMenu.js';
import AbilityPaintingUI from '../ui/AbilityPaintingUI.js';
import CocktailMenu from '../ui/CocktailMenu.js';
import ScoreboardDisplay from '../ui/ScoreboardDisplay.js';
import TrophyWallDisplay from '../ui/TrophyWallDisplay.js';
import { passiveAbilities } from '../data/passiveAbilities.js';
import { gameSession } from '../systems/SessionManager.js';

/**
 * Cave Bar Scene
 *
 * The cave bar hub where players purchase upgrades, weapons, and cocktails
 * between hunts. This is a 30-second social/strategy phase.
 *
 * Features:
 * - Interactive bartender NPC
 * - Weapon rack shop
 * - Cave painting passive abilities
 * - Scoreboard and trophy wall
 * - 30-second timer with auto-exit to next hunt
 */
export default class CaveBarScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CaveBarScene' });
    }

    preload() {
        // Load player sprite sheets
        const playerColors = ['red', 'blue', 'yellow', 'green'];
        playerColors.forEach((color, index) => {
            this.load.atlas(
                `player-${index}`,
                `/assets/generated/spritesheets/${color}-hero.png`,
                `/assets/generated/spritesheets/${color}-hero.json`
            );
        });

        // Load bartender sprite sheet
        this.load.atlas(
            'bartender',
            '/assets/generated/spritesheets/bartender.png',
            '/assets/generated/spritesheets/bartender.json'
        );

        // Load cave bar floor tiles
        this.load.image('cave-stone-floor', '/assets/environments/cave-bar/tiles/cave-stone-floor.png');
        this.load.image('polished-cave-floor', '/assets/environments/cave-bar/tiles/polished-cave-floor.png');
        this.load.image('decorative-floor', '/assets/environments/cave-bar/tiles/decorative-floor.png');
        this.load.image('cave-wall-base', '/assets/environments/cave-bar/tiles/cave-wall-base.png');

        // Load cave wall tiles
        this.load.image('cave-wall-vertical', '/assets/environments/cave-bar/tiles/cave-wall-vertical.png');
        this.load.image('cave-wall-corner', '/assets/environments/cave-bar/tiles/cave-wall-corner.png');

        // Load bar counter tiles
        this.load.image('bar-counter-left-end', '/assets/environments/cave-bar/tiles/bar-counter-left-end.png');
        this.load.image('bar-counter-middle-platform', '/assets/environments/cave-bar/tiles/bar-counter-middle-platform.png');
        this.load.image('bar-counter-right-end', '/assets/environments/cave-bar/tiles/bar-counter-right-end.png');
        this.load.image('bar-counter-corner', '/assets/environments/cave-bar/tiles/bar-counter-corner.png');

        // Load cave bar props
        this.load.image('cave-wall-barrier', '/assets/environments/cave-bar/props/cave-wall-barrier.png');
        this.load.image('cave-wall-straight', '/assets/environments/cave-bar/props/cave-wall-straight.png');
        this.load.image('cave-wall-corner-prop', '/assets/environments/cave-bar/props/cave-wall-corner.png');
        this.load.image('bar-stool', '/assets/environments/cave-bar/props/bar-stool.png');
        this.load.image('bone-mug', '/assets/environments/cave-bar/props/bone-mug.png');

        // Load unique cave paintings for each passive ability
        this.load.image('cave-painting-thick-hide', '/assets/environments/cave-bar/props/cave-painting-thick-hide.png');
        this.load.image('cave-painting-swift-feet', '/assets/environments/cave-bar/props/cave-painting-swift-feet.png');
        this.load.image('cave-painting-hunters-eye', '/assets/environments/cave-bar/props/cave-painting-hunters-eye.png');
        this.load.image('cave-painting-pack-leader', '/assets/environments/cave-bar/props/cave-painting-pack-leader.png');
        this.load.image('cave-painting-scavenger', '/assets/environments/cave-bar/props/cave-painting-scavenger.png');

        this.load.image('scoreboard', '/assets/environments/cave-bar/props/scoreboard.png');
        this.load.image('torch-sconce', '/assets/environments/cave-bar/props/torch-sconce.png');
        this.load.image('trophy-skull', '/assets/environments/cave-bar/props/trophy-skull.png');
        this.load.image('weapon-rack', '/assets/environments/cave-bar/props/weapon-rack.png');
    }

    create() {
        console.log('🍺 Cave Bar Scene created');
        console.log('==========================================');
        console.log('Welcome to the Cave Bar!');
        console.log('📍 Move with WASD');
        console.log('🔫 Visit weapon rack (left wall)');
        console.log('🎨 Check cave paintings (around walls)');
        console.log('🍺 Order drinks from bartender (bar counter)');
        console.log('⏱️  You have 30 seconds before the hunt!');
        console.log('==========================================');

        // Initialize systems
        this.inputManager = new InputManager(this);
        this.inputManager.setupKeyboard(); // Enable WASD for player 0 (testing)

        // Create animations
        this.createPlayerAnimations();
        this.createBartenderAnimations();

        // Build the cave bar environment
        this.addBackground();
        this.buildFloor();
        // Walls removed for open cave design
        // this.buildWalls();
        this.buildBarCounter();
        this.addBartender();
        this.addBarStools();
        this.addBarProps();
        this.addWeaponRack();
        this.addCavePaintings();
        this.addTorches();

        // Spawn players (must come before scoreboard since it needs player data)
        this.spawnPlayers();

        // Load player state from session
        gameSession.loadPlayerState(this.players);

        // Add scoreboard and trophy wall after players exist
        this.addScoreboard();
        this.addTrophyWall();

        // Update UI displays with session data
        if (this.scoreboardDisplay) {
            this.scoreboardDisplay.setHunt(gameSession.getCurrentHunt());
        }
        if (this.trophyWallDisplay) {
            this.trophyWallDisplay.defeatedDinosaurs = gameSession.getDefeatedDinosaurs();
            this.trophyWallDisplay.refresh();
        }

        // Create weapon shop menus (one per player)
        this.weaponShopMenus = this.players.map(player => new WeaponShopMenu(this, player));

        // Create ability painting UI instances (one per player per painting)
        this.abilityPaintingUIs = this.players.map(player =>
            this.cavePaintings.map(painting => new AbilityPaintingUI(this, painting, player))
        );

        // Create cocktail menus (one per player)
        this.cocktailMenus = this.players.map(player => new CocktailMenu(this, player, this.bartender));

        // Initialize player buffs arrays
        this.players.forEach(player => {
            if (!player.passiveAbilities) {
                player.passiveAbilities = [];
            }
            if (!player.cocktailBuffs) {
                player.cocktailBuffs = [];
            }
        });

        // Setup bartender interaction zone (larger for U-shaped bar)
        this.bartenderZone = {
            worldX: this.bartender.worldX,
            worldY: this.bartender.worldY,
            worldZ: this.bartender.worldZ,
            interactionRadius: 3.5 // Larger radius for U-shape
        };

        // Setup camera (fixed, centered on room)
        this.setupCamera();

        // Add atmospheric lighting (subtle tint)
        this.addLighting();

        // Define collision boundaries
        this.setupCollisionZones();

        // Setup countdown timer
        this.setupTimer();
    }

    update(time, delta) {
        // Update players with movement and collision
        if (this.players) {
            this.players.forEach((player, index) => {
                // Skip movement if player has any menu open
                if ((this.weaponShopMenus && this.weaponShopMenus[index].isOpen) ||
                    (this.cocktailMenus && this.cocktailMenus[index].isOpen)) {
                    player.isMoving = false;
                    player.update(delta);
                    return;
                }

                // Get input for this player (with keyboard fallback for player 0)
                const input = this.inputManager.getPlayerInputWithKeyboard(index);

                if (input) {
                    // Convert D-pad to screen-space direction
                    const screenDirection = this.inputManager.getDPadDirection(input.dpad);

                    if (screenDirection.x !== 0 || screenDirection.y !== 0) {
                        // Convert screen-space input to world-space direction (critical for isometric)
                        const worldDirection = screenToWorldDirection(screenDirection.x, screenDirection.y);

                        // Calculate desired new position
                        const moveSpeed = player.moveSpeed;
                        const deltaSeconds = delta / 1000;
                        const newX = player.worldX + worldDirection.x * moveSpeed * deltaSeconds;
                        const newY = player.worldY + worldDirection.y * moveSpeed * deltaSeconds;

                        // Check if new position is valid (collision detection)
                        if (this.isValidPosition(newX, newY, player.worldZ)) {
                            player.worldX = newX;
                            player.worldY = newY;
                            player.facingX = worldDirection.x;
                            player.facingY = worldDirection.y;
                            player.isMoving = true;
                        } else {
                            player.isMoving = false;
                        }
                    } else {
                        player.isMoving = false;
                    }

                    // Update player animation based on movement state
                    updatePlayerAnimation(player.sprite, player.playerNumber, player.facingX, player.facingY, player.isMoving);
                }

                // Update player entity
                player.update(delta);
            });
        }

        // Update bartender
        if (this.bartender) {
            this.bartender.update(time, delta);
        }

        // Check weapon rack proximity and handle menu interactions
        if (this.weaponRack && this.players) {
            let anyPlayerNearRack = false;

            this.players.forEach((player, index) => {
                const input = this.inputManager.getPlayerInputWithKeyboard(index);
                if (!input) return;

                const distance = this.getDistance2D(
                    player.worldX, player.worldY,
                    this.weaponRack.worldX, this.weaponRack.worldY
                );

                const isNearRack = distance <= this.weaponRack.interactionRadius;
                player.nearWeaponRack = isNearRack;

                if (isNearRack) {
                    anyPlayerNearRack = true;
                }

                // If weapon shop menu is open for this player, handle menu input
                if (this.weaponShopMenus[index].isOpen) {
                    this.weaponShopMenus[index].update(input);
                    return; // Skip movement when menu is open
                }

                // Open weapon shop when X is pressed near rack
                if (isNearRack && input.buttons.x && !player.lastX) {
                    // Close other menus first
                    if (this.cocktailMenus[index].isOpen) {
                        this.cocktailMenus[index].close();
                    }
                    this.weaponShopMenus[index].open();
                    console.log(`Player ${index} opened weapon shop`);
                }

                // Track X button state for edge detection
                player.lastX = input.buttons.x;
            });

            // Show/hide weapon rack prompt
            if (this.weaponRackPrompt) {
                this.weaponRackPrompt.setVisible(anyPlayerNearRack);
            }
        }

        // Check cave painting proximity and handle ability purchases
        if (this.cavePaintings && this.players && this.abilityPaintingUIs) {
            this.players.forEach((player, playerIndex) => {
                const input = this.inputManager.getPlayerInputWithKeyboard(playerIndex);
                if (!input) return;

                // Check proximity to each painting
                this.cavePaintings.forEach((painting, paintingIndex) => {
                    const distance = this.getDistance2D(
                        player.worldX, player.worldY,
                        painting.worldX, painting.worldY
                    );

                    const isNear = distance <= painting.interactionRadius;
                    const paintingUI = this.abilityPaintingUIs[playerIndex][paintingIndex];

                    // Show/hide UI based on proximity
                    if (isNear && !this.weaponShopMenus[playerIndex].isOpen) {
                        if (!paintingUI.isVisible) {
                            paintingUI.show();
                            paintingUI.updatePaintingState();
                        }

                        // Purchase ability on X press
                        if (input.buttons.x && !player.lastPaintingX) {
                            paintingUI.tryPurchase();
                        }
                    } else {
                        if (paintingUI.isVisible) {
                            paintingUI.hide();
                        }
                    }
                });

                // Track X button for paintings
                player.lastPaintingX = input.buttons.x;
            });
        }

        // Check bartender proximity and handle cocktail menu
        if (this.bartenderZone && this.players && this.cocktailMenus) {
            let anyPlayerNearBartender = false;

            this.players.forEach((player, index) => {
                const input = this.inputManager.getPlayerInputWithKeyboard(index);
                if (!input) return;

                const distance = this.getDistance2D(
                    player.worldX, player.worldY,
                    this.bartenderZone.worldX, this.bartenderZone.worldY
                );

                const isNearBartender = distance <= this.bartenderZone.interactionRadius;
                player.nearBartender = isNearBartender;

                if (isNearBartender) {
                    anyPlayerNearBartender = true;
                }

                // If cocktail menu is open, handle menu input
                if (this.cocktailMenus[index].isOpen) {
                    this.cocktailMenus[index].update(input);
                    return; // Skip other interactions
                }

                // Open cocktail menu when X is pressed near bartender
                if (isNearBartender && input.buttons.x && !player.lastBartenderX) {
                    // Close other menus first
                    if (this.weaponShopMenus[index].isOpen) {
                        this.weaponShopMenus[index].close();
                    }
                    this.cocktailMenus[index].open();
                    console.log(`Player ${index} opened cocktail menu`);
                }

                // Track X button for bartender
                player.lastBartenderX = input.buttons.x;
            });

            // Show/hide bartender prompt
            if (this.bartenderPrompt) {
                this.bartenderPrompt.setVisible(anyPlayerNearBartender);
            }
        }

        // Update countdown timer
        if (this.timerActive && this.timeRemaining > 0) {
            this.timeRemaining -= delta / 1000; // Convert ms to seconds

            // Update timer display
            if (this.timerText) {
                this.timerText.setText(this.formatTime(Math.max(0, this.timeRemaining)));

                // Change color based on time remaining
                if (this.timeRemaining <= 5) {
                    this.timerText.setColor('#ff0000'); // Red for last 5 seconds
                } else if (this.timeRemaining <= 10) {
                    this.timerText.setColor('#ff9900'); // Orange for last 10 seconds
                }
            }

            // Play warning beeps at specific times
            if (Math.ceil(this.timeRemaining) === 10 && !this.beep10) {
                console.log('⏰ 10 seconds remaining!');
                this.beep10 = true;
                // TODO: Play warning beep sound
                // this.sound.play('timer-beep');
            }
            if (Math.ceil(this.timeRemaining) === 5 && !this.beep5) {
                console.log('⏰ 5 seconds remaining! GET READY!');
                this.beep5 = true;

                // Show "GET READY!" warning overlay
                const camera = this.cameras.main;
                const warning = this.add.text(
                    camera.width / 2,
                    camera.height / 2 - 100,
                    'GET READY!',
                    {
                        fontSize: '64px',
                        fontFamily: 'Arial',
                        color: '#ff0000',
                        fontStyle: 'bold',
                        stroke: '#000000',
                        strokeThickness: 8
                    }
                );
                warning.setOrigin(0.5);
                warning.setScrollFactor(0);
                warning.setDepth(90000);

                // Pulse animation
                this.tweens.add({
                    targets: warning,
                    scale: 1.2,
                    alpha: 0,
                    duration: 1000,
                    ease: 'Power2'
                });

                // TODO: Play urgent warning sound
                // this.sound.play('warning-urgent');
            }

            // Trigger exit when timer reaches 0
            if (this.timeRemaining <= 0 && !this.exiting) {
                this.exiting = true;
                this.triggerExit();
            }
        }
    }

    /**
     * Trigger exit transition to hunt scene
     */
    triggerExit() {
        console.log('🚪 Time\'s up! Exiting cave bar...');

        this.timerActive = false;

        // Save player state to session
        gameSession.savePlayerState(this.players);

        // Show exit message
        const camera = this.cameras.main;
        const exitText = this.add.text(
            camera.width / 2,
            camera.height / 2,
            'TIME\'S UP!\nGET READY FOR THE HUNT!',
            {
                fontSize: '48px',
                fontFamily: 'Arial',
                color: '#ff9900',
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 8
            }
        );
        exitText.setOrigin(0.5);
        exitText.setScrollFactor(0);
        exitText.setDepth(150000);

        // Fade out after 2 seconds and transition to hunt scene
        this.time.delayedCall(2000, () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                console.log('🎯 Transitioning to hunt scene...');
                this.scene.start('HuntScene');
            });
        });
    }

    /**
     * Calculate 2D distance between two points (ignoring Z)
     */
    getDistance2D(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Creates player animations for all 4 players
     */
    createPlayerAnimations() {
        const directions = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
        const playerColors = ['red', 'blue', 'yellow', 'green'];

        for (let playerIndex = 0; playerIndex < 4; playerIndex++) {
            const atlasKey = `player-${playerIndex}`;

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
                    repeat: -1
                });

                // Create idle animation (4 frames, 6 fps)
                this.anims.create({
                    key: `player-${playerIndex}-idle-${direction}`,
                    frames: this.anims.generateFrameNames(atlasKey, {
                        prefix: `player-${playerIndex}-idle-${direction}-`,
                        start: 0,
                        end: 3
                    }),
                    frameRate: 6,
                    repeat: -1
                });
            });
        }

        console.log('✅ Player animations created');
    }

    /**
     * Creates bartender animations for all directions
     */
    createBartenderAnimations() {
        const directions = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
        const animations = [
            { key: 'idle', frames: 16, frameRate: 8, repeat: -1 },
            { key: 'serving', frames: 16, frameRate: 12, repeat: 0 },
            { key: 'victory', frames: 16, frameRate: 10, repeat: -1 },
            { key: 'disapproval', frames: 16, frameRate: 8, repeat: -1 }
        ];

        directions.forEach(direction => {
            animations.forEach(anim => {
                this.anims.create({
                    key: `bartender-${anim.key}-${direction}`,
                    frames: this.anims.generateFrameNames('bartender', {
                        prefix: `bartender-${anim.key}-${direction}-`,
                        start: 0,
                        end: anim.frames - 1
                    }),
                    frameRate: anim.frameRate,
                    repeat: anim.repeat
                });
            });
        });

        console.log('✅ Bartender animations created');
    }

    /**
     * Add black background
     */
    addBackground() {
        const camera = this.cameras.main;
        const bg = this.add.rectangle(
            camera.width / 2,
            camera.height / 2,
            camera.width * 2,
            camera.height * 2,
            0x000000 // Black
        );
        bg.setScrollFactor(0);
        bg.setDepth(-10000); // Behind everything
    }

    /**
     * Build floor layout using tiles
     * Cave bar dimensions: ~20×15 world units (smaller than hunt arenas)
     */
    buildFloor() {
        console.log('🏗️  Building organic cave floor...');

        const centerX = 10;
        const centerY = 7.5;
        const radiusX = 10; // Match wall ellipse
        const radiusY = 7.5; // Match wall ellipse
        const tileSize = 0.64;

        // Calculate tile grid bounds
        const minX = Math.floor((centerX - radiusX) / tileSize);
        const maxX = Math.ceil((centerX + radiusX) / tileSize);
        const minY = Math.floor((centerY - radiusY) / tileSize);
        const maxY = Math.ceil((centerY + radiusY) / tileSize);

        let floorTileCount = 0;

        // Create floor tiles only inside the organic cave shape
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const worldX = x * tileSize;
                const worldY = y * tileSize;

                // Check if this tile is inside the organic cave boundary
                if (!this.isInsideCave(worldX, worldY, centerX, centerY, radiusX, radiusY)) {
                    continue; // Skip tiles outside the cave
                }

                const worldZ = 0; // Floor at ground level
                const screenPos = worldToScreen(worldX, worldY, worldZ);
                const depth = calculateDepth(worldY, worldZ);

                // Use darker floor tiles for cave atmosphere
                let tileKey = 'cave-stone-floor'; // Default cave floor with rough stone texture

                // Add lighter polished floor near bar area (center-right of room)
                if (worldX >= 10 && worldX <= 15 && worldY >= 5 && worldY <= 10) {
                    tileKey = 'cave-stone-floor'; // Lighter tan for bar area contrast
                }

                // Add occasional darker accent tiles (5% chance)
                if (Math.random() < 0.05) {
                    tileKey = 'polished-cave-floor'; // Dark purple accent
                }

                const tile = this.add.sprite(screenPos.x, screenPos.y, tileKey);
                tile.setDepth(depth);
                floorTileCount++;
            }
        }

        console.log(`✅ Organic floor built (${floorTileCount} tiles inside cave boundary)`);
    }

    /**
     * Check if a point is inside the organic cave boundary
     * Uses same elliptical shape with variations as the walls
     */
    isInsideCave(x, y, centerX, centerY, radiusX, radiusY) {
        // Calculate angle from center to point
        const dx = x - centerX;
        const dy = y - centerY;
        const angle = Math.atan2(dy, dx);

        // Apply same organic variations as wall generation
        const variation1 = Math.sin(angle * 3) * 0.8;
        const variation2 = Math.sin(angle * 5 + 1.5) * 0.5;
        const variation3 = Math.sin(angle * 2 + 3) * 1.2;
        const radiusVariation = variation1 + variation2 + variation3;

        // Calculate effective radius at this angle for ellipse
        const effectiveRadiusX = radiusX + radiusVariation;
        const effectiveRadiusY = radiusY + radiusVariation;

        // Distance from center
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Expected radius at this angle (ellipse formula)
        const expectedRadius = Math.sqrt(
            (effectiveRadiusX * effectiveRadiusX * effectiveRadiusY * effectiveRadiusY) /
            (effectiveRadiusY * effectiveRadiusY * Math.cos(angle) * Math.cos(angle) +
             effectiveRadiusX * effectiveRadiusX * Math.sin(angle) * Math.sin(angle))
        );

        // Point is inside if its distance is less than the expected radius
        // Add small margin to ensure floor extends slightly under walls
        return distance <= expectedRadius * 0.95;
    }

    /**
     * Build walls using elevated floor tiles (high worldZ)
     * Creates an organic, rounded cave perimeter
     */
    buildWalls() {
        console.log('🏗️  Building organic cave walls...');

        const centerX = 10;
        const centerY = 7.5;
        const radiusX = 10; // Horizontal radius
        const radiusY = 7.5; // Vertical radius (creates ellipse)
        const tileSize = 0.64;
        const wallLayers = 6;
        const layerSpacing = 0.15;

        let wallTileCount = 0;

        // Generate wall positions along an elliptical perimeter with organic variations
        const wallPoints = this.generateCavePerimeter(centerX, centerY, radiusX, radiusY, tileSize);

        // Create tightly stacked wall layers
        for (let layer = 0; layer < wallLayers; layer++) {
            const layerZ = layer * layerSpacing;

            wallPoints.forEach(point => {
                const screenPos = worldToScreen(point.x, point.y, layerZ);
                const depth = calculateDepth(point.y, layerZ);
                const wall = this.add.sprite(screenPos.x, screenPos.y, 'cave-wall-base');
                wall.setDepth(depth);
                wallTileCount++;
            });
        }

        console.log(`✅ Organic cave walls built (${wallTileCount} tiles in ${wallLayers} layers)`);
    }

    /**
     * Generate organic cave perimeter points
     * Creates an elliptical shape with natural variations
     * Skips the bottom section to create an entrance opening
     */
    generateCavePerimeter(centerX, centerY, radiusX, radiusY, tileSize) {
        const points = [];
        const angleStep = Math.PI / 24; // Sample points around the ellipse

        // Define entrance opening angle range (bottom section)
        const entranceAngleStart = Math.PI * 0.6;  // ~108 degrees (bottom-left)
        const entranceAngleEnd = Math.PI * 1.4;    // ~252 degrees (bottom-right)

        for (let angle = 0; angle < Math.PI * 2; angle += angleStep) {
            // Skip the bottom section (entrance opening)
            if (angle >= entranceAngleStart && angle <= entranceAngleEnd) {
                continue;
            }
            // Base ellipse position
            let x = centerX + Math.cos(angle) * radiusX;
            let y = centerY + Math.sin(angle) * radiusY;

            // Add organic variations using sine waves at different frequencies
            const variation1 = Math.sin(angle * 3) * 0.8; // Small bumps
            const variation2 = Math.sin(angle * 5 + 1.5) * 0.5; // Smaller details
            const variation3 = Math.sin(angle * 2 + 3) * 1.2; // Larger curves

            // Apply variations to radius
            const radiusVariation = variation1 + variation2 + variation3;
            x = centerX + Math.cos(angle) * (radiusX + radiusVariation);
            y = centerY + Math.sin(angle) * (radiusY + radiusVariation);

            // Fill in between sampled points with tiles
            const lastPoint = points[points.length - 1];
            if (lastPoint) {
                const dx = x - lastPoint.x;
                const dy = y - lastPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const steps = Math.ceil(distance / tileSize);

                // Add intermediate points
                for (let step = 1; step < steps; step++) {
                    const t = step / steps;
                    points.push({
                        x: lastPoint.x + dx * t,
                        y: lastPoint.y + dy * t
                    });
                }
            }

            points.push({ x, y });
        }

        return points;
    }

    /**
     * Build the bar counter structure in U-shape
     * Positioned in the center-right area of the cave
     */
    buildBarCounter() {
        console.log('🏗️  Building U-shaped bar counter...');

        const barZ = 0.3; // Slightly elevated platform
        const tileSize = 0.64;

        // U-shape configuration
        const centerX = 13.5;
        const centerY = 7.5;
        const uWidth = 5; // Width in tiles
        const uHeight = 3; // Height of arms in tiles

        // Calculate U corners
        const leftX = centerX - (uWidth / 2) * tileSize;
        const rightX = centerX + (uWidth / 2) * tileSize - tileSize;
        const topY = centerY;
        const bottomY = centerY + uHeight * tileSize;

        // Left vertical arm (top to bottom)
        for (let i = 0; i < uHeight; i++) {
            const worldX = leftX;
            const worldY = topY + i * tileSize;
            const screenPos = worldToScreen(worldX, worldY, barZ);
            const tile = this.add.sprite(screenPos.x, screenPos.y, 'bar-counter-middle-platform');
            tile.setDepth(calculateDepth(worldY, barZ));
        }

        // Bottom horizontal section (left to right, including corners)
        for (let i = 0; i < uWidth; i++) {
            const worldX = leftX + i * tileSize;
            const worldY = bottomY;
            const screenPos = worldToScreen(worldX, worldY, barZ);
            const tile = this.add.sprite(screenPos.x, screenPos.y, 'bar-counter-middle-platform');
            tile.setDepth(calculateDepth(worldY, barZ));
        }

        // Right vertical arm (top to bottom)
        for (let i = 0; i < uHeight; i++) {
            const worldX = rightX;
            const worldY = topY + i * tileSize;
            const screenPos = worldToScreen(worldX, worldY, barZ);
            const tile = this.add.sprite(screenPos.x, screenPos.y, 'bar-counter-middle-platform');
            tile.setDepth(calculateDepth(worldY, barZ));
        }

        console.log('✅ U-shaped bar counter built');
    }

    /**
     * Add the bartender NPC inside the U-shaped bar
     */
    addBartender() {
        console.log('🏗️  Adding bartender NPC...');

        // Position bartender inside the U-shape
        const bartenderX = 13.5; // Center of the U
        const bartenderY = 7.5; // Inside the U
        const bartenderZ = 0.4; // Slightly elevated (standing on platform)

        this.bartender = new Bartender(this, bartenderX, bartenderY, bartenderZ);

        // Create interaction prompt (positioned at bottom of U)
        const screenPos = worldToScreen(bartenderX, bartenderY + 3.0, bartenderZ);
        const promptY = screenPos.y + 20;
        this.bartenderPrompt = this.add.text(
            screenPos.x,
            promptY,
            'Press X to Order Drink',
            {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        this.bartenderPrompt.setOrigin(0.5);
        this.bartenderPrompt.setDepth(calculateDepth(bartenderY, bartenderZ) + 1);
        this.bartenderPrompt.setVisible(false);

        console.log('✅ Bartender added at bar counter');
    }

    /**
     * Add bar stools around the U-shaped bar
     */
    addBarStools() {
        console.log('🏗️  Adding bar stools...');

        const stoolZ = 0.2; // Slightly elevated
        const tileSize = 0.64;
        const centerX = 13.5;
        const centerY = 7.5;
        const uWidth = 5;
        const uHeight = 3;

        const leftX = centerX - (uWidth / 2) * tileSize;
        const rightX = centerX + (uWidth / 2) * tileSize - tileSize;
        const bottomY = centerY + uHeight * tileSize;

        // 4 stools positioned in front of the U (outside, facing inward)
        const stoolOffset = 0.8; // Distance from counter
        const stoolPositions = [
            { x: leftX, y: bottomY + stoolOffset, label: 'red' },           // Bottom left
            { x: centerX - 0.5, y: bottomY + stoolOffset, label: 'blue' },  // Bottom center-left
            { x: centerX + 0.5, y: bottomY + stoolOffset, label: 'yellow' },// Bottom center-right
            { x: rightX, y: bottomY + stoolOffset, label: 'green' }         // Bottom right
        ];

        this.barStools = [];

        stoolPositions.forEach(pos => {
            const screenPos = worldToScreen(pos.x, pos.y, stoolZ);
            const depth = calculateDepth(pos.y, stoolZ);
            const stool = this.add.sprite(screenPos.x, screenPos.y, 'bar-stool');
            stool.setDepth(depth);

            // Store stool data for later interaction system
            this.barStools.push({
                sprite: stool,
                worldX: pos.x,
                worldY: pos.y,
                worldZ: stoolZ,
                playerColor: pos.label
            });
        });

        console.log(`✅ Added ${stoolPositions.length} bar stools`);
    }

    /**
     * Add decorative props to the bar area
     */
    addBarProps() {
        console.log('🏗️  Adding bar props...');

        const barZ = 0.6; // On top of counter
        const tileSize = 0.64;
        const centerX = 13.5;
        const centerY = 7.5;
        const uWidth = 5;
        const uHeight = 3;

        const leftX = centerX - (uWidth / 2) * tileSize;
        const rightX = centerX + (uWidth / 2) * tileSize - tileSize;
        const bottomY = centerY + uHeight * tileSize;

        // Add bone mugs on the U-shaped counter
        const mugPositions = [
            { x: leftX, y: bottomY },              // Bottom left corner
            { x: centerX, y: bottomY },            // Bottom center
            { x: rightX, y: bottomY },             // Bottom right corner
            { x: leftX, y: centerY + tileSize },   // Left arm middle
            { x: rightX, y: centerY + tileSize }   // Right arm middle
        ];

        mugPositions.forEach(pos => {
            const screenPos = worldToScreen(pos.x, pos.y, barZ);
            const depth = calculateDepth(pos.y, barZ);
            const mug = this.add.sprite(screenPos.x, screenPos.y, 'bone-mug');
            mug.setDepth(depth);
        });

        console.log('✅ Bar props added');
    }

    /**
     * Add weapon rack station on left wall
     */
    addWeaponRack() {
        console.log('🏗️  Adding weapon rack station...');

        // Position on left wall (per design)
        const rackX = 3;
        const rackY = 7;
        const rackZ = 0.2;

        const screenPos = worldToScreen(rackX, rackY, rackZ);
        const depth = calculateDepth(rackY, rackZ);

        this.weaponRack = {
            sprite: this.add.sprite(screenPos.x, screenPos.y, 'weapon-rack'),
            worldX: rackX,
            worldY: rackY,
            worldZ: rackZ,
            interactionRadius: 2.0 // Distance for interaction prompt
        };

        this.weaponRack.sprite.setDepth(depth);

        // Create interaction prompt (hidden by default)
        const promptY = screenPos.y - 60; // Above the weapon rack
        this.weaponRackPrompt = this.add.text(
            screenPos.x,
            promptY,
            'Press X to View Weapons',
            {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        this.weaponRackPrompt.setOrigin(0.5);
        this.weaponRackPrompt.setDepth(depth + 1);
        this.weaponRackPrompt.setVisible(false);

        console.log('✅ Weapon rack added on left wall');
    }

    /**
     * Add cave paintings for passive abilities
     * Distributed around the cave walls
     * Each ability now has its own unique painting prop
     */
    addCavePaintings() {
        console.log('🏗️  Adding cave paintings...');

        // Map ability IDs to their specific painting images
        const abilityPaintingMap = {
            'thick-hide': 'cave-painting-thick-hide',
            'swift-feet': 'cave-painting-swift-feet',
            'hunters-eye': 'cave-painting-hunters-eye',
            'pack-leader': 'cave-painting-pack-leader',
            'scavenger': 'cave-painting-scavenger'
        };

        // Painting positions around the cave (5 paintings for 5 abilities)
        const paintingPositions = [
            { x: 5, y: 3, z: 0.3 },    // North-west wall
            { x: 15, y: 3, z: 0.3 },   // North-east wall
            { x: 17, y: 8, z: 0.3 },   // East wall
            { x: 6, y: 12, z: 0.3 },   // South-west wall
            { x: 14, y: 12, z: 0.3 }   // South-east wall
        ];

        this.cavePaintings = [];

        passiveAbilities.forEach((ability, index) => {
            const pos = paintingPositions[index];
            const screenPos = worldToScreen(pos.x, pos.y, pos.z);
            const depth = calculateDepth(pos.y, pos.z);

            // Get the specific painting image for this ability
            const paintingImage = abilityPaintingMap[ability.id];

            // Add glowing circle behind painting for visibility
            const glowRadius = 50;
            const glow = this.add.circle(screenPos.x, screenPos.y, glowRadius, 0xffaa44, 0.3);
            glow.setDepth(depth - 1); // Behind painting

            // Pulsing glow animation to draw attention
            this.tweens.add({
                targets: glow,
                alpha: 0.5,
                scale: 1.15,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            const painting = {
                sprite: this.add.sprite(screenPos.x, screenPos.y, paintingImage),
                glow: glow,
                worldX: pos.x,
                worldY: pos.y,
                worldZ: pos.z,
                ability: ability,
                interactionRadius: 2.0
            };

            painting.sprite.setDepth(depth);
            // Remove dimming - keep paintings at full brightness
            // painting.sprite.setTint(0x666666);

            this.cavePaintings.push(painting);
        });

        console.log(`✅ Added ${this.cavePaintings.length} cave paintings with unique artwork`);
    }

    /**
     * Add torch sconces for atmospheric lighting
     */
    addTorches() {
        console.log('🏗️  Adding torches...');

        // Torch positions around the cave perimeter
        const torchPositions = [
            { x: 4, y: 4, z: 0.5 },     // North-west
            { x: 10, y: 2, z: 0.5 },    // North center
            { x: 16, y: 4, z: 0.5 },    // North-east
            { x: 18, y: 8, z: 0.5 },    // East
            { x: 16, y: 12, z: 0.5 },   // South-east
            { x: 10, y: 14, z: 0.5 },   // South center
            { x: 4, y: 12, z: 0.5 },    // South-west
            { x: 2, y: 8, z: 0.5 }      // West
        ];

        this.torches = [];

        torchPositions.forEach(pos => {
            const screenPos = worldToScreen(pos.x, pos.y, pos.z);
            const depth = calculateDepth(pos.y, pos.z);

            // Torch sconce sprite
            const torch = this.add.sprite(screenPos.x, screenPos.y, 'torch-sconce');
            torch.setDepth(depth);

            // Add flickering flame effect (simple scale animation)
            this.tweens.add({
                targets: torch,
                scaleX: 1.05,
                scaleY: 0.95,
                duration: 300 + Math.random() * 200, // Random duration for natural flicker
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Add orange glow effect
            torch.setTint(0xffaa44);

            // Add point light effect (subtle circular glow)
            const glowRadius = 60;
            const glow = this.add.circle(screenPos.x, screenPos.y, glowRadius, 0xff8822, 0.15);
            glow.setDepth(depth - 1); // Behind torch

            // Animate glow pulsing
            this.tweens.add({
                targets: glow,
                alpha: 0.25,
                scale: 1.1,
                duration: 1000 + Math.random() * 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.torches.push({
                sprite: torch,
                glow: glow,
                worldX: pos.x,
                worldY: pos.y,
                worldZ: pos.z
            });
        });

        console.log(`✅ Added ${this.torches.length} torches`);
    }

    /**
     * Add scoreboard display on wall
     */
    addScoreboard() {
        console.log('🏗️  Adding scoreboard...');

        // Position scoreboard on north wall (top center, visible to all)
        const scoreboardX = 10;
        const scoreboardY = 2;
        const scoreboardZ = 0.3;

        const screenPos = worldToScreen(scoreboardX, scoreboardY, scoreboardZ);
        const depth = calculateDepth(scoreboardY, scoreboardZ);

        // Scoreboard prop/background
        const scoreboardProp = this.add.sprite(screenPos.x, screenPos.y, 'scoreboard');
        scoreboardProp.setDepth(depth);

        // Create scoreboard UI display
        this.scoreboardDisplay = new ScoreboardDisplay(
            this,
            screenPos.x,
            screenPos.y,
            this.players,
            1 // Starting at hunt 1
        );

        console.log('✅ Scoreboard added');
    }

    /**
     * Add trophy wall display
     */
    addTrophyWall() {
        console.log('🏗️  Adding trophy wall...');

        const camera = this.cameras.main;

        // Position in camera space (right side of screen)
        const screenX = camera.width - 170; // Right edge with padding
        const screenY = camera.height / 2 - 50; // Vertically centered

        // Trophy wall display (no defeated dinosaurs yet in testing)
        this.trophyWallDisplay = new TrophyWallDisplay(
            this,
            screenX,
            screenY,
            [] // Empty for now, will be populated from session state
        );

        console.log('✅ Trophy wall added');
    }

    /**
     * Spawn players at cave entrance
     */
    spawnPlayers() {
        console.log('🏗️  Spawning players...');

        // Cave entrance position (bottom-center of the cave)
        const entranceX = 10;
        const entranceY = 13;
        const entranceZ = 1; // Slightly above floor for proper depth sorting

        // Spacing between players at entrance
        const playerSpacing = 1.5;

        this.players = [];

        // Create 4 players at entrance
        for (let i = 0; i < 4; i++) {
            // Stagger positions left to right at entrance
            const offsetX = (i - 1.5) * playerSpacing; // Centers around entrance
            const player = new Player(
                this,
                i,
                entranceX + offsetX,
                entranceY,
                entranceZ
            );

            // Set slower movement speed for cave bar (exploration pace)
            player.moveSpeed = 5; // Slower than hunt scene (8)

            // TEMPORARY: Give testing credits so shops can be tested
            player.score = 500; // Enough to test all items

            this.players.push(player);
        }

        console.log(`✅ Spawned ${this.players.length} players at entrance`);
    }

    /**
     * Setup collision zones for walls and props
     */
    setupCollisionZones() {
        console.log('🏗️  Setting up collision zones...');

        // Cave boundary collision (uses same organic cave shape)
        const centerX = 10;
        const centerY = 7.5;
        const radiusX = 10;
        const radiusY = 7.5;

        this.caveBoundary = {
            centerX,
            centerY,
            radiusX,
            radiusY,
            type: 'organic-ellipse'
        };

        // Bar counter collision (U-shaped zone - simplified as larger box)
        this.barCounterZone = {
            minX: 11.5,
            maxX: 15.5,
            minY: 6.0,
            maxY: 10.5,
            minZ: 0,
            maxZ: 1.0,
            type: 'box'
        };

        // TODO: Add more collision zones for other props as needed

        console.log('✅ Collision zones configured');
    }

    /**
     * Check if a position is valid (inside floor area, not colliding with props)
     */
    isValidPosition(worldX, worldY, worldZ) {
        // Check if on floor (inside cave floor boundary)
        if (!this.isInsideCave(worldX, worldY, this.caveBoundary.centerX, this.caveBoundary.centerY, this.caveBoundary.radiusX, this.caveBoundary.radiusY)) {
            return false;
        }

        // Check bar counter collision
        if (worldX >= this.barCounterZone.minX && worldX <= this.barCounterZone.maxX &&
            worldY >= this.barCounterZone.minY && worldY <= this.barCounterZone.maxY &&
            worldZ >= this.barCounterZone.minZ && worldZ <= this.barCounterZone.maxZ) {
            return false;
        }

        return true;
    }

    /**
     * Setup camera (fixed position, centered on room)
     */
    setupCamera() {
        const camera = this.cameras.main;

        // Center camera on cave bar (10, 7.5 world units = center of 20×15 room)
        const centerPos = worldToScreen(10, 7.5, 0);

        // Set camera to fixed position (no following)
        camera.centerOn(centerPos.x, centerPos.y);

        // Optional: slight zoom in for cozy feeling
        // camera.setZoom(1.1);

        console.log('📷 Camera setup complete');
    }

    /**
     * Setup countdown timer
     */
    setupTimer() {
        console.log('🏗️  Setting up countdown timer...');

        const camera = this.cameras.main;

        // Timer duration in seconds
        this.timerDuration = 30;
        this.timeRemaining = this.timerDuration;
        this.timerActive = true;

        // Timer display (top center of screen)
        this.timerText = this.add.text(
            camera.width / 2,
            50,
            this.formatTime(this.timeRemaining),
            {
                fontSize: '48px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 6
            }
        );
        this.timerText.setOrigin(0.5);
        this.timerText.setScrollFactor(0); // Fixed to camera
        this.timerText.setDepth(50000); // High depth but below menus

        // Timer label
        this.timerLabel = this.add.text(
            camera.width / 2,
            100,
            'TIME UNTIL NEXT HUNT',
            {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#999999',
                fontStyle: 'bold'
            }
        );
        this.timerLabel.setOrigin(0.5);
        this.timerLabel.setScrollFactor(0);
        this.timerLabel.setDepth(50000);

        console.log('✅ Timer setup complete');
    }

    /**
     * Format time in MM:SS format
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Add atmospheric lighting
     */
    addLighting() {
        const camera = this.cameras.main;

        // Warm ambient overlay for torch-lit cave atmosphere
        // Using a subtle additive blend for warm glow without darkening
        const overlay = this.add.rectangle(
            camera.width / 2,
            camera.height / 2,
            camera.width,
            camera.height,
            0xff9944, // Warm orange
            0.08 // Very subtle
        );
        overlay.setScrollFactor(0); // Fixed to camera
        overlay.setDepth(45000); // High enough to be above all game elements
        overlay.setBlendMode(Phaser.BlendModes.ADD); // Additive for warm glow

        // Subtle pulsing ambient light
        this.tweens.add({
            targets: overlay,
            alpha: 0.12,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        console.log('💡 Atmospheric lighting added');
    }
}
