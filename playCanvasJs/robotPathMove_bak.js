// 创建 PlayCanvas 脚本：机器人沿路径移动
var RobotPathMove = pc.createScript('robotPathMove');

/* =========================================================
 * 可调参数（在 Editor 面板中可配置）
 * ========================================================= */

// 用于控制动画朝向的实体（通常是模型节点）
// 如果不填，则默认使用当前 entity 本身旋转
RobotPathMove.attributes.add('animEntity', { type: 'entity' });
RobotPathMove.attributes.add('labelPlane', { type: 'entity' });
RobotPathMove.attributes.add('labelOffsetY', { type: 'number', default: 1.8 });

// 到达路径点的判定距离（小于该值认为“到点”）
RobotPathMove.attributes.add('arriveDistance', { type: 'number', default: 0.15 });

// 最大移动速度限制（防止物理速度失控）
RobotPathMove.attributes.add('moveSpeed', { type: 'number', default: 0.8});

// pause 节点停留时间（秒）
RobotPathMove.attributes.add('pauseTime', { type: 'number', default: 2 });

/* =========================================================
 * initialize：脚本初始化
 * ========================================================= */
RobotPathMove.prototype.initialize = function () {

    /**
     * 路径数据：
     * - position：目标位置
     * - lookAt：到点后或 pause 时朝向的位置
     * - turn === 'pause' 表示停留节点
     */
    this.path = [
        { showMessage: '去拿料', turn: '', position: { x: 1.7, y: 0, z: 0 }, lookAt: { x: 1.7, y: 0, z: 0.336 } },
        { showMessage: '去拿料', turn: '', position: { x: 1.7, y: 0, z: 1.336 }, lookAt: { x: 1.7, y: 0, z: 1.336 } },
        { showMessage: '去拿料', turn: '', position: { x: 1.7, y: 0, z: 2.5 }, lookAt: { x: 1.7, y: 0, z: 5.3 } },
        { showMessage: '去拿料', turn: '', position: { x: 1.7, y: 0, z: 4.5 }, lookAt: { x: 1.7, y: 0, z: 5.3 } },
        { showMessage: '拿料中', turn: '', position: { x: 1.7, y: 0, z: 5.2 }, lookAt: { x: 1.7, y: 0, z: 5.3 } },
        { showMessage: '拿料中', turn: '', position: { x: 1.5, y: 0, z: 5.2 }, lookAt: { x: -3.5, y: 0, z: 5.3 } },
        { showMessage: '拿料中', turn: 'pause', position: { x: 1.5, y: 0, z: 5.2 }, lookAt: { x: -3.5, y: 0, z: 5.3 } },
        { showMessage: '拿料中', turn: 'take', position: { x: 1.5, y: 0, z: 5.2 }, lookAt: { x: -3.5, y: 0, z: 5.3 } },
        { showMessage: '去加工', turn: '', position: { x: 1.7, y: 0, z: 4.5 }, lookAt: { x: 1.8, y: 0, z: -1.3 } },
        { showMessage: '去加工', turn: '', position: { x: 1.7, y: 0, z: 4.5 }, lookAt: { x: 1.7, y: 0, z: -1.3 } },
        { showMessage: '去加工', turn: '', position: { x: 1.7, y: 0, z: 2.5 }, lookAt: { x: 1.7, y: 0, z: -1.3 } },
        { showMessage: '去加工', turn: '', position: { x: 1.7, y: 0, z: 0.5 }, lookAt: { x: 1.7, y: 0, z: -1.3 } },
        { showMessage: '去加工', turn: '', position: { x: 1.7, y: 0, z: -1.1 }, lookAt: { x: 1.7, y: 0, z: -1.3 } },
        { showMessage: '去加工', turn: '', position: { x: 1.7, y: 0, z: -1.1 }, lookAt: { x: 0.4, y: 0, z: -1.3 } },
        { showMessage: '加工中', turn: '', position: { x: 0.4, y: 0, z: -0.9 }, lookAt: { x: 0.4, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'pause', position: { x: 0.4, y: 0, z: -0.9 }, lookAt: { x: 0.4, y: 0, z: -0.9 } },
        { showMessage: '加工中', turn: 'take', position: { x: 0.4, y: 0, z: -0.9 }, lookAt: { x: 0.4, y: 0, z: -0.9 } },
        { showMessage: '去检测', turn: '', position: { x: 0.4, y: 0, z: -0.9 }, lookAt: { x: 0.4, y: 0, z: -1.9 } },
        { showMessage: '去检测', turn: '', position: { x: 0.4, y: 0, z: -1.2 }, lookAt: { x: 0.4, y: 0, z: -2.9 } },
        { showMessage: '去检测', turn: '', position: { x: 0.4, y: 0, z: -2.9 }, lookAt: { x: 0.4, y: 0, z: -3.9 } },
        { showMessage: '去检测', turn: '', position: { x: 0.4, y: 0, z: -3.9 }, lookAt: { x: 0.4, y: 0, z: -6.4 } },
        { showMessage: '去检测', turn: '', position: { x: 0.4, y: 0, z: -6.4 }, lookAt: { x: 0.4, y: 0, z: -7.5 } },
        { showMessage: '检测中', turn: '', position: { x: 0.2, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -7.5 } },
        { showMessage: '检测中', turn: 'pause', position: { x: 0.2, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -7.5 } },
        { showMessage: '不合格', turn: '', position: { x: 0.2, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -7.5 } },
        { showMessage: '去加工', turn: '', position: { x: 0.2, y: 0, z: -6.5 }, lookAt: { x: 0.3, y: 0, z: -3.5 } },
        { showMessage: '去加工', turn: '', position: { x: 0.2, y: 0, z: -3.5 }, lookAt: { x: 0.3, y: 0, z: -1 } },
        { showMessage: '去加工', turn: '', position: { x: 0.2, y: 0, z: -0.9 }, lookAt: { x: 0.3, y: 0, z: -1 } },
        { showMessage: '加工中', turn: '', position: { x: 0.2, y: 0, z: -0.9 }, lookAt: { x: -2, y: 0, z: -1 } },
        { showMessage: '加工中', turn: 'pause', position: { x: 0.2, y: 0, z: -0.9 }, lookAt: { x: -2, y: 0, z: -1 } },
        { showMessage: '加工中', turn: 'take', position: { x: 0.2, y: 0, z: -0.9 }, lookAt: { x: -2, y: 0, z: -1 } },
        { showMessage: '去检测', turn: '', position: { x: 0.2, y: 0, z: -0.9 }, lookAt: { x: 0.3, y: 0, z: -1 } },
        { showMessage: '去检测', turn: '', position: { x: 0.2, y: 0, z: -0.9 }, lookAt: { x: 0.3, y: 0, z: -1.9 } },
        { showMessage: '去检测', turn: '', position: { x: 0.2, y: 0, z: -1.9 }, lookAt: { x: 0.3, y: 0, z: -3.9 } },
        { showMessage: '去检测', turn: '', position: { x: 0.2, y: 0, z: -3.9 }, lookAt: { x: 0.3, y: 0, z: -6.4 } },
        { showMessage: '去检测', turn: '', position: { x: 0.2, y: 0, z: -6.4 }, lookAt: { x: 0.31, y: 0, z: -6.5 } },
        { showMessage: '检测中', turn: '', position: { x: 0.31, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -6.5 } },
        { showMessage: '检测中', turn: 'pause', position: { x: 0.31, y: 0, z: -6.5 }, lookAt: { x: -2, y: 0, z: -6.5 } },
        { showMessage: '合格', turn: '', position: { x: 0.3, y: 0, z: -6.5 }, lookAt: { x: 0.29, y: 0, z: -6.5 } },
        { showMessage: '去放料', turn: '', position: { x: 0.29, y: 0, z: -6.5 }, lookAt: { x: 0.29, y: 0, z: -3.7 } },
        { showMessage: '去放料', turn: '', position: { x: 0.29, y: 0, z: -3.7 }, lookAt: { x: 0.3, y: 0, z: 0 } },
        { showMessage: '去放料', turn: '', position: { x: 0.3, y: 0, z: 0 }, lookAt: { x: 0.3, y: 0, z: 2 } },
        { showMessage: '去放料', turn: '', position: { x: 0.3, y: 0, z: 2 }, lookAt: { x: 0.3, y: 0, z: 2.7 } },
        { showMessage: '去放料', turn: '', position: { x: 0.3, y: 0, z: 2.7 }, lookAt: { x: 0.3, y: 0, z: 2.7 } },
        { showMessage: '去放料', turn: '', position: { x: 0.3, y: 0, z: 2.7 }, lookAt: { x: -1, y: 0, z: 2.7 } },
        { showMessage: '去放料', turn: '', position: { x: -1, y: 0, z: 2.7 }, lookAt: { x: -1, y: 0, z: 2.7 } },
        { showMessage: '去放料', turn: '', position: { x: -1, y: 0, z: 2.7 }, lookAt: { x: -1, y: 0, z: 2.7 } },
        { showMessage: '去放料', turn: '', position: { x: -1, y: 0, z: 2.7 }, lookAt: { x: -1.2, y: 0, z: 4.5 } },
        { showMessage: '放料中', turn: 'pause', position: { x: -1.2, y: 0, z: 4.5 }, lookAt: { x: -1.3, y: 0, z: 4.5 } },
        { showMessage: '放料中', turn: 'take', position: { x: -1.2, y: 0, z: 4.5 }, lookAt: { x: -1.3, y: 0, z: 4.5 } },
        { showMessage: '放料中', turn: '', position: { x: -1.2, y: 0, z: 4.5 }, lookAt: { x: -1.3, y: 0, z: 4.5 } },
        { showMessage: '去拿料', turn: '', position: { x: -1.3, y: 0, z: 4.5 }, lookAt: { x: -1.3, y: 0, z: 2.7 } },
        { showMessage: '去拿料', turn: '', position: { x: -1.3, y: 0, z: 2.7 }, lookAt: { x: 1.8, y: 0, z: 2.5 } },
        { showMessage: '去拿料', turn: '', position: { x: 1.8, y: 0, z: 2.5 }, lookAt: { x: 1.8, y: 0, z: 4.5 } } /**/
    ];

    this._index = 0;
    this._pauseTimer = 0;

    this._moveDir = new pc.Vec3();
    this._lookDir = new pc.Vec3();

    var initEuler = (this.animEntity || this.entity).getEulerAngles().clone();
    this._baseEuler = initEuler;
    this._angle = initEuler.y;

    this._anim = this.entity.anim || (this.animEntity && this.animEntity.anim);
    this._playerStatus = -1;
    this.setPlayerStatus(2);

    /* ===== 创建 Plane 标签 ===== */
    this._lastMessage = '';
    this._camera = this.app.root.findByName('Camera');

    if (this.labelPlane) {
        this._initLabelCanvas();
        this._updateLabel(this.path[0].showMessage);
    }
};

/* ---------- Plane 标签系统 ---------- */

RobotPathMove.prototype._initLabelCanvas = function () {

    var canvas = document.createElement('canvas');
    canvas.width = 512;
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
    mat.diffuseMap = tex;
    mat.opacityMap = tex;
    mat.opacity = 1;
    mat.blendType = pc.BLEND_NORMAL;
    mat.depthWrite = false;
    mat.update();

    this.labelPlane.model.material = mat;
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
    ctx.font = 'bold 64px "Microsoft YaHei", Arial';
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

/* ---------- update ---------- */

RobotPathMove.prototype.update = function (dt) {

    if (!this.entity.rigidbody) return;
    if (this._index >= this.path.length) this._index = 0;

    var node = this.path[this._index];

    /* === 标签文字切换 === */
    if (node.showMessage !== this._lastMessage) {
        this._lastMessage = node.showMessage;
        this._updateLabel(node.showMessage);
    }

    /* === Billboard === */
    if (this.labelPlane && this._camera) {
        this.labelPlane.lookAt(this._camera.getPosition());
        this.labelPlane.setLocalPosition(0, this.labelOffsetY, 0);
    }

    var pos = this.entity.getPosition();
    var target = node.position;

    /* pause */
    if (node.turn === 'pause' || node.turn === 'take') {
        if (this._pauseTimer === 0) {
            this.setPlayerStatus(node.turn === 'take' ? 3 : 2);
        }
        this._pauseTimer += dt;
        if (this._pauseTimer >= this.pauseTime) {
            this._pauseTimer = 0;
            this._index++;
        }
        return;
    }

    this._moveDir.set(target.x - pos.x, 0, target.z - pos.z);
    var dist = this._moveDir.length();

    if (dist <= this.arriveDistance) {
        this.entity.setPosition(target.x, target.y, target.z);
        this._index++;
        return;
    }

    this.setPlayerStatus(1);
    this._moveDir.normalize();

    var step = Math.min(this.moveSpeed * dt, dist);
    pos.x += this._moveDir.x * step;
    pos.z += this._moveDir.z * step;
    this.entity.setPosition(pos);

    this._updateRotation(dt);
};

/* ---------- 朝向 ---------- */

RobotPathMove.prototype._updateRotation = function (dt) {
    var dir = this._moveDir;
    if (dir.lengthSq() === 0) return;

    var targetAngle = Math.atan2(dir.x, dir.z) * pc.math.RAD_TO_DEG;
    this._angle = pc.math.lerpAngle(this._angle, targetAngle, 0.15);

    (this.animEntity || this.entity)
        .setEulerAngles(this._baseEuler.x, this._angle, this._baseEuler.z);
};

/* ---------- 动画 ---------- */

RobotPathMove.prototype.setPlayerStatus = function (status) {
    if (!this._anim || this._playerStatus === status) return;
    this._playerStatus = status;
    this._anim.setInteger('playerStatus', status);
};
