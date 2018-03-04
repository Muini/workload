import * as THREE from 'three';
import Engine from './engine';
import AssetsManager from './assetsManager';

export default class Object {
    constructor(opt = {
        parent,
        position,
    }) {
        this.name = 'unnamed object';

        this.model = undefined;
        this.modelName = undefined;

        this.materials = {};
        this.lights = {};
        this.hasShadows = false;

        this.isActive = true;
        this.isVisible = true;

        this.parent = opt.parent || undefined;
        if (!this.parent) throw 'Object parameter "parent" is mandatory and should be a Object type';
        this.scene = this.parent.isScene ? this.parent : this.parent.scene;
        this.scene.addObject(this);

        this.position = opt.position || new THREE.Vector3(0, 0, 0);

        this.updateUID = '';
        Engine.addToUpdate(this.update.bind(this), (uid) => { this.updateUID = uid });
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
        //If the engine has started, it means it's an instanciation
        if (Engine.hasStarted) {
            this.awake();
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
                Engine.addToUpdate(this.update.bind(this), (uid) => { this.updateUID = uid });
                this._isUpdating = true;
            }
        } else {
            if (this._isUpdating) {
                Engine.removeToUpdate(this.updateUID);
                this._isUpdating = false;
            }
        }
        this.setVisibility(bool);
    }

    // Awake happen when the scene is loaded into the engine & started to be used
    awake() {
        this.model = this.modelName ? AssetsManager.getAsset('model', this.modelName) : new THREE.Object3D();
        this.overwriteModelParameters();
        this.model.position.x = this.position.x;
        this.model.position.y = this.position.y;
        this.model.position.z = this.position.z;
        if (this.parent.isScene) {
            this.scene.instance.add(this.model);
        } else {
            this.parent.model.add(this.model);
        }
    }

    overwriteModelParameters() {
        function updateLights(child, lights) {
            if (child.type != 'SpotLight' && child.type != 'PointLight' && child.type != 'DirectionalLight') return;

            child.decay = 2;
            child.penumbra = 0.8;
            child.angle /= 2.;

            if (child.type == 'PointLight') {
                child.distance = 5.0;
            }
            //Overwrite lights
            for (let light in lights) {
                if (child.name == light) {
                    child.color = lights[light].color;
                    child.intensity = lights[light].intensity;
                    child.castShadow = lights[light].castShadow;
                    if (child.type == 'PointLight') {
                        child.distance = lights[light].distance;
                    }
                    lights[light] = child;
                    child = lights[light];
                }
            }
        }

        function updateMaterials(child, materials) {
            if (child.type !== 'Mesh') return

            //Overwrite materials
            for (let material in materials) {
                if (child.material.length) {
                    for (let m = 0; m < child.material.length; m++) {
                        // console.log(child.material[m].name)
                        if (material == child.material[m].name) {
                            child.material[m] = materials[material];
                        }
                    }
                } else {
                    // console.log(child.material.name)
                    if (material == child.material.name) {
                        child.material = materials[material];
                    }
                }
            }
        }

        this.model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = this.hasShadows;
                child.receiveShadow = true;
                updateMaterials(child, this.materials);
            } else {
                updateLights(child, this.lights);
            }
        });
        this.model.name = this.name;
    }

    update(time, delta) {}

    onClicked() {
        if (!this.isActive) return;
    }

    destroy() {
        this.setActive(false);
        if (this._isUpdating) {
            Engine.removeToUpdate(this.updateUID);
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