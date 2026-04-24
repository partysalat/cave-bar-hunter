import { EventBus } from '../core/EventBus.js';
import { EVENTS } from '../core/events.js';
import type { WeakPoint } from '../core/types.js';

export interface StaggerSystemOptions {
    thresholds?: Partial<Record<WeakPoint, number>>;
}

type WeakPointState = {
    accumulatedDamage: number;
    threshold: number;
};

const DEFAULT_THRESHOLDS: Record<WeakPoint, number> = {
    head: 15,
    legs: 20,
};

export class StaggerSystem {
    private readonly bus: EventBus;
    private readonly weakPoints: Record<WeakPoint, WeakPointState>;
    private staggered = false;

    constructor(bus: EventBus, options: StaggerSystemOptions = {}) {
        this.bus = bus;
        this.weakPoints = {
            head: {
                accumulatedDamage: 0,
                threshold: options.thresholds?.head ?? DEFAULT_THRESHOLDS.head,
            },
            legs: {
                accumulatedDamage: 0,
                threshold: options.thresholds?.legs ?? DEFAULT_THRESHOLDS.legs,
            },
        };
    }

    applyWeakPointDamage(weakPoint: WeakPoint, amount: number): boolean {
        if (amount < 0) {
            throw new Error('Weak point damage cannot be negative.');
        }

        const state = this.weakPoints[weakPoint];
        state.accumulatedDamage += amount;

        if (this.staggered || state.accumulatedDamage < state.threshold) {
            return false;
        }

        state.accumulatedDamage -= state.threshold;
        state.threshold = Math.ceil(state.threshold * 1.5);
        this.staggered = true;
        this.bus.emit(EVENTS.STAGGER_TRIGGERED, {});
        return true;
    }

    isStaggered(): boolean {
        return this.staggered;
    }

    consumeStaggerWindow(): boolean {
        if (!this.staggered) {
            return false;
        }

        this.staggered = false;
        return true;
    }
}

export default StaggerSystem;
