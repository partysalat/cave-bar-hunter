import type {
    AttackDeclaration,
    AttackingPlayer,
    PlayerAction,
    PlayerId,
    Position,
    QteType,
    WeakPoint,
    WeaponType,
} from '../core/types.js';
import PositioningSystem from './PositioningSystem.js';
import { DilophosaurusAI } from './dino/DilophosaurusAI.js';
import type { SessionPlayerState } from './SessionManager.js';

export type HuntPhase =
    | { kind: 'idle' }
    | { kind: 'plan'; telegraph: AttackDeclaration; deadlineMs: number }
    | { kind: 'submit'; telegraph: AttackDeclaration; deadlineMs: number }
    | { kind: 'resolve'; telegraph: AttackDeclaration }
    | { kind: 'attack_qte'; telegraph: AttackDeclaration; deadlineMs: number; attackers: AttackingPlayer[] }
    | { kind: 'dodge_qte'; telegraph: AttackDeclaration; deadlineMs: number; affectedPlayers: PlayerId[]; qteType: QteType }
    | { kind: 'stagger_window'; deadlineMs: number; sourceWeakPoint: WeakPoint }
    | { kind: 'hunt_end'; outcome: 'dilophosaurus_defeated' | 'party_wiped' | 'retreated_to_cave_bar' };

export interface HuntLoopPlayerState {
    health: number;
    score: number;
    activeWeapon: WeaponType;
    downed: boolean;
    position: Position;
    submittedAction?: PlayerAction;
}

export interface HuntSnapshot {
    round: number;
    phase: HuntPhase;
    players: Record<PlayerId, HuntLoopPlayerState>;
    dino: {
        health: number;
        currentTelegraph: AttackDeclaration | null;
        staggerOpen: boolean;
    };
    pending: {
        attackingPlayers: AttackingPlayer[];
        affectedPlayers: PlayerId[];
    };
}

export type HuntEmission =
    | { type: 'phase_changed'; from: HuntPhase['kind']; to: HuntPhase['kind'] }
    | { type: 'telegraph_announced'; telegraph: AttackDeclaration }
    | { type: 'planned_action_submitted'; playerId: PlayerId; action: PlayerAction }
    | { type: 'attack_qte_opened'; attackers: AttackingPlayer[] }
    | { type: 'dodge_qte_opened'; affectedPlayers: PlayerId[]; qteType: QteType }
    | { type: 'stagger_window_opened'; sourceWeakPoint: WeakPoint }
    | { type: 'hunt_ended'; outcome: 'dilophosaurus_defeated' | 'party_wiped' | 'retreated_to_cave_bar' };

export type HuntErrorCode =
    | 'phase_mismatch'
    | 'hunt_already_started'
    | 'player_already_committed'
    | 'player_not_eligible'
    | 'missing_telegraph'
    | 'handoff_already_consumed';

export interface HuntError {
    code: HuntErrorCode;
    message: string;
}

export type HuntCommand =
    | { type: 'begin_hunt' }
    | { type: 'tick'; deltaMs: number }
    | { type: 'submit_planned_action'; playerId: PlayerId; action: PlayerAction }
    | { type: 'submit_attack_qte'; playerId: PlayerId; weakPoint?: WeakPoint }
    | { type: 'submit_dodge_qte'; playerId: PlayerId }
    | { type: 'ack_hunt_end' };

export type HuntUpdate =
    | { ok: true; snapshot: HuntSnapshot; emissions: HuntEmission[] }
    | { ok: false; error: HuntError; snapshot: HuntSnapshot };

export interface HuntRoundLoop {
    advance(command: HuntCommand): HuntUpdate;
    getSnapshot(): HuntSnapshot;
}

export interface HuntRoundLoopOptions {
    playerIds?: PlayerId[];
    sessionState?: SessionPlayerState[];
    dinoHealth?: number;
    planDurationMs?: number;
    submitDurationMs?: number;
    initialPositions?: Partial<Record<PlayerId, Position>>;
}

