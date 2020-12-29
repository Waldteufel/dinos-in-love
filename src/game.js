import {ImageAsset} from './assets';
import Scene from './scene';
import * as Entity from './entity';
import {ArrowsInput, WASDInput, GamepadInput} from './input';

export class Player extends Entity.Base {
    constructor(props = {}) {
        super(props);
        this.input = props.input;
        this.spriteSheet = props.spriteSheet;
        this.sprite = new Entity.Sprite({});
        this.addChild(this.sprite);
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

class StartText extends Entity.Text {
    constructor(props = {}) {
        super(props);
        this.alpha = 1.0;
        this.angle = -0.5;
        this.x = 160;
        this.y = 50;
        this._timer = 1000;
        this.textAlign = 'center';
        this.textBaseline = 'middle';
        this.fillStyle = 'white';
        this.font = '8px sans-serif';
        this.text = 'START';
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
}

export default async function start({canvas}) {
    canvas.width = 320;
    canvas.height = 240;

    let images = Object.fromEntries(await Promise.all(['doux', 'mort', 'tard', 'vita'].map(async (name, i) => {
        let image = await ImageAsset.load({src: `${name}.png`, sw: 24, sh: 24, dx: -11, dy: -20});
        return [i, {
            'idle slow': image.frames({i: 0, n: 3, delay: 200}),
            'idle fast': image.frames({i: 17, n: 1, delay: Infinity}),
            'move slow': image.frames({i: 4, n: 6, delay: 100}),
            'move fast': image.frames({i: 18, n: 6, delay: 100}),
            'freeze': [image.frame({i: 14, delay: 50}), image.frame({i: 16, delay: 50})]
        }];
    })));

    images.heart = await ImageAsset.load({src: 'heart.png', dx: -8, dy: -16}).then(i => i.frames());

    class Heart extends Entity.Base {
        constructor(props = {}) {
            super(props);
            this.sprite = this.addChild(new Entity.Sprite({frames: images.heart}));
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