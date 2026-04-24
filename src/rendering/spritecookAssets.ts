/// <reference types="vite/client" />

import Phaser from 'phaser';

import generatedSpriteCookManifestJson from '../../assets/generated/spritecook/manifest.json';
import rawSpriteCookManifest from '../../assets/spritecook/manifest.json';

const RAW_SPRITECOOK_STATIC_URLS = import.meta.glob('/assets/spritecook/**/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>;

const GENERATED_SPRITECOOK_IMAGE_URLS = import.meta.glob('/assets/generated/spritecook/entities/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>;

const GENERATED_SPRITECOOK_ATLAS_DATA = import.meta.glob('/assets/generated/spritecook/entities/*.json', {
    eager: true,
    import: 'default',
}) as Record<string, unknown>;

const GENERATED_SPRITECOOK_ANIMATION_DATA = import.meta.glob('/assets/generated/spritecook/entities/*-animations.json', {
    eager: true,
    import: 'default',
}) as Record<string, unknown>;

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

export interface SpriteCookAssetEntry {
    key: string;
    file: string;
    path: string[];
}

interface GeneratedSpriteCookManifestEntry {
    image: string;
    atlas: string;
    animations: string;
    animationCount: number;
}

interface GeneratedSpriteCookManifest {
    entities: Record<string, GeneratedSpriteCookManifestEntry>;
    skipped: Array<{ file: string; reason: string }>;
}

export interface GeneratedSpriteCookAnimationEntry {
    key: string;
    sourceFile: string;
    edgeMargin: number;
    frameWidth: number;
    frameHeight: number;
    sourceFrameWidth: number;
    sourceFrameHeight: number;
    contentWidth: number;
    contentHeight: number;
    sourceContentWidth: number;
    sourceContentHeight: number;
    frameCount: number;
    frameRate: number | null;
    durations: number[];
    repeat: number;
    loop: boolean;
    loopCount: number;
    normalizedTargetContentHeight?: number;
    normalizationReferenceEdgeMargin?: number;
    frames: string[];
}

export interface GeneratedSpriteCookEntityEntry {
    entity: string;
    atlasKey: string;
    imageUrl: string;
    atlasData: Record<string, unknown>;
    animations: Record<string, GeneratedSpriteCookAnimationEntry>;
    animationCount: number;
}

export const spriteCookCatalog = rawSpriteCookManifest;
export const generatedSpriteCookCatalog = generatedSpriteCookManifestJson as GeneratedSpriteCookManifest;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function spriteCookAssetKey(path: readonly string[]): string {
    return `spritecook.${path.join('.')}`;
}

export function spriteCookEntityAtlasKey(entity: string): string {
    return `spritecook.entity.${entity}`;
}

export function spriteCookAnimationKey(entity: string, animation: string): string {
    return `spritecook.anim.${entity}.${animation}`;
}

export function spriteCookAssetUrl(file: string): string {
    const resolvedUrl = RAW_SPRITECOOK_STATIC_URLS[`/assets/spritecook/${file}`];

    if (!resolvedUrl) {
        throw new Error(`Missing SpriteCook asset URL for ${file}`);
    }

    return resolvedUrl;
}

export function hasSpriteCookAssetUrl(file: string): boolean {
    return Boolean(RAW_SPRITECOOK_STATIC_URLS[`/assets/spritecook/${file}`]);
}

function listRawSpriteCookStaticAssets(node: unknown = spriteCookCatalog, path: string[] = []): SpriteCookAssetEntry[] {
    if (!isRecord(node)) {
        return [];
    }

    const assets: SpriteCookAssetEntry[] = [];

    if (typeof node.file === 'string' && node.file.endsWith('.png') && hasSpriteCookAssetUrl(node.file)) {
        assets.push({
            key: spriteCookAssetKey(path),
            file: node.file,
            path: [...path],
        });
    }

    for (const [childKey, childValue] of Object.entries(node)) {
        if (METADATA_KEYS.has(childKey)) {
            continue;
        }

        if (isRecord(childValue)) {
            assets.push(...listRawSpriteCookStaticAssets(childValue, [...path, childKey]));
        }
    }

    return assets;
}

export function listSpriteCookStaticAssets(): SpriteCookAssetEntry[] {
    return listRawSpriteCookStaticAssets();
}

export function listSpriteCookAssets(): SpriteCookAssetEntry[] {
    return listSpriteCookStaticAssets();
}

export function listGeneratedSpriteCookEntities(): GeneratedSpriteCookEntityEntry[] {
    const entries: GeneratedSpriteCookEntityEntry[] = [];

    for (const [entity, manifestEntry] of Object.entries(generatedSpriteCookCatalog.entities)) {
        const imageUrl = GENERATED_SPRITECOOK_IMAGE_URLS[`/assets/generated/spritecook/${manifestEntry.image}`];
        const atlasData = GENERATED_SPRITECOOK_ATLAS_DATA[`/assets/generated/spritecook/${manifestEntry.atlas}`];
        const animationData = GENERATED_SPRITECOOK_ANIMATION_DATA[`/assets/generated/spritecook/${manifestEntry.animations}`];

        if (!imageUrl || !isRecord(atlasData) || !isRecord(animationData)) {
            continue;
        }

        entries.push({
            entity,
            atlasKey: spriteCookEntityAtlasKey(entity),
            imageUrl,
            atlasData,
            animations: animationData as Record<string, GeneratedSpriteCookAnimationEntry>,
            animationCount: manifestEntry.animationCount,
        });
    }

    return entries;
}

export function listGeneratedSpriteCookSkips(): Array<{ file: string; reason: string }> {
    return generatedSpriteCookCatalog.skipped;
}

export function getGeneratedSpriteCookEntity(entity: string): GeneratedSpriteCookEntityEntry | null {
    return listGeneratedSpriteCookEntities().find((entry) => entry.entity === entity) ?? null;
}

export function getGeneratedSpriteCookAnimation(
    entity: string,
    animation: string,
    fallbacks: string[] = ['idle'],
): { entity: GeneratedSpriteCookEntityEntry; animation: string; data: GeneratedSpriteCookAnimationEntry; key: string } | null {
    const entry = getGeneratedSpriteCookEntity(entity);
    if (!entry) {
        return null;
    }

    const animationCandidates = [animation, ...fallbacks, ...Object.keys(entry.animations)];
    for (const candidate of animationCandidates) {
        const data = entry.animations[candidate];
        if (!data) {
            continue;
        }

        return {
            entity: entry,
            animation: candidate,
            data,
            key: spriteCookAnimationKey(entity, candidate),
        };
    }

    return null;
}

export function ensureGeneratedSpriteCookAnimations(animationManager: Phaser.Animations.AnimationManager): void {
    for (const entity of listGeneratedSpriteCookEntities()) {
        for (const [animationName, animationData] of Object.entries(entity.animations)) {
            const key = spriteCookAnimationKey(entity.entity, animationName);
            if (animationManager.exists(key)) {
                continue;
            }

            animationManager.create({
                key,
                frames: animationData.frames.map((frameName, index) => ({
                    key: entity.atlasKey,
                    frame: frameName,
                    duration: animationData.durations[index],
                })),
                frameRate: animationData.frameRate ?? undefined,
                repeat: animationData.repeat,
            });
        }
    }
}
