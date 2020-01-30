const THREE = require("../../scripts/three.js");

let sharedQuaternion = new THREE.Quaternion();
let sharedVector3 = new THREE.Vector3();
let sharedEuler = new THREE.Euler();

const parseVector3 = function (value, defaultValue, expanding) {

    if ((!value) || (!value.trim())) {
        return defaultValue;
    }

    let values = value.trim().split(/[\s,]+/);
    if ((values.length === 1) && expanding) {
        values = [values[0], values[0], values[0]];
    }
    if (values.length !== 3) {
        return;
    }

    floats = [];
    for (let text of values) {
        let float = parseFloat(text);
        if (!isFinite(float)) {
            return;
        }
        floats.push(float);
    }

    return floats;

};

const parseQuaternion = function (value) {

    if ((!value) || (!value.trim())) {
        return [0, 0, 0, 1];
    }

    let values = value.trim().toLowerCase().split(/[\s,]+/);

    let type = "raw";
    if (values[0] === "axis") {
        if (values.length !== 5) { return; }
        type = "axis";
        values = values.slice(1);
    } else if ("xyz".indexOf(values[0][0]) !== -1) {
        if ((values.length === 2) && (values[0].length === 1)) {
            switch (values[0]) {
                case "x": { values = ["xyz", values[1], "0", "0"]; break; };
                case "y": { values = ["xyz", "0", values[1], "0"]; break; };
                case "z": { values = ["xyz", "0", "0", values[1]]; break; };
                default: { throw new Error(`Unknown euler rotation axis[${values[0]}]`); };
            }
        }
        if (values[0].length !== 3) { return; }
        if ((values[0].indexOf("x") === -1) ||
            (values[0].indexOf("y") === -1) ||
            (values[0].indexOf("z") === -1)) {
            return;
        }
        if (values.length !== 4) { return; }
        type = values[0];
        values = values.slice(1);
    } else {
        if (values.length !== 4) { return; }
    }

    floats = [];
    for (let text of values) {
        let float = parseFloat(text);
        if (!isFinite(float)) {
            return;
        }
        floats.push(float);
    }

    if (type === "raw") {
        return floats;
    }

    if (type === "axis") {
        sharedVector3.set(floats[0], floats[1], floats[2]);
        sharedQuaternion.setFromAxisAngle(sharedVector3, floats[3]);
    } else {
        sharedEuler.set(floats[0], floats[1], floats[2], type.toUpperCase());
        sharedQuaternion.setFromEuler(sharedEuler);
    }

    return [sharedQuaternion.x, sharedQuaternion.y, sharedQuaternion.z, sharedQuaternion.w];

};

const prepareObject = function (dom) {

    if (!dom.m3dObject) {

        dom.m3dObject = new THREE.Object3D();

        dom.m3dObject.modelPosition = new THREE.Vector3();
        dom.m3dObject.modelScale = new THREE.Vector3();
        dom.m3dObject.modelQuaternion = new THREE.Quaternion();

        let scaleMatrix = new THREE.Matrix4();
        let rotationMatrix = new THREE.Matrix4();
        let translationMatrix = new THREE.Matrix4();

        // add supports for model space transform directly without additional wrapper

        dom.m3dObject.updateMatrix = function () {

            // make model specified transform
            scaleMatrix.makeScale(this.modelScale.x, this.modelScale.y, this.modelScale.z);
            rotationMatrix.makeRotationFromQuaternion(this.modelQuaternion);
            translationMatrix.makeTranslation(this.modelPosition.x, this.modelPosition.y, this.modelPosition.z);

            this.matrix.identity();
            this.matrix.premultiply(translationMatrix);
            this.matrix.premultiply(rotationMatrix);
            this.matrix.premultiply(scaleMatrix);

            // make object standard transform
            scaleMatrix.makeScale(this.scale.x, this.scale.y, this.scale.z);
            rotationMatrix.makeRotationFromQuaternion(this.quaternion);
            translationMatrix.makeTranslation(this.position.x, this.position.y, this.position.z);

            this.matrix.premultiply(scaleMatrix);
            this.matrix.premultiply(rotationMatrix);
            this.matrix.premultiply(translationMatrix);

            this.matrixWorldNeedsUpdate = true;

        };

        syncName(dom, $(dom).attr("name"));

        syncRotation(dom, $(dom).attr("rotation"));
        syncTranslation(dom, $(dom).attr("translation"));
        syncScale(dom, $(dom).attr("scale"));

        syncModelRotation(dom, $(dom).attr("model-rotation"));
        syncModelTranslation(dom, $(dom).attr("model-translation"));
        syncModelScale(dom, $(dom).attr("model-scale"));

        syncVisible(dom, $(dom).attr("visible"));

        syncChildren(dom);

    }

    return dom.m3dObject;

};

const disposeObject = function (dom) {

    if (dom.m3dObject) {
        if (dom.m3dObject.parent) {
            dom.m3dObject.parent.remove(dom);
        }
        delete dom.m3dObject;
    }

};

const syncName = function (dom, value) {

    if (!dom.m3dObject) { return; }

    dom.m3dObject.name = value;

};

