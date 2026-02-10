/**
 * Cocktail definitions for cave bar
 *
 * Temporary buffs that last for the next hunt only.
 * Players can purchase up to 2 cocktails per hunt.
 */

export const cocktails = [
    {
        id: 'mammoth-mule',
        name: 'Mammoth Mule',
        description: 'Powerful brew increases your speed. +25% movement speed.',
        price: 50,
        icon: '🦣',
        effect: {
            type: 'movement-speed',
            value: 1.25 // 25% faster movement
        }
    },
    {
        id: 'raptor-rush',
        name: 'Raptor Rush',
        description: 'Quick reflexes and rapid strikes. +30% attack speed.',
        price: 75,
        icon: '🦖',
        effect: {
            type: 'attack-speed',
            value: 1.3 // 30% faster attacks
        }
    },
    {
        id: 'dino-daiquiri',
        name: 'Dino Daiquiri',
        description: 'Refreshing regenerative properties. Regenerate 1 HP every 10s.',
        price: 75,
        icon: '💚',
        effect: {
            type: 'regeneration',
            value: 1, // HP per tick
            interval: 10000 // Every 10 seconds
        }
    },
    {
        id: 'saber-slam',
        name: 'Saber Slam',
        description: 'Channel your inner predator. Next 3 attacks deal 2× damage.',
        price: 75,
        icon: '⚔️',
        effect: {
            type: 'damage-burst',
            multiplier: 2.0,
            charges: 3 // Lasts for 3 attacks
        }
    },
    {
        id: 'tar-pit-tonic',
        name: 'Tar Pit Tonic',
        description: 'Thick coating absorbs damage. Absorbs next hit (1-hit shield).',
        price: 75,
        icon: '🛡️',
        effect: {
            type: 'shield',
            value: 1 // Blocks 1 hit
        }
    },
    {
        id: 'volcano-mojito',
        name: 'Volcano Mojito',
        description: 'Fiery infusion ignites your weapons. All attacks apply burn effect.',
        price: 50,
        icon: '🔥',
        effect: {
            type: 'elemental',
            element: 'burn'
        }
    }
];

/**
 * Maximum cocktails allowed per player per hunt
 */
export const MAX_COCKTAILS_PER_HUNT = 2;

/**
 * Get cocktail by ID
 * @param {string} cocktailId - Cocktail identifier
 * @returns {Object|null} Cocktail data or null if not found
 */
export function getCocktail(cocktailId) {
    return cocktails.find(c => c.id === cocktailId) || null;
}

/**
 * Get affordable cocktails for player's current points
 * @param {number} points - Player's available points
 * @returns {Array} Cocktails player can afford
 */
export function getAffordableCocktails(points) {
    return cocktails.filter(c => c.price <= points);
}

/**
 * Apply cocktail effect to player
 * @param {Player} player - Player entity
 * @param {Object} cocktail - Cocktail definition
 */
export function applyCocktailEffect(player, cocktail) {
    if (!player.cocktailBuffs) {
        player.cocktailBuffs = [];
    }

    const effect = cocktail.effect;

    // Add to player's active buffs
    player.cocktailBuffs.push({
        cocktailId: cocktail.id,
        name: cocktail.name,
        effect: effect
    });

    // Apply immediate stat modifications
    switch (effect.type) {
        case 'movement-speed':
            player.moveSpeedMultiplier = (player.moveSpeedMultiplier || 1.0) * effect.value;
            console.log(`${player.playerNumber}: Movement speed increased to ${player.moveSpeedMultiplier}x`);
            break;

        case 'attack-speed':
            player.attackSpeedMultiplier = (player.attackSpeedMultiplier || 1.0) * effect.value;
            console.log(`${player.playerNumber}: Attack speed increased to ${player.attackSpeedMultiplier}x`);
            break;

        case 'regeneration':
            player.hasRegeneration = true;
            player.regenAmount = effect.value;
            player.regenInterval = effect.interval;
            console.log(`${player.playerNumber}: Regeneration active (${effect.value}HP/${effect.interval}ms)`);
            break;

        case 'damage-burst':
            player.damageBurstMultiplier = effect.multiplier;
            player.damageBurstCharges = effect.charges;
            console.log(`${player.playerNumber}: Damage burst active (${effect.multiplier}x for ${effect.charges} attacks)`);
            break;

        case 'shield':
            player.shieldHits = (player.shieldHits || 0) + effect.value;
            console.log(`${player.playerNumber}: Shield active (${player.shieldHits} hits)`);
            break;

        case 'elemental':
            player.elementalEffect = effect.element;
            console.log(`${player.playerNumber}: Elemental effect active (${effect.element})`);
            break;

        default:
            console.warn(`Unknown cocktail effect type: ${effect.type}`);
    }
}

/**
 * Check if player has reached cocktail limit
 * @param {Player} player - Player entity
 * @returns {boolean} True if at limit
 */
export function hasReachedCocktailLimit(player) {
    if (!player.cocktailBuffs) {
        player.cocktailBuffs = [];
    }
    return player.cocktailBuffs.length >= MAX_COCKTAILS_PER_HUNT;
}
