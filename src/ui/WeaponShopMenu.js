import { weapons, getAffordableWeapons } from '../data/weapons.js';

/**
 * Weapon Shop Menu UI
 *
 * Displays available weapons with stats, prices, and purchase options.
 * Shown when player interacts with the weapon rack.
 */
export default class WeaponShopMenu {
    /**
     * @param {Phaser.Scene} scene - The scene this menu belongs to
     * @param {Player} player - The player viewing the shop
     */
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.isOpen = false;
        this.selectedIndex = 0;

        // UI elements (will be created when menu opens)
        this.container = null;
        this.weaponItems = [];
    }

    /**
     * Open the weapon shop menu
     */
    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.selectedIndex = 0;

        // Create UI container
        this.createUI();

        console.log(`Weapon shop opened for player ${this.player.playerNumber}`);
    }

    /**
     * Close the weapon shop menu
     */
    close() {
        if (!this.isOpen) return;

        this.isOpen = false;

        // Destroy UI elements
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }

        this.weaponItems = [];

        console.log(`Weapon shop closed for player ${this.player.playerNumber}`);
    }

    /**
     * Create the UI elements
     */
    createUI() {
        const scene = this.scene;
        const camera = scene.cameras.main;

        // Container for all UI elements
        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0); // Fixed to camera
        this.container.setDepth(100000); // Very high depth to ensure it's above all game elements

        // Semi-transparent background overlay
        const overlay = scene.add.rectangle(
            camera.width / 2,
            camera.height / 2,
            camera.width,
            camera.height,
            0x000000,
            0.7
        );
        this.container.add(overlay);

        // Menu panel background
        const panelWidth = 600;
        const panelHeight = 500;
        const panelX = camera.width / 2;
        const panelY = camera.height / 2;

        const panel = scene.add.rectangle(
            panelX,
            panelY,
            panelWidth,
            panelHeight,
            0x2a1810, // Dark brown cave color
            1.0
        );
        this.container.add(panel);

        // Panel border
        const border = scene.add.rectangle(
            panelX,
            panelY,
            panelWidth,
            panelHeight,
            0xffffff,
            0
        );
        border.setStrokeStyle(4, 0xd4a574); // Tan border
        this.container.add(border);

        // Title
        const title = scene.add.text(panelX, panelY - 220, 'WEAPON RACK', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#d4a574',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        this.container.add(title);

        // Player points display
        const pointsText = scene.add.text(
            panelX,
            panelY - 180,
            `Your Points: ${this.player.score}`,
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#ffffff'
            }
        );
        pointsText.setOrigin(0.5);
        this.container.add(pointsText);
        this.pointsText = pointsText;

        // Weapon list
        this.createWeaponList(panelX, panelY - 130, panelWidth - 40);

        // Instructions
        const instructions = scene.add.text(
            panelX,
            panelY + 210,
            'D-Pad: Select  |  X: Purchase  |  B: Close',
            {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#999999'
            }
        );
        instructions.setOrigin(0.5);
        this.container.add(instructions);
    }

    /**
     * Create the weapon list items
     */
    createWeaponList(startX, startY, width) {
        const itemHeight = 70;
        const spacing = 10;

        weapons.forEach((weapon, index) => {
            const y = startY + index * (itemHeight + spacing);
            const isAffordable = weapon.price <= this.player.score;
            const isEquipped = this.player.weapon === weapon.id;

            // Item background
            const bgColor = index === this.selectedIndex ? 0x5a4030 : 0x3a2820;
            const itemBg = this.scene.add.rectangle(startX, y, width, itemHeight, bgColor, 1.0);
            this.container.add(itemBg);

            // Weapon name
            const nameColor = isAffordable ? '#ffffff' : '#666666';
            const nameText = this.scene.add.text(startX - width/2 + 20, y - 20, weapon.name, {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: nameColor,
                fontStyle: 'bold'
            });
            this.container.add(nameText);

            // Weapon stats
            const statsText = `Damage: ${weapon.damage}  |  Range: ${weapon.range}  |  Rate: ${weapon.fireRate}s`;
            const stats = this.scene.add.text(startX - width/2 + 20, y + 5, statsText, {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#aaaaaa'
            });
            this.container.add(stats);

            // Price or equipped indicator
            let priceText;
            if (isEquipped) {
                priceText = this.scene.add.text(startX + width/2 - 20, y, 'EQUIPPED', {
                    fontSize: '16px',
                    fontFamily: 'Arial',
                    color: '#4ade80',
                    fontStyle: 'bold'
                });
                priceText.setOrigin(1, 0.5);
            } else if (weapon.price === 0) {
                priceText = this.scene.add.text(startX + width/2 - 20, y, 'FREE', {
                    fontSize: '16px',
                    fontFamily: 'Arial',
                    color: '#4ade80'
                });
                priceText.setOrigin(1, 0.5);
            } else {
                const priceColor = isAffordable ? '#d4a574' : '#ff6666';
                priceText = this.scene.add.text(startX + width/2 - 20, y, `${weapon.price} pts`, {
                    fontSize: '16px',
                    fontFamily: 'Arial',
                    color: priceColor
                });
                priceText.setOrigin(1, 0.5);
            }
            this.container.add(priceText);

            // Store references for updating
            this.weaponItems.push({
                weapon,
                bg: itemBg,
                name: nameText,
                stats,
                price: priceText
            });
        });
    }

    /**
     * Update menu (handle input)
     * @param {Object} input - Input from InputManager
     */
    update(input) {
        if (!this.isOpen) return;

        // Navigate with D-pad
        if (input.dpad.down && !this.lastDown) {
            this.selectedIndex = Math.min(this.selectedIndex + 1, weapons.length - 1);
            this.updateSelection();
        }
        if (input.dpad.up && !this.lastUp) {
            this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
            this.updateSelection();
        }

        // Purchase with X button
        if (input.buttons.x && !this.lastX) {
            this.purchaseSelected();
        }

        // Close with B button
        if (input.buttons.b && !this.lastB) {
            this.close();
        }

        // Track button states for edge detection
        this.lastDown = input.dpad.down;
        this.lastUp = input.dpad.up;
        this.lastX = input.buttons.x;
        this.lastB = input.buttons.b;
    }

    /**
     * Update selection highlight
     */
    updateSelection() {
        this.weaponItems.forEach((item, index) => {
            const isSelected = index === this.selectedIndex;
            item.bg.setFillStyle(isSelected ? 0x5a4030 : 0x3a2820);
        });
    }

    /**
     * Purchase the selected weapon
     */
    purchaseSelected() {
        const weapon = weapons[this.selectedIndex];

        // Check if already equipped
        if (this.player.weapon === weapon.id) {
            console.log('Weapon already equipped');
            return;
        }

        // Check if affordable
        if (weapon.price > this.player.score) {
            console.log(`Cannot afford ${weapon.name} (need ${weapon.price}, have ${this.player.score})`);
            return;
        }

        // Purchase weapon
        this.player.score -= weapon.price;
        this.player.weapon = weapon.id;

        console.log(`Purchased ${weapon.name} for ${weapon.price} points`);

        // Update UI
        this.pointsText.setText(`Your Points: ${this.player.score}`);

        // Recreate weapon list to show new equipped state
        this.weaponItems.forEach(item => {
            item.bg.destroy();
            item.name.destroy();
            item.stats.destroy();
            item.price.destroy();
        });
        this.weaponItems = [];

        const camera = this.scene.cameras.main;
        this.createWeaponList(camera.width / 2, camera.height / 2 - 130, 560);
        this.updateSelection();
    }
}
