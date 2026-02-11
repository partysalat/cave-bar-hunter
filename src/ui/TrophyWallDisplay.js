/**
 * Trophy Wall Display UI
 *
 * Shows defeated dinosaurs and upcoming hunts.
 * Creates anticipation for the next challenge.
 */
export default class TrophyWallDisplay {
    /**
     * @param {Phaser.Scene} scene - The scene
     * @param {number} screenX - Screen X position
     * @param {number} screenY - Screen Y position
     * @param {Array} defeatedDinosaurs - Array of defeated dinosaur IDs
     */
    constructor(scene, screenX, screenY, defeatedDinosaurs = []) {
        this.scene = scene;
        this.defeatedDinosaurs = defeatedDinosaurs;

        // All 12 dinosaurs in order (from design doc)
        this.allDinosaurs = [
            { id: 'compy', name: 'Compy' },
            { id: 'dodo', name: 'Dodo' },
            { id: 'parasaurolophus', name: 'Para' },
            { id: 'stegosaurus', name: 'Stego' },
            { id: 'ankylosaurus', name: 'Ankylo' },
            { id: 'triceratops', name: 'Trike' },
            { id: 'brontosaurus', name: 'Bronto' },
            { id: 'pteranodon', name: 'Ptero' },
            { id: 'velociraptor-pack', name: 'Raptors' },
            { id: 'spinosaurus', name: 'Spino' },
            { id: 'carnotaurus', name: 'Carno' },
            { id: 'tyrannosaurus', name: 'T-Rex' }
        ];

        // Create UI
        this.createUI(screenX, screenY);
    }

    /**
     * Create trophy wall UI
     */
    createUI(x, y) {
        const scene = this.scene;

        // Container for trophy wall
        this.container = scene.add.container(x, y);
        this.container.setDepth(40000); // High depth to ensure visibility above all game elements
        this.container.setScrollFactor(0); // Fixed to camera for consistent visibility

        // Background panel
        const panelWidth = 280;
        const panelHeight = 320;

        const panel = scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x2a1810, 0.9);
        this.container.add(panel);

        // Border
        const border = scene.add.rectangle(0, 0, panelWidth, panelHeight, 0xffffff, 0);
        border.setStrokeStyle(3, 0xd4a574);
        this.container.add(border);

        // Title
        const title = scene.add.text(0, -140, 'TROPHY WALL', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#d4a574',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        this.container.add(title);

        // Create trophy grid (3 rows × 4 columns)
        this.createTrophyGrid();

        console.log('✅ Trophy wall display created');
    }

    /**
     * Create grid of trophy skulls
     */
    createTrophyGrid() {
        const cols = 4;
        const rows = 3;
        const spacing = 65;
        const startX = -95;
        const startY = -95;

        this.trophies = [];

        this.allDinosaurs.forEach((dino, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * spacing;
            const y = startY + row * spacing;

            const isDefeated = this.defeatedDinosaurs.includes(dino.id);
            const isNext = index === this.defeatedDinosaurs.length;

            // Trophy skull icon
            const skull = this.scene.add.text(x, y - 10, '💀', {
                fontSize: '24px'
            });
            skull.setOrigin(0.5);
            this.container.add(skull);

            // Dinosaur name
            const nameColor = isDefeated ? '#4ade80' : (isNext ? '#ffaa00' : '#666666');
            const name = this.scene.add.text(x, y + 15, dino.name, {
                fontSize: '11px',
                fontFamily: 'Arial',
                color: nameColor,
                fontStyle: isDefeated ? 'bold' : 'normal'
            });
            name.setOrigin(0.5);
            this.container.add(name);

            // Visual states
            if (isDefeated) {
                // Defeated: full brightness + checkmark
                skull.setAlpha(1.0);
                const check = this.scene.add.text(x + 15, y - 15, '✓', {
                    fontSize: '16px',
                    color: '#4ade80',
                    fontStyle: 'bold'
                });
                this.container.add(check);
            } else if (isNext) {
                // Next hunt: glowing
                skull.setAlpha(1.0);
                skull.setTint(0xffaa00);

                // Pulsing glow effect
                this.scene.tweens.add({
                    targets: skull,
                    alpha: 0.7,
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else {
                // Future: silhouette
                skull.setAlpha(0.3);
                name.setAlpha(0.5);
            }

            this.trophies.push({
                skull,
                name,
                dino
            });
        });
    }

    /**
     * Update trophy wall with new defeated dinosaur
     */
    addDefeatedDinosaur(dinoId) {
        if (!this.defeatedDinosaurs.includes(dinoId)) {
            this.defeatedDinosaurs.push(dinoId);
            this.refresh();
        }
    }

    /**
     * Refresh trophy display
     */
    refresh() {
        // Destroy old trophies
        this.trophies.forEach(trophy => {
            trophy.skull.destroy();
            trophy.name.destroy();
        });
        this.trophies = [];

        // Remove checkmarks
        this.container.list.forEach(child => {
            if (child.text === '✓') {
                child.destroy();
            }
        });

        // Recreate with updated state
        this.createTrophyGrid();
    }

    /**
     * Destroy the trophy wall
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}
