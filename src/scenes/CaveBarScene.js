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
                let tileKey = 'cave-wall-base'; // Darker default floor (same as walls)

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
     */
    generateCavePerimeter(centerX, centerY, radiusX, radiusY, tileSize) {
        const points = [];
        const angleStep = Math.PI / 24; // Sample points around the ellipse

        for (let angle = 0; angle < Math.PI * 2; angle += angleStep) {
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
