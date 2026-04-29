var RotateSceneWithZoom = pc.createScript('rotateSceneWithZoom');

// ============ 参数 ============
RotateSceneWithZoom.attributes.add('rotateSensitivity', {
    type: 'number',
    default: 0.2
});

RotateSceneWithZoom.attributes.add('zoomSensitivity', {
    type: 'number',
    default: 0.1
});

RotateSceneWithZoom.attributes.add('minScale', {
    type: 'number',
    default: 0.3
});

RotateSceneWithZoom.attributes.add('maxScale', {
    type: 'number',
    default: 3
});

RotateSceneWithZoom.attributes.add('limitX', {
    type: 'number',
    default: 80
});

// ============ 初始化 ============
RotateSceneWithZoom.prototype.initialize = function () {
    // 读取初始 Transform（关键）
    var euler = this.entity.getLocalEulerAngles();
    var scale = this.entity.getLocalScale();

    this.rotX = euler.x;
    this.rotY = euler.y;

    this.scale = scale.x;

    this.dragging = false;
    this.hasInput = false; // ★ 是否已经有用户操作

    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
};

// ============ 旋转 ============
RotateSceneWithZoom.prototype.onMouseDown = function (e) {
    if (e.button === pc.MOUSEBUTTON_LEFT) {
        this.dragging = true;
        this.hasInput = true;
    }
};

RotateSceneWithZoom.prototype.onMouseUp = function () {
    this.dragging = false;
};

RotateSceneWithZoom.prototype.onMouseMove = function (e) {
    if (!this.dragging) return;

    this.hasInput = true;

    this.rotY -= e.dx * this.rotateSensitivity;
    this.rotX -= e.dy * this.rotateSensitivity;

    this.rotX = pc.math.clamp(this.rotX, -this.limitX, this.limitX);
};

// ============ 缩放 ============
RotateSceneWithZoom.prototype.onMouseWheel = function (e) {
    this.hasInput = true;

    this.scale += e.wheel * this.zoomSensitivity;
    this.scale = pc.math.clamp(this.scale, this.minScale, this.maxScale);

    this.entity.setLocalScale(this.scale, this.scale, this.scale);
};

// ============ 更新 ============
RotateSceneWithZoom.prototype.update = function () {
    // ★ 没有用户输入前，完全不动
    if (!this.hasInput) return;

    this.entity.setLocalEulerAngles(this.rotX, this.rotY, 0);
};
