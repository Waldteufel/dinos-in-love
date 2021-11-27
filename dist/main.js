/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/assets.js":
/*!***********************!*\
  !*** ./src/assets.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "loadImage": () => (/* binding */ loadImage),
/* harmony export */   "ImageAsset": () => (/* binding */ ImageAsset)
/* harmony export */ });
async function loadImage(name) {
    let img = new Image();
    img.src = './assets/' + name;
    await img.decode();
    return img;
}

class ImageAsset {
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
                result[k++] = this.frame({i: i + ii, j: j + jj, ...props});
            }
        }

        return result;
    }
}


/***/ }),

/***/ "./src/entity.js":
/*!***********************!*\
  !*** ./src/entity.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Entity)
/* harmony export */ });
let nextId = 1;

class Entity {
    constructor(props) {
        this._parent = null;
        this._children = new Set();

        this.touches = new Set();

        this.id = nextId++;
        this.name = `${this.constructor.name}#${this.id}`;

        this.vx = 0;
        this.vy = 0;
        this.vrot = 0;

        this.x = 0;
        this.y = 0;
        this.rot = 0;
        this.scaleX = 1;
        this.scaleY = 1;

        Object.assign(this, props);
    }

    toString() {
        return this.name;
    }

    updateTransform() {
        if (this._parent) {
            this._matrix = DOMMatrix.fromMatrix(this.parent._matrix);
        } else {
            this._matrix = new DOMMatrix();
        }

        this._matrix.translateSelf(Math.round(this.x), Math.round(this.y));
        this._matrix.rotateSelf(0, 0, this.rot);
        this._matrix.scaleSelf(this.scaleX, this.scaleY);
        this._anchor = this._matrix.transformPoint({x: 0, y: 0, z: this.z});
    }

    get parent() {
        return this._parent;
    }

    set parent(value) {
        if (this._parent) {
            this._parent._children.delete(this);
        }
        this._parent = value;
        if (this._parent) {
            this._parent._children.add(this);
        }
    }

    get children() {
        return this._children;
    }

    set children(value) {
        for (let c of this._children) {
            c._parent = null;
        }
        this._children = value;
        for (let c of this._children) {
            c._parent = this;
        }
    }

    addChild(c) {
        this._children.add(c);
        c._parent = this;
    }

    removeChild(c) {
        this._children.delete(c);
        c._parent = null;
    }

    remove() {
        this.parent = null;
    }
}


/***/ }),

/***/ "./src/game.js":
/*!*********************!*\
  !*** ./src/game.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ start)
/* harmony export */ });
/* harmony import */ var _assets__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assets */ "./src/assets.js");
/* harmony import */ var _scene__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scene */ "./src/scene.js");
/* harmony import */ var _entity__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./entity */ "./src/entity.js");
/* harmony import */ var _sprites__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./sprites */ "./src/sprites.js");
/* harmony import */ var _input__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./input */ "./src/input.js");
/* harmony import */ var _shapes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./shapes */ "./src/shapes.js");








