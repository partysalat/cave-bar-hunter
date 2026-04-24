/// <reference types="vite/client" />

import spriteCookManifest from '../../assets/spritecook/manifest.json';

const SPRITECOOK_URLS = import.meta.glob('/assets/spritecook/**/*.{png,webp}', {
    eager: true,
    import: 'default',
}) as Record<string, string>;

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

export const spriteCookCatalog = spriteCookManifest;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function spriteCookAssetKey(path: readonly string[]): string {
    return `spritecook.${path.join('.')}`;
}

export function spriteCookAssetUrl(file: string): string {
    const resolvedUrl = SPRITECOOK_URLS[`/assets/spritecook/${file}`];

    if (!resolvedUrl) {
        throw new Error(`Missing SpriteCook asset URL for ${file}`);
    }

    return resolvedUrl;
}

export function hasSpriteCookAssetUrl(file: string): boolean {
    return Boolean(SPRITECOOK_URLS[`/assets/spritecook/${file}`]);
}

export function listSpriteCookAssets(node: unknown = spriteCookCatalog, path: string[] = []): SpriteCookAssetEntry[] {
    if (!isRecord(node)) {
        return [];
    }

    const assets: SpriteCookAssetEntry[] = [];

    if (typeof node.file === 'string') {
        if (hasSpriteCookAssetUrl(node.file)) {
            assets.push({
                key: spriteCookAssetKey(path),
                file: node.file,
                path: [...path],
            });
        }
    }

    for (const [childKey, childValue] of Object.entries(node)) {
        if (METADATA_KEYS.has(childKey)) {
            continue;
        }

        if (isRecord(childValue)) {
            assets.push(...listSpriteCookAssets(childValue, [...path, childKey]));
        }
    }

    return assets;
}
