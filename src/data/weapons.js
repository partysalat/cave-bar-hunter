/**
 * Weapon definitions for the cave bar shop
 *
 * All weapons available for purchase between hunts.
 * Stats affect damage, fire rate, range, and special abilities.
 */

export const weapons = [
    {
        id: 'stone-spear',
        name: 'Stone Spear',
        description: 'Basic hunting spear. Reliable and free.',
        price: 0, // Free, starting weapon
        damage: 10,
        fireRate: 2.0, // seconds between attacks
        range: 8, // world units
        special: null
    },
    {
        id: 'sling',
        name: 'Sling',
        description: 'Fast ranged weapon. Lower damage, higher fire rate.',
        price: 150,
        damage: 6,
        fireRate: 1.0, // Fast attacks
        range: 10,
        special: null
    },
    {
        id: 'bone-club',
        name: 'Bone Club',
        description: 'Heavy melee weapon. High damage, close range.',
        price: 200,
        damage: 20,
        fireRate: 3.0, // Slow but powerful
        range: 3, // Melee range
        special: 'stun' // Has chance to stun
    },
    {
        id: 'net-launcher',
        name: 'Net Launcher',
        description: 'Traps dinosaurs temporarily. Great for team support.',
        price: 250,
        damage: 5,
        fireRate: 4.0, // Slow reload
        range: 7,
        special: 'slow' // Slows dinosaur movement
    },
    {
        id: 'fire-spear',
        name: 'Fire Spear',
        description: 'Enchanted spear with burning tips. Deals damage over time.',
        price: 300,
        damage: 15,
        fireRate: 2.5,
        range: 8,
        special: 'burn' // Applies burn effect
    }
];

/**
 * Get weapon by ID
 * @param {string} weaponId - Weapon identifier
 * @returns {Object|null} Weapon data or null if not found
 */
export function getWeapon(weaponId) {
    return weapons.find(w => w.id === weaponId) || null;
}

/**
 * Get all weapons sorted by price
 * @returns {Array} Sorted weapon array
 */
export function getWeaponsSortedByPrice() {
    return [...weapons].sort((a, b) => a.price - b.price);
}

/**
 * Get affordable weapons for player's current points
 * @param {number} points - Player's available points
 * @returns {Array} Weapons player can afford
 */
export function getAffordableWeapons(points) {
    return weapons.filter(w => w.price <= points);
}
