import type { AttackDeclaration, PlayerId, Position } from '../../core/types.js';

type PlayerPositions = Partial<Record<PlayerId, Position>>;

const ZONE_ORDER: PlayerId[] = [0, 1, 2, 3];

function clonePosition(position: Position): Position {
    return { zone: position.zone, flank: position.flank };
}

export class AttackZoneResolver {
    getAffectedZones(attack: AttackDeclaration): Position[] {
        return attack.affectedZones.map(clonePosition);
    }

    getAffectedPlayers(attack: AttackDeclaration, playerPositions: PlayerPositions): PlayerId[] {
        const targetedPositions = new Set(
            attack.affectedZones.map((position) => `${position.zone}:${position.flank}`),
        );

        const matchingPlayers = ZONE_ORDER.filter((playerId) => {
            const position = playerPositions[playerId];
            if (!position) {
                return false;
            }

            return targetedPositions.has(`${position.zone}:${position.flank}`);
        });

        if (attack.type === 'bite' && matchingPlayers.length > 0) {
            return [matchingPlayers[0]];
        }

        return matchingPlayers;
    }
}