const DEFAULT_PLAYER_IDS: PlayerId[] = [0, 1, 2, 3];
const DEFAULT_PLAYER_HEALTH = 4;
const DEFAULT_DINO_HEALTH = 30;
const DEFAULT_PLAN_DURATION_MS = 6000;
const DEFAULT_SUBMIT_DURATION_MS = 500;

function cloneAction(action: PlayerAction | undefined): PlayerAction | undefined {
    if (!action) {
        return undefined;
    }

    if (action.type === 'aimed_strike') {
        return { type: 'aimed_strike', target: action.target };
    }

    if (action.type === 'reposition') {
        return {
            type: 'reposition',
            moveTo: {
                zone: action.moveTo.zone,
                flank: action.moveTo.flank,
            },
        };
    }

    return { type: action.type };
}

function cloneTelegraph(telegraph: AttackDeclaration | null): AttackDeclaration | null {
    if (!telegraph) {
        return null;
    }

    return {
        type: telegraph.type,
        qteType: telegraph.qteType,
        damage: telegraph.damage,
        affectedZones: telegraph.affectedZones.map((zone) => ({
            zone: zone.zone,
            flank: zone.flank,
        })),
    };
}

function clonePhase(phase: HuntPhase): HuntPhase {
    switch (phase.kind) {
        case 'idle':
            return { kind: 'idle' };
        case 'plan':
            return { kind: 'plan', telegraph: cloneTelegraph(phase.telegraph)!, deadlineMs: phase.deadlineMs };
        case 'submit':
            return { kind: 'submit', telegraph: cloneTelegraph(phase.telegraph)!, deadlineMs: phase.deadlineMs };
        case 'resolve':
            return { kind: 'resolve', telegraph: cloneTelegraph(phase.telegraph)! };
        case 'attack_qte':
            return {
                kind: 'attack_qte',
                telegraph: cloneTelegraph(phase.telegraph)!,
                deadlineMs: phase.deadlineMs,
                attackers: phase.attackers.map((attacker) => ({ ...attacker })),
            };
        case 'dodge_qte':
            return {
                kind: 'dodge_qte',
                telegraph: cloneTelegraph(phase.telegraph)!,
                deadlineMs: phase.deadlineMs,
                affectedPlayers: [...phase.affectedPlayers],
                qteType: phase.qteType,
            };
        case 'stagger_window':
            return { kind: 'stagger_window', deadlineMs: phase.deadlineMs, sourceWeakPoint: phase.sourceWeakPoint };
        case 'hunt_end':
            return { kind: 'hunt_end', outcome: phase.outcome };
    }
}

function clonePlayers(players: Record<PlayerId, HuntLoopPlayerState>): Record<PlayerId, HuntLoopPlayerState> {
    return {
        0: {
            ...players[0],
            position: { ...players[0].position },
            submittedAction: cloneAction(players[0].submittedAction),
        },
        1: {
            ...players[1],
            position: { ...players[1].position },
            submittedAction: cloneAction(players[1].submittedAction),
        },
        2: {
            ...players[2],
            position: { ...players[2].position },
            submittedAction: cloneAction(players[2].submittedAction),
        },
        3: {
            ...players[3],
            position: { ...players[3].position },
            submittedAction: cloneAction(players[3].submittedAction),
        },
    };
}

function createPlayerMap(
    playerIds: PlayerId[],
    positioning: PositioningSystem,
    sessionState: SessionPlayerState[],
): Record<PlayerId, HuntLoopPlayerState> {
    const sessionById = new Map(sessionState.map((player) => [player.playerId, player]));
    const players = {} as Record<PlayerId, HuntLoopPlayerState>;

    for (const playerId of DEFAULT_PLAYER_IDS) {
        const saved = sessionById.get(playerId);
        const included = playerIds.includes(playerId);
        const health = included ? saved?.health ?? DEFAULT_PLAYER_HEALTH : 0;
        players[playerId] = {
            health,
            score: included ? saved?.score ?? 0 : 0,
            activeWeapon: included ? saved?.activeWeapon ?? 'club' : 'club',
            downed: included ? health <= 0 : true,
            position: positioning.getPosition(playerId),
        };
    }

    return players;
}

