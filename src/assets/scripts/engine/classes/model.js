import Engine from '../core/engine';

import Entity from './entity';
import MaterialManager from '../core/materialManager';
import AssetsManager from '../core/assetsManager';
import Animator from './animator';
import Log from '../utils/log';

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
        return (async _ => {
            //Is there a model ?
            if (!this.modelName) return;
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

        })();   
    }

    setVisibility(bool) {
        super.setVisibility(bool);
    }

    created(){
        return (async _ => {
            await this.getModel();

            await super.created();
        })()
    }

    awake() {
        return (async _ => {
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
        const updateLights = (child) => {
            //Overwrite lights
            for(let key of this.lights){
                let light = key[1];
                if (light.name == child.name) {
                    light.instance.position.set(child.position.x, child.position.y, child.position.z);
                    light.instance.quaternion.set(child.quaternion.x, child.quaternion.y, child.quaternion.z, child.quaternion.w);
                    light.instance.rotation.set(child.rotation.x, child.rotation.y, child.rotation.z);
                    light.instance.decay = 2;
                    light.instance.penumbra = 0.8;
                    // light.instance.angle /= 2.;
                    child.parent.add(light.instance);
                    // child.parent.remove(child);
                    // console.log(light.instance);
                    return light.instance;
                }
            }
            return child;
        }

        const updateMaterials = (childToReplace) => {
            let child = childToReplace;
            // Overwrite materials
            const getReplacementMaterial = (name) => {
                if (this.materials.get(name)) {
                    // Add skinning if this is on a skinned mesh
                    if(child.isSkinnedMesh)
                        this.materials.get(name).instance.skinning = true
                    return this.materials.get(name).instance;
                }else{
                    Log.push('warn', this, `Could not find material c:orange{${name}} for model ${this.modelName}`)
                    return MaterialManager.get('NotFoundMaterial').instance;
                }
            }

            if (child.material.length) {
                // Create new array of materials to deep clone them, otherwise the reference is kept between instances
                let newMaterials = [];
                // Check every materials
                for (let m = 0; m < child.material.length; m++) {
                    newMaterials.push(getReplacementMaterial(child.material[m].name));
                }
                child.material = newMaterials;
            } else {
                child.material = getReplacementMaterial(child.material.name)
            }

            return child;
        }

        this.model.traverse(child => {
            if (child.isMesh || child.isSkinnedMesh) {
                child.castShadow = this.hasShadows;
                child.receiveShadow = this.hasShadows;
                if (this.isStatic)
                    child.matrixAutoUpdate = false;
                child = updateMaterials(child);
            } else {
                child = updateLights(child);
            }
        });

        this.model.name = this.name;
    }

    getChildModel(name) {
        let models = [];
        return (async _ => {
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