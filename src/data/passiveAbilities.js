/**
 * Passive Ability definitions for cave bar shop
 *
 * Abilities provide permanent buffs for the entire session.
 * Players can purchase multiple abilities and they stack.
 */

export const passiveAbilities = [
    {
        id: 'thick-hide',
        name: 'Thick Hide',
        description: 'Tough skin provides extra protection. +1 hit before downed.',
        price: 150,
        icon: '🛡️',
        effect: {
            type: 'health',
            value: 1 // +1 max health
        }
    },
    {
        id: 'swift-feet',
        name: 'Swift Feet',
        description: 'Lighter on your feet. Dodge cooldown: 3s → 2s.',
        price: 100,
        icon: '⚡',
        effect: {
            type: 'dodge-cooldown',
            value: 2000 // Reduce to 2 seconds (from 3)
        }
    },
    {
        id: 'hunters-eye',
        name: "Hunter's Eye",
        description: 'Improved aim and focus. Weak point hitboxes +30% larger.',
        price: 150,
        icon: '👁️',
        effect: {
            type: 'weak-point-size',
            value: 1.3 // 30% larger hitboxes
        }
    },
    {
        id: 'pack-leader',
        name: 'Pack Leader',
        description: 'Natural leader and protector. Revive speed +50%, bonus damage.',
        price: 100,
        icon: '🤝',
        effect: {
            type: 'support',
            reviveSpeed: 1.5, // 50% faster
            bonusDamage: 1.2 // 20% bonus damage after being revived
        }
    },
    {
        id: 'scavenger',
        name: 'Scavenger',
        description: 'Expert at salvaging resources. +25% bonus points.',
        price: 200,
        icon: '💎',
        effect: {
            type: 'points',
            value: 1.25 // 25% point multiplier
        }
    }
];

/**
 * Get ability by ID
 * @param {string} abilityId - Ability identifier
 * @returns {Object|null} Ability data or null if not found
 */
export function getAbility(abilityId) {
    return passiveAbilities.find(a => a.id === abilityId) || null;
}

/**
 * Get affordable abilities for player's current points
 * @param {number} points - Player's available points
 * @returns {Array} Abilities player can afford
 */
export function getAffordableAbilities(points) {
    return passiveAbilities.filter(a => a.price <= points);
}

/**
 * Apply ability effect to player
 * @param {Player} player - Player entity
 * @param {Object} ability - Ability definition
 */
export function applyAbilityEffect(player, ability) {
    const effect = ability.effect;

    switch (effect.type) {
        case 'health':
            player.maxHealth += effect.value;
            player.health = Math.min(player.health + effect.value, player.maxHealth);
            console.log(`${player.playerNumber}: Max health increased to ${player.maxHealth}`);
            break;

        case 'dodge-cooldown':
            player.dodgeCooldownTime = effect.value;
            console.log(`${player.playerNumber}: Dodge cooldown reduced to ${effect.value}ms`);
            break;

        case 'weak-point-size':
            player.weakPointSizeMultiplier = effect.value;
            console.log(`${player.playerNumber}: Weak point hitboxes increased by ${(effect.value - 1) * 100}%`);
            break;

        case 'support':
            player.reviveSpeedMultiplier = effect.reviveSpeed;
            player.revivedDamageBonus = effect.bonusDamage;
            console.log(`${player.playerNumber}: Support abilities enhanced`);
            break;

        case 'points':
            player.pointsMultiplier = effect.value;
            console.log(`${player.playerNumber}: Points multiplier set to ${effect.value}x`);
            break;

        default:
            console.warn(`Unknown ability effect type: ${effect.type}`);
    }
}
