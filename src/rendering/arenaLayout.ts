export const ARENA_LAYOUT = {
    gridLeft: 0.05,
    gridRight: 0.72,
    gridTop: 0.20,
    gridBottom: 0.88,
    farBoundary: 0.28,
    closeBoundary: 0.50,
    seam1Y: 0.48,
    seam2Y: 0.64,
    dinoX: 0.82,
    dinoY: 0.56,
} as const;

export const CELL_CENTERS = {
    zone: {
        far: (ARENA_LAYOUT.gridLeft + ARENA_LAYOUT.farBoundary) / 2,
        mid: (ARENA_LAYOUT.farBoundary + ARENA_LAYOUT.closeBoundary) / 2,
        close: (ARENA_LAYOUT.closeBoundary + ARENA_LAYOUT.gridRight) / 2,
    },
    flank: {
        left: (ARENA_LAYOUT.gridTop + ARENA_LAYOUT.seam1Y) / 2,
        center: (ARENA_LAYOUT.seam1Y + ARENA_LAYOUT.seam2Y) / 2,
        right: (ARENA_LAYOUT.seam2Y + ARENA_LAYOUT.gridBottom) / 2,
    },
} as const;

export const COLUMN_BOUNDS = {
    far: { left: ARENA_LAYOUT.gridLeft, right: ARENA_LAYOUT.farBoundary },
    mid: { left: ARENA_LAYOUT.farBoundary, right: ARENA_LAYOUT.closeBoundary },
    close: { left: ARENA_LAYOUT.closeBoundary, right: ARENA_LAYOUT.gridRight },
} as const;

export const ROW_BOUNDS = {
    left: { top: ARENA_LAYOUT.gridTop, bottom: ARENA_LAYOUT.seam1Y },
    center: { top: ARENA_LAYOUT.seam1Y, bottom: ARENA_LAYOUT.seam2Y },
    right: { top: ARENA_LAYOUT.seam2Y, bottom: ARENA_LAYOUT.gridBottom },
} as const;
