import {Entity} from './entity';

export default class Scene extends Entity {
    constructor(props) {
        super(props);
    }

    updateScene(dt) {
        let f = (node) => {
            node.update?.(dt);
            node.children.forEach(f);
        };

        f(this);
    }

    drawScene(ctx, canvas) {
        let renderList = [];
        let alpha = 1.0;

        let f = (node) => {
            if (!node.draw && node.children.size == 0)
                return;

            ctx.save();
            ctx.translate(Math.round(node.x), Math.round(node.y));
            ctx.rotate(node.angle);
            ctx.scale(node.scaleX, node.scaleY);

            let oldAlpha = alpha;

            if (node.alpha)
                alpha = alpha * node.alpha;

            let newAlpha = alpha;

            if (node.draw) {
                let transform = ctx.getTransform();

                renderList.push({
                    z: node.z,
                    draw() {
                        ctx.setTransform(transform);
                        ctx.globalAlpha = newAlpha;
                        node.draw(ctx, canvas);
                        ctx.globalAlpha = 1;
                    }
                });
            }

            node.children.forEach(f);

            alpha = oldAlpha;
            ctx.restore();
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