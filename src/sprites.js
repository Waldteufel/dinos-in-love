export class ImageSprite {
    constructor(frames = []) {
        this._frames = frames;
        this._frameDelay = 0;
        this._frameIndex = -1;
    }

    update(dt) {
        this._frameDelay -= dt;
        if (this._frameDelay <= 0) {
            this._frameIndex = (this._frameIndex + 1) % this._frames.length;
            this._frameDelay = this._frames[this._frameIndex].delay;
        }
    }

    draw(ctx) {
        let {image, sx, sy, sw, sh, dx, dy, dw, dh} = this._frames[this._frameIndex];
        ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    }
}

export class TextSprite {
    constructor(props = {}) {
        this.textAlign = props.textAlign ?? 'left';
        this.textBaseline = props.textBaseline ?? 'alphabetic';
        this.fillStyle = props.fillStyle ?? 'white';
        this.font = props.font ?? '8px sans-serif';
        this.x = props.x ?? 0;
        this.y = props.y ?? 0;
        this.text = props.text ?? '';
    }

    draw(ctx) {
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        ctx.fillStyle = this.fillStyle;
        ctx.font = this.font;
        ctx.fillText(this.text, this.x, this.y);
    }
}