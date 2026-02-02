#!/usr/bin/env node

/**
 * Sprite Sheet Generator
 *
 * Packs individual animation frames into optimized sprite sheets with JSON atlases.
 * Reduces hundreds of HTTP requests down to a few sprite sheets for better performance.
 *
 * Usage:
 *   node scripts/build-spritesheets.js
 *   npm run build:spritesheets
 *
 * Output:
 *   assets/generated/spritesheets/{color}-hero.png
 *   assets/generated/spritesheets/{color}-hero.json
 *   assets/generated/spritesheets/bartender.png
 *   assets/generated/spritesheets/bartender.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import texturePacker from 'free-tex-packer-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const CHARACTERS_DIR = path.join(ASSETS_DIR, 'characters');
const OUTPUT_DIR = path.join(ASSETS_DIR, 'generated', 'spritesheets');

const PLAYER_COLORS = ['red', 'blue', 'yellow', 'green'];

// Directions for all animations
const DIRECTIONS = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];

// Player animation configurations
// Maps animation folder name to a consistent key name used in the game
const ANIMATIONS = {
    'breathing-idle': { key: 'idle', frames: 4 },
    'running-8-frames': { key: 'run', frames: 8 },
    'fight-stance-idle': { key: 'fight-stance', frames: 8 },
    'custom-swing-a-club': { key: 'club-swing', frames: 16 },
    'custom-throw-a-spear': { key: 'spear-throw', frames: null }, // Will auto-detect
    'custom-throw-a-slingshot': { key: 'slingshot-throw', frames: null },
    'custom-dodge-roll': { key: 'dodge-roll', frames: null },
    'custom-victory': { key: 'victory', frames: null },
    'getting-up': { key: 'get-up', frames: null },
    'taking-punch': { key: 'take-punch', frames: null },
    'picking-up': { key: 'pick-up', frames: null },
    'throw-object': { key: 'throw-object', frames: null },
    'cross-punch': { key: 'cross-punch', frames: null },
    'jumping-1': { key: 'jump', frames: null }
};

// Bartender-specific animation configurations
const BARTENDER_ANIMATIONS = {
    'custom-idle': { key: 'idle', frames: null },
    'custom-serving': { key: 'serving', frames: null },
    'custom-victory': { key: 'victory', frames: null },
    'custom-disapproval': { key: 'disapproval', frames: null }
};

/**
 * Ensure output directory exists
 */
function ensureOutputDir() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`Created output directory: ${OUTPUT_DIR}`);
    }
}

/**
 * Get all PNG files from a directory recursively
 */
function getFramesFromDir(dir) {
    const frames = [];

    if (!fs.existsSync(dir)) {
        return frames;
    }

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            frames.push(...getFramesFromDir(fullPath));
        } else if (file.endsWith('.png')) {
            frames.push(fullPath);
        }
    }

    return frames;
}

/**
 * Build sprite sheet for a single character
 */
async function buildCharacterSpriteSheet(color, playerIndex) {
    console.log(`\nBuilding sprite sheet for ${color} hero (player ${playerIndex})...`);

    const characterDir = path.join(CHARACTERS_DIR, `${color}-hero`);
    const animationsDir = path.join(characterDir, 'animations');

    if (!fs.existsSync(animationsDir)) {
        console.warn(`  ⚠️  No animations directory found for ${color} hero`);
        return;
    }

    // Collect all frames with metadata
    const images = [];
    let totalFrames = 0;

    // Iterate through each animation type
    for (const [folderName, config] of Object.entries(ANIMATIONS)) {
        const animDir = path.join(animationsDir, folderName);

        if (!fs.existsSync(animDir)) {
            continue; // Skip if animation doesn't exist
        }

        console.log(`  Processing animation: ${config.key}`);

        // Iterate through each direction
        for (const direction of DIRECTIONS) {
            const dirPath = path.join(animDir, direction);

            if (!fs.existsSync(dirPath)) {
                continue;
            }

            // Get all frames for this direction
            const frameFiles = fs.readdirSync(dirPath)
                .filter(f => f.endsWith('.png'))
                .sort(); // Ensure consistent ordering

            frameFiles.forEach((frameFile, frameIndex) => {
                const framePath = path.join(dirPath, frameFile);
                const buffer = fs.readFileSync(framePath);

                // Frame name format: player-{index}-{animKey}-{direction}-{frameNum}
                // This matches the existing pattern in TestScene.js
                const frameName = `player-${playerIndex}-${config.key}-${direction}-${frameIndex}`;

                images.push({
                    path: frameName,
                    name: frameName,
                    contents: buffer
                });

                totalFrames++;
            });
        }
    }

    if (images.length === 0) {
        console.warn(`  ⚠️  No frames found for ${color} hero`);
        return;
    }

    console.log(`  Total frames collected: ${totalFrames}`);
    console.log(`  Packing sprite sheet...`);

    // Pack into sprite sheet
    return new Promise((resolve, reject) => {
        texturePacker(images, {
            textureName: `${color}-hero`,
            width: 4096,
            height: 4096,
            fixedSize: false,
            padding: 2,
            allowRotation: false,
            detectIdentical: true,
            allowTrim: true,
            exporter: 'JsonHash',
            removeFileExtension: false
        }, (files, error) => {
            if (error) {
                console.error(`  ❌ Error packing ${color} hero:`, error);
                reject(error);
                return;
            }

            // Write sprite sheet PNG
            const pngFile = files.find(f => f.name.endsWith('.png'));
            if (pngFile) {
                const pngPath = path.join(OUTPUT_DIR, `${color}-hero.png`);
                fs.writeFileSync(pngPath, pngFile.buffer);
                console.log(`  ✅ Wrote sprite sheet: ${pngPath}`);
            }

            // Write JSON atlas
            const jsonFile = files.find(f => f.name.endsWith('.json'));
            if (jsonFile) {
                const jsonPath = path.join(OUTPUT_DIR, `${color}-hero.json`);
                fs.writeFileSync(jsonPath, jsonFile.buffer);
                console.log(`  ✅ Wrote atlas: ${jsonPath}`);
            }

            resolve();
        });
    });
}

