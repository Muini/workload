import * as THREE from 'three';
import Engine from './engine';
import Log from './utils/log';
import UUID from './utils/uuid';
import AssetsManager from './assetsManager';
import MaterialManager from './materialManager';
import Animator from './animator';

export default class Obj {
    constructor(opt = {
        parent,
        position,
        rotation,
        active,
    }) {
        this.uuid = UUID();
        this.name = 'unnamed object';

        this.model = new THREE.Group();
        this.modelName = undefined;
        this.modelUrl = undefined;
        this.animator = undefined;

        this.sounds = new Map();
        this.materials = new Map();
        this.lights = {};
        this.hasShadows = false;

        this.isActive = opt.active || true;
        this.isVisible = false;

        this.isObject = true;

        this.parent = opt.parent || undefined;
        if (!this.parent) return Log.push('error', this.constructor.name, `Object parameter "parent" is mandatory and should be a Object or Scene type`);
        this.scene = this.parent.isScene ? this.parent : this.parent.scene;
        this.children = [];

        this.position = opt.position || new THREE.Vector3(0, 0, 0);
        this.rotation = opt.rotation || new THREE.Vector3(0, 0, 0);

        this._isUpdating = false;

        this.init(opt);
    }

    // Init happen when the entire project is loaded
    init(opt) {
        /*this.materials.forEach(material => {
            material.instance.name = material.name;
        });*/
        for (let light in this.lights) {
            this.lights[light].name = light;
        }

        //Add object to the parent as children, and to the scene to register it
        this.scene.addObject(this);
        this.parent.addChildren(this);

        //If the engine has started, it means it's an instanciation
        if (Engine.hasStarted) {
            this.created();
        }
    }

    addMaterial(materialName, isIntancedMaterial = true) {
        const material = MaterialManager.get(materialName);
        if (!material) return;
        if (!isIntancedMaterial) {
            const cloneMaterial = material.clone();
            this.materials.set(cloneMaterial.name, cloneMaterial);
        } else {
            this.materials.set(material.name, material);
        }
    }

    addChildren(child) {
        this.children.push(child);
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
        this.sounds.forEach((sound, index) => {
            sound.stop();
        });
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

    created() {
        return (async() => {
            await this.getModel();

            // Set original coord
            this.model.position.x += this.position.x;
            this.model.position.y += this.position.y;
            this.model.position.z += this.position.z;
            this.model.rotation.x += this.rotation.x;
            this.model.rotation.y += this.rotation.y;
            this.model.rotation.z += this.rotation.z;
            // Add mesh instance to scene or parent
            if (this.parent.isScene) {
                this.scene.instance.add(this.model);
            } else {
                this.parent.model.add(this.model);
            }

            // Create children now
            if (this.children.length > 0)
                await Promise.all(this.children.map(async child => {
                    await child.created()
                }))

            // Awake
            if (this.scene && this.scene.isPlaying) {
                await this.awake();
            }
        })();
    }

    // Awake happen when the scene is loaded into the engine & started to be used
    awake() {
        return (async() => {
            this.setActive(this.isActive);
            // Awake children now
            if (this.children.length > 0)
                await Promise.all(this.children.map(async child => {
                    await child.awake()
                }))
        })();
    }

    overwriteModelParameters() {
        return (async() => {

            const updateLights = function(child, lights) {
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

            const updateMaterials = function(child, materials) {
                // Overwrite materials
                // Add skinning if this is on a skinned mesh
                materials.forEach(material => {
                    if (child.material.length) {
                        let m = child.material.length;
                        while (m--) {
                            if (material.name == child.material[m].name) {
                                if (child.isSkinnedMesh)
                                    material.instance.skinning = true;
                                child.material[m] = material.instance;
                            }
                        }
                    } else {
                        if (material.name == child.material.name) {
                            if (child.isSkinnedMesh)
                                material.instance.skinning = true;
                            child.material = material.instance;
                        }
                    }
                });

                return child;
            }

            await this.model.traverse(async(child) => {
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

    update(time, delta) {
        if (this.animator)
            this.animator.update(time, delta);

        // update Env Map & Sway uniform
        this.materials.forEach(material => {
            if (this.scene.envMap) {
                material.instance.envMap = this.scene.envMap;
            }
            if (material.isSwayShader) {
                material.instance.uniforms['time'].value = time;
            }
        })
    }

    onClicked() {
        if (!this.isActive) return;
    }

    destroy() {
        this.setActive(false);
        this.children.forEach(child => child.destroy());
        this.sounds.forEach((sound, index) => {
            sound.destroy();
        });
        if (this.animator)
            this.animator.destroy();
        this.children = [];
        this.animator = null;
        this.name = null;
        this.model = null;
        this.modelUrl = null;
        this.materials = null;
        this.lights = null;
        this.scene = null;
    }
}