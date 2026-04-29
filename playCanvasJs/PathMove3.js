import { Script, Vec3 } from 'playcanvas';

export class PathMove extends Script {
    initialize() {

    }

    update(dt) {
        const dir = target.clone().sub(pos).normalize();
        this.entity.rigidbody.applyForce(dir.scale(this.force));
    }

}
