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

    get velocity() {
        let velocity = {x: 0, y: 0};
        if (this._keys.ArrowLeft) {
            velocity.x -= 1;
        }
        if (this._keys.ArrowRight) {
            velocity.x += 1;
        }
        if (this._keys.ArrowUp) {
            velocity.y -= 1;
        }
        if (this._keys.ArrowDown) {
            velocity.y += 1;
        }
        return velocity;
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

    get velocity() {
        let velocity = {x: 0, y: 0};
        if (this._keys.a) {
            velocity.x -= 1;
        }
        if (this._keys.d) {
            velocity.x += 1;
        }
        if (this._keys.w) {
            velocity.y -= 1;
        }
        if (this._keys.s) {
            velocity.y += 1;
        }
        return velocity;
    }
}

export class GamepadInput {
    constructor(gamepad) {
        this._gamepad = gamepad;
    }

    get fast() {
        return this._gamepad.buttons[0].pressed;
    }

    get velocity() {
        return {x: this._gamepad.axes[0], y: this._gamepad.axes[1]};
    }
}