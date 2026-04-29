import { Script, Vec3, math, KEY_A, KEY_D, KEY_W, KEY_S } from 'playcanvas';

export class PlayerController extends Script {
    /**
     * The entity that holds the animation component.
     *
     * @attribute
     * @title Animation Entity
     * @type {pc.Entity}
     */
    animEntity;

    /**
     * The movement force applied to the player.
     *
     * @attribute
     * @title Power
     * @type {number}
     */
    power = 450000;

    initialize() {
        this._anim = this.animEntity.anim;
        this._angle = 0;
        this._input = true;

        // Create a single Vec3 instance to reuse every frame
        this._frameMovement = new Vec3();
    }

    update(dt) {
        this._frameMovement.set(0, 0, 0);

        if (this._input) {
            const keyboard = this.app.keyboard;

            if (keyboard.isPressed(KEY_A)) this._frameMovement.x += 1;
            if (keyboard.isPressed(KEY_D)) this._frameMovement.x -= 1;
            if (keyboard.isPressed(KEY_W)) this._frameMovement.z += 1;
            if (keyboard.isPressed(KEY_S)) this._frameMovement.z -= 1;
        }

        if (this._frameMovement.x !== 0 || this._frameMovement.z !== 0) {
            this._frameMovement.normalize().scale(this.power * dt);
            this.entity.rigidbody.applyForce(this._frameMovement);

            // Set the speed parameter in the animation
            this._anim.setFloat('Speed', this.entity.rigidbody.linearVelocity.length());

            // Rotate the model towards movement direction
            const newAngle = 90 - Math.atan2(this._frameMovement.z, this._frameMovement.x) * math.RAD_TO_DEG;
            this._angle = math.lerpAngle(this._angle, newAngle, 0.4) % 360;
            this.animEntity.setEulerAngles(0, this._angle, 0);
        } else {
            this._anim.setFloat('Speed', 0);
        }
    }
}