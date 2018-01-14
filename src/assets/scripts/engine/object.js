import * as THREE from 'three';
import ColladaLoader from '../vendors/ColladaLoader';
import Engine from './engine.js';

let loader = new THREE.ColladaLoader();

export default class Object {
    constructor() {
        this.name = 'unnamed object';

        this.modelUrl = undefined;
        this.model = undefined;

        this.materials = [];
        this.castShadow = false;

        this.parent = undefined;

        this.scene = undefined;

        Engine.addToUpdate(this.update);

        this.init();
    }

    preload(callback) {
        if (!this.modelUrl) {
            callback();
            this.awake();
            return;
        }
        loader.load(this.modelUrl,
            (collada) => {
                console.log(collada);

                // TODO : refacto & separate functions
                // Replace materials
                for (let c = 0; c < collada.scene.children.length; c++) {
                    let child = collada.scene.children[c];
                    if (child.type != 'PointLight') {
                        child.castShadow = this.castShadow;
                        child.receiveShadow = this.castShadow;
                    }
                    // console.log(child.type)
                    if (child.type == 'SpotLight' || child.type == 'PointLight') {
                        child.decay = 2;
                        child.penumbra = .5;
                        child.angle /= 2.;
                        // child.intensity /= 1.5;
                        // child.distance /= 2.0;
                        if (child.type == 'PointLight') {
                            child.distance = 5.0;
                        }
                    }
                    if (child.type == 'Mesh') {
                        for (let n = 0; n < this.materials.length; n++) {

                            if (child.material.length) {
                                for (let m = 0; m < child.material.length; m++) {
                                    if (this.materials[n].name == child.material[m].name) {
                                        child.material[m] = this.materials[n];
                                    }
                                }
                            } else {
                                if (this.materials[n].name == child.material.name) {
                                    child.material = this.materials[n];
                                }
                            }

                        }
                    }
                }

                // Set model
                this.model = collada.scene;
                this.model.name = this.name;

                callback();
                this.awake();
            }, (xhr) => {});
    }

    init() {}

    awake() {
        this.scene.instance.add(this.model);
    }

    setParent(parent) {
        this.parent = parent;
    }

    setModel(url) {
        this.modelUrl = url;
    }

    update(time) {}

    onClicked() {

    }
}