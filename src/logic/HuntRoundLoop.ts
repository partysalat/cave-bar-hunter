import type {
    AttackDeclaration,
    AttackingPlayer,
    PlayerAction,
    PlayerId,
    Position,
    QteType,
    RoundResult,
    WeakPoint,
    WeaponType,
} from '../core/types.js';
import ActionResolver from './ActionResolver.js';
import PositioningSystem from './PositioningSystem.js';
import { AttackZoneResolver } from './dino/AttackZoneResolver.js';
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

export interface HuntRoundPlayerStateInput {
    health: number;
    score: number;
    activeWeapon: WeaponType;
    downed: boolean;
    position: Position;
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
    | { type: 'weapon_switched'; playerId: PlayerId; newWeapon: WeaponType }
    | { type: 'round_resolved'; result: RoundResult }
    | { type: 'attack_qte_result'; playerId: PlayerId; weaponType: WeaponType; critical: boolean; weakPoint: WeakPoint | null }
    | { type: 'dodge_qte_result'; playerId: PlayerId; success: boolean; perfect: boolean }
    | { type: 'attack_qte_opened'; attackers: AttackingPlayer[] }
    | { type: 'dodge_qte_opened'; affectedPlayers: PlayerId[]; qteType: QteType }
    | { type: 'qte_round_finished'; result: RoundResult; failedDodges: PlayerId[]; perfectDodges: PlayerId[] }
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
    | { type: 'resolve_submitted_actions'; staggerActive?: boolean }
    | { type: 'begin_next_round'; players: Partial<Record<PlayerId, HuntRoundPlayerStateInput>> }
    | { type: 'submit_attack_qte'; playerId: PlayerId; weakPoint?: WeakPoint }
    | { type: 'submit_dodge_qte'; playerId: PlayerId }
    | { type: 'complete_qte_round' }
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

function clonePlayerStateInput(player: HuntRoundPlayerStateInput): HuntRoundPlayerStateInput {
    return {
        health: player.health,
        score: player.score,
        activeWeapon: player.activeWeapon,
        downed: player.downed,
        position: {
            zone: player.position.zone,
            flank: player.position.flank,
        },
    };
}

class HuntRoundLoopImpl implements HuntRoundLoop {
    private readonly playerIds: PlayerId[];
    private readonly dinoHealth: number;
    private readonly planDurationMs: number;
    private readonly submitDurationMs: number;
    private readonly positioning: PositioningSystem;
    private readonly actionResolver = new ActionResolver();
    private readonly attackZoneResolver = new AttackZoneResolver();
    private readonly dinosaurAI = new DilophosaurusAI();
    private readonly sessionState: SessionPlayerState[];
    private pendingRoundResult?: RoundResult;
    private attackQteResults = new Map<PlayerId, { critical: boolean; weakPoint: WeakPoint | null }>();
    private dodgeQteResults = new Map<PlayerId, { success: boolean; perfect: boolean }>();

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
            case 'resolve_submitted_actions':
                return this.resolveSubmittedActions(command.staggerActive ?? false);
            case 'begin_next_round':
                return this.beginNextRound(command.players);
            case 'complete_qte_round':
                return this.completeQteRound();
            case 'submit_attack_qte':
                return this.submitAttackQte(command.playerId, command.weakPoint ?? null);
            case 'submit_dodge_qte':
                return this.submitDodgeQte(command.playerId);
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

    private beginNextRound(players: Partial<Record<PlayerId, HuntRoundPlayerStateInput>>): HuntUpdate {
        if (
            this.snapshot.phase.kind !== 'resolve' &&
            this.snapshot.phase.kind !== 'attack_qte' &&
            this.snapshot.phase.kind !== 'dodge_qte'
        ) {
            return this.fail('phase_mismatch', 'begin_next_round is only valid after resolve or QTE phases.');
        }

        const previousPhase = this.snapshot.phase.kind;

        for (const playerId of this.playerIds) {
            const next = players[playerId];
            if (!next) {
                continue;
            }

            const cloned = clonePlayerStateInput(next);
            this.positioning.setPosition(playerId, cloned.position);
            this.snapshot.players[playerId] = {
                health: cloned.health,
                score: cloned.score,
                activeWeapon: cloned.activeWeapon,
                downed: cloned.downed,
                position: cloned.position,
                submittedAction: undefined,
            };
        }

        this.snapshot.round += 1;
        const telegraph = this.dinosaurAI.selectTelegraph(this.currentPositions());
        this.snapshot.phase = {
            kind: 'plan',
            telegraph,
            deadlineMs: this.planDurationMs,
        };
        this.snapshot.dino.currentTelegraph = telegraph;
        this.snapshot.pending.attackingPlayers = [];
        this.snapshot.pending.affectedPlayers = [];
        this.pendingRoundResult = undefined;
        this.attackQteResults.clear();
        this.dodgeQteResults.clear();

        return this.success([
            { type: 'phase_changed', from: previousPhase, to: 'plan' },
            { type: 'telegraph_announced', telegraph },
        ]);
    }

