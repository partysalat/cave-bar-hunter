export const SCENE_KEYS = {
    BOOT: 'BootScene',
    PRELOAD: 'PreloadScene',
    HUNT: 'HuntScene',
    CAVE_BAR: 'CaveBarScene',
} as const;

export type SceneKey = typeof SCENE_KEYS[keyof typeof SCENE_KEYS];
