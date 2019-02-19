import Engine from './engine';
import Loader from './loader';
import Log from '../utils/log';

class SceneManager {
    constructor() {
        this.scenes = new Map();
        this.scenesOrder = [];
        this.sceneCurrentIndex = 0;

        this.isPreloading = false;

        this.currentScene = undefined;
    }

    register(scene) {
        this.scenes.set(scene.name, scene);
    }

    initScenes(){
        return (async() => {
            for(const scene of this.scenes){
                await scene[1].initScene();
            }
        })();
    }

    preloadScenesCheck() {
        if (this.currentScene.isLoading || this.isPreloading) return;
        let nextIndex = this.sceneCurrentIndex + 1;

        const checkIfSceneShouldPreload = async _ => {
            let nextSceneName = this.scenesOrder[nextIndex];
            if (!nextSceneName) return false;
            if (!this.scenes.get(nextSceneName).hasLoaded) {
                this.isPreloading = true;
                await Engine.wait(3000);
                await this.scenes.get(nextSceneName).preload(_ => {
                    this.isPreloading = false;
                });
            } else {
                nextIndex++;
                return checkIfSceneShouldPreload();
            }
        }
        checkIfSceneShouldPreload();
    }

    preloadAllScenes(){
        return (async _ => {
            this.isPreloading = true;
            Loader.show();
            for(let scene of this.scenes){
                await Log.push('info', this, `Scene ${scene[1].name} is preloading now`)
                if (!scene[1].hasLoaded) {
                    await scene[1].preload(async _ => {});
                }
            }
            Loader.hide();
            this.isPreloading = false;
        })()
    }

    set(sceneName) {
        return new Promise((resolve, reject) => {
            if (this.scenes.get(sceneName) === undefined) {
                Log.push('error', this, `Scene ${sceneName} is not registered`);
                return reject();
            }
            this.currentScene = this.scenes.get(sceneName);
            if (Log.debug)
                window.scene = this.currentScene.instance;
            if (this.currentScene.hasLoaded) {
                // If the scene is already loaded, start it
                resolve();
            } else {
                Loader.show();
                if (this.currentScene.isLoading) {
                    // If the scene is actually loading, set the callback to start it when it's finished.
                    this.currentScene.onPreloaded = resolve;
                } else {
                    // Else load the scene, then start it
                    // console.log('Scene is not loaded, load it !')
                    this.isPreloading = true;
                    this.currentScene.preload(_ => {
                        this.isPreloading = false;
                        Loader.hide();
                        resolve();
                    });
                }
            }
        });
    }

    setOrder(order) {
        this.scenesOrder = order;
    }

    next() {
        Log.push('info', this, `Next Scene`);
        // Pause render
        // Engine.pause();
        // Clear renderer
        Engine.renderer.clear();
        // Stop the scene and deactivate everything
        this.currentScene.stop();
        // Set the next scene
        this.sceneCurrentIndex++;
        // Check if the next scene exist
        if (!this.scenesOrder[this.sceneCurrentIndex]) {
            Log.push('warn', this, `No more scenes to play.`);
            return Engine.stop();
        }
        this.set(this.scenesOrder[this.sceneCurrentIndex]).then(_ => {
            // When loaded, init the new scene
            Engine.interaction = undefined;
            this.currentScene.start().then(_ => {
                // Start the render
                // Engine.play();
            });
        })
    }
}

export default new SceneManager();