class HuntRoundLoopImpl implements HuntRoundLoop {
    private readonly playerIds: PlayerId[];
    private readonly dinoHealth: number;
    private readonly planDurationMs: number;
    private readonly submitDurationMs: number;
    private readonly positioning: PositioningSystem;
    private readonly dinosaurAI = new DilophosaurusAI();
    private readonly sessionState: SessionPlayerState[];

    private snapshot: HuntSnapshot = {
        round: 0,
        phase: { kind: 'idle' },
        players: {
            0: { health: 0, score: 0, activeWeapon: 'club', downed: true, position: { zone: 'close', flank: 'left' } },
            1: { health: 0, score: 0, activeWeapon: 'club', downed: true, position: { zone: 'close', flank: 'center' } },
            2: { health: 0, score: 0, activeWeapon: 'club', downed: true, position: { zone: 'close', flank: 'right' } },
            3: { health: 0, score: 0, activeWeapon: 'club', downed: true, position: { zone: 'mid', flank: 'center' } },
        },
        dino: {
            health: DEFAULT_DINO_HEALTH,
            currentTelegraph: null,
            staggerOpen: false,
        },
        pending: {
            attackingPlayers: [],
            affectedPlayers: [],
        },
    };

    constructor(options: HuntRoundLoopOptions = {}) {
        this.playerIds = options.playerIds ?? DEFAULT_PLAYER_IDS;
        this.dinoHealth = options.dinoHealth ?? DEFAULT_DINO_HEALTH;
        this.planDurationMs = options.planDurationMs ?? DEFAULT_PLAN_DURATION_MS;
        this.submitDurationMs = options.submitDurationMs ?? DEFAULT_SUBMIT_DURATION_MS;
        this.positioning = new PositioningSystem({ initialPositions: options.initialPositions });
        this.sessionState = options.sessionState ?? [];
    }

    advance(command: HuntCommand): HuntUpdate {
        switch (command.type) {
            case 'begin_hunt':
                return this.beginHunt();
            case 'tick':
                return this.tick(command.deltaMs);
            case 'submit_planned_action':
                return this.submitPlannedAction(command.playerId, command.action);
            case 'submit_attack_qte':
            case 'submit_dodge_qte':
            case 'ack_hunt_end':
                return this.fail('phase_mismatch', `Command ${command.type} is not implemented in the scaffold yet.`);
        }
    }

    getSnapshot(): HuntSnapshot {
        return {
            round: this.snapshot.round,
            phase: clonePhase(this.snapshot.phase),
            players: clonePlayers(this.snapshot.players),
            dino: {
                health: this.snapshot.dino.health,
                currentTelegraph: cloneTelegraph(this.snapshot.dino.currentTelegraph),
                staggerOpen: this.snapshot.dino.staggerOpen,
            },
            pending: {
                attackingPlayers: this.snapshot.pending.attackingPlayers.map((attacker) => ({ ...attacker })),
                affectedPlayers: [...this.snapshot.pending.affectedPlayers],
            },
        };
    }

    private beginHunt(): HuntUpdate {
        if (this.snapshot.phase.kind !== 'idle') {
            return this.fail('hunt_already_started', 'begin_hunt can only be used while the Hunt Round Loop is idle.');
        }

        const players = createPlayerMap(this.playerIds, this.positioning, this.sessionState);
        const telegraph = this.dinosaurAI.selectTelegraph(this.currentPositions());
        this.snapshot = {
            round: 1,
            phase: { kind: 'plan', telegraph, deadlineMs: this.planDurationMs },
            players,
            dino: {
                health: this.dinoHealth,
                currentTelegraph: telegraph,
                staggerOpen: false,
            },
            pending: {
                attackingPlayers: [],
                affectedPlayers: [],
            },
        };

        return this.success([
            { type: 'phase_changed', from: 'idle', to: 'plan' },
            { type: 'telegraph_announced', telegraph },
        ]);
    }

