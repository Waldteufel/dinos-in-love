export class Shape {
    constructor(props = {}) {
        this.mass = props.mass ?? 1;
    }
}

export class Box extends Shape {
    constructor(props = {}) {
        super(props);
        this.top = props.top;
        this.left = props.left;
        this.bottom = props.bottom;
        this.right = props.right;
    }
}

export class OuterWalls extends Shape {
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

export function resolve(a, b, {nx, ny, d}) {
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

export function collide(a, b) {
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