async function start({canvas}) {
    canvas.width = 320;
    canvas.height = 240;

    let images = Object.fromEntries(await Promise.all(['doux', 'mort', 'tard', 'vita'].map(async (name, i) => {
        let image = await _assets__WEBPACK_IMPORTED_MODULE_0__.ImageAsset.load({src: `${name}.png`, sw: 24, sh: 24, dx: -11, dy: -20});
        return [i, {
            'waiting slow': image.frames({i: 0, n: 3, delay: 200}),
            'waiting fast': image.frames({i: 17, n: 1, delay: Infinity}),
            'moving slow': image.frames({i: 4, n: 6, delay: 100}),
            'moving fast': image.frames({i: 18, n: 6, delay: 100}),
            'kissing': [image.frame({i: 17, delay: 400}), image.frame({i: 16, delay: 100})],
        }];
    })));

    images.heart = await _assets__WEBPACK_IMPORTED_MODULE_0__.ImageAsset.load({src: 'heart.png', dx: -8, dy: -16}).then(i => i.frames());

    class Player extends _entity__WEBPACK_IMPORTED_MODULE_2__["default"] {
        constructor(props = {}) {
            super({
                _state: null,
                frozen: -1,
                shape: new _shapes__WEBPACK_IMPORTED_MODULE_5__.Box({left: -4, right: +4, top: -2, bottom: +2}),
                ...props
            });
        }

        get state() {
            return this._state;
        }

        set state(value) {
            if (this._state != value) {
                this._state = value;
                this.sprite = new _sprites__WEBPACK_IMPORTED_MODULE_3__.ImageSprite(this.spriteSheet[this._state]);
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

    class StartText extends _entity__WEBPACK_IMPORTED_MODULE_2__["default"] {
        constructor(props) {
            super({
                _timer: 1000,
                alpha: 1.0,
                x: 160,
                y: 50,
                vy: -1/50,
                rot: -20,
                vrot: 1/20,
                sprite: new _sprites__WEBPACK_IMPORTED_MODULE_3__.TextSprite({
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

    class Heart extends _entity__WEBPACK_IMPORTED_MODULE_2__["default"] {
        constructor(props) {
            super({
                sprite: new _sprites__WEBPACK_IMPORTED_MODULE_3__.ImageSprite(images.heart),
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

    class Walls extends _entity__WEBPACK_IMPORTED_MODULE_2__["default"] {
        constructor(props) {
            super({
                shape: new _shapes__WEBPACK_IMPORTED_MODULE_5__.OuterWalls({mass: Infinity, top: 16, left: 10, right: 310, bottom: 240}),
                ...props
            });
        }
    }

    return new class extends _scene__WEBPACK_IMPORTED_MODULE_1__["default"] {
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
                    new Player({input: new _input__WEBPACK_IMPORTED_MODULE_4__.WASDInput(), x: 100, y: 100, spriteSheet: images[0]}),
                    new Player({input: new _input__WEBPACK_IMPORTED_MODULE_4__.ArrowsInput(), x: 200, y: 200, spriteSheet: images[1]})
                ];
            } else {
                this.players = gamepads.map((g, i) => new Player({input: new _input__WEBPACK_IMPORTED_MODULE_4__.GamepadInput(g), x: 50 + 50 * i, y: 50 + 50 * i, spriteSheet: images[i]}));
            }

            this.players.forEach(p => this.addChild(p));

            this.addChild(new StartText());
        }
    };
}

/***/ }),

/***/ "./src/input.js":
/*!**********************!*\
  !*** ./src/input.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ArrowsInput": () => (/* binding */ ArrowsInput),
/* harmony export */   "WASDInput": () => (/* binding */ WASDInput),
/* harmony export */   "GamepadInput": () => (/* binding */ GamepadInput)
/* harmony export */ });
class ArrowsInput {
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

class WASDInput {
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

class GamepadInput {
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

/***/ }),

/***/ "./src/scene.js":
/*!**********************!*\
  !*** ./src/scene.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Scene)
/* harmony export */ });
/* harmony import */ var _entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./entity */ "./src/entity.js");
/* harmony import */ var _shapes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shapes */ "./src/shapes.js");



class Scene extends _entity__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(props = {}) {
        super(props);
    }

    updateAll(dt) {
        this._renderList = [];
        this._collideList = [];

        let walk = (node) => {
            node.update?.(dt);
            node.touches.clear();

            node.x += node.vx * dt;
            node.y += node.vy * dt;
            node.rot += node.vrot * dt;

            node.updateTransform();

            if (node.sprite) {
                node.sprite.update?.(dt);
                this._renderList.push(node);
            }

            if (node.shape) {
                this._collideList.push(node);
            }

            // TODO: pre-calculate global transformation here?
            // TODO: collision detection
            node.children.forEach(walk);
        };

        walk(this);

        let again = true;
        let n = 0;

        do {
            again = false;
            for (let i = 0; i < this._collideList.length; ++i) {
                for (let j = i + 1; j < this._collideList.length; ++j) {
                    let coll = (0,_shapes__WEBPACK_IMPORTED_MODULE_1__.collide)(this._collideList[i], this._collideList[j]);
                    if (coll) {
                        this._collideList[i].touches.add({other: this._collideList[j], nx: -coll.nx, ny: -coll.ny});
                        this._collideList[j].touches.add({other: this._collideList[i], nx: coll.nx, ny: coll.ny});
                        if (coll.d < 0) // positions adjusted -> check again
                            again = true;
                    }
                }
            }
        } while (again && ++n < 10);

        if (n > 2) {
            console.warn(`no solution after ${n} collision passes!`);
        }
    }

    drawAll(ctx, canvas) {
        this._renderList.sort((node1, node2) => (node1._anchor.z - node2._anchor.z) || (node1._anchor.y - node2._anchor.y));

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let node of this._renderList) {
            ctx.save();
            ctx.transform(node._matrix.a, node._matrix.b, node._matrix.c, node._matrix.d, node._matrix.e, node._matrix.f);
            ctx.globalAlpha = node.alpha;
            node.sprite.draw(ctx, canvas);
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    }
}

/***/ }),

/***/ "./src/shapes.js":
/*!***********************!*\
  !*** ./src/shapes.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Shape": () => (/* binding */ Shape),
/* harmony export */   "Box": () => (/* binding */ Box),
/* harmony export */   "OuterWalls": () => (/* binding */ OuterWalls),
/* harmony export */   "resolve": () => (/* binding */ resolve),
/* harmony export */   "collide": () => (/* binding */ collide)
/* harmony export */ });
class Shape {
    constructor(props = {}) {
        this.mass = props.mass ?? 1;
    }
}

class Box extends Shape {
    constructor(props = {}) {
        super(props);
        this.top = props.top;
        this.left = props.left;
        this.bottom = props.bottom;
        this.right = props.right;
    }
}

