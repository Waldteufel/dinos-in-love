import Entity from './entity';

export default class Scene extends Entity {
    constructor(props = {}) {
        super(props);
    }

    updateAll(dt) {
        let f = (node) => {
            node.update?.(dt);
            node.sprite?.update?.(dt);
            node.children.forEach(f);
        };

        f(this);
    }

    drawAll(ctx, canvas) {
        let renderList = [];
        let alphaStack = [1.0];
        let zStack = [0];

        let f = (node) => {
            ctx.save();
            ctx.translate(Math.round(node.x), Math.round(node.y));
            ctx.rotate(node.angle);
            ctx.scale(node.scaleX, node.scaleY);

            if (node.z) {
                zStack.push(node.z + zStack[zStack.length - 1]);
            }

            if (node.alpha != null) {
                alphaStack.push(node.alpha * alphaStack[alphaStack.length - 1]);
            }

            if (node.sprite) {
                let transform = ctx.getTransform();
                let z = zStack[zStack.length - 1];
                let alpha = alphaStack[alphaStack.length - 1];

                renderList.push({
                    z,
                    draw() {
                        ctx.setTransform(transform);
                        ctx.globalAlpha = alpha;
                        node.sprite.draw(ctx, canvas);
                        ctx.globalAlpha = 1;
                    }
                });
            }

            node.children.forEach(f);

            ctx.restore();

            if (node.z) {
                zStack.pop();
            }

            if (node.alpha != null) {
                alphaStack.pop();
            }
        };

        f(this);

        renderList.sort(({z: z1}, {z: z2}) => z1 - z2);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        for (let {draw} of renderList) {
            draw();
        }
        ctx.restore();
    }
}