const syncRotation = function (dom, value) {

    if (!dom.m3dObject) { return; }

    let floats = parseQuaternion(value);
    if (!floats) {
        console.error(`Invalid rotation value of m3d-object: ${value}`);
        return;
    }

    dom.m3dObject.quaternion.set(floats[0], floats[1], floats[2], floats[3]);

    dom.m3dObject.matrixWorldNeedsUpdate = true;

};

const syncTranslation = function (dom, value) {

    if (!dom.m3dObject) { return; }

    let floats = parseVector3(value, [0, 0, 0]);
    if (!floats) {
        console.error(`Invalid translation value of m3d-object: ${value}`);
        return;
    }

    dom.m3dObject.position.set(floats[0], floats[1], floats[2]);

    dom.m3dObject.matrixWorldNeedsUpdate = true;

};

const syncScale = function (dom, value) {

    if (!dom.m3dObject) { return; }

    let floats = parseVector3(value, [1, 1, 1], true);
    if (!floats) {
        console.error(`Invalid scale value of m3d-object: ${value}`);
        return;
    }

    dom.m3dObject.scale.set(floats[0], floats[1], floats[2]);

    dom.m3dObject.matrixWorldNeedsUpdate = true;

};

const syncModelRotation = function (dom, value) {

    if (!dom.m3dObject) { return; }

    let floats = parseQuaternion(value);
    if (!floats) {
        console.error(`Invalid model-rotation value of m3d-object: ${value}`);
        return;
    }

    dom.m3dObject.modelQuaternion.set(floats[0], floats[1], floats[2], floats[3]);

    dom.m3dObject.matrixWorldNeedsUpdate = true;

};

const syncModelTranslation = function (dom, value) {

    if (!dom.m3dObject) { return; }

    let floats = parseVector3(value, [0, 0, 0]);
    if (!floats) {
        console.error(`Invalid model-translation value of m3d-object: ${value}`);
        return;
    }

    dom.m3dObject.modelPosition.set(floats[0], floats[1], floats[2]);

    dom.m3dObject.matrixWorldNeedsUpdate = true;

};

const syncModelScale = function (dom, value) {

    if (!dom.m3dObject) { return; }

    let floats = parseVector3(value, [1, 1, 1], true);
    if (!floats) {
        console.error(`Invalid model-scale value of m3d-object: ${value}`);
        return;
    }

    dom.m3dObject.modelScale.set(floats[0], floats[1], floats[2]);

    dom.m3dObject.matrixWorldNeedsUpdate = true;

};

const syncVisible = function (dom, value) {

    if (!dom.m3dObject) { return; }

    dom.m3dObject.visible = (value !== "no");

};

const playAnimation = function (dom, clip) {

    if (!dom.m3dObject) { return; }

    if (!dom.m3dAnimationMixer) {
        dom.m3dAnimationMixer = new THREE.AnimationMixer(dom.m3dObject);
        let scene = dom;
        while (scene && ((!scene.localName) || (scene.localName.toLowerCase() !== "m3d-scene"))) {
            scene = scene.parentNode;
        }
        if (scene) {
            if (!scene.m3dMixers) {
                scene.m3dMixers = new Set();
            }
            scene.m3dMixers.add(dom.m3dAnimationMixer);
        }
    }

    let clipDOM = $(dom).find("#" + clip)[0];
    let m3dClip = undefined;
    if (clipDOM) {
        m3dClip = clipDOM.m3dGetClip();
    }
    if (m3dClip) {
        dom.m3dAnimationMixer.clipAction(m3dClip).play();
    }

};

const syncChildren = function (dom) {

    if (!dom.m3dObject) { return; }

    let children = new Set();
    for (let child of dom.m3dObject.children) {
        if (child.m3dFromTagObject) {
            children.add(child);
        }
    }

    for (let child of dom.children) {
        if (typeof child.m3dGetObject === "function") {
            let m3dObject = child.m3dGetObject();
            if (m3dObject) {
                m3dObject.m3dFromTagObject = true;
                dom.m3dObject.add(m3dObject);
                children.delete(m3dObject);
            }
        }
    }

    for (let child of children) {
        dom.m3dObject.remove(child);
    }

};

module.exports = {
    "attributes": [
        "name",
        "rotation", "translation", "scale",
        "model-rotation", "model-translation", "model-scale",
        "visible"
    ],
    "listeners": {
        "onconnected": function () {
            this.mutationObserver = new MutationObserver(() => {
                syncChildren(this);
            });
            this.mutationObserver.observe(this, { "childList": true });
        },
        "onupdated": function (name, value) {
            switch (name) {
                case "name": { syncName(this, value); break; };
                case "rotation": { syncRotation(this, value); break; };
                case "translation": { syncTranslation(this, value); break; };
                case "scale": { syncScale(this, value); break; };
                case "model-rotation": { syncModelRotation(this, value); break; };
                case "model-translation": { syncModelTranslation(this, value); break; };
                case "model-scale": { syncModelScale(this, value); break; };
                case "visible": { syncVisible(this, value); break; };
            }
        },
        "ondisconnected": function () {
            this.mutationObserver.disconnect(this);
            disposeObject(this);
        }
    },
    "methods": {
        "m3dGetObject": function () {
            return prepareObject(this);
        },
        "m3dSyncChildren": function () {
            syncChildren(this);
        },
        "playM3DClip": function (clip) {
            playAnimation(this, clip);
        }
    }
};
