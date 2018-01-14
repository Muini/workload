import * as THREE from 'three';
import Engine from './engine.js';

export default class Scene {
    constructor(opt = {
        onLoaded
    }) {
        this.onLoaded = opt.onLoaded || function() {};

        this.instance = new THREE.Scene();
        this.instance.updateMatrixWorld(true);

        this.mainCamera = undefined;

        Engine.addToResize(this.resize);
    }

    addObject(object) {
        this.instance.add(object);
    }

    resize() {
        if (!this.mainCamera) return;
        this.mainCamera.aspect = Engine.width / Engine.height;
        this.mainCamera.updateProjectionMatrix();
    }

    setCamera(camera) {
        this.mainCamera = camera;
    }

    load() {
        // Get all entites, load their assets (sounds, models, textures)
    }

    unload() {

    }
}