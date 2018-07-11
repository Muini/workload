import * as THREE from 'three';
// import '../vendors/WebGLDeferredRenderer';
import Stats from 'stats.js';
import PostProd from './postprod';
import SoundEngine from './soundEngine'; 
import Loader from './loader';

import './utils/watch-polyfill';
import UUID from './utils/uuid';

window.DEBUG = true;

class Engine {
    constructor(opt = {}) {

        if (window.DEBUG) {
            this.stats = new Stats();
            this.stats.showPanel(0);
        }

        this.currentScene = undefined;

        this.fixedRatio = (16 / 9);
        this.hasFixedRatio = false;
        this.width = window.innerWidth;
        if (this.hasFixedRatio)
            this.height = this.width / this.fixedRatio;
        else
            this.height = window.innerHeight;

        this.scenes = new Map();
        this.scenesOrder = [];
        this.sceneCurrentIndex = 0;

        this.isMobile = (navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i)
        );
        this.quality = this.isMobile ? 2 : 4;
        /*
        function factorial(num) {
            if (num < 0) {
                throw new Error("Number cannot be negative.");
            }
            if (num % 1 !== 0) {
                throw new Error("Number must be an integer.");
            }
            if (num === 0 || num === 1) {
                return 1;
            }
            return num * factorial(num - 1);
        }
        const iterations = this.isMobile ? 10000 : 100000;
        let startTime = performance.now();
        for (let i = 1; i < iterations; i++) {
            factorial(20);
        }
        let durationTime = performance.now() - startTime;
        startTime = performance.now();
        for (let i = 1; i < iterations; i++) {
            factorial(20);
        }
        durationTime = (durationTime + (performance.now() - startTime)) / 2;
        if (window.DEBUG) {
            console.log('Performance Test: ' + durationTime + ' ms');
        }
        if (durationTime > 22)
            this.quality--;
        */
        this.container = undefined;
        this.containerBoundingBox = undefined;
        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
        // this.renderer = new THREE.WebGLDeferredRenderer();
        this.renderer.setSize(this.width, this.height);
        this.renderer.autoClear = false;
        if (this.quality < 3) {
            this.renderer.shadowMap.enabled = this.quality > 1 ? true : false;
            this.renderer.shadowMap.type = THREE.BasicShadowMap;
        } else {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = this.quality > 3 ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
        }
        this.pixelDensity = this.isMobile ? (window.devicePixelRatio > 2.0 ? 2.0 : window.devicePixelRatio) : (window.devicePixelRatio);
        this.renderer.setPixelRatio(this.pixelDensity);
        this.renderer.toneMapping = THREE.Uncharted2ToneMapping;
        // this.renderer.toneMapping = THREE.CineonToneMapping; //THREE.ACESToneMapping
        this.renderer.toneMappingExposure = Math.pow(0.68, 5.0);
        this.renderer.physicallyCorrectLights = false;
        this.renderer.gammaFactor = 2.2;
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;

        this.lastTick = 0;
        this.elapsedTime = 0;
        this.fpsMedian = 0;
        this.tickNbr = 0;
        this.hasAdapativeRenderer = true;
        this.performanceCycleNbr = 0;
        this.maxPerformanceCycle = 5; //3 Cycles
        this.performanceCycleLength = 10; //Every 8 frames

        this.requestId = undefined;
        this.hasStarted = false;
        this.isPlaying = false;

        this.updateFunctions = new Map();
        this.resizeFunctions = new Map();

        this.bindEvents();

        this.hasPostProd = true;
        this.postprod = undefined;

        if (window.DEBUG) {
            window.THREE = THREE;
            window.renderer = this.renderer;
            console.log('%cEngine%c Init - width: ' + this.width + 'px - height: ' + this.height + 'px - Quality: ' + this.quality + ' - pixelRatio: ' + this.pixelDensity + ' - Three.js r' + THREE.REVISION, "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
        }
    }

    init(container) {
        if (this.hasPostProd) {
            this.postprod = new PostProd({
                width: this.width,
                height: this.height,
                pixelDensity: this.pixelDensity,
                camera: this.mainCamera,
                scene: undefined,
                renderer: this.renderer,
                passes: {
                    fxaa: { enabled: this.quality < 2 ? true : true },
                    bloom: { enabled: this.quality < 3 ? false : true, options: [0.5, 1.0, 0.9] },
                    filmic: {
                        enabled: true,
                        noise: 0.1,
                        useStaticNoise: true,
                        rgbSplit: this.quality < 3 ? 0.0 : 5.0,
                        vignette: this.quality < 2 ? 0.0 : 20.0,
                        vignetteOffset: 0.15,
                        lut: 0.75,
                        lutURL: '/static/img/lut-gamma.png',
                    },
                    bokehdof: {
                        enabled: this.quality < 3 ? false : true,
                    },
                    blur: {
                        enabled: true,
                        strength: 3.0,
                        sharpen: this.quality < 3 ? 0.05 : 0.15,
                        blurRgbSplit: 1.25,
                        gain: 1.20,
                    }
                }
            });
        }

        this.container = container;
        this.container.appendChild(this.renderer.domElement);
        if (window.DEBUG)
            this.container.appendChild(this.stats.dom);

        this.waitNextTick(_ => {
            this.containerBoundingBox = this.container.getBoundingClientRect();
        });
    }

