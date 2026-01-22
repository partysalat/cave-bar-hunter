/**
 * HUD (Heads-Up Display) for showing game state
 */
export default class HUD {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;

        // Create UI elements
        this.createPlayerHUD();
        this.createDinosaurHealthBar();
    }

    /**
     * Create player health and score display (top-left)
     */
    createPlayerHUD() {
        // Player 1 display (can expand to 4 players later)
        this.playerText = this.scene.add.text(20, 20, '', {
            font: '24px Arial',
            fill: '#ff0000', // Red for player 1
            stroke: '#000000',
            strokeThickness: 4
        });
        this.playerText.setDepth(10000);
        this.playerText.setScrollFactor(0); // Fixed to camera
    }

    /**
     * Create dinosaur health bar (top-center)
     */
    createDinosaurHealthBar() {
        const centerX = 1280; // Screen center (2K resolution)
        const y = 50;
        const width = 600;
        const height = 30;

        // Background bar
        this.healthBarBg = this.scene.add.rectangle(
            centerX, y, width, height, 0x333333
        );
        this.healthBarBg.setDepth(10000);
        this.healthBarBg.setScrollFactor(0);

        // Foreground (actual health)
        this.healthBarFg = this.scene.add.rectangle(
            centerX, y, width, height, 0xff0000
        );
        this.healthBarFg.setDepth(10001);
        this.healthBarFg.setScrollFactor(0);

        // Dinosaur name text
        this.dinoNameText = this.scene.add.text(centerX, y - 40, '', {
            font: 'bold 28px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.dinoNameText.setOrigin(0.5, 0.5);
        this.dinoNameText.setDepth(10002);
        this.dinoNameText.setScrollFactor(0);
    }

    /**
     * Update player display
     * @param {Player} player
     * @param {number} score
     */
    updatePlayer(player, score) {
        const hearts = '❤'.repeat(player.health) + '🖤'.repeat(player.maxHealth - player.health);

        let text = `P1: ${hearts}\nScore: ${score}`;

        if (player.isDodging) {
            text += '\n[DODGING]';
        }

        if (player.perfectDodgeBuff > 0) {
            text += `\n[POWER: ${(player.perfectDodgeBuff / 1000).toFixed(1)}s]`;
        }

        this.playerText.setText(text);
    }

    /**
     * Update dinosaur health bar
     * @param {Dinosaur} dinosaur
     */
    updateDinosaur(dinosaur) {
        if (!dinosaur || dinosaur.isDead) {
            this.healthBarBg.setVisible(false);
            this.healthBarFg.setVisible(false);
            this.dinoNameText.setVisible(false);
            return;
        }

        this.healthBarBg.setVisible(true);
        this.healthBarFg.setVisible(true);
        this.dinoNameText.setVisible(true);

        // Update name
        this.dinoNameText.setText(dinosaur.type.toUpperCase());

        // Update health bar width
        const healthPercent = dinosaur.health / dinosaur.maxHealth;
        const maxWidth = 600;
        this.healthBarFg.width = maxWidth * healthPercent;

        // Shift position since rectangle grows from center
        const centerX = 1280;
        this.healthBarFg.x = centerX - (maxWidth / 2) + (this.healthBarFg.width / 2);

        // Color based on health
        if (healthPercent > 0.5) {
            this.healthBarFg.setFillStyle(0x00ff00); // Green
        } else if (healthPercent > 0.25) {
            this.healthBarFg.setFillStyle(0xffff00); // Yellow
        } else {
            this.healthBarFg.setFillStyle(0xff0000); // Red
        }
    }

    /**
     * Update HUD each frame
     * @param {Player} player
     * @param {number} score
     * @param {Dinosaur} dinosaur
     */
    update(player, score, dinosaur) {
        this.updatePlayer(player, score);
        this.updateDinosaur(dinosaur);
    }
}