class OuterWalls extends Shape {
    constructor(props = {}) {
        super(props);
        this.top = props.top;
        this.left = props.left;
        this.bottom = props.bottom;
        this.right = props.right;
    }
}

const collisionTests = [
    {shapes: [Box, Box], test(a, b) {
        let candidates = [
            {nx: +1, ny: 0, d: (b._anchor.x + b.shape.left) - (a._anchor.x + a.shape.right)},
            {nx: -1, ny: 0, d: (a._anchor.x + a.shape.left) - (b._anchor.x + b.shape.right)},
            {nx: 0, ny: +1, d: (b._anchor.y + b.shape.top) - (a._anchor.y + a.shape.bottom)},
            {nx: 0, ny: -1, d: (a._anchor.y + a.shape.top) - (b._anchor.y + b.shape.bottom)},
        ];

        if (candidates.some(c => c.d > 0)) {
            return null;
        }

        return candidates.reduce((prev, next) => prev.d > next.d ? prev : next);
    }},
    {shapes: [Box, OuterWalls], test(a, b) {
        let candidates = [
            {nx: +1, ny: 0, d: (a._anchor.x + a.shape.left) - (b._anchor.x + b.shape.left)},
            {nx: -1, ny: 0, d: (b._anchor.x + b.shape.right) - (a._anchor.x + a.shape.right)},
            {nx: 0, ny: +1, d: (a._anchor.y + a.shape.top) - (b._anchor.y + b.shape.top)},
            {nx: 0, ny: -1, d: (b._anchor.y + b.shape.bottom) - (a._anchor.y + a.shape.bottom)},
        ].filter(c => c.d <= 0);

        if (candidates.length == 0) {
            return null;
        }

        let coll = candidates.reduce((prev, next) => ({nx: prev.nx + next.nx, ny: prev.ny + next.ny, d: -1 * (prev.d**2 + next.d**2)**0.5}));

        let n = (coll.nx**2 + coll.ny**2)**0.5;

        if (n != 0) {
            coll.nx /= n;
            coll.ny /= n;
        }

        return coll;
    }}
];

function massFactors(ma, mb) {
    if (ma == Infinity) {
        if (mb == Infinity) {
            return [0, 0];
        } else {
            return [0, 1];
        }
    } else if (mb == Infinity) {
        return [1, 0];
    } else if (ma + mb == 0) {
        return [0, 0];
    } else {
        let f = ma / (ma + mb);
        return [1-f, f];
    }
}

function resolve(a, b, {nx, ny, d}) {
    if (nx == 0 && ny == 0) {
        // no surface normal -> no resolution
        return;
    }

    // calculate velocities along surface normal
    let va_n = a.vx * nx + a.vy * ny;
    let vb_n = b.vx * nx + b.vy * ny;

    // adjust positions
    let [fa, fb] = massFactors(a.shape.mass, b.shape.mass);

    a.x -= fa * d * nx;
    a.y -= fa * d * ny;

    b.x += fb * d * nx;
    b.y += fb * d * ny;

    // adjust velocities
    if (va_n < 0) {
        a.vx -= va_n * nx;
        a.vy -= va_n * ny;
    }

    if (vb_n > 0) {
        b.vx += vb_n * nx;
        b.vy += vb_n * ny;
    }

    // TODO: physical correctness

    a.updateTransform();
    b.updateTransform();
}

function collide(a, b) {
    for (let test of collisionTests) {
        if (b.shape instanceof test.shapes[0] && a.shape instanceof test.shapes[1])
            [a, b] = [b, a];

        if (a.shape instanceof test.shapes[0] && b.shape instanceof test.shapes[1]) {
            let coll = test.test(a, b);
            if (coll) {
                resolve(a, b, coll);
            }
            return coll;
        }
    }
}

/***/ }),

/***/ "./src/sprites.js":
/*!************************!*\
  !*** ./src/sprites.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ImageSprite": () => (/* binding */ ImageSprite),
/* harmony export */   "TextSprite": () => (/* binding */ TextSprite)
/* harmony export */ });
class ImageSprite {
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

class TextSprite {
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

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _game_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game.js */ "./src/game.js");


function animate(g) {
    let t0 = performance.now();

    function frame(t1) {
        let dt = t1 - t0;
        t0 = t1;

        let {done} = g.next(dt);
        if (!done) {
            requestAnimationFrame(frame);
        }
    }

    requestAnimationFrame(frame);
}

window.addEventListener('load', async () => {
    let canvas = document.getElementById('main-canvas');
    let ctx = canvas.getContext('2d', {alpha: true});
    ctx.imageSmoothingEnabled = false;

    let scene = await (0,_game_js__WEBPACK_IMPORTED_MODULE_0__["default"])({canvas});

    function* main() {
        while (true) {
            let dt = yield;

            scene.updateAll(dt);
            scene.drawAll(ctx, canvas);
        }
    }

    animate(main());
})

})();

/******/ })()
;
//# sourceMappingURL=main.js.map