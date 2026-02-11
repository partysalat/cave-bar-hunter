/**
 * Scoreboard Display UI
 *
 * Shows current hunt progress and player rankings.
 * Positioned on the cave wall for all players to see.
 */
export default class ScoreboardDisplay {
    /**
     * @param {Phaser.Scene} scene - The scene
     * @param {number} screenX - Screen X position
     * @param {number} screenY - Screen Y position
     * @param {Array} players - Array of player entities
     * @param {number} currentHunt - Current hunt number (1-5)
     */
    constructor(scene, screenX, screenY, players, currentHunt = 1) {
        this.scene = scene;
        this.players = players;
        this.currentHunt = currentHunt;

        // Create UI
        this.createUI(screenX, screenY);
    }

    /**
     * Create the scoreboard UI
     */
    createUI(x, y) {
        const scene = this.scene;

        // Container for scoreboard
        this.container = scene.add.container(x, y);
        this.container.setDepth(40000); // High depth to ensure visibility above all game elements

        // Background panel
        const panelWidth = 250;
        const panelHeight = 200;

        const panel = scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x2a1810, 0.9);
        this.container.add(panel);

        // Border
        const border = scene.add.rectangle(0, 0, panelWidth, panelHeight, 0xffffff, 0);
        border.setStrokeStyle(3, 0xd4a574);
        this.container.add(border);

        // Title
        const title = scene.add.text(0, -80, 'SCOREBOARD', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#d4a574',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        this.container.add(title);

        // Hunt progress
        this.huntText = scene.add.text(0, -55, `Hunt ${this.currentHunt}/5`, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        this.huntText.setOrigin(0.5);
        this.container.add(this.huntText);

        // Player rankings
        this.createPlayerRankings();

        console.log('✅ Scoreboard display created');
    }

    /**
     * Create player ranking list
     */
    createPlayerRankings() {
        const playerColors = ['#ff4444', '#4444ff', '#ffff44', '#44ff44']; // Red, blue, yellow, green
        const playerLabels = ['RED', 'BLUE', 'YELLOW', 'GREEN'];

        // Sort players by score (highest first)
        const sortedPlayers = [...this.players]
            .map((player, index) => ({ player, index }))
            .sort((a, b) => b.player.score - a.player.score);

        this.playerRankTexts = [];

        sortedPlayers.forEach((entry, rank) => {
            const player = entry.player;
            const playerIndex = entry.index;
            const yPos = -25 + rank * 30;

            // Rank indicator
            const rankText = this.scene.add.text(-100, yPos, `${rank + 1}.`, {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#999999',
                fontStyle: 'bold'
            });
            this.container.add(rankText);

            // MVP crown for first place
            if (rank === 0) {
                const crown = this.scene.add.text(-115, yPos, '👑', {
                    fontSize: '16px'
                });
                this.container.add(crown);
            }

            // Player color indicator
            const colorDot = this.scene.add.circle(-70, yPos, 8, parseInt(playerColors[playerIndex].substring(1), 16));
            this.container.add(colorDot);

            // Player label
            const label = this.scene.add.text(-55, yPos, playerLabels[playerIndex], {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: playerColors[playerIndex],
                fontStyle: 'bold'
            });
            label.setOrigin(0, 0.5);
            this.container.add(label);

            // Score
            const scoreText = this.scene.add.text(90, yPos, `${player.score}`, {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            });
            scoreText.setOrigin(1, 0.5);
            this.container.add(scoreText);

            this.playerRankTexts.push({
                rank: rankText,
                label,
                score: scoreText,
                playerIndex
            });
        });
    }

    /**
     * Update scoreboard with latest scores
     */
    update() {
        // Destroy old ranking texts
        this.playerRankTexts.forEach(item => {
            item.rank.destroy();
            item.label.destroy();
            item.score.destroy();
        });
        this.playerRankTexts = [];

        // Remove crown if it exists
        this.container.list.forEach(child => {
            if (child.text === '👑') {
                child.destroy();
            }
        });

        // Recreate with updated scores
        this.createPlayerRankings();
    }

    /**
     * Set current hunt number
     */
    setHunt(huntNumber) {
        this.currentHunt = huntNumber;
        if (this.huntText) {
            this.huntText.setText(`Hunt ${this.currentHunt}/5`);
        }
    }

    /**
     * Destroy the scoreboard
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}
