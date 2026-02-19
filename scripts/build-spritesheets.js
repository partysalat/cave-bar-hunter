#!/usr/bin/env node

/**
 * Sprite Sheet Generator - Sidescroller Edition
 *
 * Packs side-view animation frames into Phaser atlas files.
 * Players face right ("east" direction); left-facing is handled by sprite.setFlipX().
 *
 * Frame naming convention: {entity}-{animKey}-{frameNum}
 *   e.g. player-0-run-3, compy-walk-2
 *
 * Source directories:
 *   assets/characters/{color}-hero/animations/{anim}/east/frame_000.png
 *   assets/enemies/compy-side/animations/{anim}/east/frame_000.png
 *
 * Output:
 *   assets/generated/spritesheets/{color}-hero.png
 *   assets/generated/spritesheets/{color}-hero.json
 *   assets/generated/spritesheets/compy.png
 *   assets/generated/spritesheets/compy.json
 *   assets/generated/spritesheets/bartender.png  (8-dir, unchanged)
 *   assets/generated/spritesheets/bartender.json
 *
 * Usage:
 *   node scripts/build-spritesheets.js
 *   npm run build:spritesheets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import texturePacker from 'free-tex-packer-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const CHARACTERS_DIR = path.join(ASSETS_DIR, 'characters');
const DINOS_DIR = path.join(ASSETS_DIR, 'dinos');
const OUTPUT_DIR = path.join(ASSETS_DIR, 'generated', 'spritesheets');

const PLAYER_COLORS = ['red', 'blue', 'yellow', 'green'];

// Sidescroller player animations — folder names match game keys after rename.
// Only the "east" direction is used — left-facing handled by sprite.setFlipX().
const PLAYER_ANIMATIONS = {
    'idle':         { key: 'idle' },
    'run':          { key: 'run' },
    'jump':         { key: 'jump', alsoKey: 'fall' }, // fall reuses jump frames
    'attack':       { key: 'attack' },
    'dodge':        { key: 'dodge' },
    'downed':       { key: 'downed' },
    'get-up':       { key: 'get-up' },
    'idle-club':    { key: 'idle-club' },
    'run-club':     { key: 'run-club' },
    'jump-club':    { key: 'jump-club' },
    'attack-club':  { key: 'attack-club' },
    'idle-spear':   { key: 'idle-spear' },
    'run-spear':    { key: 'run-spear' },
    'jump-spear':   { key: 'jump-spear' },
    'attack-spear': { key: 'attack-spear' },
    'idle-bow':     { key: 'idle-bow' },
    'run-bow':      { key: 'run-bow' },
    'jump-bow':     { key: 'jump-bow' },
    'attack-bow':   { key: 'attack-bow' },
    'idle-net':     { key: 'idle-net' },
    'run-net':      { key: 'run-net' },
    'jump-net':     { key: 'jump-net' },
    'attack-net':   { key: 'attack-net' },
};

// Compy animations (quadruped cat template)
const COMPY_ANIMATIONS = {
    'walk':   { key: 'walk' },
    'run':    { key: 'run' },
    'idle':   { key: 'idle' },
    'attack': { key: 'attack' },
    'downed': { key: 'downed' },
};

// Bartender uses 8-direction top-down (unchanged from original)
const BARTENDER_DIRECTIONS = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
const BARTENDER_ANIMATIONS = {
    'custom-idle':        { key: 'idle' },
    'custom-serving':     { key: 'serving' },
    'custom-victory':     { key: 'victory' },
    'custom-disapproval': { key: 'disapproval' },
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
 * Collect frames from a single direction folder.
 * Returns array of { name, contents } objects for the texture packer.
 *
 * @param {string} dirPath - Path to direction folder (e.g. .../running-8-frames/east)
 * @param {string} framePrefix - e.g. "player-0-run"
 * @param {string} [altPrefix] - Optional second prefix for same frames (e.g. "player-0-fall")
 */
function collectFrames(dirPath, framePrefix, altPrefix) {
    if (!fs.existsSync(dirPath)) return [];

    const frameFiles = fs.readdirSync(dirPath)
        .filter(f => f.endsWith('.png'))
        .sort();

    const images = [];
    frameFiles.forEach((file, i) => {
        const buffer = fs.readFileSync(path.join(dirPath, file));
        images.push({ path: `${framePrefix}-${i}`, name: `${framePrefix}-${i}`, contents: buffer });
        if (altPrefix) {
            images.push({ path: `${altPrefix}-${i}`, name: `${altPrefix}-${i}`, contents: buffer });
        }
    });

    return images;
}

/**
 * Pack images into a sprite sheet and write PNG + JSON.
 */
