import { Script, Vec3 } from 'playcanvas';

export class PathMove extends Script {
    initialize() {

    }

    update(dt) {

    }

    catmullRom(p0, p1, p2, p3, t) {
        const t2 = t * t;
        const t3 = t2 * t;

        return p1.clone().scale(2)
            .add(p2.clone().sub(p0).scale(t))
            .add(p0.clone().scale(2).sub(p1.clone().scale(5)).add(p2.clone().scale(4)).sub(p3).scale(t2))
            .add(p3.clone().sub(p0).add(p1.clone().scale(3).sub(p2.clone().scale(3))).scale(t3))
            .scale(0.5);
    }

}
