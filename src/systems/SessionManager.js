export default class SessionManager {
    constructor() {
        this.totalHunts = 5;
        this.reset();
    }

    reset() {
        this.sessionState = 'idle';
        this.currentHunt = 1;
        this.huntsCompleted = 0;
        this.playerData = [
            {
                score: 0,
                health: 3,
                maxHealth: 3,
                meleeDamage: 3,
                throwDamage: 2,
                moveSpeedMultiplier: 1,
                dodgeCooldownMultiplier: 1,
                upgrades: {
                    weapon: false,
                    painting: false,
                    drink: false,
                },
            },
        ];
    }

    startNewSession() {
        this.reset();
        this.sessionState = 'active';
    }

    loadPlayerState(players) {
        players.forEach((player, index) => {
            const data = this.playerData[index];
            if (!data) return;
            player.score = data.score;
            player.health = data.health;
            player.maxHealth = data.maxHealth;
            player.meleeDamage = data.meleeDamage;
            player.throwDamage = data.throwDamage;
            player.moveSpeedMultiplier = data.moveSpeedMultiplier;
            player.dodgeCooldownMultiplier = data.dodgeCooldownMultiplier;
        });
    }

    savePlayerState(players) {
        players.forEach((player, index) => {
            if (!this.playerData[index]) {
                this.playerData[index] = {
                    score: 0,
                    health: 3,
                    maxHealth: 3,
                    meleeDamage: 3,
                    throwDamage: 2,
                    moveSpeedMultiplier: 1,
                    dodgeCooldownMultiplier: 1,
                    upgrades: { weapon: false, painting: false, drink: false },
                };
            }

            this.playerData[index].score = player.score;
            this.playerData[index].health = player.health;
            this.playerData[index].maxHealth = player.maxHealth;
            this.playerData[index].meleeDamage = player.meleeDamage;
            this.playerData[index].throwDamage = player.throwDamage;
            this.playerData[index].moveSpeedMultiplier = player.moveSpeedMultiplier;
            this.playerData[index].dodgeCooldownMultiplier = player.dodgeCooldownMultiplier;
        });
    }

    completeHunt(players) {
        this.savePlayerState(players);
        this.huntsCompleted += 1;
        this.currentHunt += 1;
        this.playerData.forEach((player) => {
            player.health = player.maxHealth;
        });
        this.sessionState = this.isSessionComplete() ? 'victory' : 'active';
    }

    failHunt(players) {
        this.savePlayerState(players);
        this.sessionState = 'failure';
    }

    isSessionComplete() {
        return this.currentHunt > this.totalHunts;
    }

    getPlayerData(playerIndex = 0) {
        return this.playerData[playerIndex];
    }
}

export const gameSession = new SessionManager();
