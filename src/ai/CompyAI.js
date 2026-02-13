/**
 * CompyAI - AI controller for individual Compy dinosaurs
 *
 * State Machine:
 * - CIRCLING: Orbiting around pack center, looking for opening
 * - LUNGING: Rapid dash towards target player
 * - BITING: Brief pause at target to deal damage
 * - RETREATING: Moving back to pack after attack
 */
export default class CompyAI {
    /**
     * @param {Object} compy - The Compy entity this AI controls
     * @param {Array<Object>} allCompys - All Compys in the pack (for coordination)
     * @param {Array<Object>} players - All player entities in the scene
     */
    constructor(compy, allCompys, players) {
        // Entity references
        this.compy = compy;
        this.allCompys = allCompys;
        this.players = players;

        // State machine
        this.state = 'CIRCLING';
        this.target = null;
        this.stateTimer = 0;

        // Attack timing
        this.attackCooldown = 0;

        // Movement parameters
        this.orbitRadius = 4;
        this.orbitAngle = Math.random() * Math.PI * 2; // Random starting angle

        // Lunge tracking
        this.lungeDirX = 0;
        this.lungeDirY = 0;
    }

    /**
     * Updates AI state and behavior
     * @param {number} delta - Time elapsed in milliseconds
     */
    update(delta) {
        // Convert delta to seconds
        const deltaSeconds = delta / 1000;

        // Decrement attack cooldown (clamp to 0)
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaSeconds);

        // Increment state timer
        this.stateTimer += deltaSeconds;

