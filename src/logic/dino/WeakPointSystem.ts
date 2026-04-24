import type { WeakPoint } from '../../core/types.js';

type WeakPointState = {
    accumulatedDamage: number;
    threshold: number;
};

const DEFAULT_THRESHOLDS: Record<WeakPoint, number> = {
    head: 15,
    legs: 20,
};

export class WeakPointSystem {
    private readonly state: Record<WeakPoint, WeakPointState>;

    constructor(thresholds: Partial<Record<WeakPoint, number>> = {}) {
        this.state = {
            head: {
                accumulatedDamage: 0,
                threshold: thresholds.head ?? DEFAULT_THRESHOLDS.head,
            },
            legs: {
                accumulatedDamage: 0,
                threshold: thresholds.legs ?? DEFAULT_THRESHOLDS.legs,
            },
        };
    }

    applyDamage(weakPoint: WeakPoint, amount: number): {
        accumulatedDamage: number;
        threshold: number;
        thresholdReached: boolean;
    } {
        const point = this.state[weakPoint];
        point.accumulatedDamage += amount;

        const thresholdReached = point.accumulatedDamage >= point.threshold;
        if (thresholdReached) {
            point.threshold = Math.ceil(point.threshold * 1.5);
        }

        return {
            accumulatedDamage: point.accumulatedDamage,
            threshold: point.threshold,
            thresholdReached,
        };
    }

    getAccumulatedDamage(weakPoint: WeakPoint): number {
        return this.state[weakPoint].accumulatedDamage;
    }

    getThreshold(weakPoint: WeakPoint): number {
        return this.state[weakPoint].threshold;
    }
}
