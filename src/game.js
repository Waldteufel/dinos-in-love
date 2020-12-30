import {ImageAsset} from './assets';
import Scene from './scene';
import Entity from './entity';
import {ImageSprite, TextSprite} from './sprites';
import {ArrowsInput, WASDInput, GamepadInput} from './input';

export class Player extends Entity {
    constructor(props = {}) {
        super({
            _state: null,
            frozen: -1,
            ...props
        });
    }

    get state() {
        return this._state;
    }

    set state(value) {
        if (this._state != value) {
            this._state = value;
            this.sprite = new ImageSprite(this.spriteSheet[this._state]);
        }
    }

    update(dt) {
        if (this.frozen > 0) {
            this.frozen -= dt;
            this.vx = 0;
            this.vy = 0;
            return;
        }

        this.vx = this.input.vx / 10;
        this.vy = this.input.vy / 10;

        if (this.vx > 0) {
            this.scaleX = 1;
        } else if (this.vx < 0) {
            this.scaleX = -1;
        }

        let newState;

        if (this.vx != 0 || this.vy != 0) {
            newState = 'moving';
        } else {
            newState = 'waiting';
        }

        if (this.input.fast) {
            newState += ' fast';
        } else {
            newState += ' slow';
        }

        this.state = newState;

        /* border collision */
        if (this.x <= 12) {
            this.x = 12;
            this.vx = Math.max(this.vx, 0);
        }
        if (this.y <= 16) {
            this.y = 16;
            this.vy = Math.max(this.vy, 0);
        }

        if (this.x >= 320 - 12) {
            this.x = 320 - 12;
            this.vx = Math.min(this.vx, 0);
        }
        if (this.y >= 240 - 4) {
            this.y = 240 - 4;
            this.vy = Math.min(this.vy, 0);
        }
    }
}

class StartText extends Entity {
    constructor(props) {
        super({
            _timer: 1000,
            alpha: 1.0,
            x: 160,
            y: 50,
            vy: -1/50,
            rot: -20,
            vrot: 1/20,
            sprite: new TextSprite({
                textAlign: 'center',
                textBaseline: 'middle',
                text: 'START'
            }),
            ...props
        });
    }

    update(dt) {
        this._timer -= dt;
        if (this._timer <= 0) {
            this.remove();
            return;
        }

        this.scaleX += dt / 1000;
        this.scaleY += dt / 1000;
        this.alpha -= dt / 1000;
    }
}

export default async function start({canvas}) {
    canvas.width = 320;
    canvas.height = 240;

    let images = Object.fromEntries(await Promise.all(['doux', 'mort', 'tard', 'vita'].map(async (name, i) => {
        let image = await ImageAsset.load({src: `${name}.png`, sw: 24, sh: 24, dx: -11, dy: -20});
        return [i, {
            'waiting slow': image.frames({i: 0, n: 3, delay: 200}),
            'waiting fast': image.frames({i: 17, n: 1, delay: Infinity}),
            'moving slow': image.frames({i: 4, n: 6, delay: 100}),
            'moving fast': image.frames({i: 18, n: 6, delay: 100}),
            'frozen': [image.frame({i: 14, delay: 50}), image.frame({i: 16, delay: 50})]
        }];
    })));

    images.heart = await ImageAsset.load({src: 'heart.png', dx: -8, dy: -16}).then(i => i.frames());

    class Heart extends Entity {
        constructor(props) {
            super({
                sprite: new ImageSprite(images.heart),
                timer: 1000,
                alpha: 1.0,
                vy: -1/100,
                ...props
            });
        }

        update(dt) {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.remove();
                return;
            }

            this.scaleX += dt / 1000;
            this.scaleY += dt / 1000;
            this.alpha -= dt / 1000;
        }
    }

    return new class extends Scene {
        constructor(props = {}) {
            super(props);

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
                    new Player({input: new WASDInput(), x: 100, y: 100, spriteSheet: images[0]}),
                    new Player({input: new ArrowsInput(), x: 200, y: 200, spriteSheet: images[1]})
                ];
            } else {
                this.players = gamepads.map((g, i) => new Player({input: new GamepadInput(g), x: 100 + 50 * i, y: 100 + 50 * i, spriteSheet: images[i]}));
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

                    p1.state = 'frozen';
                    p2.state = 'frozen';

                    if (p1.x < p2.x) {
                        p1.x -= 5;
                        p2.x += 5;
                        p1.scaleX = 1;
                        p2.scaleX = -1;
                    } else {
                        p1.x += 5;
                        p2.x -= 5;
                        p1.scaleX = -1;
                        p2.scaleX = 1;
                    }

                    this.addChild(new Heart({x: (p1.x + p2.x)/2, y: (p1.y + p2.y)/2}));
                }
            }
        }
    };
}