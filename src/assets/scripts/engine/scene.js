import * as THREE from 'three';
import Engine from './engine.js';

import AssetsManager from '../engine/assetsManager';

export default class Scene {
    constructor(opt = {
        name,
        data,
        setup,
        onStart,
    }) {
        this.uuid = Engine.uuid();
        this.name = opt.name || 'unamed scene';
        this.data = opt.data || {};
        this.setup = opt.setup || function() {};
        this.onStart = opt.onStart || function() {};

        this.assetsToLoad = 0;
        this.assetsLoaded = 0;
        this.callback = function() {};

        this.instance = new THREE.Scene();
        this.instance.updateMatrixWorld(true);
        this.instance.name = this.name;

        this.isScene = true;

        this.hasLoaded = false;
        this.isLoading = false;

        this.mainCamera = undefined;

        this.objects = [];
    }

    addObject(object) {
        this.objects.push(object);
    }

    awakeObjects() {
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].awake();
        }
        if (window.DEBUG)
            console.log('%cEngine%c Scene awaked ' + this.objects.length + ' object(s)', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
    }

    setCamera(camera) {
        this.mainCamera = camera;
        this.resize();
        if (Engine.postprod)
            Engine.postprod.updateScene(this.instance, this.mainCamera);
    }

    setEnvMap(envmap) {
        this.envMap = envmap;
    }

    resize() {
        if (!this.mainCamera) return;
        if (!this.mainCamera.isOrthographicCamera) {
            this.mainCamera.aspect = Engine.width / Engine.height;
        } else {
            this.mainCamera.left = Engine.width / -this.mainCamera.distance;
            this.mainCamera.right = Engine.width / this.mainCamera.distance;
            this.mainCamera.top = Engine.height / this.mainCamera.distance;
            this.mainCamera.bottom = Engine.height / -this.mainCamera.distance;
        }
        this.mainCamera.updateProjectionMatrix();
    }

    preload(callback) {
        this.isLoading = true;
        // Get all entites, load their assets (sounds, models, textures)
        this.assetsToLoad += this.objects.length;

        this.callback = callback;

        AssetsManager.loadAssetsFromScene(this.name, _ => {
            if (window.DEBUG)
                console.log('%cLoader%c Scene %c' + this.name + '%c loaded', "color:white;background:limegreen;padding:2px 4px;", "color:black", "color:DodgerBlue", "color:black");
            this.isLoading = false;
            this.hasLoaded = true;
            this.start();
            this.callback();
        });
    }

    start() {
        Engine.addToResize(this.resize.bind(this));
        this.resize();
        this.awakeObjects();
    }

    unload() {
        if (window.DEBUG)
            console.log('%cEngine%c Clear scene %c' + this.name, "color:white;background:gray;padding:2px 4px;", "color:black", "color:DodgerBlue");
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].destroy();
        }
        Engine.removeToResize(this.uuid);
    }

}