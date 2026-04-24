import { EventBus } from '../core/EventBus.js';
import { EVENTS } from '../core/events.js';
import type { PlayerId } from '../core/types.js';

type ScoringReason = 'damage' | 'weak_point_hit' | 'perfect_dodge' | 'stagger_contribution' | 'revive';

export interface ScoringSystemOptions {
    initialTotals?: Partial<Record<PlayerId, number>>;
}

const PLAYER_IDS: PlayerId[] = [0, 1, 2, 3];

export class ScoringSystem {
    private readonly bus: EventBus;
    private readonly totals = new Map<PlayerId, number>();

    constructor(bus: EventBus, options: ScoringSystemOptions = {}) {
        this.bus = bus;

        for (const playerId of PLAYER_IDS) {
            this.totals.set(playerId, options.initialTotals?.[playerId] ?? 0);
        }
    }

    awardDamage(playerId: PlayerId, amount: number): number {
        return this.addPoints(playerId, amount, 'damage');
    }

    awardWeakPointHit(playerId: PlayerId): number {
        return this.addPoints(playerId, 3, 'weak_point_hit');
    }

    awardPerfectDodge(playerId: PlayerId): number {
        return this.addPoints(playerId, 5, 'perfect_dodge');
    }

    awardStaggerContribution(playerId: PlayerId): number {
        return this.addPoints(playerId, 3, 'stagger_contribution');
    }

    awardRevive(playerId: PlayerId): number {
        return this.addPoints(playerId, 10, 'revive');
    }

    getTotals(): Record<PlayerId, number> {
        return PLAYER_IDS.reduce((accumulator, playerId) => {
            accumulator[playerId] = this.totals.get(playerId) ?? 0;
            return accumulator;
        }, {} as Record<PlayerId, number>);
    }

    private addPoints(playerId: PlayerId, amount: number, reason: ScoringReason): number {
        if (amount < 0) {
            throw new Error('Points cannot be negative.');
        }

        const total = (this.totals.get(playerId) ?? 0) + amount;
        this.totals.set(playerId, total);
        this.bus.emit(EVENTS.POINTS_EARNED, { playerId, amount, reason });
        return total;
    }
}

export default ScoringSystem;
