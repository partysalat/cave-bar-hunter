import type { Position } from '../core/types.js';
import { CELL_CENTERS } from './arenaLayout.js';

export interface ScreenPosition {
    x: number;
    y: number;
}

export function positionToScreen(position: Position, width: number, height: number): ScreenPosition {
    return {
        x: CELL_CENTERS.zone[position.zone] * width,
        y: CELL_CENTERS.flank[position.flank] * height,
    };
}
