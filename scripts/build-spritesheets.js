#!/usr/bin/env node

/**
 * SpriteCook animated WebP -> combined entity atlas converter.
 *
 * Reads `assets/spritecook/manifest.json`, finds every animated `.webp`,
 * reconstructs full-size frames from the WebP delta-frame data, and packs
 * the results into one atlas per entity:
 *
 *   assets/generated/spritecook/entities/<entity>.png
 *   assets/generated/spritecook/entities/<entity>.json
 *   assets/generated/spritecook/entities/<entity>-animations.json
 *   assets/generated/spritecook/manifest.json
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

import texturePacker from 'free-tex-packer-core';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const SPRITECOOK_DIR = path.join(PROJECT_ROOT, 'assets', 'spritecook');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'assets', 'generated', 'spritecook');
const ENTITY_OUTPUT_DIR = path.join(OUTPUT_DIR, 'entities');
const TEMP_DIR_PREFIX = path.join(os.tmpdir(), 'cave-bar-hunter-spritecook-');
const spriteCookManifest = JSON.parse(
    fs.readFileSync(path.join(SPRITECOOK_DIR, 'manifest.json'), 'utf8'),
);
const METADATA_KEYS = new Set([
    'asset_id',
    'edge_margin',
    'file',
    'fps',
    'frames',
    'label',
    'layer',
    'loop',
    'note',
    'scroll',
    'sha12',
    'size',
]);

function assertToolAvailable(toolName) {
    const result = spawnSync(toolName, ['-version'], { encoding: 'utf8' });
    if (result.error && result.error.code === 'ENOENT') {
        throw new Error(`Required tool '${toolName}' is not installed or not on PATH.`);
    }
}

function ensureDirectory(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function resetDirectory(dirPath) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    fs.mkdirSync(dirPath, { recursive: true });
}

function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function walkAnimatedSpriteCookAssets(node = spriteCookManifest, pathParts = [], results = []) {
    if (!isRecord(node)) {
        return results;
    }

    if (typeof node.file === 'string' && node.file.endsWith('.webp')) {
        results.push({
            path: [...pathParts],
            file: node.file,
            metadata: node,
        });
    }

    for (const [key, value] of Object.entries(node)) {
        if (METADATA_KEYS.has(key)) {
            continue;
        }

        if (isRecord(value)) {
            walkAnimatedSpriteCookAssets(value, [...pathParts, key], results);
        }
    }

    return results;
}

function parseAnimatedWebPInfo(sourceFile) {
    const output = execFileSync('webpmux', ['-info', sourceFile], {
        encoding: 'utf8',
        cwd: PROJECT_ROOT,
    });

    const canvasMatch = output.match(/Canvas size:\s*(\d+)\s*x\s*(\d+)/);
    const loopMatch = output.match(/Loop Count\s*:\s*(\d+)/);
    if (!canvasMatch || !loopMatch) {
        throw new Error(`Unable to parse animated WebP metadata for ${sourceFile}`);
    }

    const frames = [];
    for (const line of output.split('\n')) {
        const trimmed = line.trim();
        const frameMatch = trimmed.match(
            /^(\d+):\s+(\d+)\s+(\d+)\s+\w+\s+(\d+)\s+(\d+)\s+(\d+)\s+(\w+)\s+(\w+)/,
        );

        if (!frameMatch) {
            continue;
        }

        frames.push({
            index: Number(frameMatch[1]),
            width: Number(frameMatch[2]),
            height: Number(frameMatch[3]),
            x: Number(frameMatch[4]),
            y: Number(frameMatch[5]),
            duration: Number(frameMatch[6]),
            dispose: frameMatch[7],
            blend: frameMatch[8],
        });
    }

    return {
        canvasWidth: Number(canvasMatch[1]),
        canvasHeight: Number(canvasMatch[2]),
        loopCount: Number(loopMatch[1]),
        frames,
    };
}

function alphaBlendChannel(source, destination, alpha) {
    return Math.round((source * alpha) + (destination * (1 - alpha)));
}

function copyFramePixels(canvas, canvasWidth, framePixels, frameInfo) {
    for (let y = 0; y < frameInfo.height; y += 1) {
        for (let x = 0; x < frameInfo.width; x += 1) {
            const frameOffset = ((y * frameInfo.width) + x) * 4;
            const canvasOffset = (((frameInfo.y + y) * canvasWidth) + (frameInfo.x + x)) * 4;
            const sourceAlpha = framePixels[frameOffset + 3] / 255;

            if (frameInfo.blend === 'yes' && sourceAlpha < 1) {
                canvas[canvasOffset] = alphaBlendChannel(framePixels[frameOffset], canvas[canvasOffset], sourceAlpha);
                canvas[canvasOffset + 1] = alphaBlendChannel(framePixels[frameOffset + 1], canvas[canvasOffset + 1], sourceAlpha);
                canvas[canvasOffset + 2] = alphaBlendChannel(framePixels[frameOffset + 2], canvas[canvasOffset + 2], sourceAlpha);
                canvas[canvasOffset + 3] = Math.round((sourceAlpha + ((canvas[canvasOffset + 3] / 255) * (1 - sourceAlpha))) * 255);
                continue;
            }

            canvas[canvasOffset] = framePixels[frameOffset];
            canvas[canvasOffset + 1] = framePixels[frameOffset + 1];
            canvas[canvasOffset + 2] = framePixels[frameOffset + 2];
            canvas[canvasOffset + 3] = framePixels[frameOffset + 3];
        }
    }
}

function clearFrameRegion(canvas, canvasWidth, frameInfo) {
    for (let y = 0; y < frameInfo.height; y += 1) {
        for (let x = 0; x < frameInfo.width; x += 1) {
            const canvasOffset = (((frameInfo.y + y) * canvasWidth) + (frameInfo.x + x)) * 4;
            canvas[canvasOffset] = 0;
            canvas[canvasOffset + 1] = 0;
            canvas[canvasOffset + 2] = 0;
            canvas[canvasOffset + 3] = 0;
        }
    }
}

async function reconstructFullFrames(sourceFile, animatedInfo, tempDir) {
    const canvasPixels = new Uint8ClampedArray(animatedInfo.canvasWidth * animatedInfo.canvasHeight * 4);
    const outputs = [];

    for (const frame of animatedInfo.frames) {
        const extractedFramePath = path.join(tempDir, `frame-${frame.index}.webp`);
        execFileSync('webpmux', ['-get', 'frame', String(frame.index), sourceFile, '-o', extractedFramePath], {
            cwd: PROJECT_ROOT,
            stdio: 'ignore',
        });

        const decoded = await sharp(extractedFramePath)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        copyFramePixels(canvasPixels, animatedInfo.canvasWidth, decoded.data, frame);

        const fullFrame = await sharp(Buffer.from(canvasPixels), {
            raw: {
                width: animatedInfo.canvasWidth,
                height: animatedInfo.canvasHeight,
                channels: 4,
            },
        })
            .png()
            .toBuffer();

        outputs.push({
            buffer: fullFrame,
            duration: frame.duration,
        });

        if (frame.dispose === 'background') {
            clearFrameRegion(canvasPixels, animatedInfo.canvasWidth, frame);
        }
    }

    return outputs;
}

function inferEntityName(pathParts) {
    if (pathParts[0] !== 'players') {
        return pathParts[0];
    }

    if (pathParts[1] === 'enemies') {
        return pathParts[2];
    }

    if (pathParts[1] === 'cavebar' && pathParts[2] === 'bartender') {
        return 'bartender';
    }

    return pathParts[1];
}

function inferAnimationName(pathParts) {
    if (pathParts[0] === 'players' && pathParts[1] === 'enemies') {
        return pathParts.slice(3).join('.');
    }

    if (pathParts[0] === 'players' && pathParts[1] === 'cavebar') {
        return pathParts.slice(3).join('.');
    }

    return pathParts.slice(2).join('.');
}

function makeAnimationMetadata(asset, animatedInfo, metadataNode) {
    const durations = animatedInfo.frames.map((frame) => frame.duration);
    const uniformDuration = durations.every((duration) => duration === durations[0]) ? durations[0] : null;
    const manifestFps = typeof metadataNode.fps === 'number' ? metadataNode.fps : null;
    const inferredFps = uniformDuration ? Number((1000 / uniformDuration).toFixed(3)) : null;
    const loop = typeof metadataNode.loop === 'boolean'
        ? metadataNode.loop
        : animatedInfo.loopCount === 0;

    return {
        key: asset.path.join('.'),
        sourceFile: asset.file,
        frameWidth: animatedInfo.canvasWidth,
        frameHeight: animatedInfo.canvasHeight,
        frameCount: animatedInfo.frames.length,
        frameRate: manifestFps ?? inferredFps,
        durations,
        repeat: loop ? -1 : 0,
        loop,
        loopCount: animatedInfo.loopCount,
    };
}

async function decodeAnimatedWebP(asset) {
    const sourceFile = path.join(SPRITECOOK_DIR, asset.file);
    const tempDir = fs.mkdtempSync(TEMP_DIR_PREFIX);

    try {
        if (!fs.existsSync(sourceFile)) {
            return { skipped: true, reason: 'missing-source-file' };
        }

        let animatedInfo;
        try {
            animatedInfo = parseAnimatedWebPInfo(sourceFile);
        } catch {
            return { skipped: true, reason: 'invalid-animated-webp' };
        }

        if (animatedInfo.frames.length <= 1) {
            return { skipped: true, reason: 'single-frame-webp' };
        }

        return {
            entity: inferEntityName(asset.path),
            animation: inferAnimationName(asset.path),
            metadata: makeAnimationMetadata(asset, animatedInfo, asset.metadata),
            frames: await reconstructFullFrames(sourceFile, animatedInfo, tempDir),
        };
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

async function packEntityAtlas(entityName, animationEntries) {
    const images = [];
    const animations = {};

    for (const entry of animationEntries) {
        const frameNames = [];

        entry.frames.forEach((frame, index) => {
            const frameName = `${entry.animation}__${index}`;
            images.push({
                path: frameName,
                name: frameName,
                contents: frame.buffer,
            });
            frameNames.push(frameName);
        });

        animations[entry.animation] = {
            ...entry.metadata,
            frames: frameNames,
        };
    }

    const packedFiles = await new Promise((resolve, reject) => {
        texturePacker(images, {
            textureName: entityName,
            width: 8192,
            height: 8192,
            fixedSize: false,
            padding: 2,
            allowRotation: false,
            detectIdentical: false,
            allowTrim: false,
            exporter: 'JsonHash',
            removeFileExtension: false,
        }, (files, error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(files);
        });
    });

    const pngFile = packedFiles.find((file) => file.name.endsWith('.png'));
    const jsonFile = packedFiles.find((file) => file.name.endsWith('.json'));
    if (!pngFile || !jsonFile) {
        throw new Error(`Texture packer did not return atlas files for ${entityName}`);
    }

    ensureDirectory(ENTITY_OUTPUT_DIR);
    fs.writeFileSync(path.join(ENTITY_OUTPUT_DIR, `${entityName}.png`), pngFile.buffer);
    fs.writeFileSync(path.join(ENTITY_OUTPUT_DIR, `${entityName}.json`), jsonFile.buffer);
    fs.writeFileSync(
        path.join(ENTITY_OUTPUT_DIR, `${entityName}-animations.json`),
        `${JSON.stringify(animations, null, 2)}\n`,
    );

    return {
        image: `entities/${entityName}.png`,
        atlas: `entities/${entityName}.json`,
        animations: `entities/${entityName}-animations.json`,
        animationCount: animationEntries.length,
    };
}

async function main() {
    console.log('🎞️  SpriteCook animated WebP -> combined entity atlas converter\n');

    assertToolAvailable('webpmux');
    resetDirectory(OUTPUT_DIR);

    const assets = walkAnimatedSpriteCookAssets();
    const decodedByEntity = new Map();
    const skipped = [];

    console.log(`Found ${assets.length} animated SpriteCook assets.\n`);

    for (const asset of assets) {
        console.log(`Decoding ${asset.file}...`);
        const decoded = await decodeAnimatedWebP(asset);
        if (!decoded || decoded.skipped) {
            const reason = decoded?.reason ?? 'unsupported-animation';
            console.log(`  Skipped (${reason}).`);
            skipped.push({ file: asset.file, reason });
            continue;
        }

        if (!decodedByEntity.has(decoded.entity)) {
            decodedByEntity.set(decoded.entity, []);
        }
        decodedByEntity.get(decoded.entity).push(decoded);
        console.log(`  Collected ${decoded.animation} for ${decoded.entity}.`);
    }

    const manifest = { entities: {}, skipped };
    for (const [entityName, animationEntries] of decodedByEntity.entries()) {
        console.log(`Packing ${entityName} atlas (${animationEntries.length} animations)...`);
        manifest.entities[entityName] = await packEntityAtlas(entityName, animationEntries);
    }

    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'manifest.json'),
        `${JSON.stringify(manifest, null, 2)}\n`,
    );

    console.log(`\n✨ Done. Output written to ${OUTPUT_DIR}`);
}

main().catch((error) => {
    console.error('\n❌ SpriteCook conversion failed:');
    console.error(error);
    process.exit(1);
});
