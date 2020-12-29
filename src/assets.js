export async function loadImage(name) {
    let img = new Image();
    img.src = './assets/' + name;
    await img.decode();
    return img;
}

export class ImageAsset {
    constructor({image, sx = 0, sy = 0, sw = null, sh = null, dx = 0, dy = 0, dw = null, dh = null}) {
        this.image = image;
        this.sx = sx;
        this.sy = sy;
        this.sw = sw ?? image.width;
        this.sh = sh ?? image.height;
        this.dx = dx;
        this.dy = dy;
        this.dw = dw ?? this.sw;
        this.dh = dh ?? this.sh;
    }

    static async load({src, ...props}) {
        let image = await loadImage(src);
        return new ImageAsset({image, ...props});
    }

    frame({i = 0, j = 0, ...props}) {
        return {
            image: this.image,
            sx: this.sx + i * this.sw,
            sy: this.sy + j * this.sh,
            sw: this.sw,
            sh: this.sh,
            dx: this.dx,
            dy: this.dy,
            dw: this.dw,
            dh: this.dh,
            ...props
        };
    }

    frames({i = 0, j = 0, n = null, m = null, ...props} = {}) {
        n ??= Math.floor(this.image.width / this.sw) - i;
        m ??= Math.floor(this.image.height / this.sh) - j;

        let result = Array(n * m);
        let k = 0;

        for (let ii = 0; ii < n; ++ii) {
            for (let jj = 0; jj < m; ++jj) {
                result[k++] = this.frame({i: ii, j: jj, ...props});
            }
        }

        return result;
    }
}