    setFixedRatio(ratio) {
        this.fixedRatio = ratio;
        this.hasFixedRatio = true;
        this.resize();
    }

    bindEvents() {
        window.addEventListener('resize', _ => {
            this.performanceCycleNbr = 0;
            this.resize();
        }, false);
        // if (window.DEBUG) return;
        let isActive = true
        document.addEventListener('visibilitychange', _ => {
            if (document.visibilityState == 'visible') {
                if (!isActive) {
                    isActive = true
                    this.play();
                }
            } else {
                if (isActive) {
                    isActive = false
                    this.pause();
                }
            }
        })
        window.addEventListener('focus', _ => {
            if (!isActive) {
                isActive = true
                this.play();
            }
        }, false)
        window.addEventListener('blur', _ => {
            if (isActive) {
                isActive = false
                this.pause();
            }
        }, false)
    }

    addToResize(uuid, fct) {
        if (typeof fct !== 'function' || uuid === undefined) return;
        this.resizeFunctions.set(uuid, fct);
    }
    removeFromResize(uuid) {
        this.resizeFunctions.delete(uuid)
    }

    addToUpdate(uuid, fct) {
        if (typeof fct !== 'function' || uuid === undefined) return;
        this.updateFunctions.set(uuid, fct);
    }
    removeFromUpdate(uuid) {
        this.updateFunctions.delete(uuid)
    }

    waitNextTick(fct) {
        this.wait(fct, 0);
    }

    wait(fct, timeToWait) {
        const uuid = UUID();
        const startTime = this.lastTick;
        this.addToUpdate(uuid, _ => {
            const elapsed = this.lastTick - startTime;
            if(elapsed >= timeToWait){
                this.removeFromUpdate(uuid);
                fct();
            }
        });
    }

    resize() {
        this.width = window.innerWidth;
        if (this.hasFixedRatio) {
            this.height = this.width / this.fixedRatio;
            if (window.innerHeight < this.height) {
                this.height = window.innerHeight;
                this.width = this.height * this.fixedRatio;
            }
        } else {
            this.height = window.innerHeight;
        }

        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(this.pixelDensity);

        this.container.style['width'] = this.width + 'px';
        this.container.style['height'] = this.height + 'px';
        this.containerBoundingBox = this.container.getBoundingClientRect();

        this.resizeFunctions.forEach(fct => {
            fct();
        });

        if (this.hasPostProd)
            this.postprod.resize(this.width, this.height, this.pixelDensity);

        if (!this.isPlaying && this.hasStarted) {
            this.pause();
            this.waitNextTick(_ => {
                this.play();
            });
        }
    }

    registerScene(scene) {
        this.scenes.set(scene.name, scene);
        this.scenes.get(scene.name).initScene();
    }

    preloadScenesCheck() {
        // TODO: wait between loading to not overheat ; buffer ?
        if (this.currentScene.isLoading || this.isPreloading) return;
        let nextIndex = this.sceneCurrentIndex + 1;

        const checkIfSceneShouldPreload = _ => {
            let nextSceneName = this.scenesOrder[nextIndex];
            if (!nextSceneName) return false;
            if (!this.scenes.get(nextSceneName).hasLoaded) {
                this.isPreloading = true;
                this.scenes.get(nextSceneName).preload(_ => {
                    this.isPreloading = false;
                });
            } else {
                nextIndex++;
                return checkIfSceneShouldPreload();
            }
        }
        checkIfSceneShouldPreload();
    }

    setScene(sceneName) {
        return new Promise((resolve, reject) => {
            //TODO: reject setScene
            if (this.scenes.get(sceneName) === undefined) throw `Engine : Scene ${sceneName} is not registered`;
            this.currentScene = this.scenes.get(sceneName);
            if (window.DEBUG)
                window.scene = this.currentScene.instance;
            if (this.currentScene.hasLoaded) {
                // If the scene is already loaded, start it
                // console.log('Scene is already loaded, continue')
                this.performanceCycleNbr = 0;
                resolve();
            } else {
                if (this.currentScene.isLoading) {
                    // If the scene is actually loading, set the callback to start it when it's finished. Also, show the loader !
                    // console.log('Scene is already loading, wait for it')
                    Loader.show();
                    this.currentScene.onPreloaded = resolve;
                } else {
                    // Else load the scene, then start it
                    // console.log('Scene is not loaded, load it !')
                    this.isPreloading = true;
                    this.currentScene.preload(_ => {
                        this.isPreloading = false;
                        resolve();
                    });
                }
            }
        });
    }

    setScenesOrder(order) {
        this.scenesOrder = order;
    }

