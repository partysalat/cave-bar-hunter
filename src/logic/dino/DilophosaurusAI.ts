import type { AttackDeclaration, PlayerId, Position, WeakPoint } from '../../core/types.js';

type PlayerPositions = Partial<Record<PlayerId, Position>>;
const PLAYER_IDS: PlayerId[] = [0, 1, 2, 3];

const DEFAULT_WEAK_POINT_THRESHOLDS: Record<WeakPoint, number> = {
    head: 15,
    legs: 20,
};

function clonePosition(position: Position): Position {
    return { zone: position.zone, flank: position.flank };
}

function getActivePlayerIds(playerPositions: PlayerPositions): PlayerId[] {
    return PLAYER_IDS.filter((playerId): playerId is PlayerId => playerPositions[playerId] !== undefined);
}

function createSpitDeclaration(): AttackDeclaration {
    return {
        type: 'spit',
        affectedZones: [
            { zone: 'mid', flank: 'left' },
            { zone: 'mid', flank: 'center' },
            { zone: 'mid', flank: 'right' },
        ],
        qteType: 'timing',
        damage: 4,
    };
}

function createBiteDeclaration(target: Position): AttackDeclaration {
    return {
        type: 'bite',
        affectedZones: [clonePosition(target)],
        qteType: 'smash',
        damage: 6,
    };
}

export class DilophosaurusAI {
    private readonly weakPointThresholds: Record<WeakPoint, number>;

    constructor(options: { weakPointThresholds?: Partial<Record<WeakPoint, number>> } = {}) {
        this.weakPointThresholds = {
            head: options.weakPointThresholds?.head ?? DEFAULT_WEAK_POINT_THRESHOLDS.head,
            legs: options.weakPointThresholds?.legs ?? DEFAULT_WEAK_POINT_THRESHOLDS.legs,
        };
    }

    selectTelegraph(playerPositions: PlayerPositions): AttackDeclaration {
        const zoneCounts = new Map<string, { count: number; firstPlayerId: PlayerId }>();

        for (const playerId of getActivePlayerIds(playerPositions)) {
            const position = playerPositions[playerId];
            if (!position) {
                continue;
            }
            const existing = zoneCounts.get(position.zone);

            if (existing) {
                existing.count += 1;
            } else {
                zoneCounts.set(position.zone, { count: 1, firstPlayerId: playerId });
            }
        }

        const sharedZone = [...zoneCounts.entries()]
            .find(([, details]) => details.count >= 2);

        if (sharedZone) {
            return createSpitDeclaration();
        }

        const closePlayers = getActivePlayerIds(playerPositions)
            .filter((playerId) => playerPositions[playerId]?.zone === 'close');

        if (closePlayers.length > 0) {
            return createBiteDeclaration(playerPositions[closePlayers[0]]!);
        }

        const firstPlayerId = getActivePlayerIds(playerPositions)[0];

        if (firstPlayerId === undefined) {
            return createBiteDeclaration({ zone: 'close', flank: 'center' });
        }

        return createBiteDeclaration(playerPositions[firstPlayerId]!);
    }

    getWeakPointThresholds(): Record<WeakPoint, number> {
        return {
            head: this.weakPointThresholds.head,
            legs: this.weakPointThresholds.legs,
        };
    }
}
