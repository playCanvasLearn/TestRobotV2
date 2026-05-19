
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

// 起步加速度
RobotPathMove.attributes.add('acceleration', { type: 'number', default: 2.2 });

// 刹车减速度
RobotPathMove.attributes.add('deceleration', { type: 'number', default: 3.2 });

// 进入目标点前开始减速的距离
RobotPathMove.attributes.add('slowDownDistance', { type: 'number', default: 0.8 });

// 普通拐点的保底速度比例，避免每个路径点都像急停再起步
RobotPathMove.attributes.add('cornerSpeedRatio', { type: 'number', default: 0.35 });

// 最大转身速度（度/秒），限制急转时的生硬感
RobotPathMove.attributes.add('turnSpeed', { type: 'number', default: 240 });

// pause 节点停留时间（秒）
RobotPathMove.attributes.add('pauseTime', { type: 'number', default: 2 });
RobotPathMove.attributes.add('putItemRiseHeight', { type: 'number', default: 0.45 });
RobotPathMove.attributes.add('putItemMoveDistance', { type: 'number', default: 0.9 });
RobotPathMove.attributes.add('putItemDuration', { type: 'number', default: 1.8 });
RobotPathMove.attributes.add('putItemRotateTurns', { type: 'number', default: 2 });
RobotPathMove.attributes.add('exitDoorOpenDistance', { type: 'number', default: 0.18 });
RobotPathMove.attributes.add('exitDoorSpeed', { type: 'number', default: 1.4 });

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
     * - 上方  Y轴 正方向
     */
    this.path = [
        { showMessage: '去拿料', turn: '', position: { x: 1.8, y: 0, z: 4.5 }, lookAt: { x: 1.8, y: 0, z: 5.2 } },
        { showMessage: '拿料中', turn: '', position: { x: 1.8, y: 0, z: 5.2 }, lookAt: { x: 1.8, y: 0, z: 5.2 } },
        { showMessage: '拿料中', turn: '', position: { x: 1.8, y: 0, z: 5.2 }, lookAt: { x: 1, y: 0, z: 5.2 } },
        { showMessage: '拿料中', turn: 'pause', position: { x: 1.8, y: 0, z: 5.2 }, lookAt: { x: 1, y: 0, z: 5.2 } },
        { showMessage: '拿料中', turn: 'take', position: { x: 1.8, y: 0, z: 5.2 }, lookAt: { x: 1, y: 0, z: 5.2 } },
        { showMessage: '去加工', turn: '', position: { x: 1.8, y: 0, z: -1.1 }, lookAt: { x: 1.8, y: 0, z: -1.3 } },
        { showMessage: '去加工', turn: '', position: { x: 1.8, y: 0, z: -1 }, lookAt: { x: 0.6, y: 0, z: -1.3 } },
        { showMessage: '加工中', turn: '', position: { x: 0.6, y: 0, z: -0.9 }, lookAt: { x: 0.2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'pause', position: { x: 0.6, y: 0, z: -0.9 }, lookAt: { x: 0.2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'openDoor', position: { x: 0.6, y: 0, z: -0.9 }, lookAt: { x: 0.2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'put', position: { x: 0.6, y: 0, z: -0.9 }, lookAt: { x: 0.2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'putItem', position: { x: 0.6, y: 0, z: -0.9 }, lookAt: { x: 0.2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'pause', position: { x: 0.6, y: 0, z: -0.9 }, lookAt: { x: 0.2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'closeDoor', position: { x: 0.6, y: 0, z: -0.9 }, lookAt: { x: 0.2, y: 0, z: -0.9 } },
        { showMessage: '去检测', turn: '', position: { x: 0.6, y: 0, z: -6.4 }, lookAt: { x: 0.6, y: 0, z: -6.5 } },
        { showMessage: '检测中', turn: '', position: { x: 0.4, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -6.5 } },
        { showMessage: '检测中', turn: 'pause', position: { x: 0.4, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -6.5 } },
        { showMessage: '不合格', turn: 'pause', position: { x: -0.4, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -6.5 } },
        { showMessage: '去加工', turn: '', position: { x: 0.4, y: 0, z: -0.9 }, lookAt: { x: 0.4, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: '', position: { x: 0.6, y: 0, z: -0.9 }, lookAt: { x: -2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'pause', position: { x: 0.6, y: 0, z: -0.9 }, lookAt: { x: -2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'openDoor', position: { x: 0.6, y: 0, z: -0.9 }, lookAt: { x: -2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'put', position: { x: 0.6, y: 0, z: -0.9 }, lookAt: { x: -2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'putItem', position: { x: 0.6, y: 0, z: -0.9 }, lookAt: { x: 0.2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'pause', position: { x: 0.6, y: 0, z: -0.9 }, lookAt: { x: -2, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'closeDoor', position: { x: 0.6, y: 0, z: -0.9 }, lookAt: { x: -2, y: 0, z: -0.9 } },
        { showMessage: '去检测', turn: '', position: { x: 0.4, y: 0, z: -6.4 }, lookAt: { x: 0.4, y: 0, z: -6.5 } },
        { showMessage: '检测中', turn: '', position: { x: 0.4, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -6.5 } },
        { showMessage: '检测中', turn: 'pause', position: { x: 0.4, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -6.5 } },
        { showMessage: '合格', turn: 'pause', position: { x: 0.1, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -6.5 } },
        { showMessage: '去放料', turn: '', position: { x: 0.4, y: 0, z: 2.7 }, lookAt: { x: 0.4, y: 0, z: 2.7 } },
        { showMessage: '去放料', turn: '', position: { x: 0.4, y: 0, z: 2.7 }, lookAt: { x: -1, y: 0, z: 2.7 } },
        { showMessage: '去放料', turn: '', position: { x: -1, y: 0, z: 2.7 }, lookAt: { x: -1, y: 0, z: 2.7 } },
        { showMessage: '去放料', turn: '', position: { x: -1, y: 0, z: 2.7 }, lookAt: { x: -1, y: 0, z: 2.7 } },
        { showMessage: '去放料', turn: '', position: { x: -1, y: 0, z: 2.7 }, lookAt: { x: -1.2, y: 0, z: 4.5 } },
        { showMessage: '去放料', turn: '', position: { x: -1.2, y: 0, z: 4.5 }, lookAt: { x: -1.2, y: 0, z: 4.5 } },
        { showMessage: '放料中', turn: 'pause', position: { x: -1.2, y: 0, z: 4.5 }, lookAt: { x: -1.3, y: 0, z: 4.5 } },
        { showMessage: '放料中', turn: 'take', position: { x: -1.2, y: 0, z: 4.5 }, lookAt: { x: -1.3, y: 0, z: 4.5 } },
        { showMessage: '放料中', turn: '', position: { x: -1.2, y: 0, z: 4.5 }, lookAt: { x: -1.3, y: 0, z: 4.5 } },
        { showMessage: '去拿料', turn: '', position: { x: -1, y: 0, z: 2.7 }, lookAt: { x: -1, y: 0, z: 2.7 } },
        { showMessage: '去拿料', turn: '', position: { x: 1.8, y: 0, z: 2.7 }, lookAt: { x: 1.8, y: 0, z: 2.7 } },
        { showMessage: '去拿料', turn: '', position: { x: 1.8, y: 0, z: 4.5 }, lookAt: { x: 1.8, y: 0, z: 4.5 } },
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
    this._rotateSharpness = 10;
    this._currentSpeed = 0;
    this._labelBaseEuler = new pc.Vec3();
    this._labelWorldPos = new pc.Vec3();
    this._labelCameraPos = new pc.Vec3();
    this._grabSocket = null;
    this._pickupItem = null;
    this._heldItem = null;
    this._takeActionDone = !1;
    this._activeActionKey = '';
    this._pickupGlowShell = null;
    this._pickupGlowMaterial = null;
    this._pickupGlowTime = 0;
    this._putItemActive = !1;
    this._putItemTime = 0;
    this._pickupSpawnBasePos = new pc.Vec3();
    this._pickupSpawnPos = new pc.Vec3();
    this._pickupHandLocalPos = new pc.Vec3();
    this._pickupHomePos = new pc.Vec3();
    this._pickupDropPos = new pc.Vec3();
    this._pickupLocalPos = new pc.Vec3(0, 0, 0);
    this._pickupLocalEuler = new pc.Vec3(0, 0, 0);
    this._pickupLocalScale = new pc.Vec3(1, 1, 1);
    this._handBoneNode = null;
    this._grabSocketWorldPos = new pc.Vec3();
    this._grabSocketWorldRot = new pc.Quat();
    this._putItemStartPos = new pc.Vec3();
    this._putItemMidPos = new pc.Vec3();
    this._putItemEndPos = new pc.Vec3();
    this._putItemBaseEuler = new pc.Vec3();
    this._exitDoorTargets = [];
    this._exitDoorMaterials = [];
    this._exitDoorTime = 0;
    this._exitDoorCenter = new pc.Vec3();
    this._exitDoorMoveAxis = 'x';
    this._exitSignEntity = null;
    this._exitSignMaterial = null;
    this._exitSignTexture = null;
    this._exitSignCanvas = null;
    this._exitSignBasePos = new pc.Vec3();
    this._exitSignHalfWidth = 0.5;
    this._exitSignHalfHeight = 0.15;
    this._exitSignPulseTime = 0;
    this._exitSignClickTime = 0;
    this._exitDoorClickTime = 0;
    this._isExitDoorHovered = !1;
    this._exitDoorHoverLerp = 0;
    this._exitPopupRoot = null;

    if (this.entity.rigidbody) {
        this.entity.removeComponent('rigidbody');
    }
    if (this.entity.collision) {
        this.entity.removeComponent('collision');
    }

    // 监听鼠标点击（用于调试坐标）
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);

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
     *//*
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
        this._labelBaseEuler.copy(this.labelPlane.getLocalEulerAngles());
        this._initLabelCanvas();
        this._updateLabel(this.path[0].showMessage);
    }

    this._initPickupSystem();
    this._initExitDoorFx();

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
    this._updateExitDoorFx(dt);

    // 更新图表数据逻辑
    this._updateChart(dt);

    // 关键修复：每一帧都上传 Canvas 纹理，以便显示 ECharts 的动画效果
    if (this._chartTexture && this._chartCanvas) {
        this._chartTexture.upload();
    }

    // 每帧先刷新抓取挂点的世界姿态，再让当前手持物体同步到该挂点，保证抓取跟随稳定。
    this._updateGrabSocketPose();
    this._syncHeldItemPose();
    this._updatePickupSelectionFx(dt);

    if (window.__robotPauseAnimation) {
        this._currentSpeed = 0;
        this.setPlayerStatus(2);
        return;
    }

    this._updatePutItemAction(dt);

    // 路径走完直接结束
    if (this._index >= this.path.length) {
        this._resetPickupToHomeState();
        this._index = 0;
    };

    var node = this.path[this._index];
    var target = node.position;

    var pos = this.entity.getLocalPosition();

    // 连续的空动作节点如果与当前位置重合，且下一节点只是同一配置的重复点，则直接跳过，
    // 避免机器人在导出的冗余路径点上停顿或重复刷新同一状态。
    while (node && node.turn === '' && this._index + 1 < this.path.length) {
        var samePoint = Math.abs(target.x - pos.x) <= this.arriveDistance &&
            Math.abs(target.z - pos.z) <= this.arriveDistance;
        var nextNode = this.path[this._index + 1];
        var sameAsNext = nextNode &&
            Math.abs(target.x - nextNode.position.x) < 1e-4 &&
            Math.abs(target.y - nextNode.position.y) < 1e-4 &&
            Math.abs(target.z - nextNode.position.z) < 1e-4 &&
            nextNode.turn === node.turn &&
            nextNode.showMessage === node.showMessage &&
            nextNode.lookAt &&
            node.lookAt &&
            Math.abs(node.lookAt.x - nextNode.lookAt.x) < 1e-4 &&
            Math.abs(node.lookAt.y - nextNode.lookAt.y) < 1e-4 &&
            Math.abs(node.lookAt.z - nextNode.lookAt.z) < 1e-4;

        if (!samePoint || !sameAsNext) break;

        this._index++;
        node = this.path[this._index];
        target = node.position;
    }

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
        this._updateLabelFacingForThirdPerson();
    }

    if (this._targetMarker) {
        this._targetMarker.setLocalPosition(target.x, target.y, target.z);
    }
    if (this._targetLookMarker && node.lookAt) {
        var look = node.lookAt;
        this._targetLookMarker.setLocalPosition(look.x, look.y, look.z);
    }

    // 特殊节点优先于普通移动处理：它们通过 turn 字段驱动停留、抓取、开关门等状态机。
    // ===== pause 节点：walk → idle（纯停留）=====
    if (node.turn === 'pause') {
        this._currentSpeed = 0;
        if (this._beginSpecialAction(node)) {
            this.setPlayerStatus(2); // walk → idle
        }

        this._advanceSpecialAction(dt);
        this.updateLookAt(node, dt);

        if (this._pauseTimer >= this.pauseTime) {
            this._finishSpecialAction();
        }
        return;
    }
    // ===== take 节点：idle → take =====
    if (node.turn === 'take') {
        this._currentSpeed = 0;
        if (this._beginSpecialAction(node)) {
            this.setPlayerStatus(3); // idle → take
        }

        this._advanceSpecialAction(dt);
        this.updateLookAt(node, dt);

        // 在 take 动作即将完成前再移动物品，避免一进入 take 就直接吸到手上。
        // 数值表示“距离 take 结束还剩多少秒时”触发。
        var takeMoveLeadTime = 0.2;
        var takeActionTriggerTime = Math.max(0.05, 3.0 - takeMoveLeadTime);

        if (!this._takeActionDone && this._pauseTimer >= takeActionTriggerTime) {
            this._handleTakeAction(node);
            this._takeActionDone = !0;
        }

        if (this._pauseTimer >= 3.0) {
            this._finishSpecialAction();
        }
        return;
    }
    if (node.turn === 'put') {
        this._currentSpeed = 0;
        if (this._beginSpecialAction(node)) {
            this.setPlayerStatus(4); // walk → idle
        }

        this._advanceSpecialAction(dt);
        this.updateLookAt(node, dt);

        if (this._pauseTimer >= this.pauseTime) {
            this._finishSpecialAction();
        }
        return;
    }
    // ===== putItem 节点：非阻塞抛出/放置物品 =====
    if (node.turn === 'putItem') {
        this._currentSpeed = 0;
        this.updateLookAt(node, dt);

        if (this._beginSpecialAction(node)) {
            this._startPutItemAction();
        }

        this._finishSpecialAction();
        return;
    }
    // ===== openDoor 节点：触发开门 =====
    if (node.turn === 'openDoor') {
        this._currentSpeed = 0;
        this.setPlayerStatus(2);
        this.updateLookAt(node, dt);

        if (this._doorProgress >= 1 && this._doorDir === 0) {
            this._index++;
            return;
        }

        this._doorDir = 1; // 开始开门，并等待门动画完成
        return;
    }
    // ===== closeDoor 节点：触发关门 =====
    if (node.turn === 'closeDoor') {
        this._currentSpeed = 0;
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

    var dist = this._moveDir.length();

    /* ===== 到点 ===== */
    if (dist <= this.arriveDistance) {
        var nextNodeAfterArrive = this.path[(this._index + 1) % this.path.length];
        if (!nextNodeAfterArrive || nextNodeAfterArrive.turn !== '') {
            this._currentSpeed = 0;
        }

        // 到点后先精确贴到目标坐标，避免因为 dt 或浮点误差导致越走越偏。
        this.entity.setLocalPosition(
            target.x,
            target.y,
            target.z
        );

        // 再切到下一个路径点；真正的移动逻辑留到下一帧统一处理。
        this._index = this._index + 1 ;
        return;
    }

    /* ===== 位移移动（无物理） ===== */
    this.setPlayerStatus(1);
    this._moveDir.normalize();

    var nextNode = this.path[(this._index + 1) % this.path.length];
    var needsFullStop = !nextNode || nextNode.turn !== '';
    var slowDownDistance = Math.max(this.slowDownDistance, this.arriveDistance);
    var slowFactor = pc.math.clamp(dist / slowDownDistance, 0, 1);
    var minCornerSpeed = needsFullStop ? 0 : this.moveSpeed * this.cornerSpeedRatio;
    var desiredSpeed = this.moveSpeed;

    // 接近目标时逐步减速：
    // 1. 下一节点是特殊动作时，允许降到 0，方便原地切状态；
    // 2. 下一节点仍然是普通移动点时，保留一个最小过弯速度，让运动更连贯。
    if (dist < slowDownDistance) {
        desiredSpeed = Math.max(minCornerSpeed, this.moveSpeed * slowFactor);
    }

    var speedDelta = desiredSpeed - this._currentSpeed;
    var speedStep = (speedDelta >= 0 ? this.acceleration : this.deceleration) * dt;

    if (Math.abs(speedDelta) <= speedStep) {
        this._currentSpeed = desiredSpeed;
    } else {
        this._currentSpeed += speedStep * (speedDelta > 0 ? 1 : -1);
    }

    var step = this._currentSpeed * dt;

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

    this._applySmoothTurn(dt);
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

    this._applySmoothTurn(dt);
};

RobotPathMove.prototype._applySmoothTurn = function (dt) {
    var delta = this._targetAngle - this._angle;
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;

    var rotateLerp = 1 - Math.exp(-this._rotateSharpness * dt);
    var lerpedAngle = this._angle + delta * rotateLerp;
    var maxStep = this.turnSpeed * dt;
    var limitedDelta = lerpedAngle - this._angle;

    if (limitedDelta > maxStep) limitedDelta = maxStep;
    if (limitedDelta < -maxStep) limitedDelta = -maxStep;

    this._angle += limitedDelta;

    var baseX = this._baseEuler.x;
    var baseZ = this._baseEuler.z;

    (this.animEntity || this.entity)
        .setEulerAngles(baseX, this._angle, baseZ);
};

RobotPathMove.prototype._initPickupSystem = function () {
    var pickupNode = null;
    var dropNode = null;
    // 圆柱体在场景中“待抓取时”的初始化摆放偏移（世界坐标偏移）
    // 只影响物品在工位上的初始位置，不影响挂到手上后的相对位置。
    var pickupSpawnOffset = new pc.Vec3(0, 0, 0);
    // 圆柱体 attach 到手部挂点后的局部偏移（手部局部坐标）
    // 只影响物品抓在手上的位置，不影响场景里的初始摆放位置。
    var pickupHandOffset = new pc.Vec3(0.08, 0.08, 0.02);

    for (var i = 0; i < this.path.length; i++) {
        var node = this.path[i];
        if (!pickupNode && node.turn === 'take' && node.showMessage === '拿料中') {
            pickupNode = node;
        }
        if (!dropNode && node.turn === 'take' && node.showMessage === '放料中') {
            dropNode = node;
        }
    }

    // 这一段只负责“初始化摆放位置”：
    // 基础点来自取料路径点，再叠加 pickupSpawnOffset。
    if (pickupNode && pickupNode.lookAt) {
        this._pickupSpawnBasePos.set(pickupNode.lookAt.x+0.1, 0.18, pickupNode.lookAt.z+0.22);
    } else {
        this._pickupSpawnBasePos.set(1.1, 0.18, 5.22);
    }

    this._pickupSpawnPos.copy(this._pickupSpawnBasePos);
    this._pickupSpawnPos.add(pickupSpawnOffset);
    this._pickupHomePos.copy(this._pickupSpawnPos);

    // 放料高度与初始化摆放高度保持一致，避免取料和放料时一高一低。
    // 同时将放料位置沿 Z 轴负方向轻微偏移一点，避免与原位置重合得过满。
    if (dropNode && dropNode.position) {
        this._pickupDropPos.set(dropNode.position.x-0.7, this._pickupHomePos.y, dropNode.position.z+0.58);
    } else {
        this._pickupDropPos.set(-2.5, this._pickupHomePos.y, 5.08);
    }

    // 手上抓取位置只由 pickupHandOffset 控制：
    // 这里只影响 attach 到手上后的局部偏移，不参与初始化摆放。
    this._pickupHandLocalPos.copy(pickupHandOffset);
    this._pickupLocalPos.copy(this._pickupHandLocalPos);
    this._pickupLocalEuler.set(0, 0, 90);

    this._grabSocket = this._ensureGrabSocket();
    this._updateGrabSocketPose();
    if (this._grabSocket) {
        // 初始化摆放高度、放料高度统一对齐到手部抬起后的物品高度。
        var handRaisedItemY = this._grabSocket.getPosition().y + this._pickupLocalPos.y+0.45;
        this._pickupHomePos.y = handRaisedItemY;
        this._pickupDropPos.y = handRaisedItemY;
    }
    this._pickupItem = this._ensurePickupCylinder();
};

RobotPathMove.prototype._collectMeshInstances = function (root, out) {
    if (!root) return;
    var comp = root.render || root.model;
    if (comp && comp.meshInstances && comp.meshInstances.length) {
        for (var i = 0; i < comp.meshInstances.length; i++) {
            out.push(comp.meshInstances[i]);
        }
    }

    var children = root.children || [];
    for (var j = 0; j < children.length; j++) {
        this._collectMeshInstances(children[j], out);
    }
};

RobotPathMove.prototype._findBoneNodeFromMeshInstances = function (meshInstances, keywords) {
    for (var i = 0; i < meshInstances.length; i++) {
        var meshInstance = meshInstances[i];
        var skinInstance = meshInstance && meshInstance.skinInstance;
        var bones = skinInstance && skinInstance.bones;
        if (!bones || !bones.length) continue;

        for (var j = 0; j < bones.length; j++) {
            var bone = bones[j];
            var boneName = ((bone && bone.name) || '').toLowerCase();
            for (var k = 0; k < keywords.length; k++) {
                if (boneName.indexOf(keywords[k]) !== -1) {
                    return bone;
                }
            }
        }
    }
    return null;
};

RobotPathMove.prototype._findHandBoneNode = function () {
    if (this._handBoneNode) return this._handBoneNode;

    var root = this.animEntity || this.entity;
    if (!root) return null;

    var meshInstances = [];
    this._collectMeshInstances(root, meshInstances);

    // 优先左手
    var leftHandKeywords = [
        'lefthand',
        'left_hand',
        'hand_l',
        'l hand',
        'mixamorig:lefthand',
        'bip001 l hand'
    ];

    var rightHandKeywords = [
        'righthand',
        'right_hand',
        'hand_r',
        'r hand',
        'mixamorig:righthand',
        'bip001 r hand'
    ];

    this._handBoneNode =
        this._findBoneNodeFromMeshInstances(meshInstances, leftHandKeywords) ||
        this._findBoneNodeFromMeshInstances(meshInstances, rightHandKeywords) ||
        this._findDescendantByKeywords(root, leftHandKeywords) ||
        this._findDescendantByKeywords(root, rightHandKeywords) ||
        null;

    return this._handBoneNode;
};

RobotPathMove.prototype._findDescendantByKeywords = function (root, keywords) {
    if (!root) return null;
    var stack = [root];
    while (stack.length) {
        var node = stack.pop();
        var name = (node.name || '').toLowerCase();
        for (var i = 0; i < keywords.length; i++) {
            if (name.indexOf(keywords[i]) !== -1) return node;
        }
        var children = node.children || [];
        for (var j = 0; j < children.length; j++) stack.push(children[j]);
    }
    return null;
};

RobotPathMove.prototype._ensureGrabSocket = function () {
    var sceneRoot = this.app.root.findByName('SceneRoot') || this.app.root;
    var socket = this.app.root.findByName('GrabSocket_L');
    if (socket) return socket;

    socket = new pc.Entity('GrabSocket_L');
    sceneRoot.addChild(socket);
    socket.setPosition(0, 0, 0);
    socket.setEulerAngles(0, 0, 0);
    return socket;
};

RobotPathMove.prototype._ensurePickupCylinder = function () {
    var item = this.app.root.findByName('AutoPickupCylinder');
    if (!item) {
        item = new pc.Entity('AutoPickupCylinder');
        item.addComponent('model', {type: 'cylinder'});
        // 缩小圆柱体，减少对手掌和手指的遮挡
        item.setLocalScale(0.08, 0.12, 0.08);
        // 水平方向放置
        item.setLocalEulerAngles(90, 0, 0);
        var mat = new pc.StandardMaterial();
        mat.diffuse.set(0.65, 0.65, 0.65);
        mat.metalness = 0.1;
        mat.gloss = 0.35;
        mat.opacity = 1;
        mat.blendType = pc.BLEND_NORMAL;
        mat.update();
        item.model.material = mat;

        var sceneRoot = this.app.root.findByName('SceneRoot');
        (sceneRoot || this.app.root).addChild(item);
    }

    this._ensurePickupSelectionFx(item);
    this._setPickupSelectionFxEnabled(!this._heldItem);

    item.setPosition(this._pickupHomePos);
    item.setLocalEulerAngles(90, 0, 0);
    this._pickupLocalScale.copy(item.getLocalScale());
    return item;
};

RobotPathMove.prototype._handleTakeAction = function (node) {
    if (!node || !this._pickupItem) return;

    if (node.showMessage === '拿料中' && !this._heldItem) {
        this._attachPickupItemToHand();
        return;
    }

    if (node.showMessage === '放料中' && this._heldItem) {
        this._detachPickupItemToDropZone();
    }
};

RobotPathMove.prototype._beginSpecialAction = function (node) {
    var actionKey = this._index + ':' + (node && node.turn ? node.turn : '');
    if (this._activeActionKey === actionKey) {
        return !1;
    }

    this._activeActionKey = actionKey;
    this._pauseTimer = 0;
    this._takeActionDone = !1;
    return !0;
};

RobotPathMove.prototype._advanceSpecialAction = function (dt) {
    this._pauseTimer += dt;
};

RobotPathMove.prototype._finishSpecialAction = function () {
    this._pauseTimer = 0;
    this._takeActionDone = !1;
    this._activeActionKey = '';
    this._index++;
};

RobotPathMove.prototype._resetPickupToHomeState = function () {
    if (!this._pickupItem) return;

    var sceneRoot = this.app.root.findByName('SceneRoot');
    (sceneRoot || this.app.root).addChild(this._pickupItem);

    this._pickupItem.setPosition(this._pickupHomePos);
    this._pickupItem.setEulerAngles(90, 0, 0);
    //this._pickupItem.setLocalEulerAngles(90, 0, 0);
    this._pickupItem.setLocalScale(this._pickupLocalScale);

    this._heldItem = null;
    this._putItemActive = !1;
    this._putItemTime = 0;
    this._takeActionDone = !1;
    this._pickupGlowTime = 0;
    this._setPickupSelectionFxMode('default');
    this._setPickupSelectionFxEnabled(true);
};

RobotPathMove.prototype._attachPickupItemToHand = function () {
    if (!this._pickupItem || !this._grabSocket) return;

    this._putItemActive = !1;
    this._putItemTime = 0;
    this._updateGrabSocketPose();
    this._grabSocket.addChild(this._pickupItem);
    this._heldItem = this._pickupItem;
    this._setPickupSelectionFxMode('default');
    this._setPickupSelectionFxEnabled(false);
    this._syncHeldItemPose();
};

RobotPathMove.prototype._detachPickupItemToDropZone = function () {
    if (!this._heldItem) return;

    var sceneRoot = this.app.root.findByName('SceneRoot');
    (sceneRoot || this.app.root).addChild(this._heldItem);
    this._heldItem.setPosition(this._pickupDropPos);
    this._heldItem.setEulerAngles(90, 0, 0);
    this._heldItem.setLocalScale(this._pickupLocalScale);
    this._heldItem = null;
    this._setPickupSelectionFxMode('default');
    this._setPickupSelectionFxEnabled(true);
};

RobotPathMove.prototype._startPutItemAction = function () {
    if (!this._pickupItem) return;

    var sceneRoot = this.app.root.findByName('SceneRoot');
    var worldRoot = sceneRoot || this.app.root;
    var item = this._pickupItem;

    this._putItemStartPos.set(-0.4, 1.8, -0.6);
    this._putItemBaseEuler.copy(item.getEulerAngles());
    this._putItemMidPos.copy(this._putItemStartPos);
    this._putItemMidPos.y += this.putItemRiseHeight;
    this._putItemEndPos.copy(this._putItemMidPos);
    this._putItemEndPos.x -= this.putItemMoveDistance;

    worldRoot.addChild(item);
    item.setPosition(this._putItemStartPos);
    item.setEulerAngles(this._putItemBaseEuler);
    item.setLocalScale(this._pickupLocalScale);

    this._heldItem = null;
    this._putItemActive = !0;
    this._putItemTime = 0;
    this._pickupGlowTime = 0;
    this._setPickupSelectionFxMode('putItem');
    this._setPickupSelectionFxEnabled(true);
};

RobotPathMove.prototype._updatePutItemAction = function (dt) {
    if (!this._putItemActive || !this._pickupItem) return;

    this._putItemTime += dt;

    var duration = Math.max(0.1, this.putItemDuration);
    var progress = pc.math.clamp(this._putItemTime / duration, 0, 1);
    var riseRatio = 0.4;
    var moveProgress = 0;
    var eased = 0;
    var x = this._putItemStartPos.x;
    var y = this._putItemStartPos.y;
    var z = this._putItemStartPos.z;

    if (progress < riseRatio) {
        eased = progress / riseRatio;
        eased = eased * eased * (3 - 2 * eased);
        x = pc.math.lerp(this._putItemStartPos.x, this._putItemMidPos.x, eased);
        y = pc.math.lerp(this._putItemStartPos.y, this._putItemMidPos.y, eased);
        z = pc.math.lerp(this._putItemStartPos.z, this._putItemMidPos.z, eased);
    } else {
        moveProgress = (progress - riseRatio) / Math.max(1e-4, 1 - riseRatio);
        eased = moveProgress * moveProgress * (3 - 2 * moveProgress);
        x = pc.math.lerp(this._putItemMidPos.x, this._putItemEndPos.x, eased);
        y = pc.math.lerp(this._putItemMidPos.y, this._putItemEndPos.y, eased);
        z = pc.math.lerp(this._putItemMidPos.z, this._putItemEndPos.z, eased);
    }

    this._pickupItem.setPosition(x, y, z);
    this._pickupItem.setEulerAngles(
        this._putItemBaseEuler.x,
        this._putItemBaseEuler.y + 360 * this.putItemRotateTurns * progress,
        this._putItemBaseEuler.z
    );
    this._pickupItem.setLocalScale(this._pickupLocalScale);

    if (progress >= 1) {
        this._putItemActive = !1;
        this._pickupGlowTime = 0;
        this._setPickupSelectionFxEnabled(false);
        this._attachPickupItemToHand();
    }
};

RobotPathMove.prototype._ensurePickupSelectionFx = function (item) {
    if (!item) return;

    var glowShell = item.findByName('PickupGlowShell');
    if (!glowShell) {
        glowShell = new pc.Entity('PickupGlowShell');
        glowShell.addComponent('model', { type: 'cylinder', castShadows: false, receiveShadows: false });
        glowShell.setLocalPosition(0, 0, 0);
        glowShell.setLocalEulerAngles(0, 0, 0);
        item.addChild(glowShell);
    }

    var glowMat = glowShell.model.material;
    if (!glowMat || glowMat.name !== 'PickupGlowMaterial') {
        glowMat = new pc.StandardMaterial();
        glowMat.name = 'PickupGlowMaterial';
        glowMat.diffuse.set(0.15, 0.75, 1.0);
        glowMat.emissive.set(0.2, 0.85, 1.0);
        glowMat.emissiveIntensity = 1.6;
        glowMat.opacity = 0.28;
        glowMat.blendType = pc.BLEND_ADDITIVEALPHA;
        glowMat.useLighting = false;
        glowMat.depthWrite = false;
        glowMat.cull = pc.CULLFACE_NONE;
        glowMat.update();
        glowShell.model.material = glowMat;
    }

    this._pickupGlowShell = glowShell;
    this._pickupGlowMaterial = glowMat;
    this._setPickupSelectionFxMode('default');
    this._pickupGlowShell.enabled = true;
};

RobotPathMove.prototype._setPickupSelectionFxMode = function (mode) {
    if (!this._pickupGlowMaterial) return;

    if (mode === 'putItem') {
        this._pickupGlowMaterial.diffuse.set(1.0, 0.18, 0.12);
        this._pickupGlowMaterial.emissive.set(1.0, 0.12, 0.08);
    } else {
        this._pickupGlowMaterial.diffuse.set(0.15, 0.75, 1.0);
        this._pickupGlowMaterial.emissive.set(0.2, 0.85, 1.0);
    }

    this._pickupGlowMaterial.update();
};

RobotPathMove.prototype._setPickupSelectionFxEnabled = function (enabled) {
    if (!this._pickupGlowShell) return;
    this._pickupGlowShell.enabled = !!enabled;
};

RobotPathMove.prototype._updatePickupSelectionFx = function (dt) {
    if (!this._pickupGlowShell || !this._pickupGlowMaterial || !this._pickupGlowShell.enabled) return;

    this._pickupGlowTime += dt;

    var pulse = 0.5 + 0.5 * Math.sin(this._pickupGlowTime * 4.2);
    var scale = 1.35 + pulse * 0.18;
    this._pickupGlowShell.setLocalScale(scale, 1.08 + pulse * 0.2, scale);

    this._pickupGlowMaterial.opacity = 0.14 + pulse * 0.14;
    this._pickupGlowMaterial.emissiveIntensity = 1.2 + pulse * 1.3;
    this._pickupGlowMaterial.update();
};

RobotPathMove.prototype._syncHeldItemPose = function () {
    if (!this._heldItem) return;

    this._heldItem.setLocalPosition(this._pickupLocalPos);
    this._heldItem.setLocalEulerAngles(this._pickupLocalEuler);
    this._heldItem.setLocalScale(this._pickupLocalScale);
};

RobotPathMove.prototype._updateGrabSocketPose = function () {
    if (!this._grabSocket) return;

    var handNode = this._findHandBoneNode();
    if (handNode && handNode.getPosition && handNode.getRotation) {
        this._grabSocketWorldPos.copy(handNode.getPosition());
        this._grabSocketWorldRot.copy(handNode.getRotation());
    } else {
        var root = this.animEntity || this.entity;
        if (!root) return;
        this._grabSocketWorldPos.copy(root.getPosition());
        this._grabSocketWorldRot.copy(root.getRotation());
    }

    this._grabSocket.setPosition(this._grabSocketWorldPos);
    this._grabSocket.setRotation(this._grabSocketWorldRot);
};

RobotPathMove.prototype._initExitDoorFx = function () {
    // 用户需求里 Mesh_155 重复出现，这里按出口门连续门片补全到 Mesh_156。
    var nameSet = {
        Mesh_153: !0,
        Mesh_154: !0,
        Mesh_155: !0,
        Mesh_156: !0
    };
    var nodes = [];
    var meshInstances = [];

    this.app.root.forEach(function (node) {
        var mis = null;
        if (node.render && node.render.meshInstances) mis = node.render.meshInstances;
        else if (node.model && node.model.meshInstances) mis = node.model.meshInstances;
        if (!mis || !mis.length) return;

        for (var i = 0; i < mis.length; i++) {
            var mi = mis[i];
            var nodeName = mi && mi.node && mi.node.name ? mi.node.name : '';
            var meshName = mi && mi.mesh && mi.mesh.name ? mi.mesh.name : '';
            if (!nameSet[nodeName] && !nameSet[meshName]) continue;

            meshInstances.push(mi);
            if (mi.node && nodes.indexOf(mi.node) === -1) nodes.push(mi.node);
        }
    });

    if (!nodes.length) return;

    this._exitDoorTargets = [];
    this._exitDoorMaterials = [];
    this._exitDoorCenter.set(0, 0, 0);

    var minX = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    var minZ = Infinity;
    var maxZ = -Infinity;

    for (var j = 0; j < nodes.length; j++) {
        var worldPos = nodes[j].getPosition().clone();
        this._exitDoorCenter.add(worldPos);
        if (worldPos.x < minX) minX = worldPos.x;
        if (worldPos.x > maxX) maxX = worldPos.x;
        if (worldPos.y > maxY) maxY = worldPos.y;
        if (worldPos.z < minZ) minZ = worldPos.z;
        if (worldPos.z > maxZ) maxZ = worldPos.z;
    }

    this._exitDoorCenter.scale(1 / nodes.length);
    this._exitDoorMoveAxis = (maxX - minX) >= (maxZ - minZ) ? 'x' : 'z';

    for (var k = 0; k < nodes.length; k++) {
        var doorNode = nodes[k];
        var baseWorldPos = doorNode.getPosition().clone();
        var delta = this._exitDoorMoveAxis === 'x'
            ? baseWorldPos.x - this._exitDoorCenter.x
            : baseWorldPos.z - this._exitDoorCenter.z;
        var sign = delta >= 0 ? 1 : -1;

        this._exitDoorTargets.push({
            node: doorNode,
            baseWorldPos: baseWorldPos,
            sign: sign
        });
    }

    for (var m = 0; m < meshInstances.length; m++) {
        var meshInstance = meshInstances[m];
        if (!meshInstance || !meshInstance.material || !meshInstance.material.clone) continue;

        var cloned = meshInstance.material.clone();
        if (cloned.emissive && cloned.emissive.set) cloned.emissive.set(0.0, 1.0, 0.35);
        if (cloned.emissiveIntensity !== undefined) cloned.emissiveIntensity = 1.2;
        if (cloned.update) cloned.update();
        meshInstance.material = cloned;
        this._exitDoorMaterials.push(cloned);
    }

    this._ensureExitSign(maxY, minX, maxX, minZ, maxZ);
    this._ensureExitPopupUi();
};

RobotPathMove.prototype._updateExitDoorFx = function (dt) {
    if (!this._exitDoorTargets || !this._exitDoorTargets.length) return;

    this._exitDoorTime += dt * this.exitDoorSpeed;
    this._exitDoorClickTime = Math.max(0, this._exitDoorClickTime - dt);
    this._exitDoorHoverLerp += (((this._isExitDoorHovered ? 1 : 0) - this._exitDoorHoverLerp) * Math.min(1, dt * 10));

    var pulse = 0.5 + 0.5 * Math.sin(this._exitDoorTime);
    var openOffset = this.exitDoorOpenDistance * pulse;
    var clickBoost = this._exitDoorClickTime > 0 ? this._exitDoorClickTime / 0.25 : 0;
    var hoverBoost = this._exitDoorHoverLerp;
    var emissiveIntensity = 0.55 + pulse * 0.85 + hoverBoost * 2.4 + clickBoost * 0.55;
    var emissiveR = 0.0 + hoverBoost * 0.30;
    var emissiveG = 0.55 + hoverBoost * 0.45;
    var emissiveB = 0.18 + hoverBoost * 0.50;

    for (var i = 0; i < this._exitDoorTargets.length; i++) {
        var target = this._exitDoorTargets[i];
        var base = target.baseWorldPos;
        var x = base.x;
        var y = base.y;
        var z = base.z;

        if (this._exitDoorMoveAxis === 'x') x += target.sign * openOffset;
        else z += target.sign * openOffset;

        target.node.setPosition(x, y, z);
    }

    for (var j = 0; j < this._exitDoorMaterials.length; j++) {
        this._exitDoorMaterials[j].emissive.set(emissiveR, emissiveG, emissiveB);
        this._exitDoorMaterials[j].emissiveIntensity = emissiveIntensity;
        this._exitDoorMaterials[j].update();
    }

    this._updateExitSignFx(dt);
};

RobotPathMove.prototype._ensureExitSign = function (maxY, minX, maxX, minZ, maxZ) {
    if (this._exitSignEntity) return;

    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    this._exitSignCanvas = canvas;

    var ctx = canvas.getContext('2d');
    this._drawExitSignCanvas(ctx, canvas.width, canvas.height);

    var tex = new pc.Texture(this.app.graphicsDevice, {
        format: pc.PIXELFORMAT_R8_G8_B8_A8,
        autoMipmap: false,
        minFilter: pc.FILTER_LINEAR,
        magFilter: pc.FILTER_LINEAR,
        addressU: pc.ADDRESS_CLAMP_TO_EDGE,
        addressV: pc.ADDRESS_CLAMP_TO_EDGE
    });
    tex.setSource(canvas);
    this._exitSignTexture = tex;

    var mat = new pc.StandardMaterial();
    mat.name = 'ExitSignMaterial';
    mat.diffuseMap = tex;
    mat.emissiveMap = tex;
    mat.opacityMap = tex;
    mat.opacityMapChannel = 'a';
    mat.diffuse.set(1, 1, 1);
    mat.emissive.set(0.1, 1.0, 0.4);
    mat.emissiveIntensity = 1.3;
    mat.opacity = 1;
    mat.blendType = pc.BLEND_NORMAL;
    mat.useLighting = false;
    mat.depthWrite = false;
    mat.cull = pc.CULLFACE_NONE;
    mat.update();
    this._exitSignMaterial = mat;

    var sign = new pc.Entity('ExitSign');
    sign.addComponent('model', {
        type: 'plane',
        castShadows: false,
        receiveShadows: false
    });
    sign.model.material = mat;

    var span = this._exitDoorMoveAxis === 'x' ? (maxX - minX) : (maxZ - minZ);
    var signWidth = Math.max(0.75, span * 0.75);
    var signHeight = 0.24;
    this._exitSignHalfWidth = signWidth * 0.5;
    this._exitSignHalfHeight = signHeight * 0.5;

    this._exitSignBasePos.set(this._exitDoorCenter.x, maxY + 0.42, this._exitDoorCenter.z);
    sign.setPosition(this._exitSignBasePos);
    // 固定面向 +X 方向，避免随门轴切换后出现倾斜难读。
    sign.setEulerAngles(90, 90, 0);
    sign.setLocalScale(signWidth, 1, signHeight);

    var sceneRoot = this.app.root.findByName('SceneRoot');
    (sceneRoot || this.app.root).addChild(sign);
    this._exitSignEntity = sign;
};

RobotPathMove.prototype._drawExitSignCanvas = function (ctx, width, height) {
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(4, 22, 10, 0.70)';
    ctx.strokeStyle = 'rgba(53, 255, 148, 0.95)';
    ctx.lineWidth = 12;

    var x = 28;
    var y = 28;
    var w = width - 56;
    var h = height - 56;
    var r = 24;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'rgba(53,255,148,0.85)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(230, 255, 240, 1)';
    ctx.font = 'bold 118px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT', width * 0.5, height * 0.54);
    ctx.shadowBlur = 0;
};

RobotPathMove.prototype._ensureExitPopupUi = function () {
    if (this._exitPopupRoot) return;

    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.display = 'none';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.background = 'rgba(2, 6, 12, 0.58)';
    overlay.style.backdropFilter = 'blur(8px)';
    overlay.style.zIndex = '10020';

    var panel = document.createElement('div');
    panel.style.width = 'min(520px, calc(100vw - 32px))';
    panel.style.borderRadius = '22px';
    panel.style.border = '1px solid rgba(58, 255, 154, 0.24)';
    panel.style.background = 'linear-gradient(180deg, rgba(13,24,21,0.97), rgba(8,14,17,0.98))';
    panel.style.boxShadow = '0 24px 60px rgba(0,0,0,0.42)';
    panel.style.padding = '22px 22px 18px 22px';
    panel.style.color = 'rgba(235, 245, 240, 0.96)';
    panel.style.fontFamily = 'Arial, sans-serif';
    panel.style.backdropFilter = 'blur(10px)';

    var title = document.createElement('div');
    title.textContent = '上海机床厂';
    title.style.fontSize = '22px';
    title.style.fontWeight = '700';
    title.style.letterSpacing = '0.6px';
    title.style.color = 'rgba(95, 255, 174, 0.98)';

    var desc = document.createElement('div');
    desc.textContent = '上海机床厂始建于 1946 年，是中国大型精密磨床制造企业，在国内磨床行业长期处于领先地位。';
    desc.style.marginTop = '14px';
    desc.style.fontSize = '14px';
    desc.style.lineHeight = '1.65';
    desc.style.color = 'rgba(235, 245, 240, 0.86)';

    var sectionTitle = document.createElement('div');
    sectionTitle.textContent = '核心产品：';
    sectionTitle.style.marginTop = '16px';
    sectionTitle.style.fontSize = '15px';
    sectionTitle.style.fontWeight = '700';
    sectionTitle.style.color = 'rgba(235, 245, 240, 0.96)';

    var productList = document.createElement('div');
    productList.style.marginTop = '10px';
    productList.style.display = 'grid';
    productList.style.gap = '10px';

    var products = ['成型机床', '数控磨床', '重型机床'];
    for (var i = 0; i < products.length; i++) {
        var item = document.createElement('div');
        item.textContent = products[i];
        item.style.padding = '10px 12px';
        item.style.borderRadius = '12px';
        item.style.border = '1px solid rgba(255,255,255,0.08)';
        item.style.background = 'rgba(255,255,255,0.04)';
        item.style.color = 'rgba(235,245,240,0.92)';
        item.style.fontSize = '14px';
        productList.appendChild(item);
    }

    var contact = document.createElement('div');
    contact.style.marginTop = '18px';
    contact.style.padding = '14px 14px';
    contact.style.borderRadius = '14px';
    contact.style.background = 'rgba(58,255,154,0.08)';
    contact.style.border = '1px solid rgba(58,255,154,0.12)';
    contact.style.lineHeight = '1.75';
    contact.style.fontSize = '14px';
    contact.style.color = 'rgba(235,245,240,0.9)';
    contact.innerHTML =
        '<div style="font-weight:700;color:rgba(95,255,174,0.98);margin-bottom:6px;">总部地址</div>' +
        '<div>上海市杨浦区军工路1146号</div>' +
        '<div>服务热线：021-65494608</div>';

    var actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.justifyContent = 'flex-end';
    actions.style.gap = '10px';
    actions.style.marginTop = '20px';

    var buyBtn = document.createElement('button');
    buyBtn.type = 'button';
    buyBtn.textContent = '去购买';

    var visitBtn = document.createElement('button');
    visitBtn.type = 'button';
    visitBtn.textContent = '去参观';

    var cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = '取消';

    var buttons = [buyBtn, visitBtn, cancelBtn];
    for (var j = 0; j < buttons.length; j++) {
        var btn = buttons[j];
        btn.style.height = '40px';
        btn.style.minWidth = '92px';
        btn.style.padding = '0 16px';
        btn.style.borderRadius = '12px';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '14px';
        btn.style.fontWeight = '600';
        btn.style.transition = 'transform 120ms ease, opacity 120ms ease';
    }

    buyBtn.style.border = '1px solid rgba(58,255,154,0.30)';
    buyBtn.style.background = 'linear-gradient(180deg, rgba(58,255,154,0.26), rgba(58,255,154,0.12))';
    buyBtn.style.color = 'rgba(228,255,240,0.98)';

    visitBtn.style.border = '1px solid rgba(84,170,255,0.30)';
    visitBtn.style.background = 'linear-gradient(180deg, rgba(84,170,255,0.24), rgba(84,170,255,0.10))';
    visitBtn.style.color = 'rgba(233,244,255,0.98)';

    cancelBtn.style.border = '1px solid rgba(255,255,255,0.12)';
    cancelBtn.style.background = 'rgba(255,255,255,0.06)';
    cancelBtn.style.color = 'rgba(228,255,240,0.88)';

    actions.appendChild(buyBtn);
    actions.appendChild(visitBtn);
    actions.appendChild(cancelBtn);
    panel.appendChild(title);
    panel.appendChild(desc);
    panel.appendChild(sectionTitle);
    panel.appendChild(productList);
    panel.appendChild(contact);
    panel.appendChild(actions);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    var self = this;
    cancelBtn.addEventListener('click', function () {
        self._hideExitPopup();
    });
    buyBtn.addEventListener('click', function () {});
    visitBtn.addEventListener('click', function () {});
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) self._hideExitPopup();
    });

    this._exitPopupRoot = overlay;
};

RobotPathMove.prototype._showExitPopup = function () {
    if (!this._exitPopupRoot) this._ensureExitPopupUi();
    if (this._exitPopupRoot) this._exitPopupRoot.style.display = 'flex';
};

RobotPathMove.prototype._hideExitPopup = function () {
    if (this._exitPopupRoot) this._exitPopupRoot.style.display = 'none';
};

RobotPathMove.prototype._updateExitSignFx = function (dt) {
    if (!this._exitSignEntity || !this._exitSignMaterial) return;

    this._exitSignPulseTime += dt;
    this._exitSignClickTime = Math.max(0, this._exitSignClickTime - dt);

    var basePulse = 0.5 + 0.5 * Math.sin(this._exitSignPulseTime * 2.8);
    var clickBoost = this._exitSignClickTime > 0 ? this._exitSignClickTime / 0.25 : 0;
    var scaleBoost = 1 + basePulse * 0.04 + clickBoost * 0.08;

    this._exitSignEntity.setPosition(this._exitSignBasePos);
    this._exitSignEntity.setLocalScale(
        this._exitSignHalfWidth * 2 * scaleBoost,
        1,
        this._exitSignHalfHeight * 2 * scaleBoost
    );

    this._exitSignMaterial.emissiveIntensity = 1.3 + basePulse * 0.8 + clickBoost * 1.6;
    this._exitSignMaterial.update();

    if (this._exitSignTexture && this._exitSignCanvas) {
        this._exitSignTexture.upload();
    }
};

RobotPathMove.prototype._isPointerOnExitSign = function (camera, screenX, screenY) {
    if (!this._exitSignEntity || !camera) return !1;

    var center = camera.worldToScreen(this._exitSignBasePos);
    var rightWorld = this._exitSignEntity.right.clone().scale(this._exitSignHalfWidth);
    var upWorld = this._exitSignEntity.up.clone().scale(this._exitSignHalfHeight);

    var rightPoint = this._exitSignBasePos.clone().add(rightWorld);
    var upPoint = this._exitSignBasePos.clone().add(upWorld);

    var rightScreen = camera.worldToScreen(rightPoint);
    var upScreen = camera.worldToScreen(upPoint);

    var halfWidthPx = Math.max(28, Math.abs(rightScreen.x - center.x) + 12);
    var halfHeightPx = Math.max(16, Math.abs(upScreen.y - center.y) + 10);

    return Math.abs(screenX - center.x) <= halfWidthPx &&
        Math.abs(screenY - center.y) <= halfHeightPx;
};

RobotPathMove.prototype._isPointerOnExitDoor = function (camera, screenX, screenY) {
    if (!camera || !this._exitDoorTargets || !this._exitDoorTargets.length) return !1;

    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;

    for (var i = 0; i < this._exitDoorTargets.length; i++) {
        var pos = this._exitDoorTargets[i].node.getPosition();
        var screen = camera.worldToScreen(pos);
        if (screen.x < minX) minX = screen.x;
        if (screen.x > maxX) maxX = screen.x;
        if (screen.y < minY) minY = screen.y;
        if (screen.y > maxY) maxY = screen.y;
    }

    var padX = 70;
    var padY = 120;
    return screenX >= minX - padX &&
        screenX <= maxX + padX &&
        screenY >= minY - padY &&
        screenY <= maxY + padY;
};

RobotPathMove.prototype.onMouseMove = function (event) {
    var cameraEntity = this.app.root.findByName('Camera');
    if (!cameraEntity || !cameraEntity.camera) return;

    var camera = cameraEntity.camera;
    var isDoorHovered = this._isPointerOnExitDoor(camera, event.x, event.y);
    var isSignHovered = this._isPointerOnExitSign(camera, event.x, event.y);

    this._isExitDoorHovered = isDoorHovered;

    var canvas = this.app.graphicsDevice && this.app.graphicsDevice.canvas;
    if (canvas) canvas.style.cursor = (isDoorHovered || isSignHovered) ? 'pointer' : 'default';
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

    if (this._isPointerOnExitSign(camera, event.x, event.y)) {
        this._exitSignClickTime = 0.25;
        this._showExitPopup();
        return;
    }

    if (this._isPointerOnExitDoor(camera, event.x, event.y)) {
        this._exitDoorClickTime = 0.25;
        this._showExitPopup();
        return;
    }

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

RobotPathMove.prototype._updateLabelFacingForThirdPerson = function () {
    if (!this.labelPlane) return;

    if (window.__robotViewMode !== 'third' || !this._camera) {
        this.labelPlane.setLocalEulerAngles(this._labelBaseEuler);
        return;
    }

    this._labelWorldPos.copy(this.labelPlane.getPosition());
    this._labelCameraPos.copy(this._camera.getPosition());
    this._labelCameraPos.y = this._labelWorldPos.y;

    var dx = this._labelCameraPos.x - this._labelWorldPos.x;
    var dz = this._labelCameraPos.z - this._labelWorldPos.z;
    if (Math.abs(dx) <= 1e-4 && Math.abs(dz) <= 1e-4) return;

    var yaw = Math.atan2(dx, dz) * pc.math.RAD_TO_DEG;
    this.labelPlane.setLocalEulerAngles(90, yaw, 0);
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
