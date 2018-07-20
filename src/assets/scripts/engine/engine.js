import * as THREE from 'three';
// import '../vendors/WebGLDeferredRenderer';
import Log from './utils/log';
import * as dat from 'dat.gui';
import Quality from './quality';
import Stats from 'stats.js';
import PostProd from './postprod';
import SceneManager from './sceneManager';
import SoundEngine from './soundEngine';

import './utils/watch-polyfill';
import UUID from './utils/uuid';

class Engine {
    constructor() {

        if (Log.debug) {
            this.stats = new Stats();
            this.stats.showPanel(0);
        }

        this.fixedRatio = (16 / 9);
        this.hasFixedRatio = false;
        this.width = window.innerWidth;
        if (this.hasFixedRatio)
            this.height = this.width / this.fixedRatio;
        else
            this.height = window.innerHeight;

        this.container = undefined;
        this.containerBoundingBox = undefined;
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: false
        });
        // this.renderer = new THREE.WebGLDeferredRenderer();
        this.renderer.setSize(this.width, this.height);
        this.renderer.autoClear = false;
        this.renderer.toneMapping = THREE.Uncharted2ToneMapping;
        // this.renderer.toneMapping = THREE.CineonToneMapping; //THREE.ACESToneMapping
        this.renderer.toneMappingExposure = Math.pow(0.68, 4.5);
        this.renderer.physicallyCorrectLights = false;
        this.renderer.gammaFactor = 2.2;
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;

        this.lastTick = 0;
        this.elapsedTime = 0;

        this.hasAdapativeRenderer = true;
        this.pixelDensity = 1.0;
        this.pixelDensityDefault = 1.0;
        this.fpsMedian = 0;
        this.tickNbr = 0;
        this.adaptiveRendererDelay = 0;
        this.lastAdaptiveRendererTime = 0;
        this.performanceCycleNbr = 0;
        this.maxPerformanceCycle = 5; //3 Cycles
        this.performanceCycleLength = 30; //Every 8 frames

        this.hasBackgroundPreload = true;

        this.requestId = undefined;
        this.hasStarted = false;
        this.isPlaying = false;

        this.updateFunctions = new Map();
        this.resizeFunctions = new Map();

        this.bindEvents();

        this.hasPostProd = true;
        this.postprod = undefined;

        if (Log.debug) {
            window.THREE = THREE;
            window.renderer = this.renderer;
            window.gui = new dat.GUI({name: 'Engine Options'});
        }
    }

    init(container = document.body, fixedRatio = undefined) {
        return (async() => {

            Quality.init();

            // Shadow settings
            this.renderer.shadowMap.enabled = Quality.settings.shadows.enabled;
            this.renderer.shadowMap.type = (_ => {
                switch (Quality.settings.shadows.quality) {
                    case 0:
                    default:
                        return THREE.BasicShadowMap;
                        break;

                    case 1:
                        return THREE.PCFShadowMap;
                        break;

                    case 2:
                        return THREE.PCFSoftShadowMap;
                        break;
                }
            })(); 

            // Pixel density settings
            this.pixelDensity = Quality.settings.global.pixelDensity;
            this.pixelDensityDefault = this.pixelDensity;
            this.renderer.setPixelRatio(this.pixelDensity);


            if (this.hasPostProd) {
                this.postprod = await new PostProd({
                    width: this.width,
                    height: this.height,
                    pixelDensity: this.pixelDensity,
                    camera: this.mainCamera,
                    scene: undefined,
                    renderer: this.renderer,
                    passes: {
                        fxaa: {
                            enabled: Quality.score > 200 ? true : false
                        },
                        bloom: {
                            enabled: Quality.score >= 500 ? true : false,
                            options: [0.7, 1.0, 0.95]
                        },
                        // bloom: { enabled: false, options: [0.5, 1.0, 0.9] },
                        filmic: {
                            enabled: true,
                            noise: 0.1,
                            useStaticNoise: true,
                            rgbSplit: Quality.score > 200 ? 5.0 : 0.0,
                            vignette: 20.0,
                            vignetteOffset: 0.15,
                            lut: 0.90,
                            lutURL: '/static/img/lut-gamma.png',
                        },
                        bokehdof: { enabled: Quality.score >= 500 ? true : false, },
                        // bokehdof: { enabled: false, },
                        blur: {
                            enabled: true,
                            strength: 4.0,
                            sharpen: Quality.isMobile ? 0.05 : 0.2,
                            blurRgbSplit: 1.25,
                            gain: 1.1,
                        }
                    }
                });
            }

            this.container = container;
            await this.container.appendChild(this.renderer.domElement);
            if (Log.debug)
                this.container.appendChild(this.stats.dom);

            if(fixedRatio !== undefined){
                this.setFixedRatio(fixedRatio);
            }

            await SceneManager.initScenes();

            this.waitNextTick().then(_ => {
                this.containerBoundingBox = this.container.getBoundingClientRect();
            });

            Log.push(
                'success',
                this.constructor.name,
                `Init\nSize: c:lightgreen{${this.width}x${this.height}px}\nQuality score: c:salmon{${Quality.score}}\nPixelDensity: c:orange{${this.pixelDensity}}\nThree.js: c:lightgreen{r${THREE.REVISION}}\nGPU: c:orange{${Quality.gpu}}\n`
            );
        })();
    }

    setFixedRatio(ratio) {
        this.fixedRatio = ratio;
        this.hasFixedRatio = true;
        this.resize();
    }

    bindEvents() {
        window.addEventListener('resize', _ => {
            this.adaptiveRendererDelay = 100;
            this.performanceCycleNbr = 0;
            this.resize();
        }, false);
        // if (Log.debug) return;
        let isActive = true
        document.addEventListener('visibilitychange', _ => {
            if (document.visibilityState == 'visible') {
                if (!isActive) {
                    isActive = true
                    this.play();
                    SoundEngine.resume();
                }
            } else {
                if (isActive) {
                    isActive = false
                    this.pause();
                    SoundEngine.pause();
                }
            }
        })
        window.addEventListener('focus', _ => {
            if (!isActive) {
                isActive = true
                this.play();
                SoundEngine.resume();
            }
        }, false)
        window.addEventListener('blur', _ => {
            if (isActive) {
                isActive = false
                this.pause();
                SoundEngine.pause();
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

    waitNextTick() {
        return new Promise(async(resolve, reject) => {
            await this.wait(0);
            resolve();
        });
    }

    wait(timeToWait) {
        return new Promise((resolve, reject) => {
            const uuid = UUID();
            const startTime = this.lastTick;
            this.addToUpdate(uuid, _ => {
                const elapsed = this.lastTick - startTime;
                if (elapsed >= timeToWait) {
                    this.removeFromUpdate(uuid);
                    resolve();
                }
            });
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

        this.container.style['width'] = `${this.width}px`;
        this.container.style['height'] = `${this.height}px`;
        this.containerBoundingBox = this.container.getBoundingClientRect();

        this.resizeFunctions.forEach(fct => {
            fct();
        });

        if (this.hasPostProd)
            this.postprod.resize(this.width, this.height, this.pixelDensity);

        /*if (!this.isPlaying && this.hasStarted) {
            this.pause();
            this.waitNextTick(_ => {
                this.play();
            });
        }*/
    }

    start() {
        return (async() => {
            // Set the scene when the engine is starting
            await SceneManager.set(SceneManager.scenesOrder[SceneManager.sceneCurrentIndex]).then(async _ => {
                if (SceneManager.currentScene == undefined) return Log.push(
                    'error',
                    this.constructor.name,
                    'No scene has been loaded or specified, please use SceneManager.setOrder(...) function'
                );

                Log.push('info', this.constructor.name, '⏺️ Start');

                await SceneManager.currentScene.start();

                // if (SceneManager.currentScene.mainCamera == undefined) return Log.push('error', this.constructor.name, 'No camera has been added or specified, please use scene.setCamera(...) function');

                this.hasStarted = true;

                this.play();
            });
        })();
    }

    play() {
        if (!this.hasStarted || this.isPlaying) return;
        this.update = this.update.bind(this);
        this.lastTick = 0;
        this.requestId = window.requestAnimationFrame(time => this.update(time));
        this.isPlaying = true;
        // Log.push('info', this.constructor.name, '▶️ Play');
    }

    pause() {
        if (!this.hasStarted || !this.isPlaying) return;
        window.cancelAnimationFrame(this.requestId);
        this.requestId = undefined;
        this.isPlaying = false;
        // Log.push('info', this.constructor.name, '⏸️ Pause');
    }

    stop() {
        Log.push('info', this.constructor.name, '⏹️ Stop');
        this.pause();
        this.elapsedTime = 0;
        this.hasStarted = false;
    }

    adaptiveRenderer(time, delta) {
        if (!this.hasAdapativeRenderer) return;

        if (delta == 0 ||
            // this.performanceCycleNbr >= this.maxPerformanceCycle || 
            (time - this.lastAdaptiveRendererTime < this.adaptiveRendererDelay)
        ) return;

        this.tickNbr++;

        //Check current FPS
        this.fpsMedian += (1000 / delta);

        //Check median FPS by cycle
        if (this.tickNbr % this.performanceCycleLength === 0) {
            //Get the mediam FPS of the cycle
            this.fpsMedian /= this.performanceCycleLength;
            
            let hasBeenResized = false;
            
            //Adjust pixelDensity based on the fps but not on the first cycle
            if (this.performanceCycleNbr !== 0) {

                let newPixelDensity = this.pixelDensity;
                if (this.fpsMedian > 60) {
                    newPixelDensity *= 1.05;
                } else if (this.fpsMedian < 10) {
                    newPixelDensity /= 1.5;
                } else if (this.fpsMedian < 25) {
                    newPixelDensity /= 1.2;
                } else if (this.fpsMedian < 50) {
                    newPixelDensity /= 1.1;
                }

                if (newPixelDensity > this.pixelDensityDefault) {
                    newPixelDensity = this.pixelDensity;
                } else if (newPixelDensity <= .6) {
                    newPixelDensity = .6;
                }

                if (newPixelDensity != this.pixelDensity) {
                    this.pixelDensity = newPixelDensity;
                    //Trigger the resize
                    this.resize();
                    hasBeenResized = true;
                    this.adaptiveRendererDelay = 1000;
                    this.lastAdaptiveRendererTime = time;
                    Log.push('info', this.constructor.name, `Adapting renderer to c:salmon{${newPixelDensity}} pixelRatio because ${this.fpsMedian}fps`);
                }

            }

            //Reset vars to start a new cycle
            if (!hasBeenResized)
                this.performanceCycleNbr++;

            this.fpsMedian = 0;
        }
    }

    update(time) {
        if (!SceneManager.currentScene || !SceneManager.currentScene.mainCamera || !this.isPlaying) return;
        
        this.requestId = window.requestAnimationFrame(time => this.update(time))

        if (Log.debug)
            this.stats.begin();

        // Calculate delta
        const now = time,
            delta = now - (this.lastTick || now);

        //Check if we need to downgrade the renderer
        if (this.hasAdapativeRenderer)
            this.adaptiveRenderer(time, delta);

        //Check if we're loading something in background
        if (this.hasBackgroundPreload)
            SceneManager.preloadScenesCheck();

        //Update & Render Post processing effects
        if (this.hasPostProd)
            this.postprod.update(time, delta);

        //Update all objects
        this.updateFunctions.forEach(fct => {
            try {
                fct(time, delta);
            } catch (error) {
                Log.push('error', this.constructor.name, `${error}`)
                this.pause();
            }
        });

        //Render the scene
        this.renderer.render(SceneManager.currentScene.instance, SceneManager.currentScene.mainCamera);

        //Store elapsed time
        this.elapsedTime += delta;

        //Store lastTick
        this.lastTick = time;

        if (Log.debug)
            this.stats.end();

    }
}

export default new Engine();