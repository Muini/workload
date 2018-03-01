import Assets from '../assets';
import ModelLoader from './modelLoader';

class AssetsManager {
    constructor(opt = {}) {

        this.assets = {};

        this.assetsLoaded = 0;
        this.assetsToLoad = 0;

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

        for (let modelName in Assets[sceneName].models) {
            if (!this.assets[modelName].isLoaded) {
                this.assetsToLoad++;
                ModelLoader.load(this.assets[modelName].url, (modelLoaded) => {
                    this.assets[modelName].asset = modelLoaded;
                    this.assets[modelName].isLoaded = true;
                    this.updateLoader();
                });
            }
        }
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
        if (window.DEBUG)
            console.log('%cLoader%c ' + this.assetsLoaded + '/' + this.assetsToLoad + ' assets loaded', "color:white;background:orange;padding:2px 4px;", "color:black");
        if (this.assetsLoaded >= this.assetsToLoad) {
            this.onSceneLoaded();
        }
    }

    getAsset(assetType, assetName) {
        if (!this.assets[assetName].isLoaded) return console.log('%cEngine%c Model has not been loaded ! Make sure it is in assets.js with the correct name. %c' + this.assetName, "color:white;background:red;padding:2px 4px;", "color:red", "color:DodgerBlue");

        switch (assetType) {
            case 'model':
                return this.assets[assetName].asset.clone();;
                break;
            case 'texture':

                break;
            case 'sound':

                break;
        }
    }

}

export default new AssetsManager();