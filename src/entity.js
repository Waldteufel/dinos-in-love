let nextId = 1;

export default class Entity {
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
