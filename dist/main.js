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
/* harmony export */   "loadImage": () => /* binding */ loadImage,
/* harmony export */   "ImageAsset": () => /* binding */ ImageAsset
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
/* harmony export */   "default": () => /* binding */ Entity
/* harmony export */ });
class Entity {
    constructor(props) {
        this._parent = null;
        this._children = new Set();

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
/* harmony export */   "Player": () => /* binding */ Player,
/* harmony export */   "default": () => /* binding */ start
/* harmony export */ });
/* harmony import */ var _assets__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assets */ "./src/assets.js");
/* harmony import */ var _scene__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scene */ "./src/scene.js");
/* harmony import */ var _entity__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./entity */ "./src/entity.js");
/* harmony import */ var _sprites__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./sprites */ "./src/sprites.js");
/* harmony import */ var _input__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./input */ "./src/input.js");






class Player extends _entity__WEBPACK_IMPORTED_MODULE_2__.default {
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

class StartText extends _entity__WEBPACK_IMPORTED_MODULE_2__.default {
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
            'frozen': [image.frame({i: 14, delay: 50}), image.frame({i: 16, delay: 50})]
        }];
    })));

    images.heart = await _assets__WEBPACK_IMPORTED_MODULE_0__.ImageAsset.load({src: 'heart.png', dx: -8, dy: -16}).then(i => i.frames());

    class Heart extends _entity__WEBPACK_IMPORTED_MODULE_2__.default {
        constructor(props) {
            super({
                sprite: new _sprites__WEBPACK_IMPORTED_MODULE_3__.ImageSprite(images.heart),
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

    return new class extends _scene__WEBPACK_IMPORTED_MODULE_1__.default {
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
                    new Player({input: new _input__WEBPACK_IMPORTED_MODULE_4__.WASDInput(), x: 100, y: 100, spriteSheet: images[0]}),
                    new Player({input: new _input__WEBPACK_IMPORTED_MODULE_4__.ArrowsInput(), x: 200, y: 200, spriteSheet: images[1]})
                ];
            } else {
                this.players = gamepads.map((g, i) => new Player({input: new _input__WEBPACK_IMPORTED_MODULE_4__.GamepadInput(g), x: 100 + 50 * i, y: 100 + 50 * i, spriteSheet: images[i]}));
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

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

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

    let scene = await (0,_game_js__WEBPACK_IMPORTED_MODULE_0__.default)({canvas});

    function* main() {
        while (true) {
            let dt = yield;

            scene.updateAll(dt);
            scene.drawAll(ctx, canvas);
        }
    }

    animate(main());
})


/***/ }),

/***/ "./src/input.js":
/*!**********************!*\
  !*** ./src/input.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ArrowsInput": () => /* binding */ ArrowsInput,
/* harmony export */   "WASDInput": () => /* binding */ WASDInput,
/* harmony export */   "GamepadInput": () => /* binding */ GamepadInput
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
/* harmony export */   "default": () => /* binding */ Scene
/* harmony export */ });
/* harmony import */ var _entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./entity */ "./src/entity.js");


class Scene extends _entity__WEBPACK_IMPORTED_MODULE_0__.default {
    constructor(props = {}) {
        super(props);
    }

    updateAll(dt) {
        this._renderList = [];

        let walk = (node) => {
            node.update?.(dt);

            node.x += node.vx * dt;
            node.y += node.vy * dt;
            node.rot += node.vrot * dt;

            if (node.parent) {
                node._matrix = DOMMatrix.fromMatrix(node.parent._matrix);
            } else {
                node._matrix = new DOMMatrix();
            }

            node._matrix.translateSelf(Math.round(node.x), Math.round(node.y));
            node._matrix.rotateSelf(0, 0, node.rot);
            node._matrix.scaleSelf(node.scaleX, node.scaleY);
            node._anchor = node._matrix.transformPoint({x: 0, y: 0, z: node.z});

            if (node.sprite) {
                node.sprite.update?.(dt);
                this._renderList.push(node);
            }

            // TODO: pre-calculate global transformation here?
            // TODO: collision detection
            node.children.forEach(walk);
        };

        walk(this);
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

/***/ "./src/sprites.js":
/*!************************!*\
  !*** ./src/sprites.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ImageSprite": () => /* binding */ ImageSprite,
/* harmony export */   "TextSprite": () => /* binding */ TextSprite
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
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
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
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
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
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./src/index.js");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;
//# sourceMappingURL=main.js.map