export default class CombatSystem {
    constructor() {
        this.meleeRange = 1.7;
        this.meleeDamage = 3;
        this.enemyTouchDamage = 1;
    }

    canHitMelee(player, target) {
        if (!player.canMelee()) return false;
        const dx = target.worldX - player.worldX;
        const dy = target.worldY - player.worldY;
        const withinFacing = Math.sign(dx || player.facing) === player.facing || Math.abs(dx) < 0.2;
        return withinFacing && Math.hypot(dx, dy) <= this.meleeRange;
    }

    tryMeleeHit(player, target) {
        if (!this.canHitMelee(player, target)) {
            return { hit: false, damage: 0 };
        }

        player.startMeleeAttack();
        target.takeDamage(this.meleeDamage);
        player.addScore(this.meleeDamage);
        return { hit: true, damage: this.meleeDamage };
    }

    checkProjectileHit(projectile, target) {
        const dx = projectile.worldX - target.worldX;
        const dy = projectile.worldY - target.worldY;
        const hitWidth = target.width / 2 + projectile.radius;
        const hitHeight = target.height / 2 + projectile.radius;
        return Math.abs(dx) <= hitWidth && Math.abs(dy - target.height / 2) <= hitHeight;
    }

    tryEnemyTouchAttack(enemy, player) {
        const dx = player.worldX - enemy.worldX;
        const dy = player.worldY - enemy.worldY;
        if (!enemy.canAttack() || Math.hypot(dx, dy) > enemy.attackRange) {
            return false;
        }

        const damaged = player.takeDamage(this.enemyTouchDamage);
        if (damaged) {
            enemy.spendAttack();
        }
        return damaged;
    }
}
