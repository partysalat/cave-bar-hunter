export type Zone = 'close' | 'mid' | 'far';
export type Flank = 'left' | 'center' | 'right';
export type WeakPoint = 'head' | 'legs';
export type QteType = 'timing' | 'smash';
export type PlayerId = 0 | 1 | 2 | 3;

export interface Position {
    zone: Zone;
    flank: Flank;
}

export type PlayerAction =
    | { type: 'attack' }
    | { type: 'aimed_strike'; target: WeakPoint }
    | { type: 'reposition'; moveTo: Position }
    | { type: 'brace' }
    | { type: 'revive' };

/** Convenience alias derived from the discriminated union */
export type ActionType = PlayerAction['type'];

export interface AttackDeclaration {
    type: 'spit' | 'bite';
    affectedZones: Position[];
    qteType: QteType;
    damage: number;
}

export interface WeakPointHit {
    weakPoint: WeakPoint;
    playerId: PlayerId;
    damage: number;
}

export interface RoundResult {
    damageDealt: Record<PlayerId, number>;
    weakPointHits: WeakPointHit[];
    staggerTriggered: boolean;
    playersHit: PlayerId[];
}
