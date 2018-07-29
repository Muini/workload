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
                if (!this.isCamera && !this.isLight)
                    this.rotation.x += Math.PI / 2; //hack inverted axis
            }
            return;
        })();
    }

    created(){
        return (async() => {
            await this.getModel();

            super.created();
        })()
    }

    overwriteModelParameters() {
        return (async () => {

            const updateLights = function (child, lights) {
                if (!child.isSpotLight && !child.isPointLight && !child.isDirectionalLight) return child;

                child.decay = 2;
                child.penumbra = 0.8;
                child.angle /= 2.;
                /*
                if (child.isPointLight) {
                    child.distance = 5.0;
                }*/
                //Overwrite lights
                lights.forEach(light => {
                    if (light.name == child.name) {
                        child.color = light.instance.color;
                        child.intensity = light.instance.intensity;
                        child.power = light.instance.power;
                        child.castShadow = light.instance.castShadow;
                        child.visible = light.instance.visible;
                        child.shadow = light.instance.shadow;
                        if (child.isPointLight) {
                            child.distance = light.instance.distance;
                        }
                        light.instance = child;
                        child = light.instance;
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

    update(time, delta) {
        if (this.animator)
            this.animator.update(time, delta);

        // update Env Map & Sway uniform
        this.materials.forEach(material => {
            if (this.scene.envMap) {
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