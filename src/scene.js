import Entity from './entity';

export default class Scene extends Entity {
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