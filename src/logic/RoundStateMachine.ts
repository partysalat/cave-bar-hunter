import { EventBus } from '../core/EventBus.js';
import { EVENTS, type RoundPhase } from '../core/events.js';
import type { PlayerAction, PlayerId } from '../core/types.js';

export interface RoundStateMachineOptions {
    playerIds?: PlayerId[];
    planDurationMs?: number;
    submitDurationMs?: number;
    dodgeQteDurationMs?: number;
    staggerWindowDurationMs?: number;
}

type PhaseTimer = {
    phase: Exclude<RoundPhase, 'resolve'>;
    durationMs: number;
};

const DEFAULT_PLAYER_IDS: PlayerId[] = [0, 1, 2, 3];

export class RoundStateMachine {
    private readonly bus: EventBus;
    private readonly playerIds: PlayerId[];
    private readonly durations: Record<PhaseTimer['phase'], number>;
    private phase: RoundPhase = 'plan';
    private remainingMs = 0;
    private readonly actions = new Map<PlayerId, PlayerAction>();

    constructor(bus: EventBus, options: RoundStateMachineOptions = {}) {
        this.bus = bus;
        this.playerIds = options.playerIds ?? DEFAULT_PLAYER_IDS;
        this.durations = {
            plan: options.planDurationMs ?? 8000,
            submit: options.submitDurationMs ?? 500,
            dodge_qte: options.dodgeQteDurationMs ?? 3000,
            stagger_window: options.staggerWindowDurationMs ?? 3000,
        };
    }

    start(): void {
        this.actions.clear();
        this.transitionTo('plan');
    }

    submitAction(playerId: PlayerId, action: PlayerAction): void {
        if (this.phase !== 'plan') {
            throw new Error(`Cannot submit an action while in ${this.phase} phase.`);
        }

        this.actions.set(playerId, action);
        this.bus.emit(EVENTS.PLAYER_ACTION_SELECTED, { playerId, action });

        if (this.actions.size >= this.playerIds.length) {
            this.transitionTo('submit');
        }
    }

    forceSubmit(): void {
        if (this.phase === 'plan') {
            this.transitionTo('submit');
        }
    }

    beginResolve(): void {
        if (this.phase !== 'submit') {
            throw new Error(`Cannot begin resolve while in ${this.phase} phase.`);
        }

        this.transitionTo('resolve');
    }

    beginDodgeQte(): void {
        if (this.phase !== 'resolve') {
            throw new Error(`Cannot begin dodge QTE while in ${this.phase} phase.`);
        }

        this.transitionTo('dodge_qte');
    }

    openStaggerWindow(): void {
        if (this.phase !== 'resolve') {
            throw new Error(`Cannot open stagger window while in ${this.phase} phase.`);
        }

        this.transitionTo('stagger_window');
    }

    tick(deltaMs = 16): void {
        if (this.phase === 'resolve') {
            return;
        }

        this.remainingMs -= deltaMs;

        while (this.remainingMs <= 0) {
            if (this.phase === 'plan') {
                this.transitionTo('submit');
                continue;
            }

            if (this.phase === 'submit') {
                this.transitionTo('resolve');
                continue;
            }

            if (this.phase === 'dodge_qte' || this.phase === 'stagger_window') {
                this.transitionTo('plan');
                continue;
            }

            break;
        }
    }

    getPhase(): RoundPhase {
        return this.phase;
    }

    private transitionTo(nextPhase: RoundPhase): void {
        if (this.phase === nextPhase) {
            this.remainingMs = this.getDurationFor(nextPhase);
            return;
        }

        const previousPhase = this.phase;
        this.phase = nextPhase;
        this.remainingMs = this.getDurationFor(nextPhase);
        this.bus.emit(EVENTS.ROUND_PHASE_CHANGED, { phase: nextPhase, previousPhase });
    }

    private getDurationFor(phase: RoundPhase): number {
        if (phase === 'resolve') {
            return 0;
        }

        return this.durations[phase as PhaseTimer['phase']];
    }
}

export default RoundStateMachine;
