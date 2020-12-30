export default class Entity {
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
