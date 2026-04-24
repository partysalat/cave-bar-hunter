import Phaser from 'phaser';

export interface AnimatedDomFrame {
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
    duration: number;
}

interface AnimatedDomSpriteOptions {
    width: number;
    height: number;
    scale?: number;
    depth?: number;
    frames: AnimatedDomFrame[];
}

export class AnimatedDomSprite {
    private readonly scene: Phaser.Scene;
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly frames: AnimatedDomFrame[];
    private readonly images: HTMLImageElement[] = [];
    private readonly domElement: Phaser.GameObjects.DOMElement;
    private frameIndex = 0;
    private timer?: Phaser.Time.TimerEvent;
    private destroyed = false;

    constructor(scene: Phaser.Scene, x: number, y: number, options: AnimatedDomSpriteOptions) {
        this.scene = scene;
        this.frames = options.frames;
        this.canvas = document.createElement('canvas');
        this.canvas.width = options.width;
        this.canvas.height = options.height;
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.imageRendering = 'pixelated';

        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to create 2D canvas context for AnimatedDomSprite.');
        }

        this.context = context;
        this.domElement = scene.add.dom(x, y, this.canvas);
        this.domElement.setScale(options.scale ?? 1);
        this.domElement.setDepth(options.depth ?? 0);

        void this.loadFrames();
    }

    setPosition(x: number, y: number): void {
        this.domElement.setPosition(x, y);
    }

    destroy(): void {
        this.destroyed = true;
        this.timer?.remove(false);
        this.domElement.destroy();
    }

    private async loadFrames(): Promise<void> {
        const images = await Promise.all(this.frames.map((frame) => this.loadImage(frame.url)));
        if (this.destroyed) {
            return;
        }

        this.images.push(...images);
        this.drawFrame(0, true);
        this.scheduleNextFrame();
    }

    private scheduleNextFrame(): void {
        if (this.destroyed || this.images.length === 0) {
            return;
        }

        const frame = this.frames[this.frameIndex];
        this.timer = this.scene.time.delayedCall(frame.duration, () => {
            const nextIndex = (this.frameIndex + 1) % this.frames.length;
            const restartingLoop = nextIndex === 0;
            this.drawFrame(nextIndex, restartingLoop);
            this.scheduleNextFrame();
        });
    }

    private drawFrame(index: number, restartingLoop: boolean): void {
        const frame = this.frames[index];
        const image = this.images[index];
        if (!image) {
            return;
        }

        if (restartingLoop) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.context.clearRect(frame.x, frame.y, frame.width, frame.height);
        this.context.drawImage(image, frame.x, frame.y, frame.width, frame.height);
        this.frameIndex = index;
    }

    private loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Failed to load animation frame ${url}`));
            image.src = url;
        });
    }
}
