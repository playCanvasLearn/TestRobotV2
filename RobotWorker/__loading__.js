pc.script.createLoadingScreen(function (app) {
    var TOOLBAR_ID = 'bottom-toolbar';

    var showSplash = function () {
        var wrapper = document.createElement('div');
        wrapper.id = 'application-splash-wrapper';
        document.body.appendChild(wrapper);

        var contentWrapper = document.createElement('div');
        contentWrapper.className = 'contentWrapper';
        wrapper.appendChild(contentWrapper);

        var logoSection = document.createElement('div');
        logoSection.className = 'logoSection';
        contentWrapper.appendChild(logoSection);

        var logo = document.createElement('img');
        logo.className = 'appLogo';

        // Base64 encoded image, generated from: https://base64.guru/converter/encode/image
        logo.src =
            'data:image/png;base64,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';
        logoSection.appendChild(logo);

        var appName = document.createElement('h1');
        appName.className = 'appName';
        appName.innerText = '上海机床厂';
        logoSection.appendChild(appName);

        var gearbox = document.createElement('div');
        gearbox.className = 'gearbox';
        contentWrapper.appendChild(gearbox);

        var overlay = document.createElement('div');
        overlay.className = 'overlay';
        gearbox.appendChild(overlay);

        function createGear(classes, barCount) {
            var gear = document.createElement('div');
            gear.className = classes;
            var gearInner = document.createElement('div');
            gearInner.className = 'gearInner';
            gear.appendChild(gearInner);
            for (var i = 0; i < barCount; i++) {
                var bar = document.createElement('div');
                bar.className = 'bar';
                gearInner.appendChild(bar);
            }
            gearbox.appendChild(gear);
        }

        createGear('gear one', 3);
        createGear('gear two', 3);
        createGear('gear three', 3);
        createGear('gear four large', 6);

        var container = document.createElement('div');
        container.id = 'progress-bar-container';
        contentWrapper.appendChild(container);

        var bar = document.createElement('div');
        bar.id = 'progress-bar';
        container.appendChild(bar);

    };

    var hideSplash = function () {
        var splash = document.getElementById('application-splash-wrapper');
        splash.parentElement.removeChild(splash);
    };

    var setProgress = function (value) {
        var bar = document.getElementById('progress-bar');
        if(bar) {
            value = Math.min(1, Math.max(0, value));
            bar.style.width = value * 100 + '%';
        }
    };

    var createIconSvg = function (type) {
        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');

        if (type === 'third') {
            var p1 = document.createElementNS(ns, 'path');
            p1.setAttribute('d', 'M12 5a7 7 0 1 0 7 7');
            svg.appendChild(p1);

            var p2 = document.createElementNS(ns, 'path');
            p2.setAttribute('d', 'M19 5v6h-6');
            svg.appendChild(p2);

            var p3 = document.createElementNS(ns, 'path');
            p3.setAttribute('d', 'M19 11a7 7 0 0 0-7-6');
            svg.appendChild(p3);
            return svg;
        }

        if (type === 'fixed') {
            var rect = document.createElementNS(ns, 'rect');
            rect.setAttribute('x', '3');
            rect.setAttribute('y', '7');
            rect.setAttribute('width', '18');
            rect.setAttribute('height', '12');
            rect.setAttribute('rx', '2');
            rect.setAttribute('ry', '2');
            svg.appendChild(rect);

            var dot = document.createElementNS(ns, 'circle');
            dot.setAttribute('cx', '12');
            dot.setAttribute('cy', '13');
            dot.setAttribute('r', '2');
            svg.appendChild(dot);
            return svg;
        }

        if (type === 'materials') {
            var p = document.createElementNS(ns, 'path');
            p.setAttribute('d', 'M12 3l8 4v10l-8 4l-8-4V7l8-4z');
            svg.appendChild(p);
            var l1 = document.createElementNS(ns, 'path');
            l1.setAttribute('d', 'M12 3v18');
            svg.appendChild(l1);
            var l2 = document.createElementNS(ns, 'path');
            l2.setAttribute('d', 'M4 7l8 4l8-4');
            svg.appendChild(l2);
            return svg;
        }

        if (type === 'eye') {
            var e1 = document.createElementNS(ns, 'path');
            e1.setAttribute('d', 'M2 12s4-7 10-7s10 7 10 7s-4 7-10 7S2 12 2 12z');
            svg.appendChild(e1);
            var e2 = document.createElementNS(ns, 'circle');
            e2.setAttribute('cx', '12');
            e2.setAttribute('cy', '12');
            e2.setAttribute('r', '3');
            svg.appendChild(e2);
            return svg;
        }

        if (type === 'tv') {
            var r1 = document.createElementNS(ns, 'rect');
            r1.setAttribute('x', '4');
            r1.setAttribute('y', '6');
            r1.setAttribute('width', '16');
            r1.setAttribute('height', '11');
            r1.setAttribute('rx', '2');
            r1.setAttribute('ry', '2');
            svg.appendChild(r1);
            var s1 = document.createElementNS(ns, 'path');
            s1.setAttribute('d', 'M9 20h6');
            svg.appendChild(s1);
            var s2 = document.createElementNS(ns, 'path');
            s2.setAttribute('d', 'M12 17v3');
            svg.appendChild(s2);
            return svg;
        }

        if (type === 'fence') {
            var f1 = document.createElementNS(ns, 'path');
            f1.setAttribute('d', 'M4 20V7m4 13V7m4 13V7m4 13V7m4 13V7');
            svg.appendChild(f1);
            var f2 = document.createElementNS(ns, 'path');
            f2.setAttribute('d', 'M3 10h18M3 14h18');
            svg.appendChild(f2);
            return svg;
        }

        if (type === 'floor') {
            var g1 = document.createElementNS(ns, 'path');
            g1.setAttribute('d', 'M4 10l8-4l8 4l-8 4l-8-4z');
            svg.appendChild(g1);
            var g2 = document.createElementNS(ns, 'path');
            g2.setAttribute('d', 'M4 14l8 4l8-4');
            svg.appendChild(g2);
            var g3 = document.createElementNS(ns, 'path');
            g3.setAttribute('d', 'M12 10v8');
            svg.appendChild(g3);
            return svg;
        }

        var head = document.createElementNS(ns, 'path');
        head.setAttribute('d', 'M12 12a4 4 0 1 0-4-4a4 4 0 0 0 4 4');
        svg.appendChild(head);
        var body = document.createElementNS(ns, 'path');
        body.setAttribute('d', 'M4 21a8 8 0 0 1 16 0');
        svg.appendChild(body);
        return svg;
    };

    var initViewToolbar = function () {
        if (document.getElementById(TOOLBAR_ID)) return;

        var toolbar = document.createElement('div');
        toolbar.className = 'bottom-toolbar';
        toolbar.id = TOOLBAR_ID;
        toolbar.setAttribute('role', 'toolbar');
        toolbar.setAttribute('aria-label', '视图切换');

        var btnThird = document.createElement('button');
        btnThird.type = 'button';
        btnThird.className = 'toolbar-btn is-active';
        btnThird.setAttribute('aria-label', '第三人称视图');
        btnThird.appendChild(createIconSvg('third'));

        var btnFixed = document.createElement('button');
        btnFixed.type = 'button';
        btnFixed.className = 'toolbar-btn';
        btnFixed.setAttribute('aria-label', '固定视图');
        btnFixed.appendChild(createIconSvg('fixed'));

        var btnFirst = document.createElement('button');
        btnFirst.type = 'button';
        btnFirst.className = 'toolbar-btn';
        btnFirst.setAttribute('aria-label', '第一人称(眼部)');
        btnFirst.appendChild(createIconSvg('first'));

        var toolbarSep = document.createElement('div');
        toolbarSep.className = 'toolbar-sep';
        toolbarSep.setAttribute('aria-hidden', 'true');

        var btnMaterials = document.createElement('button');
        btnMaterials.type = 'button';
        btnMaterials.className = 'toolbar-btn toolbar-btn-materials';
        btnMaterials.setAttribute('aria-label', '查看场景物品');
        btnMaterials.appendChild(createIconSvg('materials'));

        var btnHideTv = document.createElement('button');
        btnHideTv.type = 'button';
        btnHideTv.className = 'toolbar-btn toolbar-btn-hide-tv';
        btnHideTv.setAttribute('aria-label', '隐藏电视');
        btnHideTv.appendChild(createIconSvg('tv'));

        var btnHideFence = document.createElement('button');
        btnHideFence.type = 'button';
        btnHideFence.className = 'toolbar-btn toolbar-btn-hide-fence';
        btnHideFence.setAttribute('aria-label', '隐藏围栏');
        btnHideFence.appendChild(createIconSvg('fence'));

        var btnHideFloor = document.createElement('button');
        btnHideFloor.type = 'button';
        btnHideFloor.className = 'toolbar-btn toolbar-btn-hide-floor';
        btnHideFloor.setAttribute('aria-label', '隐藏地板');
        btnHideFloor.appendChild(createIconSvg('floor'));

        toolbar.appendChild(btnThird);
        toolbar.appendChild(btnFixed);
        toolbar.appendChild(btnFirst);
        toolbar.appendChild(toolbarSep);
        toolbar.appendChild(btnMaterials);
        toolbar.appendChild(btnHideTv);
        toolbar.appendChild(btnHideFence);
        toolbar.appendChild(btnHideFloor);
        document.body.appendChild(toolbar);

        var canvas = document.getElementById('application-canvas');

        var cameraEntity = app.root.findByName('Camera');
        var playerEntity = app.root.findByName('player');
        var orbitScript = cameraEntity && cameraEntity.script && cameraEntity.script.cameraOrbitZoom ? cameraEntity.script.cameraOrbitZoom : null;

        var viewMode = 'third';
        var isMaterialsOpen = false;
        var isTvHidden = false;
        var isFenceHidden = false;
        var isFloorHidden = false;

        var materialsPanel = document.createElement('div');
        materialsPanel.id = 'materials-panel';
        materialsPanel.setAttribute('role', 'dialog');
        materialsPanel.setAttribute('aria-label', '场景物品');
        materialsPanel.style.display = 'none';

        var materialsHeader = document.createElement('div');
        materialsHeader.className = 'materials-header';

        var materialsTitle = document.createElement('div');
        materialsTitle.className = 'materials-title';
        materialsTitle.innerText = '场景物品';

        var materialsSearch = document.createElement('input');
        materialsSearch.className = 'materials-search';
        materialsSearch.type = 'search';
        materialsSearch.placeholder = '搜索物品名称';
        materialsSearch.autocomplete = 'off';
        materialsSearch.spellcheck = false;

        var materialsList = document.createElement('div');
        materialsList.className = 'materials-list';

        materialsHeader.appendChild(materialsTitle);
        materialsHeader.appendChild(materialsSearch);
        materialsPanel.appendChild(materialsHeader);
        materialsPanel.appendChild(materialsList);
        document.body.appendChild(materialsPanel);

        var tmpForward = new pc.Vec3();
        var tmpRight = new pc.Vec3();
        var tmpCamPos = new pc.Vec3();
        var tmpLookPos = new pc.Vec3();
        var tmpEyePos = new pc.Vec3();
        var tmpOffset = new pc.Vec3();

        var findChildByNameIncludes = function (root, token) {
            if (!root || !token) return null;
            var stack = [root];
            var t = token.toLowerCase();
            while (stack.length) {
                var e = stack.pop();
                if (e !== root) {
                    var n = (e.name || '').toLowerCase();
                    if (n.indexOf(t) !== -1) return e;
                }
                var children = e.children;
                for (var i = 0; i < children.length; i++) stack.push(children[i]);
            }
            return null;
        };

        var findEyeMount = function (root) {
            return (
                findChildByNameIncludes(root, 'eye') ||
                findChildByNameIncludes(root, '眼') ||
                findChildByNameIncludes(root, 'head') ||
                findChildByNameIncludes(root, '头') ||
                findChildByNameIncludes(root, 'camera') ||
                findChildByNameIncludes(root, 'view')
            );
        };

        var eyeMount = null;

        var treeExpanded = Object.create(null);
        var selectedPath = '';
        var highlighted = null;
        var tvTargets = null;
        var fenceTargets = null;
        var floorTargets = null;
        var hiddenEntities = Object.create(null);
        var hiddenMeshInstances = Object.create(null);

        var findByNameLower = function (root, nameLower) {
            if (!root) return null;
            var stack = [root];
            while (stack.length) {
                var e = stack.pop();
                var n = (e.name || '').toLowerCase();
                if (n === nameLower) return e;
                var children = e.children;
                for (var i = 0; i < children.length; i++) stack.push(children[i]);
            }
            return null;
        };

        var getSceneRoot = function () {
            var sr = app.root.findByName('SceneRoot');
            if (sr) return sr;
            sr = findByNameLower(app.root, 'sceneroot');
            if (sr) return sr;
            return app.root;
        };

        var resolveEntityByPath = function (root, path) {
            if (!root || !path) return null;
            var parts = path.split('.');
            var node = root;
            for (var i = 1; i < parts.length; i++) {
                var idx = parseInt(parts[i], 10);
                if (!node || !node.children || idx !== idx) return null;
                if (idx < 0 || idx >= node.children.length) return null;
                node = node.children[idx];
            }
            return node;
        };

        var getEntityId = function (e) {
            if (!e) return '';
            if (e.getGuid) return e.getGuid();
            if (e._guid) return e._guid;
            return e.name || '';
        };

        var getMeshInstanceId = function (mi) {
            if (!mi) return '';
            if (mi.id !== undefined) return String(mi.id);
            if (mi._id !== undefined) return String(mi._id);
            var n = mi.node && mi.node.name ? mi.node.name : '';
            var m = mi.mesh && mi.mesh.name ? mi.mesh.name : '';
            return n + '|' + m;
        };

        var addHiddenEntity = function (e) {
            var id = getEntityId(e);
            if (!id) return;
            var rec = hiddenEntities[id];
            if (!rec) {
                rec = { count: 0, enabled: e.enabled, entity: e };
                hiddenEntities[id] = rec;
            }
            rec.entity = e;
            rec.count++;
            e.enabled = false;
        };

        var removeHiddenEntity = function (e) {
            var id = getEntityId(e);
            if (!id) return;
            var rec = hiddenEntities[id];
            if (!rec) return;
            rec.count--;
            if (rec.count <= 0) {
                if (rec.entity) rec.entity.enabled = rec.enabled;
                delete hiddenEntities[id];
            }
        };

        var addHiddenMeshInstance = function (mi) {
            var id = getMeshInstanceId(mi);
            if (!id) return;
            var rec = hiddenMeshInstances[id];
            if (!rec) {
                rec = { count: 0, visible: mi.visible, mi: mi };
                hiddenMeshInstances[id] = rec;
            }
            rec.mi = mi;
            rec.count++;
            mi.visible = false;
        };

        var removeHiddenMeshInstance = function (mi) {
            var id = getMeshInstanceId(mi);
            if (!id) return;
            var rec = hiddenMeshInstances[id];
            if (!rec) return;
            rec.count--;
            if (rec.count <= 0) {
                if (rec.mi) rec.mi.visible = rec.visible;
                delete hiddenMeshInstances[id];
            }
        };

        var collectTargetsByNames = function (names) {
            var set = Object.create(null);
            for (var i = 0; i < names.length; i++) set[names[i]] = true;
            var entities = [];
            var meshInstances = [];
            app.root.forEach(function (node) {
                if (set[node.name]) entities.push(node);

                var mis = null;
                if (node.render && node.render.meshInstances) mis = node.render.meshInstances;
                else if (node.model && node.model.meshInstances) mis = node.model.meshInstances;
                if (!mis || !mis.length) return;

                for (var j = 0; j < mis.length; j++) {
                    var mi = mis[j];
                    var n1 = mi && mi.node && mi.node.name ? mi.node.name : '';
                    var n2 = mi && mi.mesh && mi.mesh.name ? mi.mesh.name : '';
                    if (set[n1] || set[n2]) meshInstances.push(mi);
                }
            });
            return { entities: entities, meshInstances: meshInstances };
        };

        var hideTargets = function (targets) {
            if (!targets) return;
            var es = targets.entities || [];
            for (var i = 0; i < es.length; i++) addHiddenEntity(es[i]);
            var ms = targets.meshInstances || [];
            for (var j = 0; j < ms.length; j++) addHiddenMeshInstance(ms[j]);
        };

        var showTargets = function (targets) {
            if (!targets) return;
            var es = targets.entities || [];
            for (var i = 0; i < es.length; i++) removeHiddenEntity(es[i]);
            var ms = targets.meshInstances || [];
            for (var j = 0; j < ms.length; j++) removeHiddenMeshInstance(ms[j]);
        };

        var clearHighlight = function () {
            if (!highlighted || !highlighted.items) return;
            for (var i = 0; i < highlighted.items.length; i++) {
                var it = highlighted.items[i];
                if (!it || !it.meshInstance) continue;
                it.meshInstance.material = it.material;
            }
            highlighted = null;
        };

        var applyHighlight = function (entity) {
            clearHighlight();
            if (!entity) return;
            var items = [];

            entity.forEach(function (node) {
                var meshInstances = null;
                if (node.render && node.render.meshInstances) meshInstances = node.render.meshInstances;
                else if (node.model && node.model.meshInstances) meshInstances = node.model.meshInstances;
                if (!meshInstances || !meshInstances.length) return;

                for (var i = 0; i < meshInstances.length; i++) {
                    var mi = meshInstances[i];
                    if (!mi || !mi.material || !mi.material.clone) continue;

                    items.push({ meshInstance: mi, material: mi.material });

                    var cloned = mi.material.clone();
                    if (cloned.emissive && cloned.emissive.set) cloned.emissive.set(0, 0.6, 1);
                    if (cloned.emissiveIntensity !== undefined) cloned.emissiveIntensity = 1.8;
                    if (cloned.update) cloned.update();
                    mi.material = cloned;
                }
            });

            highlighted = { items: items };
        };

        var shouldShowNode = function (node, q) {
            if (!q) return true;
            var name = (node.name || '').toLowerCase();
            if (name.indexOf(q) !== -1) return true;
            var children = node.children;
            for (var i = 0; i < children.length; i++) {
                if (shouldShowNode(children[i], q)) return true;
            }
            return false;
        };

        var renderSceneTree = function () {
            var q = (materialsSearch.value || '').trim().toLowerCase();
            var root = getSceneRoot();

            materialsList.textContent = '';

            if (!root) {
                var empty0 = document.createElement('div');
                empty0.className = 'materials-empty';
                empty0.innerText = '未找到 SceneRoot';
                materialsList.appendChild(empty0);
                return;
            }

            var any = false;

            var renderNode = function (node, depth, path) {
                if (!shouldShowNode(node, q)) return;

                any = true;
                var children = node.children || [];
                var hasChildren = children.length > 0;

                var matched = !q || ((node.name || '').toLowerCase().indexOf(q) !== -1);
                var expanded = depth === 0 || (!!treeExpanded[path]) || (!!q && hasChildren && shouldShowNode(node, q));

                var row = document.createElement('div');
                row.className = 'scene-row' + (selectedPath === path ? ' is-selected' : '');
                row.dataset.path = path;
                row.dataset.hasChildren = hasChildren ? '1' : '0';
                row.dataset.depth = String(depth);
                row.dataset.expanded = expanded ? '1' : '0';
                row.style.paddingLeft = (10 + depth * 14) + 'px';

                var toggle = document.createElement('div');
                toggle.className = 'scene-toggle' + (hasChildren ? '' : ' is-leaf') + (expanded ? ' is-open' : '');
                row.appendChild(toggle);

                var nameEl = document.createElement('div');
                nameEl.className = 'scene-name' + (matched && q ? ' is-match' : '');
                nameEl.innerText = node.name || '(未命名)';
                row.appendChild(nameEl);

                if (depth > 0 && hasChildren) {
                    var eyeBtn = document.createElement('button');
                    eyeBtn.type = 'button';
                    eyeBtn.className = 'scene-eye';
                    eyeBtn.setAttribute('aria-label', '高亮选中');
                    eyeBtn.dataset.path = path;
                    eyeBtn.appendChild(createIconSvg('eye'));
                    row.appendChild(eyeBtn);
                }

                materialsList.appendChild(row);

                if (!hasChildren) return;
                if (!expanded) return;

                for (var i = 0; i < children.length; i++) {
                    renderNode(children[i], depth + 1, path + '.' + i);
                }
            };

            renderNode(root, 0, '0');

            if (!any) {
                var empty = document.createElement('div');
                empty.className = 'materials-empty';
                empty.innerText = '无匹配物品';
                materialsList.appendChild(empty);
            }
        };

        var setMaterialsOpen = function (open) {
            if (open === isMaterialsOpen) return;
            isMaterialsOpen = open;
            if (isMaterialsOpen) {
                btnMaterials.classList.add('is-active');
                materialsPanel.style.display = '';
                renderSceneTree();
                materialsSearch.focus();
                materialsSearch.select();
            } else {
                btnMaterials.classList.remove('is-active');
                materialsPanel.style.display = 'none';
            }
        };

        materialsSearch.addEventListener('input', function () {
            if (!isMaterialsOpen) return;
            renderSceneTree();
        });

        materialsList.addEventListener('click', function (ev) {
            var t = ev.target;
            var eye = null;
            while (t && t !== materialsList) {
                if (t.classList && t.classList.contains('scene-eye')) {
                    eye = t;
                    break;
                }
                t = t.parentElement;
            }

            if (eye) {
                ev.preventDefault();
                ev.stopPropagation();
                var p = eye.dataset.path;
                if (!p) return;
                if (selectedPath === p) {
                    selectedPath = '';
                    clearHighlight();
                } else {
                    selectedPath = p;
                    applyHighlight(resolveEntityByPath(getSceneRoot(), p));
                }
                renderSceneTree();
                return;
            }

            var el = ev.target;
            while (el && el !== materialsList && !(el.classList && el.classList.contains('scene-row'))) el = el.parentElement;
            if (!el || el === materialsList) return;

            var path = el.dataset.path;
            var hasChildren = el.dataset.hasChildren === '1';
            var depth = parseInt(el.dataset.depth, 10);
            var q = (materialsSearch.value || '').trim();

            if (!hasChildren && path) {
                selectedPath = path;
                applyHighlight(resolveEntityByPath(getSceneRoot(), path));
                renderSceneTree();
                return;
            }

            if (!q && hasChildren && depth > 0 && path) {
                treeExpanded[path] = !treeExpanded[path];
                renderSceneTree();
            }
        });

        var setActiveButton = function () {
            if (viewMode === 'first') {
                btnFirst.classList.add('is-active');
                btnThird.classList.remove('is-active');
                btnFixed.classList.remove('is-active');
            } else if (viewMode === 'fixed') {
                btnFixed.classList.add('is-active');
                btnThird.classList.remove('is-active');
                btnFirst.classList.remove('is-active');
            } else {
                btnThird.classList.add('is-active');
                btnFirst.classList.remove('is-active');
                btnFixed.classList.remove('is-active');
            }
        };

        var exitPointerLock = function () {
            if (document.pointerLockElement) {
                document.exitPointerLock();
            }
        };

        var onUpdate = function () {
            if (viewMode !== 'fixed' && viewMode !== 'first') return;

            if (!cameraEntity) {
                cameraEntity = app.root.findByName('Camera');
                orbitScript = cameraEntity && cameraEntity.script && cameraEntity.script.cameraOrbitZoom ? cameraEntity.script.cameraOrbitZoom : null;
                if (orbitScript) orbitScript.enabled = false;
            }
            if (!playerEntity) playerEntity = app.root.findByName('player');
            if (!cameraEntity || !playerEntity) return;

            var p = playerEntity.getPosition();
            var robotPathMove = playerEntity.script && playerEntity.script.robotPathMove ? playerEntity.script.robotPathMove : null;
            var facingEntity = robotPathMove && robotPathMove.animEntity ? robotPathMove.animEntity : playerEntity;

            var lookDir = null;
            if (robotPathMove && robotPathMove._lookDir && robotPathMove._lookDir.lengthSq && robotPathMove._lookDir.lengthSq() > 1e-6) {
                lookDir = robotPathMove._lookDir;
            } else {
                lookDir = facingEntity.forward;
            }

            tmpForward.set(lookDir.x, 0, lookDir.z);
            if (tmpForward.lengthSq() < 1e-6) {
                var fallbackForward = playerEntity.forward;
                tmpForward.set(fallbackForward.x, 0, fallbackForward.z);
            }
            tmpForward.normalize();

            if (viewMode === 'fixed') {
                tmpRight.cross(pc.Vec3.UP, tmpForward).normalize();

                var followBack = 4.75;
                var followUp = 2.4;
                var followRight = 0.55;
                var lookAhead = 38.0;
                var lookUp = 3.2;

                tmpCamPos.set(
                    p.x - tmpForward.x * followBack + tmpRight.x * followRight,
                    p.y + followUp,
                    p.z - tmpForward.z * followBack + tmpRight.z * followRight
                );

                tmpLookPos.set(
                    p.x + tmpForward.x * lookAhead,
                    p.y + lookUp,
                    p.z + tmpForward.z * lookAhead
                );

                cameraEntity.setPosition(tmpCamPos);
                cameraEntity.lookAt(tmpLookPos);
                return;
            }

            if (!eyeMount) eyeMount = findEyeMount(facingEntity) || findEyeMount(playerEntity);
            if (eyeMount) {
                tmpEyePos.copy(eyeMount.getPosition());
            } else {
                tmpEyePos.set(p.x, p.y + 1.75, p.z);
            }

            tmpOffset.copy(tmpForward).scale(0.25);
            tmpCamPos.copy(tmpEyePos).add(tmpOffset);

            tmpOffset.copy(tmpForward).scale(20.0);
            tmpLookPos.copy(tmpCamPos).add(tmpOffset);
            tmpLookPos.y += 0.6;

            cameraEntity.setPosition(tmpCamPos);
            cameraEntity.lookAt(tmpLookPos);
        };

        var setViewMode = function (mode) {
            if (mode === viewMode) return;
            viewMode = mode;

            if (viewMode !== 'first') exitPointerLock();
            if (orbitScript) orbitScript.enabled = (viewMode === 'third');

            setActiveButton();
        };

        var swallow = function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
        };

        btnThird.addEventListener('pointerdown', swallow, { passive: false });
        btnFixed.addEventListener('pointerdown', swallow, { passive: false });
        btnFirst.addEventListener('pointerdown', swallow, { passive: false });
        btnMaterials.addEventListener('pointerdown', swallow, { passive: false });
        btnHideTv.addEventListener('pointerdown', swallow, { passive: false });
        btnHideFence.addEventListener('pointerdown', swallow, { passive: false });
        btnHideFloor.addEventListener('pointerdown', swallow, { passive: false });

        btnThird.addEventListener('click', function () { setViewMode('third'); });
        btnFixed.addEventListener('click', function () { setViewMode('fixed'); });
        btnFirst.addEventListener('click', function () { setViewMode('first'); });
        btnMaterials.addEventListener('click', function () { setMaterialsOpen(!isMaterialsOpen); });
        btnHideTv.addEventListener('click', function () {
            var tvNames = [
                'Mesh_368', 'Mesh_369', 'Mesh_370', 'Mesh_371', 'Mesh_372', 'Mesh_373', 'Mesh_374', 'Mesh_375', 'Mesh_376',
                'Mesh_377', 'Mesh_378', 'Mesh_379', 'Mesh_380', 'Mesh_381', '屏幕'
            ];
            isTvHidden = !isTvHidden;
            if (isTvHidden) {
                btnHideTv.classList.add('is-active');
                tvTargets = collectTargetsByNames(tvNames);
                hideTargets(tvTargets);
            } else {
                btnHideTv.classList.remove('is-active');
                showTargets(tvTargets);
                tvTargets = null;
            }
        });
        btnHideFence.addEventListener('click', function () {
            var fenceNames = [
                'Mesh_106', 'Mesh_77', 'Mesh_55', 'Mesh_63', 'Mesh_155', 'Mesh_60', 'Mesh_110', 'Mesh_145', 'Mesh_156', 'Mesh_153', 'Mesh_154',
                'Mesh_75', 'Mesh_80', 'Mesh_85', 'Mesh_90', 'Mesh_96', 'Mesh_101', 'Mesh_103', 'Mesh_113',
                'Mesh_48', 'Mesh_53', 'Mesh_58', 'Mesh_62', 'Mesh_64', 'Mesh_66', 'Mesh_68', 'Mesh_69', 'Mesh_71', 'Mesh_72', 'Mesh_76', 'Mesh_78',
                'Mesh_88', 'Mesh_91', 'Mesh_93', 'Mesh_98', 'Mesh_100', 'Mesh_105', 'Mesh_107', 'Mesh_109', 'Mesh_111', 'Mesh_115', 'Mesh_119',
                'Mesh_44', 'Mesh_59', 'Mesh_81', 'Mesh_83', 'Mesh_86', 'Mesh_95',
                'Mesh_40', 'Mesh_49', 'Mesh_54', 'Mesh_57', 'Mesh_62', 'Mesh_67', 'Mesh_73'
            ];
            isFenceHidden = !isFenceHidden;
            if (isFenceHidden) {
                btnHideFence.classList.add('is-active');
                fenceTargets = collectTargetsByNames(fenceNames);
                hideTargets(fenceTargets);
            } else {
                btnHideFence.classList.remove('is-active');
                showTargets(fenceTargets);
                fenceTargets = null;
            }
        });

        btnHideFloor.addEventListener('click', function () {
            var floorNames = ['Mesh_383'];
            isFloorHidden = !isFloorHidden;
            if (isFloorHidden) {
                btnHideFloor.classList.add('is-active');
                floorTargets = collectTargetsByNames(floorNames);
                hideTargets(floorTargets);
            } else {
                btnHideFloor.classList.remove('is-active');
                showTargets(floorTargets);
                floorTargets = null;
            }
        });

        app.on('update', onUpdate);

    };

    var createCss = function () {
        var css = [
            'body {',
            '    background-color: #0d0d0d;',
            '    margin: 0;',
            '    overflow: hidden;',
            '}',
            '',
            '#application-splash-wrapper {',
            '    height: 100vh;',
            '    width: 100vw;',
            '    display: flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    background: #0d0d0d;',
            '    position: absolute;',
            '    top: 0;',
            '    left: 0;',
            '    z-index: 9999;',
            '}',
            '',
            '.contentWrapper {',
            '    display: flex;',
            '    flex-direction: column;',
            '    align-items: center;',
            '    justify-content: center;',
            '}',
            '',
            '.logoSection {',
            '    display: flex;',
            '    flex-direction: column;',
            '    align-items: center;',
            '    margin-bottom: 60px;',
            '    animation: fadeIn 1s ease-in;',
            '}',
            '',
            '.appLogo {',
            '    width: 125px;',
            '    margin-bottom: 16px;',
            '    border-radius: 12px;',
            '}',
            '',
            '.appName {',
            '    color: #fff;',
            '    font-size: 24px;',
            '    font-weight: 600;',
            '    letter-spacing: 2px;',
            '    margin: 0;',
            '    text-transform: uppercase;',
            '    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;',
            '}',
            '',
            '@keyframes fadeIn {',
            '    from { opacity: 0; transform: translateY(-20px); }',
            '    to { opacity: 1; transform: translateY(0); }',
            '}',
            '',
            '@keyframes clockwise {',
            '    0% { transform: rotate(0deg); }',
            '    100% { transform: rotate(360deg); }',
            '}',
            '',
            '@keyframes counter-clockwise {',
            '    0% { transform: rotate(0deg); }',
            '    100% { transform: rotate(-360deg); }',
            '}',
            '',
            '.gearbox {',
            '    background: #111;',
            '    height: 150px;',
            '    width: 200px;',
            '    position: relative;',
            '    border: none;',
            '    border-radius: 6px;',
            '}',
            '',
            '.overlay {',
            '    border-radius: 6px;',
            '    content: "";',
            '    position: absolute;',
            '    top: 0;',
            '    left: 0;',
            '    width: 100%;',
            '    height: 100%;',
            '    z-index: 10;',
            '    transition: background 0.2s;',
            '    background: transparent;',
            '}',
            '',
            '.gear {',
            '    position: absolute;',
            '    height: 60px;',
            '    width: 60px;',
            '    border-radius: 30px;',
            '}',
            '',
            '.large {',
            '    height: 120px;',
            '    width: 120px;',
            '    border-radius: 60px;',
            '}',
            '',
            '.large:after {',
            '    height: 96px;',
            '    width: 96px;',
            '    border-radius: 48px;',
            '    margin-left: -48px;',
            '    margin-top: -48px;',
            '}',
            '',
            '.one { top: 12px; left: 10px; }',
            '.two { top: 61px; left: 60px; }',
            '.three { top: 110px; left: 10px; }',
            '.four { top: 13px; left: 128px; }',
            '',
            '.gear:after {',
            '    content: "";',
            '    position: absolute;',
            '    height: 36px;',
            '    width: 36px;',
            '    border-radius: 36px;',
            '    background: #111;',
            '    top: 50%;',
            '    left: 50%;',
            '    margin-left: -18px;',
            '    margin-top: -18px;',
            '    z-index: 3;',
            '}',
            '',
            '.gearInner {',
            '    position: relative;',
            '    height: 100%;',
            '    width: 100%;',
            '    background: #555;',
            '    border-radius: 30px;',
            '    border: 1px solid rgba(255, 255, 255, 0.1);',
            '    box-sizing: border-box;',
            '}',
            '',
            '.large .gearInner { border-radius: 60px; }',
            '.one .gearInner { animation: counter-clockwise 3s infinite linear; }',
            '.two .gearInner { animation: clockwise 3s infinite linear; }',
            '.three .gearInner { animation: counter-clockwise 3s infinite linear; }',
            '.four .gearInner { animation: counter-clockwise 6s infinite linear; }',
            '',
            '.bar {',
            '    background: #555;',
            '    height: 16px;',
            '    width: 76px;',
            '    position: absolute;',
            '    left: 50%;',
            '    margin-left: -38px;',
            '    top: 50%;',
            '    margin-top: -8px;',
            '    border-radius: 2px;',
            '    border-left: 1px solid rgba(255, 255, 255, 0.1);',
            '    border-right: 1px solid rgba(255, 255, 255, 0.1);',
            '    box-sizing: border-box;',
            '}',
            '',
            '.large .bar {',
            '    margin-left: -68px;',
            '    width: 136px;',
            '}',
            '',
            '.gearInner .bar:nth-child(2) { transform: rotate(60deg); }',
            '.gearInner .bar:nth-child(3) { transform: rotate(120deg); }',
            '.gearInner .bar:nth-child(4) { transform: rotate(90deg); }',
            '.gearInner .bar:nth-child(5) { transform: rotate(30deg); }',
            '.gearInner .bar:nth-child(6) { transform: rotate(150deg); }',
            '',
            '.bottom-toolbar {',
            '    position: fixed;',
            '    left: 50%;',
            '    bottom: 12px;',
            '    transform: translateX(-50%);',
            '    display: flex;',
            '    gap: 10px;',
            '    padding: 10px 12px;',
            '    border-radius: 14px;',
            '    background: rgba(16, 18, 20, 0.72);',
            '    border: 1px solid rgba(255, 255, 255, 0.12);',
            '    backdrop-filter: blur(10px);',
            '    -webkit-backdrop-filter: blur(10px);',
            '    z-index: 10001;',
            '    pointer-events: auto;',
            '    user-select: none;',
            '}',
            '',
            '@supports (bottom: env(safe-area-inset-bottom)) {',
            '    .bottom-toolbar {',
            '        bottom: calc(12px + env(safe-area-inset-bottom));',
            '    }',
            '}',
            '',
            '.bottom-toolbar .toolbar-btn {',
            '    width: 44px;',
            '    height: 44px;',
            '    border-radius: 12px;',
            '    border: 1px solid rgba(255, 255, 255, 0.12);',
            '    background: rgba(255, 255, 255, 0.06);',
            '    display: inline-flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    cursor: pointer;',
            '    padding: 0;',
            '    outline: none;',
            '}',
            '',
            '.bottom-toolbar .toolbar-btn svg {',
            '    width: 22px;',
            '    height: 22px;',
            '    fill: none;',
            '    stroke: rgba(255, 255, 255, 0.92);',
            '    stroke-width: 1.8;',
            '    stroke-linecap: round;',
            '    stroke-linejoin: round;',
            '}',
            '',
            '.bottom-toolbar .toolbar-btn.is-active {',
            '    background: rgba(0, 153, 255, 0.18);',
            '    border-color: rgba(0, 153, 255, 0.55);',
            '}',
            '',
            '.bottom-toolbar .toolbar-btn:active {',
            '    transform: translateY(1px);',
            '}',
            '',
            '.bottom-toolbar .toolbar-sep {',
            '    width: 1px;',
            '    height: 26px;',
            '    background: rgba(255, 255, 255, 0.18);',
            '    align-self: center;',
            '    margin: 0 2px;',
            '    pointer-events: none;',
            '}',
            '',
            '#materials-panel {',
            '    position: fixed;',
            '    top: 12px;',
            '    right: 12px;',
            '    width: 320px;',
            '    max-width: calc(100vw - 24px);',
            '    max-height: calc(100vh - 24px);',
            '    display: flex;',
            '    flex-direction: column;',
            '    border-radius: 14px;',
            '    background: rgba(16, 18, 20, 0.92);',
            '    border: 1px solid rgba(255, 255, 255, 0.14);',
            '    backdrop-filter: blur(10px);',
            '    -webkit-backdrop-filter: blur(10px);',
            '    z-index: 10002;',
            '    overflow: hidden;',
            '}',
            '',
            '#materials-panel .materials-header {',
            '    display: flex;',
            '    flex-direction: column;',
            '    gap: 8px;',
            '    padding: 12px 12px 10px 12px;',
            '    border-bottom: 1px solid rgba(255, 255, 255, 0.10);',
            '}',
            '',
            '#materials-panel .materials-title {',
            '    color: rgba(255, 255, 255, 0.92);',
            '    font-size: 13px;',
            '    font-weight: 600;',
            '    letter-spacing: 0.2px;',
            '}',
            '',
            '#materials-panel .materials-search {',
            '    width: 100%;',
            '    height: 34px;',
            '    border-radius: 10px;',
            '    border: 1px solid rgba(255, 255, 255, 0.12);',
            '    background: rgba(255, 255, 255, 0.06);',
            '    color: rgba(255, 255, 255, 0.92);',
            '    padding: 0 10px;',
            '    outline: none;',
            '    box-sizing: border-box;',
            '}',
            '',
            '#materials-panel .materials-search::placeholder {',
            '    color: rgba(255, 255, 255, 0.45);',
            '}',
            '',
            '#materials-panel .materials-list {',
            '    padding: 8px 8px 10px 8px;',
            '    overflow: auto;',
            '    flex: 1;',
            '}',
            '',
            '#materials-panel .scene-row {',
            '    display: flex;',
            '    align-items: center;',
            '    gap: 8px;',
            '    padding-top: 8px;',
            '    padding-bottom: 8px;',
            '    border-radius: 10px;',
            '    border: 1px solid rgba(255, 255, 255, 0.08);',
            '    background: rgba(255, 255, 255, 0.03);',
            '    margin: 0 0 8px 0;',
            '    cursor: pointer;',
            '    user-select: none;',
            '}',
            '',
            '#materials-panel .scene-row:hover {',
            '    background: rgba(255, 255, 255, 0.05);',
            '}',
            '',
            '#materials-panel .scene-row.is-selected {',
            '    background: rgba(0, 153, 255, 0.16);',
            '    border-color: rgba(0, 153, 255, 0.38);',
            '}',
            '',
            '#materials-panel .scene-toggle {',
            '    width: 12px;',
            '    height: 12px;',
            '    flex: 0 0 12px;',
            '    position: relative;',
            '}',
            '',
            '#materials-panel .scene-toggle:before {',
            '    content: "";',
            '    position: absolute;',
            '    top: 1px;',
            '    left: 3px;',
            '    width: 0;',
            '    height: 0;',
            '    border-style: solid;',
            '    border-width: 5px 0 5px 6px;',
            '    border-color: transparent transparent transparent rgba(255, 255, 255, 0.70);',
            '    transform-origin: 2px 5px;',
            '}',
            '',
            '#materials-panel .scene-toggle.is-open:before {',
            '    transform: rotate(90deg);',
            '}',
            '',
            '#materials-panel .scene-toggle.is-leaf:before {',
            '    border-width: 0;',
            '}',
            '',
            '#materials-panel .scene-name {',
            '    color: rgba(255, 255, 255, 0.92);',
            '    font-size: 13px;',
            '    line-height: 1.2;',
            '    word-break: break-word;',
            '    flex: 1;',
            '}',
            '',
            '#materials-panel .scene-name.is-match {',
            '    color: rgba(0, 153, 255, 0.95);',
            '}',
            '',
            '#materials-panel .scene-eye {',
            '    margin-left: auto;',
            '    width: 28px;',
            '    height: 28px;',
            '    border-radius: 10px;',
            '    border: 1px solid rgba(255, 255, 255, 0.12);',
            '    background: rgba(255, 255, 255, 0.05);',
            '    display: inline-flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    padding: 0;',
            '    cursor: pointer;',
            '}',
            '',
            '#materials-panel .scene-eye svg {',
            '    width: 18px;',
            '    height: 18px;',
            '    fill: none;',
            '    stroke: rgba(255, 255, 255, 0.80);',
            '    stroke-width: 1.8;',
            '    stroke-linecap: round;',
            '    stroke-linejoin: round;',
            '}',
            '',
            '#materials-panel .materials-row {',
            '    padding: 10px 10px;',
            '    border-radius: 12px;',
            '    border: 1px solid rgba(255, 255, 255, 0.08);',
            '    background: rgba(255, 255, 255, 0.03);',
            '    margin: 0 0 8px 0;',
            '}',
            '',
            '#materials-panel .materials-name {',
            '    color: rgba(255, 255, 255, 0.92);',
            '    font-size: 13px;',
            '    line-height: 1.2;',
            '    word-break: break-word;',
            '}',
            '',
            '#materials-panel .materials-meta {',
            '    color: rgba(255, 255, 255, 0.55);',
            '    font-size: 12px;',
            '    margin-top: 4px;',
            '}',
            '',
            '#materials-panel .materials-empty {',
            '    color: rgba(255, 255, 255, 0.55);',
            '    font-size: 12px;',
            '    padding: 12px 10px;',
            '}',
            '',
            '#progress-bar-container {',
            '    margin: 32px auto 0 auto;',
            '    height: 4px;',
            '    width: 200px;',
            '    background-color: #1d292c;',
            '    border-radius: 2px;',
            '}',
            '',
            '#progress-bar {',
            '    width: 0%;',
            '    height: 100%;',
            '    background-color: #f60;',
            '    border-radius: 2px;',
            '    transition: width 0.2s;',
            '}'
        ].join("\n");

        var style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        document.head.appendChild(style);
    };

    createCss();
    showSplash();

    app.on('preload:end', function () {
        app.off('preload:progress');
    });
    app.on('preload:progress', setProgress);
    app.on('start', function () {
        hideSplash();
        initViewToolbar();
    });
});
