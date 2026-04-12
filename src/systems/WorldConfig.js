export const SCREEN_WIDTH = 1280;
export const SCREEN_HEIGHT = 720;
export const PIXELS_PER_UNIT = 48;
export const FLOOR_Y = SCREEN_HEIGHT - 96;

export const ARENA = {
    width: 48,
    height: 12,
};

export const PLAYER_COLORS = [
    0xd94b4b,
    0x4b74d9,
    0xd9b84b,
    0x4bbf73,
];

export function worldToScreen(worldX, worldY) {
    return {
        x: worldX * PIXELS_PER_UNIT,
        y: FLOOR_Y - worldY * PIXELS_PER_UNIT,
    };
}
