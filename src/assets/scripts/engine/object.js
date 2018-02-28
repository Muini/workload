import * as THREE from 'three';
import Engine from './engine.js';

export default class Object {
    constructor(opt = {
        scene,
    }) {
        this.name = 'unnamed object';

        this.model = undefined;
        this.modelUrl = undefined;

        this.materials = {};
        this.lights = {};
        this.hasShadows = false;

        this.isActive = true;
        this.isVisible = true;

        this.parent = undefined;

        this.scene = opt.scene || undefined
        if (!this.scene) throw 'Object parameter "scene" is mandatory and should be a Scene type';
        this.scene.addObject(this);

        Engine.addToUpdate(this.update.bind(this));
        this._isUpdating = true;

        this.init();
    }

    // Init happen when the entire project is loaded
    init() {
        for (let material in this.materials) {
            this.materials[material].name = material;
        }
        for (let light in this.lights) {
            this.lights[light].name = light;
        }
    }

    setVisibility(bool) {
        this.model.visible = bool;
        this.isVisible = bool;
    }

    setActive(bool) {
        this.isActive = bool;
        if (this.isActive) {
            if (!this._isUpdating) {
                Engine.addToUpdate(this.update.bind(this));
                this._isUpdating = true;
            }
        } else {
            if (this._isUpdating) {
                Engine.removeToUpdate(this.update.bind(this));
                this._isUpdating = false;
            }
        }
        this.setVisibility(bool);
    }

    // Awake happen when the scene is loaded into the engine & started to be used
    awake() {
        this.scene.instance.add(this.model);
    }

    setParent(parent) {
        this.parent = parent;
    }

    update(time) {}

    onClicked() {
        if (!this.isActive) return;
    }

    destroy() {
        this.setActive(false);
        if (this._isUpdating) {
            Engine.removeToUpdate(this.update.bind(this));
            this._isUpdating = false;
        }
        this.name = null;
        this.model = null;
        this.modelUrl = null;
        this.scene = null;
        this.materials = null;
        this.lights = null;
    }
}