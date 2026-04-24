import type {
    AttackDeclaration,
    PlayerAction,
    PlayerId,
    QteType,
    RoundResult,
} from './types.js';

export const EVENTS = {
    DINO_TELEGRAPH:         'DinoTelegraph',
    ROUND_PHASE_CHANGED:    'RoundPhaseChanged',
    PLAYER_ACTION_SELECTED: 'PlayerActionSelected',
    ROUND_RESOLVED:         'RoundResolved',
    STAGGER_TRIGGERED:      'StaggerTriggered',
    PLAYER_DAMAGED:         'PlayerDamaged',
    PLAYER_DOWNED:          'PlayerDowned',
    DINO_HEALTH_CHANGED:    'DinoHealthChanged',
    QTE_START:              'QTEStart',
    QTE_RESULT:             'QTEResult',
    POINTS_EARNED:          'PointsEarned',
} as const;

export type EventName = typeof EVENTS[keyof typeof EVENTS];

export type RoundPhase = 'plan' | 'submit' | 'resolve' | 'dodge_qte' | 'stagger_window';

export interface EventData {
    [EVENTS.DINO_TELEGRAPH]:         { attack: AttackDeclaration };
    [EVENTS.ROUND_PHASE_CHANGED]:    { phase: RoundPhase; previousPhase: RoundPhase };
    [EVENTS.PLAYER_ACTION_SELECTED]: { playerId: PlayerId; action: PlayerAction };
    [EVENTS.ROUND_RESOLVED]:         { result: RoundResult };
    [EVENTS.STAGGER_TRIGGERED]:      Record<never, never>;
    [EVENTS.PLAYER_DAMAGED]:         { playerId: PlayerId; amount: number; newHealth: number };
    [EVENTS.PLAYER_DOWNED]:          { playerId: PlayerId };
    [EVENTS.DINO_HEALTH_CHANGED]:    { amount: number; newHealth: number };
    [EVENTS.QTE_START]:              { affectedPlayerIds: PlayerId[]; qteType: QteType };
    [EVENTS.QTE_RESULT]:             { playerId: PlayerId; success: boolean; perfect: boolean };
    [EVENTS.POINTS_EARNED]:          { playerId: PlayerId; amount: number; reason: string };
}
