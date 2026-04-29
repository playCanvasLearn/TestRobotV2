import { Script, Vec3 } from 'playcanvas';

export class PathMove extends Script {
    initialize() {
        this.points = [
            new Vec3(0, 0, 0),
            new Vec3(3, 0, 2),
            new Vec3(6, 0, 5)
        ];
        this.speed = 2;
        this.index = 0;
    }

    update(dt) {
        const target = this.points[this.index];
        const pos = this.entity.getPosition();

        const dir = target.clone().sub(pos);
        const dist = dir.length();

        if (dist < 0.1) {
            this.index = (this.index + 1) % this.points.length;
            return;
        }

        dir.normalize();
        this.entity.translate(dir.scale(this.speed * dt));
        this.entity.lookAt(target);
    }
}
