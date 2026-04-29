// 创建 PlayCanvas 脚本：机器人沿路径移动
var RobotPathMove = pc.createScript('robotPathMove');

/* =========================================================
 * 可调参数（在 Editor 面板中可配置）
 * ========================================================= */

// 用于控制动画朝向的实体（通常是模型节点）
// 如果不填，则默认使用当前 entity 本身旋转
RobotPathMove.attributes.add('animEntity', { type: 'entity' });

// 到达路径点的判定距离（小于该值认为“到点”）
RobotPathMove.attributes.add('arriveDistance', { type: 'number', default: 0.15 });

// 最大移动速度限制（防止物理速度失控）
RobotPathMove.attributes.add('moveSpeed', { type: 'number', default: 0.8});

// pause 节点停留时间（秒）
RobotPathMove.attributes.add('pauseTime', { type: 'number', default: 2 });

RobotPathMove.attributes.add('labelPlane', { type: 'entity' });
RobotPathMove.attributes.add('labelOffsetY', { type: 'number', default: 1.8 });

/* =========================================================
 * initialize：脚本初始化
 * ========================================================= */
RobotPathMove.prototype.initialize = function () {

    /**
     * 路径数据：
     * - position：目标位置
     * - lookAt：到点后或 pause 时朝向的位置
     * - turn === 'pause' 表示停留节点
     * - 左边  z轴 正方向
     * - 里面  x轴 负方向
     */
    this.path = [
        { showMessage: '去拿料', turn: '', position: { x: 1.7, y: 0, z: 0 }, lookAt: { x: 1.7, y: 0, z: 1.3 } },
        { showMessage: '去拿料', turn: '', position: { x: 1.7, y: 0, z: 1.3 }, lookAt: { x: 1.7, y: 0, z: 2.5 } },
        { showMessage: '去拿料', turn: '', position: { x: 1.7, y: 0, z: 2.5 }, lookAt: { x: 1.7, y: 0, z: 4.5 } },
        { showMessage: '去拿料', turn: '', position: { x: 1.7, y: 0, z: 4.5 }, lookAt: { x: 1.7, y: 0, z: 5.2 } },
        { showMessage: '拿料中', turn: '', position: { x: 1.7, y: 0, z: 5.2 }, lookAt: { x: 1.7, y: 0, z: 5.2 } },
        { showMessage: '拿料中', turn: '', position: { x: 1.5, y: 0, z: 5.2 }, lookAt: { x: 1, y: 0, z: 5.2 } },
        { showMessage: '拿料中', turn: 'pause', position: { x: 1.5, y: 0, z: 5.2 }, lookAt: { x: 1, y: 0, z: 5.2 } },
        { showMessage: '拿料中', turn: 'take', position: { x: 1.5, y: 0, z: 5.2 }, lookAt: { x: 1, y: 0, z: 5.2 } },
        { showMessage: '去加工', turn: '', position: { x: 1.7, y: 0, z: 4.5 }, lookAt: { x: 1.7, y: 0, z: -1.3 } },
        { showMessage: '去加工', turn: '', position: { x: 1.7, y: 0, z: 2.5 }, lookAt: { x: 1.7, y: 0, z: -1.3 } },
        { showMessage: '去加工', turn: '', position: { x: 1.7, y: 0, z: 0.5 }, lookAt: { x: 1.7, y: 0, z: -1.3 } },
        { showMessage: '去加工', turn: '', position: { x: 1.7, y: 0, z: -1.1 }, lookAt: { x: 1.7, y: 0, z: -1.3 } },
        { showMessage: '去加工', turn: '', position: { x: 1.7, y: 0, z: -1 }, lookAt: { x: 0.4, y: 0, z: -1.3 } },
        { showMessage: '加工中', turn: '', position: { x: 0.4, y: 0, z: -0.9 }, lookAt: { x: 0.2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'pause', position: { x: 0.4, y: 0, z: -0.9 }, lookAt: { x: 0.2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'openDoor', position: { x: 0.4, y: 0, z: -0.9 }, lookAt: { x: 0.2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'take', position: { x: 0.4, y: 0, z: -0.9 }, lookAt: { x: 0.2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'closeDoor', position: { x: 0.4, y: 0, z: -0.9 }, lookAt: { x: 0.2, y: 0, z: -0.9 } },
        { showMessage: '去检测', turn: '', position: { x: 0.4, y: 0, z: -0.9 }, lookAt: { x: 0.4, y: 0, z: -1.2 } },
        { showMessage: '去检测', turn: '', position: { x: 0.4, y: 0, z: -1.2 }, lookAt: { x: 0.4, y: 0, z: -2.9 } },
        { showMessage: '去检测', turn: '', position: { x: 0.4, y: 0, z: -2.9 }, lookAt: { x: 0.4, y: 0, z: -3.9 } },
        { showMessage: '去检测', turn: '', position: { x: 0.4, y: 0, z: -3.9 }, lookAt: { x: 0.4, y: 0, z: -6.4 } },
        { showMessage: '去检测', turn: '', position: { x: 0.4, y: 0, z: -6.4 }, lookAt: { x: 0.4, y: 0, z: -6.5 } },
        { showMessage: '检测中', turn: '', position: { x: 0.2, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -6.5 } },
        { showMessage: '检测中', turn: 'pause', position: { x: 0.2, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -6.5 } },
        { showMessage: '不合格', turn: 'pause', position: { x: -0.2, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -6.5 } },
        { showMessage: '去加工', turn: '', position: { x: 0.2, y: 0, z: -6.5 }, lookAt: { x: 0.2, y: 0, z: -3.5 } },
        { showMessage: '去加工', turn: '', position: { x: 0.2, y: 0, z: -3.5 }, lookAt: { x: 0.2, y: 0, z: -0.9 } },
        { showMessage: '去加工', turn: '', position: { x: 0.2, y: 0, z: -0.9 }, lookAt: { x: 0.2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: '', position: { x: 0.4, y: 0, z: -0.9 }, lookAt: { x: -2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'pause', position: { x: 0.4, y: 0, z: -0.9 }, lookAt: { x: -2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'openDoor', position: { x: 0.4, y: 0, z: -0.9 }, lookAt: { x: -2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'take', position: { x: 0.4, y: 0, z: -0.9 }, lookAt: { x: -2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'closeDoor', position: { x: 0.4, y: 0, z: -0.9 }, lookAt: { x: -2, y: 0, z: -0.9 } },
        { showMessage: '去检测', turn: '', position: { x: 0.2, y: 0, z: -0.9 }, lookAt: { x: 0.3, y: 0, z: -1.9 } },
        { showMessage: '去检测', turn: '', position: { x: 0.2, y: 0, z: -1.9 }, lookAt: { x: 0.3, y: 0, z: -3.9 } },
        { showMessage: '去检测', turn: '', position: { x: 0.2, y: 0, z: -3.9 }, lookAt: { x: 0.3, y: 0, z: -6.4 } },
        { showMessage: '去检测', turn: '', position: { x: 0.2, y: 0, z: -6.4 }, lookAt: { x: 0.3, y: 0, z: -6.5 } },
        { showMessage: '检测中', turn: '', position: { x: 0.2, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -6.5 } },
        { showMessage: '检测中', turn: 'pause', position: { x: 0.2, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -6.5 } },
        { showMessage: '合格', turn: 'pause', position: { x: 0.1, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -6.5 } },
        { showMessage: '去放料', turn: '', position: { x: 0.3, y: 0, z: -6.5 }, lookAt: { x: 0.29, y: 0, z: -3.7 } },
        { showMessage: '去放料', turn: '', position: { x: 0.3, y: 0, z: -3.7 }, lookAt: { x: 0.3, y: 0, z: 0 } },
        { showMessage: '去放料', turn: '', position: { x: 0.3, y: 0, z: 0 }, lookAt: { x: 0.3, y: 0, z: 2 } },
        { showMessage: '去放料', turn: '', position: { x: 0.3, y: 0, z: 2 }, lookAt: { x: 0.3, y: 0, z: 2.7 } },
        { showMessage: '去放料', turn: '', position: { x: 0.3, y: 0, z: 2.7 }, lookAt: { x: 0.3, y: 0, z: 2.7 } },
        { showMessage: '去放料', turn: '', position: { x: 0.3, y: 0, z: 2.7 }, lookAt: { x: -1, y: 0, z: 2.7 } },
        { showMessage: '去放料', turn: '', position: { x: -1, y: 0, z: 2.7 }, lookAt: { x: -1, y: 0, z: 2.7 } },
        { showMessage: '去放料', turn: '', position: { x: -1, y: 0, z: 2.7 }, lookAt: { x: -1, y: 0, z: 2.7 } },
        { showMessage: '去放料', turn: '', position: { x: -1, y: 0, z: 2.7 }, lookAt: { x: -1.2, y: 0, z: 4.5 } },
        { showMessage: '去放料', turn: '', position: { x: -1.2, y: 0, z: 4.5 }, lookAt: { x: -1.2, y: 0, z: 4.5 } },
        { showMessage: '放料中', turn: 'pause', position: { x: -1.2, y: 0, z: 4.5 }, lookAt: { x: -1.3, y: 0, z: 4.5 } },
        { showMessage: '放料中', turn: 'take', position: { x: -1.2, y: 0, z: 4.5 }, lookAt: { x: -1.3, y: 0, z: 4.5 } },
        { showMessage: '放料中', turn: '', position: { x: -1.2, y: 0, z: 4.5 }, lookAt: { x: -1.3, y: 0, z: 4.5 } },
        { showMessage: '去拿料', turn: '', position: { x: -1.3, y: 0, z: 4.5 }, lookAt: { x: -1.3, y: 0, z: 2.7 } },
        { showMessage: '去拿料', turn: '', position: { x: -1.3, y: 0, z: 2.7 }, lookAt: { x: 1.8, y: 0, z: 2.5 } },
        { showMessage: '去拿料', turn: '', position: { x: 1.7, y: 0, z: 0 }, lookAt: { x: 1.7, y: 0, z: 1.3 } },/**/
    ];

    // 当前路径索引
    this._index = 0;

    // pause 节点累计时间
    this._pauseTimer = 0;

    // 复用向量，避免每帧 new 对象（性能优化）
    this._moveDir = new pc.Vec3();   // 移动方向
    this._lookDir = new pc.Vec3();   // 朝向方向

    // 目标角度（Y 轴）
    this._targetAngle = 0;

    /**
     * 记录初始欧拉角
     * 用途：
     * - 保留 X / Z 轴姿态
     * - 只控制 Y 轴旋转
     */
    var initEuler = this.animEntity
        ? this.animEntity.getEulerAngles().clone()
        : this.entity.getEulerAngles().clone();

    this._baseEuler = initEuler; // 初始姿态
    this._angle = initEuler.y;   // 当前 Y 轴角度（用于插值）

    // 监听鼠标点击（用于调试坐标）
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);

    /* ===== 门控制初始化 ===== */
    this._leftDoor = null;
    this._rightDoor = null;
    this._doorInitZ_L = 0;
    this._doorInitZ_R = 0;
    this._doorProgress = 0; // 0:关闭, 1:开启
    this._doorDir = 0;      // 0:不动, 1:开, -1:关

    // 查找门实体（遍历场景）
    var self = this;
    this.app.root.forEach(function(node) {
        if (node.name.indexOf('左侧门') !== -1) {
            self._leftDoor = node;
            self._doorInitZ_L = node.getLocalPosition().z;
        }
        if (node.name.indexOf('右侧门') !== -1) {
            self._rightDoor = node;
            self._doorInitZ_R = node.getLocalPosition().z;
        }
    });

    if (this._leftDoor && this._rightDoor) {
        console.log("Doors found:", this._leftDoor.name, this._rightDoor.name);
    } else {
        console.warn("Doors NOT found in scene!");
    }

    /**
     * 创建一个目标点可视化 Marker
     * 方便在场景中看到当前移动目标
     */
    /*
        this._targetMarker = new pc.Entity('TargetMarker');
        this._targetMarker.addComponent('model', { type: 'box' });
        this._targetMarker.setLocalScale(0.3, 0.3, 0.3);

        var sceneRoot = this.app.root.findByName('SceneRoot');
        (sceneRoot || this.app.root).addChild(this._targetMarker);

        this._targetLookMarker = new pc.Entity('TargetLookMarker');
        this._targetLookMarker.addComponent('model', { type: 'sphere' });
        this._targetLookMarker.setLocalScale(0.3, 0.3, 0.3);

        // 创建红色材质
        var redMat = new pc.StandardMaterial();
        redMat.diffuse.set(1, 0, 0); // 红色
        redMat.update();

        // 应用材质
        this._targetLookMarker.model.material = redMat;

        var sceneRoot = this.app.root.findByName('SceneRoot');
        (sceneRoot || this.app.root).addChild(this._targetLookMarker);
    */

    // Animator 组件
    this._anim = this.entity.anim || (this.animEntity && this.animEntity.anim);

    // 当前动画状态，避免重复 set
    this._playerStatus = 0;

    // 初始默认为 idle
    this.setPlayerStatus(2);

    /* ===== 创建 Plane 标签 ===== */
    this._lastMessage = '';
    this._camera = this.app.root.findByName('Camera');

    if (this.labelPlane) {
        this._initLabelCanvas();
        this._updateLabel(this.path[0].showMessage);
    }

    this._chartTimer = 0;
    var screenEntity = this.app.root.findByName('屏幕');
    if (screenEntity) {
        var meshInstances = screenEntity.render ? screenEntity.render.meshInstances : (screenEntity.model ? screenEntity.model.meshInstances : []);
        if (meshInstances.length > 0) {
            // 尝试查找名称包含 "Screen" 或 "屏幕" 的材质，或者根据名称猜测
            // 如果没有明确名称，可能需要进一步判断，暂时默认找第一个不是支架的（如果能区分）
            // 或者对所有 meshInstances 进行遍历判断
            var targetMeshInstance = meshInstances[0];

            // 简单 heuristic: 假设屏幕面板的材质名字可能特殊
            // 但如果导入的模型没有命名好，可能比较难。
            // 为了安全起见，克隆材质是必须的。

            this._initChartScreen(targetMeshInstance);
        }
    }
};

/* =========================================================
 * update：每帧更新
 * ========================================================= */
RobotPathMove.prototype.update = function (dt) {

    /* ===== 始终更新的逻辑 (门动画、图表刷新) ===== */
    this._updateDoors(dt);

    // 更新图表数据逻辑
    this._updateChart(dt);

    // 关键修复：每一帧都上传 Canvas 纹理，以便显示 ECharts 的动画效果
    if (this._chartTexture && this._chartCanvas) {
        this._chartTexture.upload();
    }

    // 必须有刚体才能移动
    if (!this.entity.rigidbody) return;

    // 路径走完直接结束
    if (this._index >= this.path.length) {
        this._index = 0;
    };

    var node = this.path[this._index];
    var target = node.position;

    var pos = this.entity.getLocalPosition();

    /* === 标签文字切换 === */
    if (node.showMessage !== this._lastMessage) {
        this._lastMessage = node.showMessage;
        this._updateLabel(node.showMessage);

        // 更新图表标题
        this._chartTitle = node.showMessage;
        this._updateChartOption();
    }

    /* === Billboard === */
    if (this.labelPlane && this._camera) {
        //this.labelPlane.lookAt(this._camera.getLocalPosition());
        //this.labelPlane.setLocalPosition(0, this.labelOffsetY, 0);
    }
    // ===== pause 节点：walk → idle（纯停留）=====
    if (node.turn === 'pause') {
        // 第一次进入 pause
        if (this._pauseTimer === 0) {
            this.setPlayerStatus(2); // walk → idle
        }

        this._pauseTimer += dt;
        this.updateLookAt(node, dt);

        if (this._pauseTimer >= this.pauseTime) {
            this._pauseTimer = 0;
            this._index++;
        }
        return;
    }
    // ===== take 节点：idle → take =====
    if (node.turn === 'take') {
        // 第一次进入 take
        if (this._pauseTimer === 0) {
            this.setPlayerStatus(3); // idle → take
        }

        this._pauseTimer += dt;
        this.updateLookAt(node, dt);

        if (this._pauseTimer >= this.pauseTime) {
            this._pauseTimer = 0;
            this._index++;
        }
        return;
    }
    // ===== openDoor 节点：触发开门 =====
    if (node.turn === 'openDoor') {
        this._doorDir = 1; // 开始开门
        this._index++;     // 立即进入下一节点，不阻塞
        return;
    }
    // ===== closeDoor 节点：触发关门 =====
    if (node.turn === 'closeDoor') {
        this._doorDir = -1; // 开始关门
        this._index++;      // 立即进入下一节点，不阻塞
        return;
    }

    // XZ 平面方向
    this._moveDir.set(
        target.x - pos.x,
        0,
        target.z - pos.z
    );

    // 更新可视化 Marker
    /*    if (this._targetMarker) {
            this._targetMarker.setLocalPosition(target.x, target.y, target.z);
        }
        if (this._targetLookMarker) {
            var look = node.lookAt;
            this._targetLookMarker.setLocalPosition(look.x, look.y, look.z);
        }*/

    var dist = this._moveDir.length();

    /* ===== 到点 ===== */
    if (dist <= this.arriveDistance) {

        // 精确贴点
        this.entity.setLocalPosition(
            target.x,
            target.y,
            target.z
        );

        // 切换到另一个点
        this._index = this._index + 1 ;
        return;
    }

    /* ===== 位移移动（无物理） ===== */
    this.setPlayerStatus(1);
    this._moveDir.normalize();

    var step = this.moveSpeed * dt;

    // 防止跨过目标
    if (step > dist) step = dist;

    pos.x += this._moveDir.x * step;
    pos.z += this._moveDir.z * step;

    this.entity.setLocalPosition(pos);

    // 朝向同步 (完全根据 lookAt 设定，与移动方向无关)
    this.updateLookAt(node, dt);
};

/* =========================================================
 * 移动时的朝向控制（面向移动方向）- 已弃用，改用 updateLookAt
 * ========================================================= */
RobotPathMove.prototype.updateMoveRotation = function (dt) {

    var dir = this._moveDir;
    if (dir.lengthSq() === 0) return;

    /**
     * atan2(x, z)：
     * - PlayCanvas 默认前方是 +Z
     * - 返回弧度，需要转成角度
     */
    this._targetAngle =
        Math.atan2(dir.x, dir.z) * pc.math.RAD_TO_DEG;

    // 角度插值（平滑转身，防抖）
    this._angle = pc.math.lerpAngle(this._angle, this._targetAngle, 0.15);

    // 只控制 Y 轴，X/Z 保持初始姿态
    var baseX = this._baseEuler.x;
    var baseZ = this._baseEuler.z;

    // 优先控制 animEntity（模型）
    (this.animEntity || this.entity)
        .setEulerAngles(baseX, this._angle, baseZ);
};

/* =========================================================
 * pause 节点的 lookAt 朝向控制
 * ========================================================= */
RobotPathMove.prototype.updateLookAt = function (node, dt) {
    // 移除对 moveDir 的依赖，完全基于 lookAt 点
    var pos = this.entity.getLocalPosition();
    var look = node.lookAt;

    // 计算朝向向量（XZ 平面）
    this._lookDir.set(
        look.x - pos.x,
        0,
        look.z - pos.z
    );

    if (this._lookDir.lengthSq() === 0) return;

    this._lookDir.normalize();

    // 使用 lookDir 计算目标角度
    this._targetAngle = Math.atan2(this._lookDir.x, this._lookDir.z) * pc.math.RAD_TO_DEG;

    this._angle = pc.math.lerpAngle(this._angle, this._targetAngle, 0.15);

    var baseX = this._baseEuler.x;
    var baseZ = this._baseEuler.z;

    (this.animEntity || this.entity)
        .setEulerAngles(baseX, this._angle, baseZ);
};

/* =========================================================
 * 鼠标点击：输出点击到地面的世界坐标（调试用）
 * ========================================================= */
RobotPathMove.prototype.onMouseDown = function (event) {

    var cameraEntity = this.app.root.findByName('Camera');
    if (!cameraEntity || !cameraEntity.camera) return;

    var camera = cameraEntity.camera;

    // 屏幕坐标 → 世界射线
    var from = camera.screenToWorld(event.x, event.y, camera.nearClip);
    var to   = camera.screenToWorld(event.x, event.y, camera.farClip);

    var dir = to.clone().sub(from).normalize();

    // 与 y = 0 平面的交点
    var t = -from.y / dir.y;
    var point = from.clone().add(dir.clone().scale(t));

    console.log('点击坐标:', point);
};

RobotPathMove.prototype.setPlayerStatus = function (status) {
    if (!this._anim) return;
    if (this._playerStatus === status) return;

    this._playerStatus = status;
    this._anim.setInteger('playerStatus', status);
};

/* ---------- 门动画逻辑 ---------- */
RobotPathMove.prototype._updateDoors = function (dt) {
    if (!this._leftDoor || !this._rightDoor || this._doorDir === 0) return;

    // 3秒内完成移动，速度 = 1/3
    var speed = 1.0 / 3.0;

    this._doorProgress += dt * speed * this._doorDir;
    this._doorProgress = pc.math.clamp(this._doorProgress, 0, 1);

    // 更新位置
    // 左门：初始Z + 进度 (向+Z移动)
    // 右门：初始Z - 进度 (向-Z移动)
    // 假设移动距离为 1.0 (根据 demo2 参考)
    var dist = 1.0;

    var posL = this._leftDoor.getLocalPosition();
    posL.z = this._doorInitZ_L + this._doorProgress * dist;
    this._leftDoor.setLocalPosition(posL);

    var posR = this._rightDoor.getLocalPosition();
    posR.z = this._doorInitZ_R - this._doorProgress * dist;
    this._rightDoor.setLocalPosition(posR);

    // 动画完成停止计算
    if (this._doorProgress === 0 || this._doorProgress === 1) {
        this._doorDir = 0;
    }
};

/* ---------- Plane 标签系统 ---------- */
RobotPathMove.prototype._initLabelCanvas = function () {

    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;

    this._labelCanvas = canvas;
    this._ctx = canvas.getContext('2d');

    var tex = new pc.Texture(this.app.graphicsDevice, {
        format: pc.PIXELFORMAT_R8_G8_B8_A8,
        autoMipmap: true
    });
    tex.setSource(canvas);
    this._labelTexture = tex;

    var mat = new pc.StandardMaterial();
    mat.emissiveMap = tex;
    mat.emissive.set(1, 1, 1);
    mat.emissiveIntensity = 1;
    // 透明
    mat.opacityMap = tex;
    mat.opacity = 1;
    mat.blendType = pc.BLEND_NORMAL;

    // UI 必须关深度写入
    mat.depthWrite = false;

    // 可选：防止背面变暗
    mat.cull = pc.CULLFACE_NONE;

    mat.update();

    var model = this.labelPlane.model || this.labelPlane.render;
    if (!model) {
        console.error('[LabelPlane] 没有 Model / Render 组件');
        return;
    }
    model.material = mat;
};

RobotPathMove.prototype._updateLabel = function (text) {
    if (!this._ctx) return;

    var ctx = this._ctx;
    var w = this._labelCanvas.width;
    var h = this._labelCanvas.height;

    ctx.clearRect(0, 0, w, h);

    /* === 圆角背景 === */
    var r = 28;
    ctx.fillStyle = this._getBgColor(text);
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(w, 0, w, h, r);
    ctx.arcTo(w, h, 0, h, r);
    ctx.arcTo(0, h, 0, 0, r);
    ctx.arcTo(0, 0, w, 0, r);
    ctx.closePath();
    ctx.fill();

    /* === 文字 === */
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px "Microsoft YaHei", Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);

    this._labelTexture.upload();
};

/* 背景颜色策略 */
RobotPathMove.prototype._getBgColor = function (text) {
    if (text === '不合格') return 'rgba(220,60,60,0.85)';
    if (text === '合格')   return 'rgba(60,180,90,0.85)';
    if (text.indexOf('中') !== -1) return 'rgba(70,130,220,0.85)';
    return 'rgba(0,0,0,0.65)';
};

// 初始化屏幕材质
RobotPathMove.prototype._initChartScreen = function(meshInstance) {
    if (!meshInstance) return;

    // ⚠️ 克隆材质，防止影响共用材质的其他部件（如支架）
    var material = meshInstance.material.clone();
    meshInstance.material = material;

    var mesh = meshInstance.mesh;

    // 1️⃣ 创建隐藏 Canvas
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);

    this._chartCanvas = canvas;
    this._chartInstance = echarts.init(canvas, null, { renderer: 'canvas' });

    // 2️⃣ 初始化数据
    this._chartData = [];
    this._chartTitle = '实时数据监控:';

    var now = Date.now();
    var lastVal = 50;
    for (var i = 9; i >= 0; i--) {
        lastVal = lastVal + (Math.random() - 0.5) * 20;
        lastVal = Math.max(0, Math.min(100, lastVal));
        this._chartData.push({
            time: now - i * 5000,
            value: lastVal
        });
    }

    // 3️⃣ 创建 Texture
    var tex = new pc.Texture(this.app.graphicsDevice, {
        format: pc.PIXELFORMAT_R8_G8_B8_A8,
        autoMipmap: false,
        minFilter: pc.FILTER_LINEAR,
        magFilter: pc.FILTER_LINEAR,
        addressU: pc.ADDRESS_CLAMP_TO_EDGE,
        addressV: pc.ADDRESS_CLAMP_TO_EDGE
    });
    tex.setSource(canvas);
    this._chartTexture = tex;

    // 4️⃣ 创建覆盖用的 Plane (解决 UV/Mesh 问题)
    // 计算原始 Mesh 的 AABB (局部坐标)
    var mesh = meshInstance.mesh;
    var positions = [];
    mesh.getPositions(positions);
    var minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity, minZ=Infinity, maxZ=-Infinity;
    for(var i=0; i<positions.length; i+=3) {
        var x=positions[i], y=positions[i+1], z=positions[i+2];
        if(x<minX) minX=x; if(x>maxX) maxX=x;
        if(y<minY) minY=y; if(y>maxY) maxY=y;
        if(z<minZ) minZ=z; if(z>maxZ) maxZ=z;
    }

    var width = maxX - minX;
    var height = maxY - minY;
    var depth = maxZ - minZ;

    console.log("Original Mesh AABB:", width, height, depth);

    // 创建一个新的 Entity 作为屏幕显示层
    var screenPlane = new pc.Entity("ChartScreenOverlay");
    screenPlane.addComponent('model', {
        type: 'plane',
        castShadows: false,
        receiveShadows: false
    });

    // 挂载到原来的节点下
    meshInstance.node.addChild(screenPlane);

    // 定位到 AABB 中心
    var centerX = (minX + maxX) / 2;
    var centerY = (minY + maxY) / 2;
    var centerZ = (minZ + maxZ) / 2;
    screenPlane.setLocalPosition(centerX, centerY, centerZ);

    // 调整旋转和缩放
    // 根据之前的日志，是一个 XY 平面 (width=1.8, height=1.2, depth=0.15)
    // Plane 默认是 XZ 平面，法线朝上 (+Y)
    // 我们需要把它立起来，变成 XY 平面，法线朝前 (+Z) -> 绕 X 轴旋转 90 度
    screenPlane.setLocalEulerAngles(90, 0, 0);

    // 缩放：Plane 默认 1x1
    // X 对应 width, Z (原Y) 对应 height
    screenPlane.setLocalScale(width, 1, height);

    // 稍微往前挪一点点，防止 Z-fighting (虽然我们要隐藏原 Mesh，但为了保险)
    screenPlane.translateLocal(0, 0.01, 0);

    // 隐藏原来的 MeshInstance
    meshInstance.visible = false;

    console.log("Created Overlay Plane at", centerX, centerY, centerZ, "Size:", width, height);

    // 5️⃣ 给材质赋值
    console.log("Setting material textures. Texture:", tex);

    // 创建材质
    var newMat = new pc.StandardMaterial();
    newMat.name = "ChartMaterial_ECharts";

    newMat.diffuseMap = tex;
    newMat.diffuse = new pc.Color(1, 1, 1);

    newMat.emissiveMap = tex;
    newMat.emissive = new pc.Color(1, 1, 1);

    newMat.useLighting = false; // 自发光不需要光照
    newMat.cull = pc.CULLFACE_NONE; // 双面渲染

    newMat.update();

    // 赋值给新 Plane
    screenPlane.model.material = newMat;

    console.log("Assigned ECharts material to Overlay Plane.");

    // 6️⃣ 首次渲染
    // 延迟一帧渲染
    setTimeout(() => {
        this._updateChartOption();
    }, 100);

};


RobotPathMove.prototype._updateChartOption = function() {
    if (!this._chartInstance || !this._chartTexture) return;

    // 格式化数据
    var formattedData = this._chartData.map(function(item) {
        var date = new Date(item.time);
        var h = date.getHours().toString().padStart(2, '0');
        var m = date.getMinutes().toString().padStart(2, '0');
        var s = date.getSeconds().toString().padStart(2, '0');
        return {
            time: h + ':' + m + ':' + s,
            value: Number(item.value).toFixed(2)
        };
    });

    var option = {
        title: {
            text: this._chartTitle,
            textStyle: { color: '#fff', fontSize: 14 },
            left: '10%',
            top: '20%'
        },
        tooltip: {
            trigger: 'axis',
            textStyle: { color: '#fff' },
            backgroundColor: 'rgba(0,0,0,0.2)'
        },
        xAxis: {
            type: 'category',
            data: formattedData.map(function(item){ return item.time; }),
            axisLine: { lineStyle: { color: '#fff' } },
            axisLabel: { color: '#fff', fontSize: 10, rotate: 45 }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#fff' } },
            axisLabel: { color: '#fff' },
            splitLine: { show: false }
        },
        series: [{
            data: formattedData.map(function(item){ return item.value; }),
            type: 'line',
            smooth: true,
            lineStyle: { color: '#00ff00' },
            itemStyle: { color: '#00ff00' },
            animationDelay: function (idx) {
                // 简单的生长动画效果
                return idx * 50;
            }
        }],
        backgroundColor: 'rgba(0,0,0,0.8)', // 半透明黑色背景，与 Three.js 版本保持一致
        grid: { left: '12%', right: '10%', top: '30%', bottom: '35%' },
        animation: true,
        animationDuration: 1000
    };

    // 更新 echarts
    this._chartInstance.setOption(option, true);

    // 刷新材质贴图
    this._chartTexture.setSource(this._chartCanvas);
    this._chartTexture.upload();
    // console.log("Chart texture uploaded in _updateChartOption");
};

RobotPathMove.prototype._updateChart = function (dt) {
    /* === 图表刷新 === */
    if (!this._chartInstance) return;

    this._chartTimer += dt;
    if (this._chartTimer >= 5) {
        this._chartTimer = 0;

        var lastValue = this._chartData.length > 0 ? this._chartData[this._chartData.length - 1].value : 50;
        // 模拟平滑波动，而不是纯随机
        var newValue = lastValue + (Math.random() - 0.5) * 20;
        // 限制在 0-100 之间
        newValue = Math.max(0, Math.min(100, newValue));

        this._chartData.push({
            time: Date.now(),
            value: newValue
        });

        if (this._chartData.length > 10) {
            this._chartData.shift();
        }

        this._updateChartOption();
    }
}

/* ==================== 检查 UV ==================== */
RobotPathMove.prototype._hasUV = function (mesh) {
    var vb = mesh.vertexBuffer;
    var fmt = vb.format;
    return fmt.elements.some(e => e.name === pc.SEMANTIC_TEXCOORD0);
};

/* ==================== 生成平面 UV ==================== */
RobotPathMove.prototype._generatePlaneUV = function (meshInstance) {
    var mesh = meshInstance.mesh;
    var numVerts = mesh.vertexBuffer.numVertices;

    var positions = [];
    mesh.getPositions(positions);

    var normals = [];
    mesh.getNormals(normals);

    var uvs = [];

    // 1. 计算 AABB
    var minX = Infinity, maxX = -Infinity;
    var minY = Infinity, maxY = -Infinity;
    var minZ = Infinity, maxZ = -Infinity;

    for (var i = 0; i < numVerts; i++) {
        var x = positions[i * 3 + 0];
        var y = positions[i * 3 + 1];
        var z = positions[i * 3 + 2];

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
    }

    var dx = maxX - minX;
    var dy = maxY - minY;
    var dz = maxZ - minZ;

    console.log("Mesh AABB:", dx, dy, dz);

    // 2. 判断主平面方向 (投影到变化最大的两个轴)
    // 默认 XY
    var uAxis = 0; // 0:x, 1:y, 2:z
    var vAxis = 1;
    var minU = minX, maxU = maxX;
    var minV = minY, maxV = maxY;

    if (dx >= dy && dz >= dy) {
        // XZ 平面 (如地面)
        console.log("Generating UV for XZ plane");
        uAxis = 0; // x
        vAxis = 2; // z
        minU = minX; maxU = maxX;
        minV = minZ; maxV = maxZ;
    } else if (dy >= dx && dz >= dx) {
        // YZ 平面 (侧面)
        console.log("Generating UV for YZ plane");
        uAxis = 2; // z
        vAxis = 1; // y
        minU = minZ; maxU = maxZ;
        minV = minY; maxV = maxY;
    } else {
        // XY 平面 (正面)
        console.log("Generating UV for XY plane");
        uAxis = 0; // x
        vAxis = 1; // y
        minU = minX; maxU = maxX;
        minV = minY; maxV = maxY;
    }

    var width = maxU - minU;
    var height = maxV - minV;

    console.log("UV Bounds - minU:", minU, "maxU:", maxU, "minV:", minV, "maxV:", maxV);
    console.log("UV Dimensions - width:", width, "height:", height);

    if (width < 0.0001) width = 1;
    if (height < 0.0001) height = 1;

    // 3. 生成 UV
    for (var i = 0; i < numVerts; i++) {
        var uVal = positions[i * 3 + uAxis];
        var vVal = positions[i * 3 + vAxis];

        // 简单的归一化映射，如果发现倒了可能需要 1.0 - ...
        var u = (uVal - minU) / width;
        var v = (vVal - minV) / height;
        uvs.push(u);
        uvs.push(v);

        if (i < 5) console.log("UV[", i, "]:", u, v);
    }

    // 创建新 Mesh，确保包含 UV 语义
    console.log("Creating new Mesh...");
    var device = mesh.device || (this.app ? this.app.graphicsDevice : null);
    if (!device) {
        console.error("No graphics device found!");
        return;
    }

    var newMesh = new pc.Mesh(device);
    newMesh.setLocalPositions(positions);
    newMesh.setUvs(0, uvs);
    console.log("Positions and UVs set.");

    if (normals.length > 0) {
        newMesh.setNormals(normals);
    }

    // 保留索引
    if (mesh.indexBuffer) {
        var indices = [];
        mesh.getIndices(indices);
        // Fallback if getIndices didn't populate the array (some versions return it)
        if (indices.length === 0) {
            var returnedIndices = mesh.getIndices();
            if (returnedIndices && returnedIndices.length > 0) {
                indices = returnedIndices;
            }
        }
        console.log("Indices count:", indices.length);
        newMesh.setIndices(indices);
    } else {
        console.warn("Original mesh has no index buffer.");
        // 如果没有索引，可能需要手动生成或者不需要（视具体几何体而定，但通常都有）
        // 这里假设是常规模型
    }

    newMesh.update();
    console.log("New mesh updated.");

    // 替换 MeshInstance 的 mesh
    meshInstance.mesh = newMesh;
    console.log("MeshInstance mesh replaced.");
};
