export class Entity {
    constructor(props = {}) {
        this.x = props.x ?? 0;
        this.y = props.y ?? 0;
        this.z = props.z ?? 0;
        this.scaleX = props.scaleX ?? 1;
        this.scaleY = props.scaleY ?? 1;
        this.angle = props.angle ?? 0;

        this.parent = null;
        this.children = new Set();
    }

    addChild(c) {
        this.children.add(c);
        c.parent = this;
        return c;
    }

    removeChild(c) {
        this.children.delete(c);
        c.parent = null;
    }

    remove() {
        this.children.forEach(c => c.parent = null);
        this.children.clear();
        this.parent.removeChild(this);
    }
}

export class Sprite extends Entity {
    constructor(props = {}) {
        super(props);
        this._frames = props.frames ?? [];
        this._frameDelay = 0;
        this._frameIndex = -1;
    }

    get frames() {
        return this._frames;
    }

    set frames(value) {
        if (value != this._frames) {
            this._frames = value;
            this._frameDelay = 0;
            this._frameIndex = -1;
        }
    }

    update(dt) {
        this._frameDelay -= dt;
        if (this._frameDelay <= 0) {
            this._frameIndex = (this._frameIndex + 1) % this._frames.length;
            this._frameDelay = this._frames[this._frameIndex].delay;
        }
    }

    draw(ctx) {
        let {image, sx, sy, sw, sh, dx, dy, dw, dh} = this.frames[this._frameIndex];
        ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    }
}