    private resolveSubmittedActions(staggerActive: boolean): HuntUpdate {
        if (this.snapshot.phase.kind !== 'resolve') {
            return this.fail('phase_mismatch', 'resolve_submitted_actions is only valid during resolve.');
        }

        const telegraph = this.snapshot.phase.telegraph;
        const playerActions: Partial<Record<PlayerId, PlayerAction>> = {};
        const emissions: HuntEmission[] = [];

        for (const playerId of this.playerIds) {
            const action = this.snapshot.players[playerId].submittedAction;
            if (!action || this.snapshot.players[playerId].downed) {
                continue;
            }

            playerActions[playerId] = action;
            if (action.type === 'switch_weapon') {
                const current = this.snapshot.players[playerId].activeWeapon;
                const nextWeapon = current === 'club' ? 'bow' : 'club';
                this.snapshot.players[playerId].activeWeapon = nextWeapon;
                emissions.push({ type: 'weapon_switched', playerId, newWeapon: nextWeapon });
            }
        }

        const result = this.actionResolver.resolveRound({
            playerActions,
            positioningSystem: this.positioning,
            attackDeclaration: telegraph,
            playerState: this.toResolverState(),
            staggerActive,
        });
        this.syncPositionsFromSystem();
        this.pendingRoundResult = result;
        this.attackQteResults.clear();
        this.dodgeQteResults.clear();
        this.snapshot.pending.attackingPlayers = result.attackingPlayers.map((attacker) => ({ ...attacker }));
        this.snapshot.pending.affectedPlayers = this.attackZoneResolver.getAffectedPlayers(telegraph, this.currentPositions());

        emissions.push({ type: 'round_resolved', result });

        const hasAttackQte = this.snapshot.pending.attackingPlayers.length > 0;
        const hasDodgeQte = this.snapshot.pending.affectedPlayers.length > 0;
        if (hasAttackQte || hasDodgeQte) {
            this.snapshot.phase = hasAttackQte
                ? {
                    kind: 'attack_qte',
                    telegraph,
                    deadlineMs: 2200,
                    attackers: this.snapshot.pending.attackingPlayers.map((attacker) => ({ ...attacker })),
                }
                : {
                    kind: 'dodge_qte',
                    telegraph,
                    deadlineMs: 2200,
                    affectedPlayers: [...this.snapshot.pending.affectedPlayers],
                    qteType: telegraph.qteType,
                };
            emissions.push({
                type: 'phase_changed',
                from: 'resolve',
                to: this.snapshot.phase.kind,
            });
            if (hasAttackQte) {
                emissions.push({
                    type: 'attack_qte_opened',
                    attackers: this.snapshot.pending.attackingPlayers.map((attacker) => ({ ...attacker })),
                });
            }
            if (hasDodgeQte) {
                emissions.push({
                    type: 'dodge_qte_opened',
                    affectedPlayers: [...this.snapshot.pending.affectedPlayers],
                    qteType: telegraph.qteType,
                });
            }
        }

        return this.success(emissions);
    }

    private submitAttackQte(playerId: PlayerId, weakPoint: WeakPoint | null): HuntUpdate {
        if (this.snapshot.phase.kind !== 'attack_qte') {
            return this.fail('phase_mismatch', 'submit_attack_qte is only valid during attack_qte.');
        }

        const attacker = this.snapshot.phase.attackers.find((candidate) => candidate.playerId === playerId);
        if (!attacker) {
            return this.fail('player_not_eligible', `Player ${playerId} is not an active attacker in this QTE.`);
        }

        if (this.attackQteResults.has(playerId)) {
            return this.fail('player_already_committed', `Player ${playerId} already submitted an attack QTE result.`);
        }

        let result: { critical: boolean; weakPoint: WeakPoint | null };
        if (attacker.weaponType === 'club') {
            const elapsed = 2200 - this.snapshot.phase.deadlineMs;
            result = {
                critical: elapsed >= 562 && elapsed <= 937,
                weakPoint: null,
            };
        } else {
            result = {
                critical: weakPoint !== null,
                weakPoint,
            };
        }

        this.attackQteResults.set(playerId, result);
        return this.success([{
            type: 'attack_qte_result',
            playerId,
            weaponType: attacker.weaponType,
            critical: result.critical,
            weakPoint: result.weakPoint,
        }]);
    }

