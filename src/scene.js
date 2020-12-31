import Entity from './entity';
import {collide} from './shapes';

export default class Scene extends Entity {
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
                    let coll = collide(this._collideList[i], this._collideList[j]);
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