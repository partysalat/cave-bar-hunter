import { distance2D } from './PhysicsManager.js';

// Club attack constants
const CLUB_ATTACK_RANGE = 2.5; // World units
const CLUB_ATTACK_CONE_DEGREES = 60; // Total arc angle
const CLUB_BASE_DAMAGE = 15;

/**
 * Combat system - damage calculations, hit detection, scoring
 */
export default class CombatSystem {
    constructor() {
        // Can add buffs/modifiers here later
    }

    /**
     * Check if projectile hits weak point
     * @param {Projectile} projectile
     * @param {WeakPoint} weakPoint
     * @returns {Object} {hit: boolean, damage: number}
     */
    checkProjectileHit(projectile, weakPoint) {
        if (weakPoint.isBroken) {
            return { hit: false, damage: 0 };
        }

        const dist = distance2D(
            projectile.worldX, projectile.worldY,
            weakPoint.worldX, weakPoint.worldY
        );

        const hit = dist < (projectile.radius + weakPoint.radius);

        if (hit) {
            // Calculate damage with weak point multiplier
            const damage = projectile.damage * weakPoint.damageMultiplier;
            return { hit: true, damage };
        }

        return { hit: false, damage: 0 };
    }

    /**
     * Check if projectile hits dinosaur body (not weak point)
     * @param {Projectile} projectile
     * @param {Dinosaur} dinosaur
     * @returns {Object} {hit: boolean, damage: number}
     */
    checkProjectileHitDinosaur(projectile, dinosaur) {
        const dist = distance2D(
            projectile.worldX, projectile.worldY,
            dinosaur.worldX, dinosaur.worldY
        );

        const hit = dist < (projectile.radius + dinosaur.radius);

        if (hit) {
            // Normal damage, no multiplier
            return { hit: true, damage: projectile.damage };
        }

        return { hit: false, damage: 0 };
    }

    /**
     * Check if club attack hits enemy
     * @param {Player} player - Attacking player
     * @param {Object} target - Enemy with worldX, worldY, id
     * @returns {Object} {hit: boolean, damage: number}
     */
    checkClubHit(player, target) {
        // 1. Verify player is in swing phase
        if (player.attackPhase !== 'swing') {
            return { hit: false, damage: 0 };
        }

        // 2. Check if already hit this swing
        if (player.hitEnemiesThisSwing.includes(target.id)) {
            return { hit: false, damage: 0 };
        }

        // 3. Check distance
        const dx = target.worldX - player.worldX;
        const dy = target.worldY - player.worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > CLUB_ATTACK_RANGE) {
            return { hit: false, damage: 0 };
        }

        // 4. Check if in attack cone
        const angleToTarget = Math.atan2(dy, dx);
        const facingAngle = Math.atan2(player.facingY, player.facingX);
        let angleDiff = Math.abs(angleToTarget - facingAngle);

        // Normalize angle difference to 0-180°
        if (angleDiff > Math.PI) {
            angleDiff = 2 * Math.PI - angleDiff;
        }

        const maxAngleDiff = (CLUB_ATTACK_CONE_DEGREES / 2) * (Math.PI / 180);

        if (angleDiff > maxAngleDiff) {
            return { hit: false, damage: 0 };
        }

        // 5. Hit confirmed
        return { hit: true, damage: CLUB_BASE_DAMAGE };
    }
}
