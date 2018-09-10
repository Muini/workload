import * as THREE from 'three';

import Engine from './engine';
import Loader from './loader';
import Log from '../utils/log';

//TODO: Auto detect assets to load. Use class delectation to 
import Assets from '../../assets';
import ModelLoader from './modelLoader';

class AssetsManager {
    constructor(opt = {}) {

        this.assets = {};

        this.assetsLoaded = 0;
        this.assetsToLoad = 0;
        this.assetPercent = 0;

        this.onSceneLoaded = function() {};

        this.init();
    }

    init() {
        for (let sceneName in Assets) {
            let sceneAssets = Assets[sceneName];
            // Register Models
            for (let modelName in sceneAssets.models) {
                this.registerAsset('model', modelName, sceneAssets.models[modelName]);
            }
            // Register Textures
            for (let textureName in sceneAssets.textures) {
                this.registerAsset('texture', textureName, sceneAssets.textures[textureName]);
            }
            // Register Sounds
            for (let soundName in sceneAssets.sounds) {
                this.registerAsset('sound', soundName, sceneAssets.sounds[soundName]);
            }
        }
    }

    registerAsset(assetType, assetName, assetUrl) {
        if (this.assets[assetName]) return;
        this.assets[assetName] = {
            url: assetUrl,
            isLoaded: false,
            asset: undefined,
            type: assetType,
        }
    }

    loadAssetsFromScene(sceneName, callback) {
        if (!Assets[sceneName]) return callback();

        this.onSceneLoaded = callback;
        this.assetsToLoad = 0;
        this.assetsLoaded = 0;

        // TODO: Async everything
        for (let modelName in Assets[sceneName].models) {
            if (!this.assets[modelName].isLoaded) {
                this.assetsToLoad++;
                this.assetPercent = 0;
                ModelLoader.load(
                    this.assets[modelName].url,
                    (modelLoaded) => {
                        this.assets[modelName].asset = modelLoaded;
                        this.assets[modelName].isLoaded = true;
                        this.updateLoader();
                    },
                    (loaded, total) => {
                        this.assetPercent = loaded / total * 100;
                        Loader.updateLoader(this.assetsLoaded, this.assetsToLoad, this.assetPercent);
                    }
                );
            }
        }
        // TODO: sound loading
        for (let textureName in Assets[sceneName].textures) {
            if (!this.assets[textureName].isLoaded) {
                this.assetsToLoad++;
            }
        }
        for (let soundName in Assets[sceneName].sounds) {
            if (!this.assets[soundName].isLoaded) {
                this.assetsToLoad++;
            }
        }
    }

    updateLoader() {
        this.assetsLoaded++;
        Loader.updateLoader(this.assetsLoaded, this.assetsToLoad, this.assetPercent);
        Log.push('info', this.constructor.name, `c:LightGreen{${this.assetsLoaded}/${this.assetsToLoad}} assets loaded`);
        if (this.assetsLoaded >= this.assetsToLoad) {
            this.onSceneLoaded();
        }
    }

    getAsset(assetType, assetName) {
        return (async() => {
            if (!this.assets[assetName] || !this.assets[assetName].isLoaded) return Log.push('error', this.constructor.name, `Asset ${assetName} has not been loaded ! Make sure it is in assets.js with the correct name.`);

            switch (assetType) {
                case 'model':
                console.log(this.assets[assetName])
                    let cloneAsset = await this.cloneGltf(this.assets[assetName].asset);
                    const returnAsset = {
                        model: cloneAsset.scene,
                        animations: cloneAsset.animations
                    }
                    return returnAsset;
                    break;
                case 'texture':

                    break;
                case 'sound':

                    break;
            }
        })();
    }

    cloneGltf(gltf) {
        return (async() => {
            const clone = {
                animations: gltf.animations,
                scene: gltf.scene.clone(true)
            };

            const skinnedMeshes = {};

            gltf.scene.traverse(node => {
                if (node.isSkinnedMesh) {
                    skinnedMeshes[node.name] = node;
                }
            });

            const cloneBones = {};
            const cloneSkinnedMeshes = {};

            clone.scene.traverse(node => {
                if (node.isBone) {
                    cloneBones[node.name] = node;
                }

                if (node.isSkinnedMesh) {
                    cloneSkinnedMeshes[node.name] = node;
                }
            });

            for (let name in skinnedMeshes) {
                const skinnedMesh = skinnedMeshes[name];
                const skeleton = skinnedMesh.skeleton;
                const cloneSkinnedMesh = cloneSkinnedMeshes[name];

                const orderedCloneBones = [];

                for (let i = 0; i < skeleton.bones.length; ++i) {
                    const cloneBone = cloneBones[skeleton.bones[i].name];
                    orderedCloneBones.push(cloneBone);
                }

                cloneSkinnedMesh.bind(
                    new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses),
                    cloneSkinnedMesh.matrixWorld);
            }

            return clone;
        })();
    }

}

export default new AssetsManager();