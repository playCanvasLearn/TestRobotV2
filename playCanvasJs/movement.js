var Movement = pc.createScript('movement');

Movement.attributes.add('speed', {
    type: 'number',
    default: 0.1,
    min: 0.05,
    max: 0.5,
    precision: 2,
    description: 'Controls the movement speed'
});

Movement.attributes.add('isControllable', {
    type: 'boolean',
    default: true,
    description: 'Can this entity be controlled'
});

// Initialize code called once per entity
Movement.prototype.initialize = function() {
    this.force = new pc.Vec3();
    this.spawnPos = this.entity.getPosition().clone();

    // 第一个初始化的作为默认控制对象
    if (!this.app.currentMoveTarget && this.isControllable) {
        console.log("init currentMoveTarget");
        this.app.currentMoveTarget = this.entity;
    }
};

// Update code called every frame
Movement.prototype.update = function(dt) {

    // 不是当前控制对象，直接 return
    if (this.app.currentMoveTarget !== this.entity) {
        this._updateAnimationSpeed(0);
        return;
    }

    // 玩家掉落处理
    const pos = this.entity.getPosition();
    if (pos.y < -1) {
        this.teleport(this.spawnPos);
        return;
    }

    const keyboard = this.app.keyboard;
    let forceX = 0;
    let forceZ = 0;

    // 计算移动输入
    if (keyboard.isPressed(pc.KEY_LEFT) || keyboard.isPressed(pc.KEY_A)) forceX = -this.speed;
    if (keyboard.isPressed(pc.KEY_RIGHT) || keyboard.isPressed(pc.KEY_D)) forceX += this.speed;
    if (keyboard.isPressed(pc.KEY_UP) || keyboard.isPressed(pc.KEY_W)) forceZ = -this.speed;
    if (keyboard.isPressed(pc.KEY_DOWN) || keyboard.isPressed(pc.KEY_S)) forceZ += this.speed;

    this.force.set(forceX, 0, forceZ);

    // 是否有移动输入
    const speed = this.force.length();

    // 更新动画参数
    this._updateAnimationSpeed(speed);

    // 移动逻辑
    if (speed > 0) {
        this.force.normalize().scale(this.speed);

        const angle = -Math.PI * 0.25;
        const rx = Math.cos(angle);
        const rz = Math.sin(angle);
        const fx = this.force.x * rx - this.force.z * rz;
        const fz = this.force.z * rx + this.force.x * rz;

        this.force.set(fx, 0, fz);
    }

    if (keyboard.wasPressed(pc.KEY_SPACE)) {
        // 给 Rigidbody 一个向上的冲量
        this.entity.rigidbody.applyImpulse(0, 0.2, 0); // 0.2 可根据实际调节跳跃高度
        // 播放跳跃动画
        if (this.entity.anim) {
            this.entity.anim.setBoolean('playerJump', true);
        }
    }

    // 如果在空中且垂直速度为负（下落），可以让 jump 参数恢复 false
    if (this.entity.rigidbody.linearVelocity.y <= 0) {
        if (this.entity.anim) {
            this.entity.anim.setBoolean('playerJump', false);
        }
    }

    // 应用冲量移动
    this.entity.rigidbody.applyImpulse(this.force);
};

// 更新 Animation Graph 参数（安全检查）
Movement.prototype._updateAnimationSpeed = function(speed) {
    //console.log(this.entity)

    if (!this.entity.anim) return;
    //const graph = this.entity.anim.graph;
    //if (!graph) return;
    // 设置 ASG 的参数
    //console.log("_updateAnimationSpeed")
    this.entity.anim.setFloat('playerSpeed', speed);
    //this.entity.anim.setInteger.setGraphParameter('playerSpeed', speed);
};

// 传送方法
Movement.prototype.teleport = function(pos) {
    this.entity.rigidbody.teleport(pos);
    this.spawnPos.copy(pos);
    this.entity.rigidbody.linearVelocity = pc.Vec3.ZERO;
    this.entity.rigidbody.angularVelocity = pc.Vec3.ZERO;
};
