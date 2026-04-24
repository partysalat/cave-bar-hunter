import type { PlayerAction, PlayerId, Position, Flank, Zone } from '../core/types.js';

export interface PositioningSystemOptions {
    initialPositions?: Partial<Record<PlayerId, Position>>;
}

const PLAYER_IDS: PlayerId[] = [0, 1, 2, 3];
const DEFAULT_POSITIONS: Record<PlayerId, Position> = {
    0: { zone: 'close', flank: 'left' },
    1: { zone: 'close', flank: 'center' },
    2: { zone: 'close', flank: 'right' },
    3: { zone: 'mid', flank: 'center' },
};

export class PositioningSystem {
    private readonly positions = new Map<PlayerId, Position>();

    constructor(options: PositioningSystemOptions = {}) {
        for (const playerId of PLAYER_IDS) {
            const startPosition = options.initialPositions?.[playerId] ?? DEFAULT_POSITIONS[playerId];
            this.positions.set(playerId, { ...startPosition });
        }
    }

    getPosition(playerId: PlayerId): Position {
        const position = this.positions.get(playerId);
        if (!position) {
            throw new Error(`Unknown player ${playerId}.`);
        }

        return { ...position };
    }

    setPosition(playerId: PlayerId, position: Position): void {
        this.positions.set(playerId, this.clonePosition(position));
    }

    validateMove(playerId: PlayerId, toPosition: Position): boolean {
        const current = this.getPosition(playerId);
        return this.isValidPosition(toPosition) && this.isSingleAxisMove(current, toPosition);
    }

    applyAction(playerId: PlayerId, action: PlayerAction): void {
        if (action.type !== 'reposition') {
            return;
        }

        if (!this.validateMove(playerId, action.moveTo)) {
            throw new Error(`Invalid reposition for player ${playerId}.`);
        }

        this.setPosition(playerId, action.moveTo);
    }

    getPlayersInZones(zones: Position[]): PlayerId[] {
        const wanted = zones.map(zone => this.positionKey(zone));

        return PLAYER_IDS.filter(playerId => wanted.includes(this.positionKey(this.getPosition(playerId))));
    }

    private isSingleAxisMove(current: Position, next: Position): boolean {
        if (this.positionKey(current) === this.positionKey(next)) {
            return true;
        }

        const zoneChanged = current.zone !== next.zone;
        const flankChanged = current.flank !== next.flank;
        return zoneChanged !== flankChanged;
    }

    private isValidPosition(position: Position): boolean {
        return this.isValidZone(position.zone) && this.isValidFlank(position.flank);
    }

    private isValidZone(zone: Zone): boolean {
        return zone === 'close' || zone === 'mid' || zone === 'far';
    }

    private isValidFlank(flank: Flank): boolean {
        return flank === 'left' || flank === 'center' || flank === 'right';
    }

    private positionKey(position: Position): string {
        return `${position.zone}:${position.flank}`;
    }

    private clonePosition(position: Position): Position {
        return { zone: position.zone, flank: position.flank };
    }
}

export default PositioningSystem;
