import Engine from '../core/engine';

import Entity from './entity';
import MaterialManager from '../core/materialManager';
import AssetsManager from '../core/assetsManager';
import Animator from './animator';

export default class Model extends Entity{
    constructor(opt){
        super(opt);

        this.modelName = undefined;
        this.modelUrl = undefined;
        this.animator = undefined;

        this.materials = new Map();

        this.hasShadows = false;

        this.isModelEntity = true;

        this.isHovering = false;
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

    getModel() {
        return (async () => {
            //Is there a model ?
            if (!this.modelName) return;
            //Get the model from the assets manager
            const asset = await AssetsManager.getAsset('model', this.modelName);
            this.model = asset.model;
            /*for (let i = 0; i < asset.model.children.length; i++) {
                console.log(asset.model.children[i])
                this.model.add(asset.model.children[i]);
            }*/
            //Create an animator if there is animations
            if (asset.animations.length) {
                this.animator = new Animator({
                    model: this.model,
                    animations: asset.animations
                });
            }
            //Update local parameters
            await this.overwriteModelParameters();

            return;
        })();
    }

    setVisibility(bool) {
        super.setVisibility(bool);
    }

    created(){
        return (async() => {
            await this.getModel();

            super.created();
        })()
    }

    awake() {
        return (async () => {
            await super.awake();

            this.bindEvents();
        })();
    }

    bindEvents() {
        this.model.on('click', this.onClick.bind(this));
        this.model.on('mousemove', this.onHover.bind(this));
        this.model.on('mouseout', this.onOutHover.bind(this));
    }

    onClick(e) {
        if (!this.isActive) return;
    }
    onHover(e) {
        if (!this.isActive) return;
        if (this.isHovering) return;
        this.isHovering = true;
    }
    onOutHover(e){
        this.isHovering = false;
    }

    overwriteModelParameters() {
        return (async () => {

            const updateLights = function (child, lights) {
                //Overwrite lights
                lights.forEach(light => {
                    if (light.name == child.name) {
                        light.instance.position.set(child.position.x, child.position.y, child.position.z);
                        light.instance.quaternion.set(child.quaternion.x, child.quaternion.y, child.quaternion.z, child.quaternion.w);
                        light.instance.rotation.set(child.rotation.x, child.rotation.y, child.rotation.z);
                        light.instance.decay = 2;
                        light.instance.penumbra = 0.8;
                        child.parent.add(light.instance);
                        // child.parent.remove(child);
                        // light.instance.angle /= 2.;
                        // console.log(light.instance);
                        return light.instance;
                    }
                });
                return child;
            }

            const updateMaterials = function (child, materials) {
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

            await this.model.traverse(async (child) => {
                if (child.isMesh || child.isSkinnedMesh) {
                    child.castShadow = this.hasShadows;
                    child.receiveShadow = true;
                    if (this.isStatic)
                        child.matrixAutoUpdate = false;
                    child = await updateMaterials(child, this.materials);
                } else {
                    child = await updateLights(child, this.lights);
                }
            });

            this.model.name = this.name;

        })();
    }

    getChildModel(name) {
        let models = [];
        return (async () => {
            await this.model.traverse((child) => {
                if (child.name.indexOf(name) > -1) {
                    models.push(child);
                }
            });
            return models;
        })();
    }

    fade(duration, onUpdate){
        // TODO: fade in and fade out method
    }

    update(time, delta) {
        if (this.animator)
            this.animator.update(time, delta);

        // update Env Map & Sway uniform
        this.materials.forEach(material => {
            if (this.scene.envMap) {
                // console.log('update envMap')
                material.instance.envMap = this.scene.envMap;
            }
            if (material.isSwayShader) {
                material.instance.uniforms['time'].value += delta;
            }
        })

        super.update(time, delta);
    }

    destroy(){
        super.destroy();
        if (this.animator)
            this.animator.destroy();
        this.animator = null;
        this.modelUrl = null;
        this.materials = null;
    }

}