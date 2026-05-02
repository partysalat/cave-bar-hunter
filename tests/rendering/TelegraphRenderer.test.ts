import { describe, expect, it } from 'vitest';

import type { AttackDeclaration } from '../../src/core/types.ts';
import { telegraphCellRects, telegraphStage1Mode } from '../../src/rendering/TelegraphRenderer.ts';

function makeDeclaration(affectedZones: AttackDeclaration['affectedZones']): AttackDeclaration {
    return {
        type: 'bite',
        affectedZones,
        qteType: 'timing',
        damage: 10,
    };
}

describe('telegraphCellRects', () => {
    const width = 1000;
    const height = 800;

    it('returns one rect per affected zone', () => {
        expect(telegraphCellRects(makeDeclaration([{ zone: 'close', flank: 'center' }]), width, height)).toHaveLength(1);
    });

    it('returns three rects for a full-row attack', () => {
        expect(
            telegraphCellRects(
                makeDeclaration([
                    { zone: 'far', flank: 'left' },
                    { zone: 'mid', flank: 'left' },
                    { zone: 'close', flank: 'left' },
                ]),
                width,
                height,
            ),
        ).toHaveLength(3);
    });

    it('uses the correct column bounds', () => {
        const [rect] = telegraphCellRects(makeDeclaration([{ zone: 'far', flank: 'center' }]), width, height);
        expect(rect.x).toBeCloseTo(width * 0.05);
        expect(rect.x + rect.w).toBeCloseTo(width * 0.28);
    });

    it('uses the correct row bounds', () => {
        const [rect] = telegraphCellRects(makeDeclaration([{ zone: 'mid', flank: 'center' }]), width, height);
        expect(rect.y).toBeCloseTo(height * 0.48);
        expect(rect.y + rect.h).toBeCloseTo(height * 0.64);
    });
});

describe('telegraphStage1Mode', () => {
    it('uses a cone for bite telegraphs', () => {
        expect(telegraphStage1Mode(makeDeclaration([{ zone: 'close', flank: 'center' }]))).toBe('cone');
    });

    it('uses a sweep for spit telegraphs', () => {
        expect(
            telegraphStage1Mode({
                type: 'spit',
                affectedZones: [
                    { zone: 'mid', flank: 'left' },
                    { zone: 'mid', flank: 'center' },
                    { zone: 'mid', flank: 'right' },
                ],
                qteType: 'timing',
                damage: 4,
            }),
        ).toBe('sweep');
    });
});
