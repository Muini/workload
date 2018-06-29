import * as THREE from 'three';
import Engine from './engine';
import AssetsManager from './assetsManager';
import Animator from './animator';

export default class Object {
    constructor(opt = {
        parent,
        position,
        rotation,
        active,
    }) {
        this.uuid = Engine.uuid();
        this.name = 'unnamed object';

        this.model = new THREE.Group();
        this.modelName = undefined;
        this.modelUrl = undefined;
        this.animator = undefined;

        this.sounds = {};
        this.materials = {};
        this.lights = {};
        this.hasShadows = false;

        this.isActive = opt.active || true;
        this.isVisible = false;

        this.isObject = true;

        this.parent = opt.parent || undefined;
        if (!this.parent) throw 'Object parameter "parent" is mandatory and should be a Object or Scene type';
        this.scene = this.parent.isScene ? this.parent : this.parent.scene;
        this.scene.addObject(this);

        this.position = opt.position || new THREE.Vector3(0, 0, 0);
        this.rotation = opt.rotation || new THREE.Vector3(0, 0, 0);

        this._isUpdating = false;

        this.init(opt);
    }

    // Init happen when the entire project is loaded
    init(opt) {
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
                Engine.addToUpdate(this.uuid, this.update.bind(this));
                this._isUpdating = true;
            }
        } else {
            if (this._isUpdating) {
                Engine.removeFromUpdate(this.uuid);
                this._isUpdating = false;
            }
        }
        this.setVisibility(bool);
    }

    stopAllSounds() {
        for (key in this.sounds) {
            this.sounds[key].stop();
        }
    }

    getModel() {
        return (async() => {
            //Is there a model ?
            if (this.modelName) {
                //Get the model from the assets manager
                const asset = await AssetsManager.getAsset('model', this.modelName);
                this.model = asset.model;
                //Create an animator if there is animations
                if (asset.animations.length) {
                    this.animator = new Animator({
                        model: this.model,
                        animations: asset.animations
                    });
                }
                //Update local parameters
                await this.overwriteModelParameters();
            } else {
                //There is no model, just name it properly
                this.model.name = this.name;
                if (!this.isCamera)
                    this.rotation.x += Math.PI / 2; //hack inverted axis
            }
            return;
        })();
    }

    // Awake happen when the scene is loaded into the engine & started to be used
    awake() {
        return (async() => {
            await this.getModel();

            this.model.position.x += this.position.x;
            this.model.position.y += this.position.y;
            this.model.position.z += this.position.z;
            this.model.rotation.x += this.rotation.x;
            this.model.rotation.y += this.rotation.y;
            this.model.rotation.z += this.rotation.z;
            if (this.parent.isScene) {
                this.scene.instance.add(this.model);
            } else {
                this.parent.model.add(this.model);
            }

            this.updateEnvMap();

            this.setActive(this.isActive);
        })();
    }

    overwriteModelParameters() {
        return (async() => {

            const updateLights = async function(child, lights) {
                if (child.isSpotLight && !child.isPointLight && child.isDirectionalLight) return;

                child.decay = 2;
                child.penumbra = 0.8;
                child.angle /= 2.;

                if (child.isPointLight) {
                    child.distance = 5.0;
                }
                //Overwrite lights
                for (let light in lights) {
                    if (child.name == light) {
                        child.color = lights[light].color;
                        child.intensity = lights[light].intensity;
                        child.power = lights[light].power;
                        child.castShadow = lights[light].castShadow;
                        child.visible = lights[light].visible;
                        if (child.isPointLight) {
                            child.distance = lights[light].distance;
                        }
                        lights[light] = child;
                        child = lights[light];
                    }
                }

                return child;
            }

            const updateMaterials = async function(child, materials) {
                //Overwrite materials
                for (let material in materials) {
                    if (child.material.length) {
                        for (let m = 0; m < child.material.length; m++) {
                            // console.log(child.material[m].name)
                            if (material == child.material[m].name) {
                                if (child.isSkinnedMesh)
                                    materials[material].skinning = true;
                                child.material[m] = materials[material];
                            }
                        }
                    } else {
                        // console.log(child.material.name)
                        if (material == child.material.name) {
                            if (child.isSkinnedMesh)
                                materials[material].skinning = true;
                            child.material = materials[material];
                        }
                    }
                }

                return child;
            }

            this.model.traverse(async(child) => {
                if (child.isMesh || child.isSkinnedMesh) {
                    child.castShadow = this.hasShadows;
                    child.receiveShadow = true;
                    child = await updateMaterials(child, this.materials);
                } else {
                    child = await updateLights(child, this.lights);
                }
            });

            this.model.name = this.name;

        })();
    }

    updateEnvMap() {
        // Update envMap
        if (!this.scene.envMap) return;
        for (let material in this.materials) {
            if (this.materials[material].isMeshStandardMaterial) {
                this.materials[material].envMap = this.scene.envMap;
            }

        }
    }

    update(time, delta) {
        if (this.animator)
            this.animator.update(time, delta);

        this.updateEnvMap();
    }

    onClicked() {
        if (!this.isActive) return;
    }

    destroy() {
        this.setActive(false);
        for (key in this.sounds) {
            this.sounds[key].destroy();
        }
        if (this.animator)
            this.animator.destroy();
        this.animator = null;
        this.name = null;
        this.model = null;
        this.modelUrl = null;
        this.materials = null;
        this.lights = null;
        this.scene = null;
    }
}