async function packSpriteSheet(images, textureName, outputName) {
    if (images.length === 0) {
        console.warn(`  ⚠️  No frames collected for ${outputName}, skipping`);
        return;
    }

    console.log(`  Packing ${images.length} frames into ${outputName}...`);

    return new Promise((resolve, reject) => {
        texturePacker(images, {
            textureName: outputName,
            width: 4096,
            height: 4096,
            fixedSize: false,
            padding: 2,
            allowRotation: false,
            detectIdentical: false,  // Don't deduplicate: fall/jump share frames intentionally
            allowTrim: true,
            exporter: 'JsonHash',
            removeFileExtension: false,
        }, (files, error) => {
            if (error) {
                console.error(`  ❌ Error packing ${outputName}:`, error);
                reject(error);
                return;
            }

            const pngFile = files.find(f => f.name.endsWith('.png'));
            const jsonFile = files.find(f => f.name.endsWith('.json'));

            if (pngFile) {
                fs.writeFileSync(path.join(OUTPUT_DIR, `${outputName}.png`), pngFile.buffer);
                console.log(`  ✅ ${outputName}.png`);
            }
            if (jsonFile) {
                fs.writeFileSync(path.join(OUTPUT_DIR, `${outputName}.json`), jsonFile.buffer);
                console.log(`  ✅ ${outputName}.json`);
            }

            resolve();
        });
    });
}

/**
 * Build sprite sheet for a single player color.
 * Uses only the "east" direction (right-facing).
 */
async function buildPlayerSpriteSheet(color, playerIndex) {
    console.log(`\nBuilding ${color} hero (player ${playerIndex})...`);

    const animationsDir = path.join(CHARACTERS_DIR, `${color}-hero`, 'animations');
    if (!fs.existsSync(animationsDir)) {
        console.warn(`  ⚠️  ${color}-hero/animations not found`);
        return;
    }

    const images = [];

    for (const [folder, config] of Object.entries(PLAYER_ANIMATIONS)) {
        const eastDir = path.join(animationsDir, folder, 'east');
        const prefix = `player-${playerIndex}-${config.key}`;
        const altPrefix = config.alsoKey ? `player-${playerIndex}-${config.alsoKey}` : undefined;
        const frames = collectFrames(eastDir, prefix, altPrefix);
        if (frames.length > 0) {
            console.log(`  ${config.key}: ${frames.length / (altPrefix ? 2 : 1)} frames`);
        }
        images.push(...frames);
    }

    await packSpriteSheet(images, `${color}-hero`, `${color}-hero`);
}

/**
 * Build sprite sheet for the Compy enemy.
 * Uses "east" direction (right-facing), named compy-{anim}-{frame}.
 */
async function buildCompySpriteSheet() {
    console.log(`\nBuilding compy...`);

    const animationsDir = path.join(DINOS_DIR, 'compy', 'animations');
    if (!fs.existsSync(animationsDir)) {
        console.warn(`  ⚠️  dinos/compy/animations not found`);
        return;
    }

    const images = [];

    for (const [folder, config] of Object.entries(COMPY_ANIMATIONS)) {
        const eastDir = path.join(animationsDir, folder, 'east');
        const frames = collectFrames(eastDir, `compy-${config.key}`);
        if (frames.length > 0) {
            console.log(`  ${config.key}: ${frames.length} frames`);
        }
        images.push(...frames);
    }

    await packSpriteSheet(images, 'compy', 'compy');
}

/**
 * Build sprite sheet for the bartender NPC.
 * Still uses 8-direction top-down (unchanged from Phase 2).
 */
async function buildBartenderSpriteSheet() {
    console.log(`\nBuilding bartender...`);

    const animationsDir = path.join(CHARACTERS_DIR, 'bartender', 'animations');
    if (!fs.existsSync(animationsDir)) {
        console.warn(`  ⚠️  bartender/animations not found`);
        return;
    }

    const images = [];

    for (const [folder, config] of Object.entries(BARTENDER_ANIMATIONS)) {
        for (const dir of BARTENDER_DIRECTIONS) {
            const dirPath = path.join(animationsDir, folder, dir);
            if (!fs.existsSync(dirPath)) continue;

            const frameFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.png')).sort();
            frameFiles.forEach((file, i) => {
                const name = `bartender-${config.key}-${dir}-${i}`;
                images.push({ path: name, name, contents: fs.readFileSync(path.join(dirPath, file)) });
            });
        }
    }

    await packSpriteSheet(images, 'bartender', 'bartender');
}

/**
 * Main build process
 */
async function main() {
    console.log('🎨 Prehistoric Hunter - Sprite Sheet Builder (Sidescroller)\n');
    console.log('============================================================\n');

    ensureOutputDir();

    for (let i = 0; i < PLAYER_COLORS.length; i++) {
        await buildPlayerSpriteSheet(PLAYER_COLORS[i], i);
    }

    await buildCompySpriteSheet();
    await buildBartenderSpriteSheet();

    console.log('\n✨ Done!\n');
    console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(error => {
    console.error('❌ Build failed:', error);
    process.exit(1);
});
