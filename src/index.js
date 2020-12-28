import '../assets/style.css';
import start from './game.js';

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

    let scene = await start({canvas});

    function* main() {
        while (true) {
            let dt = yield;

            scene.updateScene(dt);
            scene.drawScene(ctx, canvas);
        }
    }

    animate(main());
})
