import * as THREE from 'three';
import Engine from './engine';
import UUID from './utils/uuid';
import Log from './utils/log';

import SceneManager from './sceneManager';
import AssetsManager from './assetsManager';

export default class Scene {
    constructor(opt = {
        name,
        data,
        setup,
        onStart,
    }) {
        this.uuid = UUID();
        this.name = opt.name || 'unamed scene';
        if(this.name === 'global'){
            Log.push('warn', this.constructor.name, `Scene name 'global' is reserved, changed to 'global2'`)
            this.name = 'global2'
        }
        this.data = opt.data || {};
        this.setup = opt.setup || function() {};
        this.onStart = opt.onStart || function() {};

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
        this.children = [];
        this.sounds = [];

        this.assets = {
            'models': {},
            'sounds': {},
            'textures': {},
        }

        SceneManager.register(this);
    }

    // TODO: Create default setup with sky, sun, plane, all optionnal
    initScene() {
        return (async () => {
            await this.setup();
            return;
        })();
    }

    addSound(sound) {
        this.sounds.push(sound);
    }

    addObject(object) {
        this.objects.push(object);
    }

    addChildren(child){
        this.children.push(child);
    }

    createObjects() {
        return (async() => {
            await Promise.all(this.children.map(async object => { await object.created() }))
            Log.push('info', this.constructor.name, `Scene created c:salmon{${this.children.length}} object(s)`);
            return;
        })();
    }

    awakeObjects() {
        return (async() => {
            await Promise.all(this.children.map(async object => { await object.awake() }))
            Log.push('info', this.constructor.name, `Scene awaked c:salmon{${this.children.length}} object(s)`);
            return;
        })();
    }

    // TODO: Create default camera inside a scene automatically, then use virtual cameras
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
            // Log.push('info', this.constructor.name, `Resize camera c:salmon{${Engine.width} & ${Engine.height}}`);
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

            this.onPreloaded = callback;

            this.sounds.forEach(sound => sound.load());

            await AssetsManager.loadAssetsFromScene(this.name, async _ => {
                Log.push('success', this.constructor.name, `Scene c:LightGreen{${this.name}} loaded`);
                await this.createObjects();
                console.log('compile scene', this.name)
                await Engine.renderer.compile(this.instance, this.camera.instance);
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
            if (!this.camera || !this.camera.instance) return Log.push('error', this.constructor.name, `No camera has been specified in the scene ${this.name}`);
            this.setCamera(this.camera.instance);
            this.isPlaying = true;
            Engine.waitNextTick().then(_ => {
                this.onStart();
            });
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
        Log.push('info', this.constructor.name, `Clear scene ${this.name}`);

        this.sounds.forEach(elem => elem.destroy());
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].destroy();
        }
        Engine.removeFromResize(this.uuid);
    }

}