    nextScene() {
        if (window.DEBUG)
            console.log('%cEngine%c Next Scene', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");

        // Pause render
        this.pause();
        // Clear renderer
        this.renderer.clear();
        // Stop the scene and deactivate everything
        this.currentScene.stop();
        // Set the next scene
        this.sceneCurrentIndex++;
        // Check if the next scene exist
        if (!this.scenesOrder[this.sceneCurrentIndex]) {
            if (window.DEBUG)
                console.log('%cEngine%c No more scenes to play.', "color:white;background:Orange;padding:2px 4px;", "color:black");
            return this.stop();
        }
        this.setScene(this.scenesOrder[this.sceneCurrentIndex]).then(_ => {
            // When loaded, init the new scene
            this.currentScene.start().then(_ => {
                // Start the render
                this.play();
            });
        })
    }

    start() {
        return (async() => {
            // Set the scene when the engine is starting
            await this.setScene(this.scenesOrder[this.sceneCurrentIndex]).then(async _ => {
                if (this.currentScene == undefined) throw 'No scene has been loaded or specified, please use Engine.setScenesOrder(...) function';

                if (window.DEBUG)
                    console.log('%cEngine%c ⏺️ Start', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");

                await this.currentScene.start();

                if (this.currentScene.mainCamera == undefined) throw 'No camera has been added or specified, please use scene.setCamera(...) function';

                this.hasStarted = true;

                this.play();
            });
        })();
    }

    play() {
        if (!this.hasStarted || this.isPlaying) return;
        this.update = this.update.bind(this);
        this.lastTick = 0;
        this.requestId = requestAnimationFrame(time => this.update(time));
        this.isPlaying = true;
        if (window.DEBUG)
            console.log('%cEngine%c ▶️ Play', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
    }

    pause() {
        if (!this.hasStarted || !this.isPlaying) return;
        window.cancelAnimationFrame(this.requestId);
        this.requestId = undefined;
        this.isPlaying = false;
        if (window.DEBUG)
            console.log('%cEngine%c ⏸️ Pause', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
    }

    stop() {
        if (window.DEBUG)
            console.log('%cEngine%c ⏹️ Stop', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
        this.pause();
        this.elapsedTime = 0;
        this.hasStarted = false;
    }

    adaptiveRenderer(time, delta) {
        if (!this.hasAdapativeRenderer) return;

        if (this.lastTick == null) return;
        if (this.performanceCycleNbr >= this.maxPerformanceCycle) return;

        this.tickNbr++;

        //Check current FPS
        let fps = 1000 / (time - this.lastTick);
        this.fpsMedian += fps;

        //Check median FPS by cycle
        if (this.tickNbr % this.performanceCycleLength === 0) {
            //Get the mediam FPS of the cycle
            this.fpsMedian /= this.performanceCycleLength;

            let hasBeenResized = false;

            //Adjust pixelDensity based on the fps but not on the first cycle
            if (this.performanceCycleNbr !== 0) {

                let newPixelDensity = this.pixelDensity;
                if(this.fpsMedian > 58){
                    newPixelDensity *= 1.1;
                } else if (this.fpsMedian < 10) {
                    newPixelDensity /= 1.5;
                } else if (this.fpsMedian < 25) {
                    newPixelDensity /= 1.2;
                } else if (this.fpsMedian < 50) {
                    newPixelDensity /= 1.1;
                }
                
                if(newPixelDensity > this.pixelDensity){
                    newPixelDensity = this.pixelDensity;
                }else if (newPixelDensity <= .6){
                    newPixelDensity = .6;
                }

                if (newPixelDensity != this.pixelDensity) {
                    this.pixelDensity = newPixelDensity;
                    //Trigger the resize
                    this.resize();
                    hasBeenResized = true;
                    // console.log(this.fpsMedian, this.pixelDensity);
                    if (window.DEBUG)
                        console.log('%cEngine%c Adapting renderer to ' + newPixelDensity + ' pixelRatio', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
                }

            }

            //Reset vars to start a new cycle
            if (!hasBeenResized)
                this.performanceCycleNbr++;
            this.fpsMedian = 0;
        }
    }

    update(time) {
        if (!this.currentScene || !this.currentScene.mainCamera || !this.isPlaying) return;

        if (window.DEBUG)
            this.stats.begin();

        // Calculate delta
        const now = time,
            delta = now - (this.lastTick || now);

        //Store lastTick
        this.lastTick = time;

        //Store elapsed time
        this.elapsedTime += delta;

        //Check if we need to downgrade the renderer
        if (this.hasAdapativeRenderer)
            this.adaptiveRenderer(time, delta);

        //Check if we're loading something in background
        this.preloadScenesCheck();

        //Update & Render Post processing effects
        if (this.hasPostProd)
            this.postprod.update(time, delta);

        //Update all objects
        this.updateFunctions.forEach(fct => fct(time, delta));

        //Render the scene
        this.renderer.render(this.currentScene.instance, this.currentScene.mainCamera);

        if (window.DEBUG)
            this.stats.end();
        
        this.requestId = requestAnimationFrame(time => this.update(time))
    }
}

export default new Engine();