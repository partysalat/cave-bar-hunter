import { distance3D } from './PhysicsManager.js';

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

        const dist = distance3D(
            projectile.worldX, projectile.worldY, projectile.worldZ,
            weakPoint.worldX, weakPoint.worldY, weakPoint.worldZ
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
        const dist = distance3D(
            projectile.worldX, projectile.worldY, projectile.worldZ,
            dinosaur.worldX, dinosaur.worldY, dinosaur.worldZ
        );

        const hit = dist < (projectile.radius + dinosaur.radius);

        if (hit) {
            // Normal damage, no multiplier
            return { hit: true, damage: projectile.damage };
        }

        return { hit: false, damage: 0 };
    }
}
