import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../src/core/EventBus.js';
import { EVENTS } from '../src/core/events.js';

describe('EventBus', () => {
    it('calls handler when event is emitted', () => {
        const bus = new EventBus();
        const handler = vi.fn();

        bus.on(EVENTS.STAGGER_TRIGGERED, handler);
        bus.emit(EVENTS.STAGGER_TRIGGERED, {});

        expect(handler).toHaveBeenCalledOnce();
    });

    it('passes event data to the handler', () => {
        const bus = new EventBus();
        const handler = vi.fn();

        bus.on(EVENTS.PLAYER_DAMAGED, handler);
        bus.emit(EVENTS.PLAYER_DAMAGED, { playerId: 0, amount: 2, newHealth: 3 });

        expect(handler).toHaveBeenCalledWith({ playerId: 0, amount: 2, newHealth: 3 });
    });

    it('does not call handler after off()', () => {
        const bus = new EventBus();
        const handler = vi.fn();

        bus.on(EVENTS.STAGGER_TRIGGERED, handler);
        bus.off(EVENTS.STAGGER_TRIGGERED, handler);
        bus.emit(EVENTS.STAGGER_TRIGGERED, {});

        expect(handler).not.toHaveBeenCalled();
    });

    it('calls all handlers registered for the same event', () => {
        const bus = new EventBus();
        const h1 = vi.fn();
        const h2 = vi.fn();

        bus.on(EVENTS.STAGGER_TRIGGERED, h1);
        bus.on(EVENTS.STAGGER_TRIGGERED, h2);
        bus.emit(EVENTS.STAGGER_TRIGGERED, {});

        expect(h1).toHaveBeenCalledOnce();
        expect(h2).toHaveBeenCalledOnce();
    });

    it('does not cross-fire handlers registered for different events', () => {
        const bus = new EventBus();
        const handler = vi.fn();

        bus.on(EVENTS.PLAYER_DOWNED, handler);
        bus.emit(EVENTS.STAGGER_TRIGGERED, {});

        expect(handler).not.toHaveBeenCalled();
    });

    it('calls once() handler exactly once across multiple emits', () => {
        const bus = new EventBus();
        const handler = vi.fn();

        bus.once(EVENTS.STAGGER_TRIGGERED, handler);
        bus.emit(EVENTS.STAGGER_TRIGGERED, {});
        bus.emit(EVENTS.STAGGER_TRIGGERED, {});

        expect(handler).toHaveBeenCalledOnce();
    });

    it('does not throw when emitting with no listeners', () => {
        const bus = new EventBus();
        expect(() => bus.emit(EVENTS.STAGGER_TRIGGERED, {})).not.toThrow();
    });

    it('off() on a handler that was never registered does not throw', () => {
        const bus = new EventBus();
        const handler = vi.fn();
        expect(() => bus.off(EVENTS.STAGGER_TRIGGERED, handler)).not.toThrow();
    });
});
