import {ImageAsset} from './assets';
import Scene from './scene';
import Entity from './entity';
import {ImageSprite, TextSprite} from './sprites';
import {ArrowsInput, WASDInput, GamepadInput} from './input';

import {OuterWalls, Box} from './shapes';

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
            'kissing': [image.frame({i: 17, delay: 400}), image.frame({i: 16, delay: 100})],
        }];
    })));

    images.heart = await ImageAsset.load({src: 'heart.png', dx: -8, dy: -16}).then(i => i.frames());

    class Player extends Entity {
        constructor(props = {}) {
            super({
                _state: null,
                frozen: -1,
                shape: new Box({left: -4, right: +4, top: -2, bottom: +2}),
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

            for (let {other, nx, ny} of this.touches) {
                if (other instanceof Player) {
                    if (ny != 0) {
                        this.x -= 4 * nx;
                        this.y -= 4 * ny;

                        other.x += 4 * nx;
                        other.y += 4 * ny;
                    } else if (other.frozen <= 0) {
                        this.frozen = 500;
                        other.frozen = 500;

                        this.state = 'kissing';
                        other.state = 'kissing';

                        if (this.x < other.x) {
                            this.scaleX = 1;
                            other.scaleX = -1;
                        } else {
                            this.scaleX = -1;
                            other.scaleX = 1;
                        }

                        this.x -= 8 * nx;
                        this.y -= 8 * ny;

                        other.x += 8 * nx;
                        other.y += 8 * ny;

                        this.parent.addChild(new Heart({x: (this.x + other.x)/2, y: (this.y + other.y)/2}));

                        return;
                    }
                }
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

    class Heart extends Entity {
        constructor(props) {
            super({
                sprite: new ImageSprite(images.heart),
                timer: 1400,
                alpha: 0,
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

            if (this.timer < 1000) {
                this.scaleX += dt / 1000;
                this.scaleY += dt / 1000;
                this.alpha = this.timer / 1000;
            }
        }
    }

    class Walls extends Entity {
        constructor(props) {
            super({
                shape: new OuterWalls({mass: Infinity, top: 16, left: 10, right: 310, bottom: 240}),
                ...props
            });
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

            this.addChild(new Walls());
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
                this.players = gamepads.map((g, i) => new Player({input: new GamepadInput(g), x: 50 + 50 * i, y: 50 + 50 * i, spriteSheet: images[i]}));
            }

            this.players.forEach(p => this.addChild(p));

            this.addChild(new StartText());
        }
    };
}