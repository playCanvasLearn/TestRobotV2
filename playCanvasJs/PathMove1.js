import { Script, Vec3 } from 'playcanvas';

export class PathMove extends Script {
    initialize() {
        this.time = 0;
    }

    update(dt) {
        this.time += dt;
        const t = pc.math.clamp(this.time / this.duration, 0, 1);

        const p = new Vec3().lerp(
            this.startPos,
            this.endPos,
            t
        );

        this.entity.setPosition(p);
    }

}