        // Execute current state behavior
        switch (this.state) {
            case 'CIRCLING':
                this.updateCircling(deltaSeconds);
                break;
            case 'LUNGING':
                this.updateLunging(deltaSeconds);
                break;
            case 'BITING':
                this.updateBiting(deltaSeconds);
                break;
            case 'RETREATING':
                this.updateRetreating(deltaSeconds);
                break;
        }
    }

    /**
     * CIRCLING state: Orbit around pack center, look for attack opening
     * @param {number} dt - Delta time in seconds
     */
    updateCircling(dt) {
        // If no target or target is downed, select a new target
        if (!this.target || this.target.isDowned) {
            this.selectTarget();
        }

        // If still no target, stop moving
        if (!this.target) {
            this.compy.velocity.x = 0;
            this.compy.velocity.y = 0;
            return;
        }

        // Increment orbit angle
        this.orbitAngle += dt * 0.5;

        // Calculate desired position on orbit
        const desiredX = this.target.worldX + Math.cos(this.orbitAngle) * this.orbitRadius;
        const desiredY = this.target.worldY + Math.sin(this.orbitAngle) * this.orbitRadius;

        // Move toward desired position at 6 units/sec
        const dx = desiredX - this.compy.worldX;
        const dy = desiredY - this.compy.worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.compy.velocity.x = (dx / distance) * 6;
            this.compy.velocity.y = (dy / distance) * 6;
        }

        // Random attack: 2% chance per frame if cooldown is ready
        if (this.attackCooldown <= 0 && Math.random() < 0.02) {
            this.transitionToLunging();
        }
    }

    /**
     * LUNGING state: Rapid dash towards target player
     * @param {number} dt - Delta time in seconds
     */
    updateLunging(dt) {
        // If no target, return to circling
        if (!this.target) {
            this.transitionToCircling();
            return;
        }

        // Telegraph phase (first 0.5 seconds)
        if (this.stateTimer < 0.5) {
            // Freeze in place
            this.compy.velocity.x = 0;
            this.compy.velocity.y = 0;

            // Store direction to target (normalized)
            const dx = this.target.worldX - this.compy.worldX;
            const dy = this.target.worldY - this.compy.worldY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                this.lungeDirX = dx / distance;
                this.lungeDirY = dy / distance;
            }
        } else {
            // Charge phase - dash at 12 units/sec in stored direction
            this.compy.velocity.x = this.lungeDirX * 12;
            this.compy.velocity.y = this.lungeDirY * 12;

            // Check if reached target
            const distToTarget = this.getDistanceTo(this.target);
            if (distToTarget <= 0.5) {
                this.transitionToBiting();
                return;
            }

            // Check for timeout (1.0 seconds total)
            if (this.stateTimer >= 1.0) {
                this.transitionToRetreating();
                return;
            }
        }
    }

    /**
     * BITING state: Brief pause at target to deal damage
     * @param {number} dt - Delta time in seconds
     */
    updateBiting(dt) {
        // Freeze velocity
        this.compy.velocity.x = 0;
        this.compy.velocity.y = 0;

        // Deal damage on first frame only (stateTimer < dt means this is the first call)
        if (this.stateTimer < dt && this.target) {
            // Check if target is alive and in range
            if (!this.target.isDowned && !this.target.isDead) {
                const distToTarget = this.getDistanceTo(this.target);
                if (distToTarget <= 0.5) {
                    this.target.takeDamage(0.5);
                }
            }
        }

        // Transition after 0.5 seconds
        if (this.stateTimer >= 0.5) {
            this.attackCooldown = 2.0;
            this.transitionToRetreating();
        }
    }

    /**
     * RETREATING state: Move back to pack after attack
     * @param {number} dt - Delta time in seconds
     */
    updateRetreating(dt) {
        // If no target, freeze and return to circling
        if (!this.target) {
            this.compy.velocity.x = 0;
            this.compy.velocity.y = 0;
            this.transitionToCircling();
            return;
        }

        // Move away from target at 4 units/sec
        const dx = this.compy.worldX - this.target.worldX;
        const dy = this.compy.worldY - this.target.worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.compy.velocity.x = (dx / distance) * 4;
            this.compy.velocity.y = (dy / distance) * 4;
        }

        // Transition back to circling after 2.5 seconds
        if (this.stateTimer >= 2.5) {
            this.transitionToCircling();
        }
    }

    /**
     * Select the closest alive player as target
     * @returns {Object|null} Target player or null if none available
     */
    selectTarget() {
        const alivePlayers = this.players.filter(p => !p.isDowned && !p.isDead);

        if (alivePlayers.length === 0) {
            this.target = null;
            return null;
        }

        // Find closest player
        let closest = alivePlayers[0];
        let closestDist = this.getDistanceTo(closest);

        for (let i = 1; i < alivePlayers.length; i++) {
            const dist = this.getDistanceTo(alivePlayers[i]);
            if (dist < closestDist) {
                closest = alivePlayers[i];
                closestDist = dist;
            }
        }

        this.target = closest;
        return closest;
    }

    /**
     * Calculate 2D distance to another entity
     * @param {Object} entity - Entity with worldX, worldY properties
     * @returns {number} Distance in world units
     */
    getDistanceTo(entity) {
        const dx = entity.worldX - this.compy.worldX;
        const dy = entity.worldY - this.compy.worldY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Transition to LUNGING state
     */
    transitionToLunging() {
        this.state = 'LUNGING';
        this.stateTimer = 0;
        console.log('Compy transitioning to LUNGING');
    }

    /**
     * Transition to CIRCLING state
     */
    transitionToCircling() {
        this.state = 'CIRCLING';
        this.stateTimer = 0;
    }

    /**
     * Transition to BITING state
     */
    transitionToBiting() {
        this.state = 'BITING';
        this.stateTimer = 0;
        console.log('Compy transitioning to BITING');
    }

    /**
     * Transition to RETREATING state
     */
    transitionToRetreating() {
        this.state = 'RETREATING';
        this.stateTimer = 0;
        console.log('Compy transitioning to RETREATING');
    }

    /**
     * Check if compy is in telegraph phase (warning before charge)
     * @returns {boolean}
     */
    isTelegraphing() {
        return this.state === 'LUNGING' && this.stateTimer < 0.5;
    }

    /**
     * Check if compy is charging (moving towards target)
     * @returns {boolean}
     */
    isCharging() {
        return this.state === 'LUNGING' && this.stateTimer >= 0.5;
    }
}
