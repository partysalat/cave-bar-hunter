import { cocktails, applyCocktailEffect, hasReachedCocktailLimit, MAX_COCKTAILS_PER_HUNT } from '../data/cocktails.js';

/**
 * Cocktail Menu UI
 *
 * Displays available cocktails for purchase at the bar.
 * Shown when player interacts with the bartender.
 */
export default class CocktailMenu {
    /**
     * @param {Phaser.Scene} scene - The scene this menu belongs to
     * @param {Player} player - The player viewing the menu
     * @param {Bartender} bartender - The bartender NPC
     */
    constructor(scene, player, bartender) {
        this.scene = scene;
        this.player = player;
        this.bartender = bartender;
        this.isOpen = false;
        this.selectedIndex = 0;

        // UI elements
        this.container = null;
        this.cocktailItems = [];
    }

    /**
     * Open the cocktail menu
     */
    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.selectedIndex = 0;

        // Create UI
        this.createUI();

        console.log(`Cocktail menu opened for player ${this.player.playerNumber}`);
    }

    /**
     * Close the cocktail menu
     */
    close() {
        if (!this.isOpen) return;

        this.isOpen = false;

        // Destroy UI
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }

        this.cocktailItems = [];

        console.log(`Cocktail menu closed for player ${this.player.playerNumber}`);
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
        this.container.setDepth(100000); // On top of everything

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
        const panelHeight = 550;
        const panelX = camera.width / 2;
        const panelY = camera.height / 2;

        const panel = scene.add.rectangle(
            panelX,
            panelY,
            panelWidth,
            panelHeight,
            0x2a1810, // Dark brown
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
        const title = scene.add.text(panelX, panelY - 240, '🍺 CAVE BAR COCKTAILS', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#d4a574',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        this.container.add(title);

        // Player points and cocktail count
        const cocktailCount = this.player.cocktailBuffs ? this.player.cocktailBuffs.length : 0;
        const infoText = `Your Points: ${this.player.score}  |  Cocktails: ${cocktailCount}/${MAX_COCKTAILS_PER_HUNT}`;
        const info = scene.add.text(panelX, panelY - 195, infoText, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        info.setOrigin(0.5);
        this.container.add(info);
        this.infoText = info;

        // Warning if at limit
        if (hasReachedCocktailLimit(this.player)) {
            const warning = scene.add.text(
                panelX,
                panelY - 165,
                '⚠️ Maximum cocktails reached for this hunt',
                {
                    fontSize: '16px',
                    fontFamily: 'Arial',
                    color: '#ff6666',
                    fontStyle: 'bold'
                }
            );
            warning.setOrigin(0.5);
            this.container.add(warning);
        }

        // Cocktail list
        this.createCocktailList(panelX, panelY - 125, panelWidth - 40);

        // Instructions
        const instructions = scene.add.text(
            panelX,
            panelY + 235,
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
     * Create cocktail list items
     */
    createCocktailList(startX, startY, width) {
        const itemHeight = 65;
        const spacing = 8;

        cocktails.forEach((cocktail, index) => {
            const y = startY + index * (itemHeight + spacing);
            const isAffordable = cocktail.price <= this.player.score;
            const atLimit = hasReachedCocktailLimit(this.player);

            // Item background
            const bgColor = index === this.selectedIndex ? 0x5a4030 : 0x3a2820;
            const itemBg = this.scene.add.rectangle(startX, y, width, itemHeight, bgColor, 1.0);
            this.container.add(itemBg);

            // Cocktail icon and name
            const nameColor = (isAffordable && !atLimit) ? '#ffffff' : '#666666';
            const nameText = this.scene.add.text(
                startX - width/2 + 20,
                y - 18,
                `${cocktail.icon} ${cocktail.name}`,
                {
                    fontSize: '18px',
                    fontFamily: 'Arial',
                    color: nameColor,
                    fontStyle: 'bold'
                }
            );
            this.container.add(nameText);

            // Description
            const desc = this.scene.add.text(
                startX - width/2 + 20,
                y + 5,
                cocktail.description,
                {
                    fontSize: '13px',
                    fontFamily: 'Arial',
                    color: '#aaaaaa',
                    wordWrap: { width: width - 120 }
                }
            );
            this.container.add(desc);

            // Price
            const priceColor = (isAffordable && !atLimit) ? '#d4a574' : '#ff6666';
            const priceText = this.scene.add.text(
                startX + width/2 - 20,
                y,
                `${cocktail.price} pts`,
                {
                    fontSize: '16px',
                    fontFamily: 'Arial',
                    color: priceColor
                }
            );
            priceText.setOrigin(1, 0.5);
            this.container.add(priceText);

            // Store references
            this.cocktailItems.push({
                cocktail,
                bg: itemBg,
                name: nameText,
                desc,
                price: priceText
            });
        });
    }

    /**
     * Update menu (handle input)
     */
    update(input) {
        if (!this.isOpen) return;

        // Navigate with D-pad
        if (input.dpad.down && !this.lastDown) {
            this.selectedIndex = Math.min(this.selectedIndex + 1, cocktails.length - 1);
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

        // Track button states
        this.lastDown = input.dpad.down;
        this.lastUp = input.dpad.up;
        this.lastX = input.buttons.x;
        this.lastB = input.buttons.b;
    }

    /**
     * Update selection highlight
     */
    updateSelection() {
        this.cocktailItems.forEach((item, index) => {
            const isSelected = index === this.selectedIndex;
            item.bg.setFillStyle(isSelected ? 0x5a4030 : 0x3a2820);
        });
    }

    /**
     * Purchase selected cocktail
     */
    purchaseSelected() {
        const cocktail = cocktails[this.selectedIndex];

        // Check cocktail limit
        if (hasReachedCocktailLimit(this.player)) {
            console.log(`Player ${this.player.playerNumber} has reached cocktail limit (${MAX_COCKTAILS_PER_HUNT})`);
            return;
        }

        // Check if affordable
        if (cocktail.price > this.player.score) {
            console.log(`Cannot afford ${cocktail.name} (need ${cocktail.price}, have ${this.player.score})`);
            return;
        }

        // Purchase cocktail
        this.player.score -= cocktail.price;
        applyCocktailEffect(this.player, cocktail);

        // Trigger bartender serving animation
        if (this.bartender) {
            this.bartender.serveDrink();
        }

        console.log(`Purchased ${cocktail.name} for ${cocktail.price} points`);

        // Close menu if at limit now
        if (hasReachedCocktailLimit(this.player)) {
            this.close();
        } else {
            // Update UI
            const cocktailCount = this.player.cocktailBuffs.length;
            this.infoText.setText(`Your Points: ${this.player.score}  |  Cocktails: ${cocktailCount}/${MAX_COCKTAILS_PER_HUNT}`);

            // Refresh list to show updated affordability
            this.cocktailItems.forEach(item => {
                item.bg.destroy();
                item.name.destroy();
                item.desc.destroy();
                item.price.destroy();
            });
            this.cocktailItems = [];

            const camera = this.scene.cameras.main;
            this.createCocktailList(camera.width / 2, camera.height / 2 - 125, 560);
            this.updateSelection();
        }
    }
}
