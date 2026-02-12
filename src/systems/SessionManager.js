/**
 * Session Manager
 *
 * Manages game session flow between hunt scenes and cave bar.
 * Tracks player progression, scores, and loadouts across multiple hunts.
 */

export default class SessionManager {
    constructor() {
        // Session state
        this.currentHunt = 1;
        this.totalHunts = 5;
        this.defeatedDinosaurs = [];

        // Player data (4 players)
        this.playerData = [
            this.createPlayerData(0),
            this.createPlayerData(1),
            this.createPlayerData(2),
            this.createPlayerData(3)
        ];
    }

    /**
     * Create initial player data
     */
    createPlayerData(playerIndex) {
        return {
            playerIndex,
            score: 0,
            weapon: 'stone-spear',
            passiveAbilities: [],
            cocktailBuffs: [],
            health: 2,
            maxHealth: 2
        };
    }

    /**
     * Save player state from a scene
     */
    savePlayerState(players) {
        players.forEach((player, index) => {
            if (this.playerData[index]) {
                this.playerData[index].score = player.score || 0;
                this.playerData[index].weapon = player.weapon || 'stone-spear';
                this.playerData[index].passiveAbilities = player.passiveAbilities || [];
                this.playerData[index].cocktailBuffs = player.cocktailBuffs || [];
                this.playerData[index].health = player.health || 2;
                this.playerData[index].maxHealth = player.maxHealth || 2;
            }
        });
    }

    /**
     * Load player state into a scene's players
     */
    loadPlayerState(players) {
        players.forEach((player, index) => {
            if (this.playerData[index]) {
                const data = this.playerData[index];
                player.score = data.score;
                player.weapon = data.weapon;
                player.passiveAbilities = [...data.passiveAbilities];
                player.cocktailBuffs = [...data.cocktailBuffs];
                player.health = data.health;
                player.maxHealth = data.maxHealth;

                // Apply passive ability effects
                // (These modify player stats based on owned abilities)
                this.applyPassiveAbilities(player);

                // Apply cocktail buffs
                this.applyCocktailBuffs(player);
            }
        });
    }

    /**
     * Apply passive ability effects to player
     */
    applyPassiveAbilities(player) {
        // Reset multipliers
        player.weakPointSizeMultiplier = 1.0;
        player.reviveSpeedMultiplier = 1.0;
        player.revivedDamageBonus = 1.0;
        player.pointsMultiplier = 1.0;

        // Apply each ability's effects
        player.passiveAbilities.forEach(abilityId => {
            switch (abilityId) {
                case 'thick-hide':
                    // Already applied to maxHealth
                    break;
                case 'swift-feet':
                    player.dodgeCooldownTime = 2000;
                    break;
                case 'hunters-eye':
                    player.weakPointSizeMultiplier = 1.3;
                    break;
                case 'pack-leader':
                    player.reviveSpeedMultiplier = 1.5;
                    player.revivedDamageBonus = 1.2;
                    break;
                case 'scavenger':
                    player.pointsMultiplier = 1.25;
                    break;
            }
        });
    }

    /**
     * Apply cocktail buff effects to player
     */
    applyCocktailBuffs(player) {
        // Reset buff multipliers
        player.moveSpeedMultiplier = 1.0;
        player.attackSpeedMultiplier = 1.0;
        player.hasRegeneration = false;
        player.damageBurstMultiplier = 1.0;
        player.damageBurstCharges = 0;
        player.shieldHits = 0;
        player.elementalEffect = null;

        // Apply each buff
        player.cocktailBuffs.forEach(buff => {
            const effect = buff.effect;

            switch (effect.type) {
                case 'movement-speed':
                    player.moveSpeedMultiplier *= effect.value;
                    break;
                case 'attack-speed':
                    player.attackSpeedMultiplier *= effect.value;
                    break;
                case 'regeneration':
                    player.hasRegeneration = true;
                    player.regenAmount = effect.value;
                    player.regenInterval = effect.interval;
                    break;
                case 'damage-burst':
                    player.damageBurstMultiplier = effect.multiplier;
                    player.damageBurstCharges = effect.charges;
                    break;
                case 'shield':
                    player.shieldHits += effect.value;
                    break;
                case 'elemental':
                    player.elementalEffect = effect.element;
                    break;
            }
        });
    }

    /**
     * Complete current hunt and record dinosaur defeat
     */
    completeHunt(dinosaurId) {
        this.defeatedDinosaurs.push(dinosaurId);
        console.log(`✅ Hunt ${this.currentHunt} complete! Defeated: ${dinosaurId}`);
    }

    /**
     * Advance to next hunt
     */
    nextHunt() {
        this.currentHunt++;

        // Clear cocktail buffs (they only last one hunt)
        this.playerData.forEach(data => {
            data.cocktailBuffs = [];
        });

        console.log(`🎯 Starting hunt ${this.currentHunt}/${this.totalHunts}`);
    }

    /**
     * Check if session is complete
     */
    isSessionComplete() {
        return this.currentHunt > this.totalHunts;
    }

    /**
     * Get current hunt number
     */
    getCurrentHunt() {
        return this.currentHunt;
    }

    /**
     * Get defeated dinosaurs list
     */
    getDefeatedDinosaurs() {
        return [...this.defeatedDinosaurs];
    }

    /**
     * Reset session
     */
    reset() {
        this.currentHunt = 1;
        this.defeatedDinosaurs = [];
        this.playerData = [
            this.createPlayerData(0),
            this.createPlayerData(1),
            this.createPlayerData(2),
            this.createPlayerData(3)
        ];
        console.log('🔄 Session reset');
    }
}

// Global session instance (shared across all scenes)
export const gameSession = new SessionManager();
