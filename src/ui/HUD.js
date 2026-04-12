export default class HUD {
    constructor(scene) {
        this.scene = scene;
        this.text = scene.add.text(24, 24, '', {
            color: '#ffffff',
            fontSize: '22px',
            fontFamily: 'monospace',
            backgroundColor: '#00000088',
            padding: { x: 12, y: 8 },
        }).setScrollFactor(0);
    }

    update(player, dummy, projectileCount) {
        this.text.setText(
            `HP ${player.health}/${player.maxHealth}   SCORE ${player.score}\n` +
            `DUMMY ${dummy.health}/${dummy.maxHealth}   SPEARS ${projectileCount}\n` +
            `MELEE CD ${player.meleeCooldownRemaining.toFixed(2)}   THROW CD ${player.throwCooldownRemaining.toFixed(2)}`
        );
    }
}
