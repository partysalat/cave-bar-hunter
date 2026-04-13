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

    update(lines) {
        this.text.setText(lines.join('\n'));
    }
}