/**
 * Build sprite sheet for the bartender NPC
 */
async function buildBartenderSpriteSheet() {
    console.log(`\nBuilding sprite sheet for bartender...`);

    const bartenderDir = path.join(CHARACTERS_DIR, 'bartender');
    const animationsDir = path.join(bartenderDir, 'animations');

    if (!fs.existsSync(animationsDir)) {
        console.warn(`  ⚠️  No animations directory found for bartender`);
        return;
    }

    // Collect all frames with metadata
    const images = [];
    let totalFrames = 0;

    // Iterate through each bartender animation type
    for (const [folderName, config] of Object.entries(BARTENDER_ANIMATIONS)) {
        const animDir = path.join(animationsDir, folderName);

        if (!fs.existsSync(animDir)) {
            console.warn(`  ⚠️  Animation not found: ${folderName}`);
            continue; // Skip if animation doesn't exist
        }

        console.log(`  Processing animation: ${config.key}`);

        // Iterate through each direction
        for (const direction of DIRECTIONS) {
            const dirPath = path.join(animDir, direction);

            if (!fs.existsSync(dirPath)) {
                console.warn(`    ⚠️  Direction not found: ${direction}`);
                continue;
            }

            // Get all frames for this direction
            const frameFiles = fs.readdirSync(dirPath)
                .filter(f => f.endsWith('.png'))
                .sort(); // Ensure consistent ordering

            frameFiles.forEach((frameFile, frameIndex) => {
                const framePath = path.join(dirPath, frameFile);
                const buffer = fs.readFileSync(framePath);

                // Frame name format: bartender-{animKey}-{direction}-{frameNum}
                const frameName = `bartender-${config.key}-${direction}-${frameIndex}`;

                images.push({
                    path: frameName,
                    name: frameName,
                    contents: buffer
                });

                totalFrames++;
            });
        }
    }

    if (images.length === 0) {
        console.warn(`  ⚠️  No frames found for bartender`);
        return;
    }

    console.log(`  Total frames collected: ${totalFrames}`);
    console.log(`  Packing sprite sheet...`);

    // Pack into sprite sheet
    return new Promise((resolve, reject) => {
        texturePacker(images, {
            textureName: 'bartender',
            width: 4096,
            height: 4096,
            fixedSize: false,
            padding: 2,
            allowRotation: false,
            detectIdentical: true,
            allowTrim: true,
            exporter: 'JsonHash',
            removeFileExtension: false
        }, (files, error) => {
            if (error) {
                console.error(`  ❌ Error packing bartender:`, error);
                reject(error);
                return;
            }

            // Write sprite sheet PNG
            const pngFile = files.find(f => f.name.endsWith('.png'));
            if (pngFile) {
                const pngPath = path.join(OUTPUT_DIR, 'bartender.png');
                fs.writeFileSync(pngPath, pngFile.buffer);
                console.log(`  ✅ Wrote sprite sheet: ${pngPath}`);
            }

            // Write JSON atlas
            const jsonFile = files.find(f => f.name.endsWith('.json'));
            if (jsonFile) {
                const jsonPath = path.join(OUTPUT_DIR, 'bartender.json');
                fs.writeFileSync(jsonPath, jsonFile.buffer);
                console.log(`  ✅ Wrote atlas: ${jsonPath}`);
            }

            resolve();
        });
    });
}

/**
 * Main build process
 */
async function main() {
    console.log('🎨 Prehistoric Hunter - Sprite Sheet Builder\n');
    console.log('=========================================\n');

    ensureOutputDir();

    // Build sprite sheet for each player character color
    for (let i = 0; i < PLAYER_COLORS.length; i++) {
        const color = PLAYER_COLORS[i];
        await buildCharacterSpriteSheet(color, i);
    }

    // Build sprite sheet for bartender NPC
    await buildBartenderSpriteSheet();

    console.log('\n✨ Sprite sheet generation complete!\n');
    console.log(`Output location: ${OUTPUT_DIR}`);
    console.log('\nGenerated files:');
    console.log('  - 4 player hero sprite sheets (red, blue, yellow, green)');
    console.log('  - 1 bartender sprite sheet');
    console.log('\nNext steps:');
    console.log('  1. Update scene preload() to use this.load.atlas()');
    console.log('  2. Remove individual frame loading code');
    console.log('  3. Test in game to verify animations work correctly\n');
}

// Run the build
main().catch(error => {
    console.error('❌ Build failed:', error);
    process.exit(1);
});
