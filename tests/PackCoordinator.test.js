import { describe, expect, it } from 'vitest';
import PackCoordinator from '../src/ai/PackCoordinator.js';

describe('PackCoordinator', () => {
    it('returns stable slot directions for a compy group', () => {
        const coordinator = new PackCoordinator();

        expect(coordinator.getSlotDirections(4)).toEqual([-1, 1, -1, 1]);
    });
});
