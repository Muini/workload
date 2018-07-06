import * as THREE from 'three';
import Engine from './engine';

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
        this.onPreloaded = function() {};

        this.instance = new THREE.Scene();
        this.instance.updateMatrixWorld(true);
        this.instance.name = this.name;

        this.isScene = true;

        this.hasLoaded = false;
        this.isLoading = false;

        this.isPlaying = false;

        this.mainCamera = undefined;

        this.objects = [];
        this.sounds = new Map();

        this.assets = {
            'models': {},
            'sounds': {},
            'textures': {},
        }
    }

    initScene() {
        return (async() => {
            await this.setup();
            return;
        })();
    }

    addSound(sound) {
        if (this.sounds.get(sound.name))
            console.warn(`Sound ${sound.name} already exist in scene ${this.scene.name}. Please use another name`);
        this.sounds.set(sound.name, sound);
    }

    addObject(object) {
        this.objects.push(object);
        // this.assets['models']
    }

    createObjects() {
        return (async() => {
            await Promise.all(this.objects.map(async object => { await object.created() }))
            if (window.DEBUG)
                console.log('%cEngine%c Scene created ' + this.objects.length + ' object(s)', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
            return;
        })();
    }

    awakeObjects() {
        return (async() => {
            await Promise.all(this.objects.map(async object => { await object.awake() }))
            if (window.DEBUG)
                console.log('%cEngine%c Scene awaked ' + this.objects.length + ' object(s)', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
            return;
        })();
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
        return (async() => {
            this.isLoading = true;
            // Get all entites, load their assets (sounds, models, textures)
            this.assetsToLoad += this.objects.length;

            this.onPreloaded = callback;

            this.sounds.forEach(elem => elem.load());

            await AssetsManager.loadAssetsFromScene(this.name, _ => {
                if (window.DEBUG)
                    console.log('%cLoader%c Scene %c' + this.name + '%c loaded', "color:white;background:limegreen;padding:2px 4px;", "color:black", "color:DodgerBlue", "color:black");
                this.createObjects();
                this.isLoading = false;
                this.hasLoaded = true;
                return this.onPreloaded();
            });
        })();
    }

    start() {
        return (async() => {
            Engine.addToResize(this.uuid, this.resize.bind(this));
            this.resize();
            await this.awakeObjects();
            this.onStart();
            this.isPlaying = true;
        })();
    }

    stop() {
        //This is the end of the scene
        // Desactivate every objects
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].setActive(false);
        }
        // Stop all sounds
        this.sounds.forEach(elem => elem.stop());

        this.isPlaying = false;
        Engine.removeFromResize(this.uuid);
    }

    unload() {
        if (window.DEBUG)
            console.log('%cEngine%c Clear scene %c' + this.name, "color:white;background:gray;padding:2px 4px;", "color:black", "color:DodgerBlue");

        this.sounds.forEach(elem => elem.destroy());
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].destroy();
        }
        Engine.removeFromResize(this.uuid);
    }

}