import {loadImage} from './assets';
import Scene from './scene';
import {Entity, Sprite} from './entity';
import {ArrowsInput, WASDInput, GamepadInput} from './input';

export class Player extends Entity {
    constructor(props = {}) {
        super(props);
        this.input = props.input;
        this.spriteSheet = props.spriteSheet;
        this.sprite = this.addChild(new Sprite({}));
        this.frozen = -1;
    }

    update(dt) {
        if (this.frozen > 0) {
            this.frozen -= dt;
            return;
        }

        let fast = this.input.fast;
        let velocity = this.input.velocity;

        let power = fast ? 1.5 : 0.5;

        velocity.x *= power;
        velocity.y *= power;

        let direction = null;
        if (velocity.x > 0) {
            direction = 'right';
        } else if (velocity.x < 0) {
            direction = 'left';
        }

        if (velocity.x != 0 || velocity.y != 0) {
            if (fast) {
                this.sprite.frames = this.spriteSheet['move fast'];
            } else {
                this.sprite.frames = this.spriteSheet['move slow'];
            }
        } else {
            if (fast) {
                this.sprite.frames = this.spriteSheet['idle fast'];
            } else {
                this.sprite.frames = this.spriteSheet['idle slow'];
            }
        }

        if (direction === 'left') {
            this.sprite.scaleX = -1;
        } else if (direction === 'right') {
            this.sprite.scaleX = 1;
        }

        this.x += velocity.x;
        this.y += velocity.y;

        if (this.x < 12)
            this.x = 12;
        if (this.y < 16)
            this.y = 16;

        if (this.x >= 320 - 12)
            this.x = 320 - 12;
        if (this.y >= 240 - 4)
            this.y = 240 - 4;

        this.z = this.y / 1000;
    }
}

class StartText extends Entity {
    constructor(props = {}) {
        super(props);
        this.alpha = 1.0;
        this.angle = -0.5;
        this.x = 160;
        this.y = 50;
        this._timer = 1000;
    }

    update(dt) {
        this._timer -= dt;
        if (this._timer <= 0) {
            this.remove();
            return;
        }

        this.y -= dt / 50;
        this.scaleX += dt / 1000;
        this.scaleY += dt / 1000;
        this.angle += dt / 500;
        this.alpha -= dt / 1000;
    }

    draw(ctx) {
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.font = '8px sans-serif';
        ctx.fillText('START', 0, 4);
    }
}

export default async function start({canvas}) {
    canvas.width = 320;
    canvas.height = 240;

    let spriteSheet = [
        await loadImage('doux.png'),
        await loadImage('mort.png'),
        await loadImage('tard.png'),
        await loadImage('vita.png')
    ];

    let heart = [
        {image: await loadImage('heart.png'), sx: 0, sy: 0, sw: 16, sh: 16, dx: -8, dy: -16, dw: 16, dh: 16, delay: Infinity}
    ];

    function loop(player, start, n, delay) {
        let result = new Array(n);
        for (let i = 0; i < n; ++i) {
            let j = start + i;
            result[i] = {image: spriteSheet[player], sx: j * 24, sy: 0, sw: 24, sh: 24, dx: -11, dy: -20, dw: 24, dh: 24, delay};
        }
        return result;
    }

    let frames = [0, 1, 2, 3].map(player => ({
        'idle slow': loop(player, 0, 3, 200),
        'idle fast': loop(player, 17, 1, Infinity),
        'move slow': loop(player, 4, 6, 100),
        'move fast': loop(player, 18, 6, 100),
        'freeze': [...loop(player, 14, 1, 50), ...loop(player, 16, 1, 50)]
    }));

    class Heart extends Entity {
        constructor(props = {}) {
            super(props);
            this.sprite = this.addChild(new Sprite({frames: heart}));
            this.timer = 1000;
            this.alpha = 1.0;
        }

        update(dt) {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.remove();
                return;
            }

            this.y -= dt / 100;
            this.scaleX += dt / 1000;
            this.scaleY += dt / 1000;
            this.alpha -= dt / 1000;
        }
    }

    return new class extends Scene {
        constructor() {
            super(new Entity);
            this.players = [];
            this._listener = () => this.resetPlayers();

            window.addEventListener('gamepadconnected', this._listener);
            window.addEventListener('gamepaddisconnected', this._listener);
            this.resetPlayers();
        }

        close() {
            window.removeEventListener('gamepadconnected', this._listener);
            window.removeEventListener('gamepaddisconnected', this._listener);
        }

        resetPlayers() {
            this.players.forEach(p => p.remove());

            let gamepads = navigator.getGamepads();
            if (gamepads.length == 0) {
                this.players = [
                    new Player({input: new WASDInput(), x: 100, y: 100, spriteSheet: frames[0]}),
                    new Player({input: new ArrowsInput(), x: 200, y: 200, spriteSheet: frames[1]})
                ];
            } else {
                this.players = gamepads.map((g, i) => new Player({input: new GamepadInput(g), x: 100 + 50 * i, y: 100 + 50 * i, spriteSheet: frames[i]}));
            }

            this.players.forEach(p => this.addChild(p));

            this.addChild(new StartText());
        }

        update(dt) {
            function *pairs(ps) {
                for (let i = 0; i < ps.length; ++i) {
                    for (let j = i + 1; j < ps.length; ++j) {
                        yield [ps[i], ps[j]];
                    }
                }
            }

            for (let [p1, p2] of pairs(this.players)) {
                if (p1.frozen > 0 || p2.frozen > 0) continue;

                let d = ((p1.x - p2.x) / 24) ** 2 + ((p1.y - p2.y) / 8) ** 2;

                if (d < 1) {
                    p1.frozen = 500;
                    p2.frozen = 500;
                    p1.sprite.frames = p1.spriteSheet['freeze'];
                    p2.sprite.frames = p2.spriteSheet['freeze'];

                    if (p1.x < p2.x) {
                        p1.x -= 5;
                        p2.x += 5;
                        p1.sprite.scaleX = 1;
                        p2.sprite.scaleX = -1;
                    } else {
                        p1.x += 5;
                        p2.x -= 5;
                        p1.sprite.scaleX = -1;
                        p2.sprite.scaleX = 1;
                    }

                    this.addChild(new Heart({x: (p1.x + p2.x)/2, y: (p1.y + p2.y)/2}));
                }
            }
        }
    };
}