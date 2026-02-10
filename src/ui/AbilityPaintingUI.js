import { passiveAbilities, applyAbilityEffect } from '../data/passiveAbilities.js';

/**
 * Ability Painting UI
 *
 * Displays ability information when player approaches cave paintings.
 * Shows purchase prompt and handles ability acquisition.
 */
export default class AbilityPaintingUI {
    /**
     * @param {Phaser.Scene} scene - The scene
     * @param {Object} painting - Painting sprite with ability data
     * @param {Player} player - The player viewing the painting
     */
    constructor(scene, painting, player) {
        this.scene = scene;
        this.painting = painting;
        this.player = player;
        this.ability = painting.ability;

        // UI elements
        this.container = null;
        this.isVisible = false;
    }

    /**
     * Show ability information
     */
    show() {
        if (this.isVisible) return;

        this.isVisible = true;
        this.createUI();
    }

    /**
     * Hide ability information
     */
    hide() {
        if (!this.isVisible) return;

        this.isVisible = false;

        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }

    /**
     * Create the UI panel
     */
    createUI() {
        const scene = this.scene;

        // Get painting screen position
        const paintingScreenPos = this.painting.sprite.getCenter();

        // Container for UI elements (moves with world, positioned above painting)
        this.container = scene.add.container(paintingScreenPos.x, paintingScreenPos.y - 100);
        // Don't set scrollFactor - let it move naturally with world objects
        this.container.setDepth(100000); // Very high depth to ensure it's above all game elements

        // Check if player already owns this ability
        const hasAbility = this.player.passiveAbilities && this.player.passiveAbilities.includes(this.ability.id);
        const canAfford = this.player.score >= this.ability.price;

        // Panel background
        const panelWidth = 300;
        const panelHeight = hasAbility ? 100 : 120;

        const panel = scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x2a1810, 0.95);
        this.container.add(panel);

        // Panel border
        let borderColor = 0x666666; // Gray default
        if (hasAbility) {
            borderColor = 0x4ade80; // Green for owned
        } else if (canAfford) {
            borderColor = 0xd4a574; // Tan for affordable
        } else {
            borderColor = 0xff6666; // Red for unaffordable
        }

        const border = scene.add.rectangle(0, 0, panelWidth, panelHeight, 0xffffff, 0);
        border.setStrokeStyle(3, borderColor);
        this.container.add(border);

        // Ability name with icon
        const title = scene.add.text(0, -panelHeight/2 + 20, `${this.ability.icon} ${this.ability.name}`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        this.container.add(title);

        // Description
        const desc = scene.add.text(0, -panelHeight/2 + 50, this.ability.description, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#cccccc',
            wordWrap: { width: panelWidth - 20 },
            align: 'center'
        });
        desc.setOrigin(0.5);
        this.container.add(desc);

        // Status text (price or owned indicator)
        let statusText, statusColor;
        if (hasAbility) {
            statusText = '✓ UNLOCKED';
            statusColor = '#4ade80';
        } else if (canAfford) {
            statusText = `Press X to Purchase (${this.ability.price} pts)`;
            statusColor = '#d4a574';
        } else {
            statusText = `${this.ability.price} points required`;
            statusColor = '#ff6666';
        }

        const status = scene.add.text(0, panelHeight/2 - 15, statusText, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: statusColor,
            fontStyle: hasAbility ? 'bold' : 'normal'
        });
        status.setOrigin(0.5);
        this.container.add(status);
    }

    /**
     * Update painting appearance based on state
     */
    updatePaintingState() {
        const hasAbility = this.player.passiveAbilities && this.player.passiveAbilities.includes(this.ability.id);
        const canAfford = this.player.score >= this.ability.price;

        // Update painting sprite tint
        if (hasAbility) {
            this.painting.sprite.setTint(0x4ade80); // Green glow for owned
        } else if (canAfford) {
            this.painting.sprite.setTint(0xffffff); // Normal for affordable
        } else {
            this.painting.sprite.setTint(0x666666); // Dim for unaffordable
        }
    }

    /**
     * Attempt to purchase ability
     * @returns {boolean} True if purchase succeeded
     */
    tryPurchase() {
        // Check if already owned
        if (!this.player.passiveAbilities) {
            this.player.passiveAbilities = [];
        }

        if (this.player.passiveAbilities.includes(this.ability.id)) {
            console.log(`Player ${this.player.playerNumber} already has ${this.ability.name}`);
            return false;
        }

        // Check if can afford
        if (this.player.score < this.ability.price) {
            console.log(`Player ${this.player.playerNumber} cannot afford ${this.ability.name}`);
            return false;
        }

        // Purchase ability
        this.player.score -= this.ability.price;
        this.player.passiveAbilities.push(this.ability.id);

        // Apply ability effect
        applyAbilityEffect(this.player, this.ability);

        console.log(`Player ${this.player.playerNumber} purchased ${this.ability.name}`);

        // Update UI
        this.hide();
        this.show();
        this.updatePaintingState();

        return true;
    }
}
