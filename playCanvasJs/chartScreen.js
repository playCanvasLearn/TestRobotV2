var ChartScreen = pc.createScript('chartScreen');

/* =========================
 * 初始化
 * ========================= */
ChartScreen.prototype.initialize = function () {

    /* ---------- Canvas ---------- */
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);

    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');

    /* ---------- ECharts ---------- */
    this._chart = echarts.init(canvas, null, { renderer: 'canvas' });

    this._chartData = [];
    this._chartTitle = '实时数据监控:';

    this._initChartData();
    this._updateChart();

    /* ---------- PlayCanvas Texture ---------- */
    var tex = new pc.Texture(this.app.graphicsDevice, {
        format: pc.PIXELFORMAT_R8_G8_B8_A8,
        autoMipmap: false
    });
    tex.setSource(canvas);
    this._chartTexture = tex;

    /* ---------- 材质（UI / 不受光照） ---------- */
    var mat = new pc.StandardMaterial();
    mat.emissiveMap = tex;
    mat.emissive.set(1, 1, 1);
    mat.emissiveIntensity = 1;

    mat.opacity = 1;
    mat.blendType = pc.BLEND_NORMAL;
    mat.depthWrite = false;
    mat.cull = pc.CULLFACE_NONE;
    mat.update();

    /* ---------- 绑定到模型 ---------- */
    var model = this.entity.render || this.entity.model;
    if (!model) {
        console.error('[ChartScreen] Entity 没有 render / model 组件');
        return;
    }
    model.material = mat;

    /* ---------- 定时刷新 ---------- */
    this._timer = 0;
};

/* =========================
 * 初始化数据
 * ========================= */
ChartScreen.prototype._initChartData = function () {
    this._chartData.length = 0;
    var now = Date.now();
    for (var i = 9; i >= 0; i--) {
        this._chartData.push({
            time: now - i * 5000,
            value: Math.random() * 100
        });
    }
};

/* =========================
 * 更新数据
 * ========================= */
ChartScreen.prototype._pushData = function () {
    this._chartData.push({
        time: Date.now(),
        value: Math.random() * 100
    });
    if (this._chartData.length > 10) {
        this._chartData.shift();
    }
};

/* =========================
 * 更新图表
 * ========================= */
ChartScreen.prototype._updateChart = function () {

    var formatted = this._chartData.map(function (item) {
        return {
            time: new Date(item.time).toLocaleTimeString('zh-CN', { hour12: false }),
            value: Number(item.value).toFixed(2)
        };
    });

    var option = {
        title: {
            text: this._chartTitle,
            textStyle: { color: '#fff', fontSize: 14 },
            left: '10%',
            top: '10%'
        },
        tooltip: {
            trigger: 'axis',
            textStyle: { color: '#fff' },
            backgroundColor: 'rgba(0,0,0,0.3)'
        },
        xAxis: {
            type: 'category',
            data: formatted.map(d => d.time),
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
            data: formatted.map(d => d.value),
            type: 'line',
            smooth: true,
            lineStyle: { color: '#00ff00' },
            itemStyle: { color: '#00ff00' }
        }],
        backgroundColor: 'rgba(0,0,0,0.25)',
        grid: { left: '12%', right: '10%', top: '30%', bottom: '35%' }
    };

    this._chart.setOption(option, true);
    this._chartTexture.upload(); // ★ 关键
};

/* =========================
 * 每帧更新
 * ========================= */
ChartScreen.prototype.update = function (dt) {

    this._timer += dt;
    if (this._timer >= 5) {
        this._timer = 0;
        this._pushData();
        this._updateChart();
    }
};

/* =========================
 * 外部接口
 * ========================= */
ChartScreen.prototype.setTitle = function (text) {
    this._chartTitle = text && text.length ? text : '实时数据监控:';
    this._updateChart();
};
