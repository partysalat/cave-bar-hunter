import Phaser from 'phaser';
import { worldToScreen, calculateDepth } from '../systems/CoordinateSystem.js';

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
        this.load.image('cave-painting', '/assets/environments/cave-bar/props/cave-painting.png');
        this.load.image('scoreboard', '/assets/environments/cave-bar/props/scoreboard.png');
        this.load.image('torch-sconce', '/assets/environments/cave-bar/props/torch-sconce.png');
        this.load.image('trophy-skull', '/assets/environments/cave-bar/props/trophy-skull.png');
        this.load.image('weapon-rack', '/assets/environments/cave-bar/props/weapon-rack.png');
    }

    create() {
        console.log('🍺 Cave Bar Scene created');

        // Create bartender animations
        this.createBartenderAnimations();

        // Build the cave bar environment
        this.buildFloor();
        this.buildWalls();

        // Setup camera (fixed, centered on room)
        this.setupCamera();

        // Add atmospheric lighting (subtle tint)
        this.addLighting();
    }

    update(time, delta) {
        // Phase 1: Just render the environment
        // Later phases will add:
        // - Player movement
        // - Bartender interactions
        // - Shop menus
        // - Timer countdown
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
     * Build floor layout using tiles
     * Cave bar dimensions: ~20×15 world units (smaller than hunt arenas)
     */
    buildFloor() {
        console.log('🏗️  Building cave bar floor...');

        // Floor dimensions in world units
        const roomWidth = 20;
        const roomHeight = 15;

        // Tile size in world units (each tile = 0.64 world units)
        // Note: Cave bar tiles are 64px, which maps to 0.64 world units at our scale
        const tileSize = 0.64;

        // Calculate number of tiles needed to fill the room
        const tilesWide = Math.ceil(roomWidth / tileSize);
        const tilesHigh = Math.ceil(roomHeight / tileSize);

        // Create floor tile sprites
        for (let x = 0; x < tilesWide; x++) {
            for (let y = 0; y < tilesHigh; y++) {
                const worldX = x * tileSize;
                const worldY = y * tileSize;
                const worldZ = 0; // Floor at ground level

                const screenPos = worldToScreen(worldX, worldY, worldZ);
                const depth = calculateDepth(worldY, worldZ);

                // Vary floor tiles for visual interest
                let tileKey = 'cave-stone-floor'; // Default

                // Add polished floor near bar area (center-right of room)
                // Adjust coordinates to work with world units instead of tile indices
                if (worldX >= 10 && worldX <= 15 && worldY >= 5 && worldY <= 10) {
                    tileKey = 'polished-cave-floor';
                }

                // Add decorative floor tiles randomly (5% chance)
                if (Math.random() < 0.05) {
                    tileKey = 'decorative-floor';
                }

                const tile = this.add.sprite(screenPos.x, screenPos.y, tileKey);
                tile.setDepth(depth);
            }
        }

        console.log(`✅ Floor built (${tilesWide}×${tilesHigh} = ${tilesWide * tilesHigh} tiles at ${tileSize} unit spacing)`);
    }

    /**
     * Build walls around room perimeter using props
     */
    buildWalls() {
        console.log('🏗️  Building cave walls...');

        const roomWidth = 20;
        const roomHeight = 15;

        // Place wall barriers around perimeter
        // Left wall (west side)
        for (let y = 0; y < roomHeight; y += 3) {
            const screenPos = worldToScreen(-0.5, y, 0);
            const depth = calculateDepth(y, 0);
            const wall = this.add.sprite(screenPos.x, screenPos.y, 'cave-wall-straight');
            wall.setDepth(depth + 100); // Higher depth to appear behind props
        }

        // Right wall (east side)
        for (let y = 0; y < roomHeight; y += 3) {
            const screenPos = worldToScreen(roomWidth + 0.5, y, 0);
            const depth = calculateDepth(y, 0);
            const wall = this.add.sprite(screenPos.x, screenPos.y, 'cave-wall-straight');
            wall.setDepth(depth + 100);
        }

        // Top wall (north side)
        for (let x = 0; x < roomWidth; x += 3) {
            const screenPos = worldToScreen(x, -0.5, 0);
            const depth = calculateDepth(-0.5, 0);
            const wall = this.add.sprite(screenPos.x, screenPos.y, 'cave-wall-barrier');
            wall.setDepth(depth + 100);
        }

        // Bottom wall (south side, behind players)
        for (let x = 0; x < roomWidth; x += 3) {
            const screenPos = worldToScreen(x, roomHeight + 0.5, 0);
            const depth = calculateDepth(roomHeight + 0.5, 0);
            const wall = this.add.sprite(screenPos.x, screenPos.y, 'cave-wall-barrier');
            wall.setDepth(depth + 100);
        }

        // Add corners for visual interest
        const corners = [
            { x: -0.5, y: -0.5 }, // Top-left
            { x: roomWidth + 0.5, y: -0.5 }, // Top-right
            { x: -0.5, y: roomHeight + 0.5 }, // Bottom-left
            { x: roomWidth + 0.5, y: roomHeight + 0.5 } // Bottom-right
        ];

        corners.forEach(corner => {
            const screenPos = worldToScreen(corner.x, corner.y, 0);
            const depth = calculateDepth(corner.y, 0);
            const wall = this.add.sprite(screenPos.x, screenPos.y, 'cave-wall-corner-prop');
            wall.setDepth(depth + 100);
        });

        console.log('✅ Cave walls built');
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
     * Add atmospheric lighting
     */
    addLighting() {
        // Add warm orange/yellow color overlay for cave atmosphere
        // This creates a cozy, torch-lit ambiance
        const overlay = this.add.rectangle(
            0, 0,
            this.cameras.main.width * 2,
            this.cameras.main.height * 2,
            0xff9944, // Warm orange
            0.08 // Very subtle (8% opacity)
        );
        overlay.setOrigin(0, 0);
        overlay.setScrollFactor(0); // Fixed to camera
        overlay.setDepth(10000); // On top of everything

        console.log('💡 Atmospheric lighting added');
    }
}
