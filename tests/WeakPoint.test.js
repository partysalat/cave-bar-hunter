import { describe, it, expect } from 'vitest';
import WeakPoint from '../src/entities/WeakPoint.js';

describe('WeakPoint', () => {
    it('initializes with type and health', () => {
        const wp = new WeakPoint('head', 50, 2.0, 0, 0, 0);
        expect(wp.type).toBe('head');
        expect(wp.health).toBe(50);
        expect(wp.damageMultiplier).toBe(2.0);
        expect(wp.isBroken).toBe(false);
    });

    it('takes damage and breaks at 0 health', () => {
        const wp = new WeakPoint('head', 50, 2.0, 0, 0, 0);

        wp.takeDamage(30);
        expect(wp.health).toBe(20);
        expect(wp.isBroken).toBe(false);

        wp.takeDamage(20);
        expect(wp.health).toBe(0);
        expect(wp.isBroken).toBe(true);
    });

    it('applies different hitbox sizes by type', () => {
        const head = new WeakPoint('head', 50, 2.0, 0, 0, 0);
        const tail = new WeakPoint('tail', 50, 1.5, 0, 0, 0);
        const legs = new WeakPoint('legs', 50, 1.0, 0, 0, 0);

        expect(head.radius).toBeLessThan(tail.radius);
        expect(tail.radius).toBeLessThan(legs.radius);
    });
});
