const THREE = require("../../scripts/three.js");

const textureLoader = new THREE.TextureLoader();

const prepareTexture = function (dom) {

    let src = $(dom).attr("src");
    if (!dom.m3dTexture) {
        if (src) {
            dom.m3dTexture = textureLoader.load(src);
            syncID(dom, $(dom).attr("id"));
            syncFlipY(dom, $(dom).attr("flip-y"));
            syncWrapS(dom, $(dom).attr("wrap-s"));
            syncWrapT(dom, $(dom).attr("wrap-t"));
            trigTextureUpdate(dom);
        }
    } else {
        if (!src) {
            dom.m3dTexture.dispose();
            delete dom.m3dTexture;
        }
    }

    return dom.m3dTexture;

};

const disposeTexture = function (dom) {

    if (dom.m3dTexture) {
        dom.m3dTexture.dispose();
        delete dom.m3dTexture;
    }

};

const syncID = function (dom, value) {

    if (!dom.m3dTexture) { return; }

    if (dom.m3dTexture.name !== value) {
        dom.m3dTexture.name = value;
        trigTextureUpdate(dom);
    }

};

const syncFlipY = function (dom, value) {

    if (!dom.m3dTexture) { return; }

    if (!value) { return; }

    dom.m3dTexture.flipY = (value === "yes");

};

const syncWrapS = function (dom, value) {

    if (!dom.m3dTexture) { return; }

    if (!value) { return; }

    switch (value) {
        case "clamp": { dom.m3dTexture.wrapS = THREE.ClampToEdgeWrapping; break; };
        case "repeat": { dom.m3dTexture.wrapS = THREE.RepeatWrapping; break; };
        default: { console.error(`Unknown wrap-s settings: ${value}`); break; }
    }

};

const syncWrapT = function (dom, value) {

    if (!dom.m3dTexture) { return; }

    if (!value) { return; }

    switch (value) {
        case "clamp": { dom.m3dTexture.wrapT = THREE.ClampToEdgeWrapping; break; };
        case "repeat": { dom.m3dTexture.wrapT = THREE.RepeatWrapping; break; };
        default: { console.error(`Unknown wrap-t settings: ${value}`); break; }
    }

};

const syncSRC = function (dom, value) {

    if (!dom.m3dTexture) {
        if (value) {
            dom.m3dTexture = textureLoader.load(value);
            syncID(dom, $(dom).attr("id"));
            trigTextureUpdate(dom);
        }
    } else {
        if (!value) {
            dom.m3dTexture.dispose();
            delete dom.m3dTexture;
        }
    }

}

const trigTextureUpdate = function (dom) {

    let parent = dom.parentNode;
    while (parent && ((!parent.localName) || (parent.localName.toLowerCase() !== "m3d-scene"))) {
        parent = parent.parentNode;
    }

    let id = $(dom).attr("id");

    if (parent && id) {
        parent.m3dTrigTextureUpdate(id);
    }

};

module.exports = {
    "attributes": [ "id", "src", "flip-y", "wrap-s", "wrap-t" ],
    "listeners": {
        "onconnected": function () {
            trigTextureUpdate(this);
        },
        "onupdated": function (name, value) {
            switch (name) {
                case "id": { syncID(this, value); break; };
                case "src": { syncSRC(this, value); break; };
                case "flip-y": { syncFlipY(this, value); break; };
                case "wrap-s": { syncWrapS(this, value); break; };
                case "wrap-t": { syncWrapT(this, value); break; };
                default: { break; };
            }
        },
        "ondisconnected": function () {
            disposeTexture(this);
        }
    },
    "methods": {
        "m3dGetTexture": function () {
            return prepareTexture(this);
        }
    }
};
