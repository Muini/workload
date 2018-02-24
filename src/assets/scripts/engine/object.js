import * as THREE from 'three';
import Engine from './engine.js';

export default class Object {
    constructor(opt = {
        scene,
    }) {
        this.name = 'unnamed object';

        this.model = undefined;
        this.modelUrl = undefined;

        this.materials = [];
        this.castShadow = false;

        this.parent = undefined;

        this.scene = opt.scene || undefined
        if (!this.scene) throw 'Object parameter "scene" is mandatory and should be a Scene type';
        this.scene.addObject(this);

        Engine.addToUpdate(this.update);

        this.init();
    }

    // Init happen when the entire project is loaded
    init() {}

    // Awake happen when the scene is loaded into the engine & started to be used
    awake() {
        this.scene.instance.add(this.model);
    }

    setParent(parent) {
        this.parent = parent;
    }

    update(time) {}

    onClicked() {

    }
}