    private submitDodgeQte(playerId: PlayerId): HuntUpdate {
        if (this.snapshot.phase.kind !== 'attack_qte' && this.snapshot.phase.kind !== 'dodge_qte') {
            return this.fail('phase_mismatch', 'submit_dodge_qte is only valid during active QTE phases.');
        }

        if (!this.snapshot.pending.affectedPlayers.includes(playerId)) {
            return this.fail('player_not_eligible', `Player ${playerId} is not targeted by the current dodge QTE.`);
        }

        if (this.dodgeQteResults.has(playerId)) {
            return this.fail('player_already_committed', `Player ${playerId} already submitted a dodge QTE result.`);
        }

        const deadlineMs = this.snapshot.phase.deadlineMs;
        const elapsed = 2200 - deadlineMs;
        const result = {
            success: true,
            perfect: elapsed <= 700,
        };
        this.dodgeQteResults.set(playerId, result);
        return this.success([{
            type: 'dodge_qte_result',
            playerId,
            success: true,
            perfect: result.perfect,
        }]);
    }

    private completeQteRound(): HuntUpdate {
        if (this.snapshot.phase.kind !== 'attack_qte' && this.snapshot.phase.kind !== 'dodge_qte') {
            return this.fail('phase_mismatch', 'complete_qte_round is only valid during QTE phases.');
        }

        if (!this.pendingRoundResult) {
            return this.fail('phase_mismatch', 'complete_qte_round requires a pending round result.');
        }

        const result = this.pendingRoundResult;
        const finalWeakPointHits = result.weakPointHits.filter((hit) => {
            const attacker = result.attackingPlayers.find((candidate) => candidate.playerId === hit.playerId);
            if (!attacker) {
                return true;
            }

            const qteResult = this.attackQteResults.get(hit.playerId);
            if (attacker.weaponType === 'club') {
                return qteResult?.critical === true;
            }

            return qteResult?.weakPoint === hit.weakPoint;
        });

        const damageDealt = { ...result.damageDealt };
        for (const attacker of result.attackingPlayers) {
            const qteResult = this.attackQteResults.get(attacker.playerId);
            if (attacker.weaponType === 'club' && qteResult?.critical) {
                damageDealt[attacker.playerId] *= 2;
                const hit = finalWeakPointHits.find((candidate) => candidate.playerId === attacker.playerId);
                if (hit) {
                    hit.damage = damageDealt[attacker.playerId];
                }
            }

            if (attacker.weaponType === 'bow' && attacker.action === 'attack' && qteResult?.weakPoint) {
                finalWeakPointHits.push({
                    playerId: attacker.playerId,
                    weakPoint: qteResult.weakPoint,
                    damage: damageDealt[attacker.playerId],
                });
            }
        }

        const failedDodges = this.snapshot.pending.affectedPlayers.filter((playerId) => {
            return this.dodgeQteResults.get(playerId)?.success !== true;
        });
        const perfectDodges = this.snapshot.pending.affectedPlayers.filter((playerId) => {
            return this.dodgeQteResults.get(playerId)?.perfect === true;
        });

        const finalResult: RoundResult = {
            ...result,
            damageDealt,
            weakPointHits: finalWeakPointHits,
        };

        return this.success([{
            type: 'qte_round_finished',
            result: finalResult,
            failedDodges,
            perfectDodges,
        }]);
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

    private syncPositionsFromSystem(): void {
        for (const playerId of this.playerIds) {
            this.snapshot.players[playerId].position = this.positioning.getPosition(playerId);
        }
    }

    private toResolverState(): Record<PlayerId, { health: number; downed: boolean; activeWeapon: WeaponType }> {
        return {
            0: {
                health: this.snapshot.players[0].health,
                downed: this.snapshot.players[0].downed,
                activeWeapon: this.snapshot.players[0].activeWeapon,
            },
            1: {
                health: this.snapshot.players[1].health,
                downed: this.snapshot.players[1].downed,
                activeWeapon: this.snapshot.players[1].activeWeapon,
            },
            2: {
                health: this.snapshot.players[2].health,
                downed: this.snapshot.players[2].downed,
                activeWeapon: this.snapshot.players[2].activeWeapon,
            },
            3: {
                health: this.snapshot.players[3].health,
                downed: this.snapshot.players[3].downed,
                activeWeapon: this.snapshot.players[3].activeWeapon,
            },
        };
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