    private tick(deltaMs: number): HuntUpdate {
        if (deltaMs < 0) {
            return this.fail('phase_mismatch', 'tick requires a non-negative deltaMs.');
        }

        if (this.snapshot.phase.kind === 'plan') {
            const nextDeadline = Math.max(0, this.snapshot.phase.deadlineMs - deltaMs);
            this.snapshot.phase = {
                kind: 'plan',
                telegraph: this.snapshot.phase.telegraph,
                deadlineMs: nextDeadline,
            };
            if (nextDeadline === 0) {
                return this.transitionToSubmit();
            }
            return this.success([]);
        }

        if (this.snapshot.phase.kind === 'submit') {
            const nextDeadline = Math.max(0, this.snapshot.phase.deadlineMs - deltaMs);
            this.snapshot.phase = {
                kind: 'submit',
                telegraph: this.snapshot.phase.telegraph,
                deadlineMs: nextDeadline,
            };
            if (nextDeadline === 0) {
                this.snapshot.phase = {
                    kind: 'resolve',
                    telegraph: this.snapshot.phase.telegraph,
                };
                return this.success([
                    { type: 'phase_changed', from: 'submit', to: 'resolve' },
                ]);
            }
            return this.success([]);
        }

        return this.success([]);
    }

    private submitPlannedAction(playerId: PlayerId, action: PlayerAction): HuntUpdate {
        if (this.snapshot.phase.kind !== 'plan') {
            return this.fail('phase_mismatch', 'submit_planned_action is only valid during the plan phase.');
        }

        const player = this.snapshot.players[playerId];
        if (!player || !this.playerIds.includes(playerId) || player.downed) {
            return this.fail('player_not_eligible', `Player ${playerId} cannot submit a planned action right now.`);
        }

        if (player.submittedAction) {
            return this.fail('player_already_committed', `Player ${playerId} already submitted a planned action this round.`);
        }

        player.submittedAction = cloneAction(action);
        const emissions: HuntEmission[] = [
            { type: 'planned_action_submitted', playerId, action },
        ];

        if (this.allEligiblePlayersCommitted()) {
            const transition = this.transitionToSubmit();
            if (!transition.ok) {
                return transition;
            }
            return {
                ok: true,
                snapshot: transition.snapshot,
                emissions: [...emissions, ...transition.emissions],
            };
        }

        return this.success(emissions);
    }

    private transitionToSubmit(): HuntUpdate {
        if (this.snapshot.phase.kind !== 'plan') {
            return this.fail('phase_mismatch', 'The scaffold can only enter submit from the plan phase.');
        }

        this.snapshot.phase = {
            kind: 'submit',
            telegraph: this.snapshot.phase.telegraph,
            deadlineMs: this.submitDurationMs,
        };

        return this.success([
            { type: 'phase_changed', from: 'plan', to: 'submit' },
        ]);
    }

    private allEligiblePlayersCommitted(): boolean {
        return this.playerIds
            .filter((playerId) => !this.snapshot.players[playerId].downed)
            .every((playerId) => this.snapshot.players[playerId].submittedAction !== undefined);
    }

    private currentPositions(): Partial<Record<PlayerId, Position>> {
        const positions: Partial<Record<PlayerId, Position>> = {};
        for (const playerId of this.playerIds) {
            positions[playerId] = this.positioning.getPosition(playerId);
        }
        return positions;
    }

    private success(emissions: HuntEmission[]): HuntUpdate {
        return {
            ok: true,
            snapshot: this.getSnapshot(),
            emissions,
        };
    }

    private fail(code: HuntErrorCode, message: string): HuntUpdate {
        return {
            ok: false,
            error: { code, message },
            snapshot: this.getSnapshot(),
        };
    }
}

export function createHuntRoundLoop(options: HuntRoundLoopOptions = {}): HuntRoundLoop {
    return new HuntRoundLoopImpl(options);
}
