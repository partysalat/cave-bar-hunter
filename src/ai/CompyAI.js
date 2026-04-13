export default class CompyAI {
    constructor(compy, slotDirection = 1) {
        this.compy = compy;
        this.slotDirection = slotDirection;
        this.desiredDistance = 1.2 + Math.abs(slotDirection) * 0.9;
    }

    update(player) {
        if (!this.compy.active) {
            this.compy.velocityX = 0;
            return;
        }

        const slotTargetX = player.worldX + this.slotDirection * this.desiredDistance;
        const dx = slotTargetX - this.compy.worldX;

        if (Math.abs(dx) < 0.1) {
            this.compy.velocityX = 0;
            return;
        }

        this.compy.velocityX = Math.sign(dx) * this.compy.moveSpeed;
    }
}
