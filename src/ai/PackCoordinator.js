/**
 * PackCoordinator - Manages group tactics for a pack of Compy dinosaurs
 *
 * Coordinates multiple Compy AIs to execute pack hunting behaviors:
 * - Target prioritization (isolated/low-health players)
 * - Coordinated attack patterns (pincer, swarm)
 * - Dynamic threat assessment
 */
export default class PackCoordinator {
    /**
     * @param {Array<Object>} compys - All Compy entities in the pack
     * @param {Array<Object>} players - All player entities
     */
    constructor(compys, players) {
        // Entity references
        this.compys = compys;
        this.players = players;

        // Coordinated attack patterns
        this.attackPatterns = [];

        // Coordination timing
        this.coordinationTimer = 2.0;
        this.coordinationInterval = 2.0;
    }

    /**
     * Updates pack coordination and attack patterns
     * @param {number} delta - Time elapsed in milliseconds
     */
    update(delta) {
        // Convert delta to seconds
        const deltaSeconds = delta / 1000;

        // Decrement coordination timer
        this.coordinationTimer -= deltaSeconds;

        // Analyze and coordinate when timer expires
        if (this.coordinationTimer <= 0) {
            this.analyzeAndCoordinate();
            this.coordinationTimer = this.coordinationInterval;
        }

        // Process ongoing attack patterns
        this.processAttackPatterns(deltaSeconds);
    }

    /**
     * Analyzes current situation and coordinates pack behavior
     */
    analyzeAndCoordinate() {
        // Assign targets based on priorities
        this.assignTargets();

        // Schedule coordinated attacks
        this.scheduleCoordinatedAttacks();
    }

    /**
     * Identifies priority targets (isolated and low-health players)
     * @returns {Object} Object with isolated and lowHealth arrays
     */
    getPriorityTargets() {
        const alivePlayers = this.players.filter(p => !p.isDowned && !p.isDead);
        const isolated = [];
        const lowHealth = [];

        for (const player of alivePlayers) {
            // Check if low-health (health <= 1)
            if (player.health <= 1) {
                lowHealth.push(player);
            }

            // Check if isolated (>5 units from all other alive players)
            let isIsolated = true;
            for (const otherPlayer of alivePlayers) {
                if (player === otherPlayer) continue;

                const dx = player.worldX - otherPlayer.worldX;
                const dy = player.worldY - otherPlayer.worldY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= 5) {
                    isIsolated = false;
                    break;
                }
            }

            if (isIsolated) {
                isolated.push(player);
            }
        }

        return { isolated, lowHealth };
    }

    /**
     * Assigns targets to compys based on priorities
     * Priority order: isolated players (2-3 compys), low-health players (2 compys), spread rest evenly
     */
    assignTargets() {
        const alivePlayers = this.players.filter(p => !p.isDowned && !p.isDead);

        // No alive players - nothing to assign
        if (alivePlayers.length === 0) {
            return;
        }

        const priorities = this.getPriorityTargets();
        let availableCompys = [...this.compys];

        // Assign 2-3 compys to each isolated player (high priority)
        for (const isolatedPlayer of priorities.isolated) {
            const numToAssign = Math.min(3, Math.max(2, Math.floor(Math.random() * 2) + 2));
            const assignedCompys = availableCompys.splice(0, numToAssign);
            assignedCompys.forEach(compy => {
                if (compy.ai) {
                    compy.ai.target = isolatedPlayer;
                }
            });
        }

        // Assign 2 compys to each low-health player (medium priority)
        for (const lowHealthPlayer of priorities.lowHealth) {
            // Skip if already targeted as isolated
            if (priorities.isolated.includes(lowHealthPlayer)) continue;

            const numToAssign = Math.min(2, availableCompys.length);
            const assignedCompys = availableCompys.splice(0, numToAssign);
            assignedCompys.forEach(compy => {
                if (compy.ai) {
                    compy.ai.target = lowHealthPlayer;
                }
            });
        }

        // Spread remaining compys evenly across all players
        let playerIndex = 0;
        for (const compy of availableCompys) {
            if (compy.ai) {
                compy.ai.target = alivePlayers[playerIndex];
                playerIndex = (playerIndex + 1) % alivePlayers.length;
            }
        }
    }

    /**
     * Schedules coordinated attack patterns
     * TODO: Implement pattern scheduling logic
     */
    scheduleCoordinatedAttacks() {
        // Placeholder - to be implemented
    }

    /**
     * Processes ongoing attack patterns
     * @param {number} dt - Delta time in seconds
     * TODO: Implement pattern processing logic
     */
    processAttackPatterns(dt) {
        // Placeholder - to be implemented
    }
}
