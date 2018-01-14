import * as THREE from 'three';
import Engine from './engine.js';

export default class Scene {
    constructor(opt = {
        name,
    }) {
        this.name = opt.name || 'unamed scene';

        this.instance = new THREE.Scene();
        this.instance.updateMatrixWorld(true);
        this.instance.name = this.name;

        this.mainCamera = undefined;

        this.objects = [];
        this.objectsLoaded = 0;

        Engine.addToResize(this.resize.bind(this));
    }

    addObject(object) {
        this.objects.push(object);
        object.scene = this;
    }

    resize() {
        if (!this.mainCamera) return;
        this.mainCamera.aspect = Engine.width / Engine.height;
        this.mainCamera.updateProjectionMatrix();
    }

    setCamera(camera) {
        this.mainCamera = camera;
    }

    load(callback) {
        // Get all entites, load their assets (sounds, models, textures)
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].preload(_ => {
                // Add object to the scene
                // console.log(this.objects[i])
                // if (this.objects[i].model)
                //     this.instance.add(this.objects[i].model);
                // Update loader
                this.updateLoader(callback);
            });
        }
    }

    updateLoader(callback) {
        this.objectsLoaded++;
        console.log('%cLoader%c ' + this.objectsLoaded + '/' + this.objects.length + ' loaded', "color:white;background:orange;padding:2px 4px;", "color:black");
        if (this.objectsLoaded >= this.objects.length) {
            console.log('%cLoader%c Scene ' + this.name + ' loaded', "color:white;background:limegreen;padding:2px 4px;", "color:black");
            callback();
        }
    }

    unload() {
        console.log('%cLoader%c Clear loader', "color:white;background:gray;padding:2px 4px;", "color:black");
    }
}