export type Zone = 'close' | 'mid' | 'far';
export type Flank = 'left' | 'center' | 'right';
export type ActionType = 'attack' | 'aimed_strike' | 'reposition' | 'brace' | 'revive';
export type WeakPoint = 'head' | 'legs';
export type QteType = 'timing' | 'smash';
export type PlayerId = 0 | 1 | 2 | 3;

export interface Position {
    zone: Zone;
    flank: Flank;
}

export interface PlayerAction {
    type: ActionType;
    /** aimed_strike only */
    target?: WeakPoint;
    /** reposition only */
    moveTo?: Position;
}

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
    damageDealt: Map<PlayerId, number>;
    weakPointHits: WeakPointHit[];
    staggerTriggered: boolean;
    playersHit: PlayerId[];
}
