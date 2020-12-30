export class ArrowsInput {
    constructor() {
        this._keys = {};
        this._listener = (e) => this._keys[e.key] = (e.type == 'keydown');
        window.addEventListener('keyup', this._listener);
        window.addEventListener('keydown', this._listener);
    }

    close() {
        window.removeEventListener('keyup', this._listener);
        window.removeEventListener('keydown', this._listener);
    }

    get fast() {
        return this._keys.Shift;
    }

    get vx() {
        let value = 0;

        if (this._keys.ArrowLeft) {
            value -= 1;
        }

        if (this._keys.ArrowRight) {
            value += 1;
        }

        if (this.fast) {
            value *= 1.5;
        } else {
            value *= 0.5;
        }

        return value;
    }

    get vy() {
        let value = 0;

        if (this._keys.ArrowUp) {
            value -= 1;
        }

        if (this._keys.ArrowDown) {
            value += 1;
        }

        if (this.fast) {
            value *= 1.5;
        } else {
            value *= 0.5;
        }

        return value;
    }
}

export class WASDInput {
    constructor() {
        this._keys = {};
        this._listener = (e) => this._keys[e.key] = (e.type == 'keydown');
        window.addEventListener('keyup', this._listener);
        window.addEventListener('keydown', this._listener);
    }

    close() {
        window.removeEventListener('keyup', this._listener);
        window.removeEventListener('keydown', this._listener);
    }

    get fast() {
        return this._keys.f;
    }

    get vx() {
        let value = 0;

        if (this._keys.a) {
            value -= 1;
        }

        if (this._keys.d) {
            value += 1;
        }

        if (this.fast) {
            value *= 1.5;
        } else {
            value *= 0.5;
        }

        return value;
    }

    get vy() {
        let value = 0;

        if (this._keys.w) {
            value -= 1;
        }

        if (this._keys.s) {
            value += 1;
        }

        if (this.fast) {
            value *= 1.5;
        } else {
            value *= 0.5;
        }

        return value;
    }
}

export class GamepadInput {
    constructor(gamepad) {
        this._gamepad = gamepad;
    }

    get fast() {
        return this._gamepad.buttons[0].pressed;
    }

    get vx() {
        return this._gamepad.axes[0] * (this.fast ? 1.5 : 0.5);
    }

    get vy() {
        return this._gamepad.axes[1] * (this.fast ? 1.5 : 0.5);
    }
}