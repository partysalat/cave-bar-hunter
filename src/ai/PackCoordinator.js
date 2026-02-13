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
     * Schedules coordinated attack patterns based on compy positioning
     */
    scheduleCoordinatedAttacks() {
        // Group compys by target (only those ready to attack)
        const targetGroups = new Map();

        for (const compy of this.compys) {
            if (!compy.ai) continue;
            if (compy.ai.state !== 'CIRCLING') continue;
            if (compy.ai.attackCooldown > 0) continue;

            const target = compy.ai.target;
            if (!target) continue;

            if (!targetGroups.has(target)) {
                targetGroups.set(target, []);
            }
            targetGroups.get(target).push(compy);
        }

        // Schedule patterns for each target group
        for (const [target, compys] of targetGroups) {
            if (compys.length >= 3) {
                // Swarm attack with 3+ compys
                this.scheduleSwarmAttack(compys, target);
            } else if (compys.length >= 2) {
                // Pincer attack with 2 compys (if positioned correctly)
                this.schedulePincerAttack(compys, target);
            }
        }
    }

    /**
     * Schedules a pincer attack pattern
     * @param {Array<Object>} compys - Array of 2+ compys
     * @param {Object} target - Target player
     */
    schedulePincerAttack(compys, target) {
        // Verify 2 compys are on opposite sides (>90° apart)
        if (compys.length < 2) return;

        const compy1 = compys[0];
        const compy2 = compys[1];

        // Calculate angles from target to each compy
        const angle1 = Math.atan2(
            compy1.worldY - target.worldY,
            compy1.worldX - target.worldX
        );
        const angle2 = Math.atan2(
            compy2.worldY - target.worldY,
            compy2.worldX - target.worldX
        );

        // Calculate angle difference
        let angleDiff = Math.abs(angle1 - angle2);
        if (angleDiff > Math.PI) {
            angleDiff = 2 * Math.PI - angleDiff;
        }

        // Need at least 90° separation (π/2 radians)
        if (angleDiff < Math.PI / 2) {
            return;
        }

        // Create pincer pattern
        this.attackPatterns.push({
            type: 'pincer',
            compys: [compy1, compy2],
            target: target,
            startTime: 0,
            triggered: false,
            nextTriggerTime: 0,
            completed: false
        });
    }

    /**
     * Schedules a swarm attack pattern
     * @param {Array<Object>} compys - Array of 3+ compys
     * @param {Object} target - Target player
     */
    scheduleSwarmAttack(compys, target) {
        this.attackPatterns.push({
            type: 'swarm',
            compys: compys.slice(0, 3), // Take first 3
            target: target,
            startTime: 0,
            triggerIndex: 0,
            completed: false
        });
    }

    /**
     * Processes ongoing attack patterns
     * @param {number} dt - Delta time in seconds
     */
    processAttackPatterns(dt) {
        // Increment pattern timers
        for (const pattern of this.attackPatterns) {
            pattern.startTime += dt;
        }

        // Process each pattern
        for (const pattern of this.attackPatterns) {
            if (pattern.completed) continue;

            if (pattern.type === 'pincer') {
                this.processPincerPattern(pattern);
            } else if (pattern.type === 'swarm') {
                this.processSwarmPattern(pattern);
            }
        }

        // Remove completed patterns
        this.attackPatterns = this.attackPatterns.filter(p => !p.completed);
    }

    /**
     * Processes a pincer attack pattern
     * @param {Object} pattern - Pincer pattern object
     */
    processPincerPattern(pattern) {
        // First trigger: immediately
        if (pattern.nextTriggerTime === 0 && !pattern.triggered) {
            if (pattern.compys[0].ai) {
                pattern.compys[0].ai.transitionToLunging();
            }
            pattern.nextTriggerTime = 0.5;
            return;
        }

        // Second trigger: at 0.5s
        if (pattern.startTime >= pattern.nextTriggerTime && !pattern.triggered) {
            if (pattern.compys[1].ai) {
                pattern.compys[1].ai.transitionToLunging();
            }
            pattern.triggered = true;
            pattern.completed = true;
        }
    }

    /**
     * Processes a swarm attack pattern
     * @param {Object} pattern - Swarm pattern object
     */
    processSwarmPattern(pattern) {
        // Trigger compys at 0.3s intervals
        const triggerTime = pattern.triggerIndex * 0.3;

        if (pattern.startTime >= triggerTime && pattern.triggerIndex < pattern.compys.length) {
            const compy = pattern.compys[pattern.triggerIndex];
            if (compy.ai) {
                compy.ai.transitionToLunging();
            }
            pattern.triggerIndex++;
        }

        // Mark completed when all triggered
        if (pattern.triggerIndex >= pattern.compys.length) {
            pattern.completed = true;
        }
    }
}
