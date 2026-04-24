import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/EventBus.js';
import { EVENTS } from '../../src/core/events.js';
import { StaggerSystem } from '../../src/logic/StaggerSystem.js';

describe('StaggerSystem', () => {
    it('accumulates weak point damage until a threshold triggers stagger', () => {
        const bus = new EventBus();
        const triggered = vi.fn();
        const system = new StaggerSystem(bus, { thresholds: { head: 10 } });

        bus.on(EVENTS.STAGGER_TRIGGERED, triggered);

        expect(system.applyWeakPointDamage('head', 6)).toBe(false);
        expect(system.applyWeakPointDamage('head', 4)).toBe(true);
        expect(system.isStaggered()).toBe(true);
        expect(triggered).toHaveBeenCalledOnce();
    });

    it('increases the next threshold after a stagger window is consumed', () => {
        const bus = new EventBus();
        const system = new StaggerSystem(bus, { thresholds: { legs: 8 } });

        expect(system.applyWeakPointDamage('legs', 8)).toBe(true);
        expect(system.consumeStaggerWindow()).toBe(true);
        expect(system.isStaggered()).toBe(false);
        expect(system.applyWeakPointDamage('legs', 3)).toBe(false);
        expect(system.applyWeakPointDamage('legs', 9)).toBe(true);
    });
});
