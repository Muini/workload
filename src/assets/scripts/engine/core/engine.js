import * as THREE from 'three';
import { Interaction } from 'three.interaction';
import Log from '../utils/log';
import * as dat from 'dat.gui';
import Quality from './quality';
import RendererStats from 'three-webgl-stats';
import PostProd from './postprod';
import SceneManager from './sceneManager';
import SoundManager from './soundManager';

import UUID from '../utils/uuid';

class Engine {
    constructor() {

        // TODO: event based engine to avoid import in every files. With naming convention for event

        if (Log.debug) {
            this.rendererStats = new RendererStats();
        }

        this._fixedRatio = (16 / 9);
        this.hasFixedRatio = false;
        this.width = window.innerWidth;
        if (this.hasFixedRatio)
            this.height = this.width / this._fixedRatio;
        else
            this.height = window.innerHeight;

        this.container = undefined;
        this.containerBoundingBox = undefined;
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: 'high-performance',
            alpha: false
        });
        // this.renderer = new THREE.WebGLDeferredRenderer();
        this.renderer.setSize(this.width, this.height);
        this.renderer.autoClear = false;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = Math.pow(0.68, 5.0);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.gammaFactor = 2.2;
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;

        this.interaction = undefined;

        this.timeScale = 1.0;
        this.lastTick = 0;
        this.elapsedTime = 0;

        this.hasAdapativeRenderer = false;
        this.pixelDensity = 1.0;
        this.pixelDensityDefault = 1.0;
        this._fpsMedian = 0;
        this._tickNbr = 0;
        this._adaptiveRendererDelay = 0;
        this._lastAdaptiveRendererTime = 0;
        this._performanceCycleNbr = 0;
        this._maxPerformanceCycle = 5; //3 Cycles
        this._performanceCycleLength = 30; //Every 8 frames

        this.hasBackgroundPreload = false;

        this._requestId = undefined;
        this.hasStarted = false;
        this.isPlaying = false;

        this._updateFunctions = new Map();
        this._resizeFunctions = new Map();

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
                // return THREE.BasicShadowMap;
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
                    width: this.width / 1.5,
                    height: this.height / 1.5,
                    pixelDensity: this.pixelDensity,
                    camera: this.mainCamera,
                    scene: undefined,
                    renderer: this.renderer,
                    passes: {
                        fxaa: {
                            enabled: Quality.score > 200 ? true : false
                        },
                        bloom: {
                            enabled: Quality.score >= 1000 ? true : false,
                            options: [0.5, 1.5, 0.8]
                        },
                        filmic: {
                            enabled: true,
                            // noise: 0.05, 
                            noise: 0.1, 
                            useStaticNoise: true,
                            rgbSplit: 6.0, //30
                            // vignette: Quality.score >= 1000 ? 20.0 : 0.0,
                            vignette: 30.0,
                            // vignetteOffset: 0.15,
                            vignetteOffset: 0.09,
                            brightness: 0.1,
                            // contrast: 1.3,
                            contrast: 1.3,
                            gamma: 2.2,
                            // gamma: 2.2,
                            vibrance: 0.3,
                            // vibrance: 0.0,
                            lut: 0.00,
                            lutURL: '/static/img/lut-gamma.png',
                        },
                        // bokehdof: { enabled: Quality.score >= 1500 ? true : false, },
                        bokehdof: { enabled: false, },
                        blur: {
                            enabled: false,
                            strength: 10.0,
                            // sharpen: Quality.isMobile ? 0.05 : 0.2,
                            sharpen: Quality.isMobile ? 0.3 : 0.5,
                            blurRgbSplit: 1.5,
                            gain: 1.3,
                        }
                    }
                });
            }

            this.container = container;
            await this.container.appendChild(this.renderer.domElement);
            if (Log.debug){
                this.rendererStats.domElement.style.position = 'absolute'
                this.rendererStats.domElement.style.left = '0px'
                this.rendererStats.domElement.style.bottom = '0px'
                document.body.appendChild(this.rendererStats.domElement)
            }

            if(fixedRatio !== undefined){
                this.setFixedRatio(fixedRatio);
            }

            await SceneManager.initScenes();

            this.containerBoundingBox = this.container.getBoundingClientRect();

            Log.push(
                'success',
                this,
                `Init\nSize: c:lightgreen{${this.width | 0}x${this.height | 0}px}\nQuality score: c:salmon{${Quality.score}}\nPixelDensity: c:orange{${this.pixelDensity}}\nThree.js: c:lightgreen{r${THREE.REVISION}}\nGPU: c:orange{${Quality.gpu}}\n`
            );
        })();
    }

    setFixedRatio(ratio) {
        this._fixedRatio = ratio;
        this.hasFixedRatio = true;
        this.resize();
    }

    bindEvents() {
        window.addEventListener('resize', _ => {
            this._adaptiveRendererDelay = 100;
            this._performanceCycleNbr = 0;
            this.resize();
        }, false);
        if (Log.debug) return;
        let isActive = true
        document.addEventListener('visibilitychange', _ => {
            if (document.visibilityState == 'visible') {
                if (!isActive) {
                    isActive = true
                    this.play();
                    SoundManager.resume();
                }
            } else {
                if (isActive) {
                    isActive = false
                    this.pause();
                    SoundManager.pause();
                }
            }
        })
        window.addEventListener('focus', _ => {
            if (!isActive) {
                isActive = true
                this.play();
                SoundManager.resume();
            }
        }, false)
        window.addEventListener('blur', _ => {
            if (isActive) {
                isActive = false
                this.pause();
                SoundManager.pause();
            }
        }, false)
    }

    addToResize(uuid, fct) {
        if (typeof fct !== 'function' || uuid === undefined) return;
        this._resizeFunctions.set(uuid, fct);
    }
    removeFromResize(uuid) {
        this._resizeFunctions.delete(uuid)
    }

    addToUpdate(uuid, fct) {
        if (typeof fct !== 'function' || uuid === undefined) return;
        this._updateFunctions.set(uuid, fct);
    }
    removeFromUpdate(uuid) {
        this._updateFunctions.delete(uuid)
    }

    waitNextTick() {
        return new Promise((resolve, reject) => {
            this.wait(0).then(_ => {
                resolve();
            });
        });
    }

    wait(timeToWait) {
        return new Promise((resolve, reject) => {
            const uuid = UUID();
            const startTime = this.elapsedTime;
            this.addToUpdate(uuid, _ => {
                const elapsed = this.elapsedTime - startTime;
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
            this.height = this.width / this._fixedRatio;
            if (window.innerHeight < this.height) {
                this.height = window.innerHeight;
                this.width = this.height * this._fixedRatio;
            }
        } else {
            this.height = window.innerHeight;
        }

        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(this.pixelDensity);

        this.container.style['width'] = `${this.width}px`;
        this.container.style['height'] = `${this.height}px`;
        this.containerBoundingBox = this.container.getBoundingClientRect();

        this._resizeFunctions.forEach(fct => {
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
        return (async _ => {
            // Set the scene when the engine is starting
            await SceneManager.set(SceneManager.scenesOrder[SceneManager.sceneCurrentIndex]).then(async _ => {
                if (SceneManager.currentScene == undefined) return Log.push(
                    'error',
                    this,
                    'No scene has been loaded or specified, please use SceneManager.setOrder(...) function'
                );

                Log.push('info', this, '⏺️ Start');

                await SceneManager.currentScene.start();

                // if (SceneManager.currentScene.mainCamera == undefined) return Log.push('error', this, 'No camera has been added or specified, please use scene.setCamera(...) function');

                this.hasStarted = true;

                this.play();
            });
        })();
    }

    play() {
        if (!this.hasStarted || this.isPlaying) return;
        this.update = this.update.bind(this);
        this.lastTick = 0;
        this._requestId = window.requestAnimationFrame(time => this.update(time));
        this.isPlaying = true;
        // Log.push('info', this, '▶️ Play');
    }

    pause() {
        if (!this.hasStarted || !this.isPlaying) return;
        window.cancelAnimationFrame(this._requestId);
        this._requestId = undefined;
        this.isPlaying = false;
        // Log.push('info', this, '⏸️ Pause');
    }

    stop() {
        Log.push('info', this, '⏹️ Stop');
        this.pause();
        this.elapsedTime = 0;
        this.hasStarted = false;
    }

    adaptiveRenderer(time, delta) {
        if (!this.hasAdapativeRenderer) return;

        if (delta == 0 ||
            // this._performanceCycleNbr >= this._maxPerformanceCycle || 
            (time - this._lastAdaptiveRendererTime < this._adaptiveRendererDelay)
        ) return;

        this._tickNbr++;

        //Check current FPS
        this._fpsMedian += (1000 / delta);

        //Check median FPS by cycle
        if (this._tickNbr % this._performanceCycleLength === 0) {
            //Get the mediam FPS of the cycle
            this._fpsMedian /= this._performanceCycleLength;
            
            let hasBeenResized = false;
            
            //Adjust pixelDensity based on the fps but not on the first cycle
            if (this._performanceCycleNbr !== 0) {

                let newPixelDensity = this.pixelDensity;
                if (this._fpsMedian > 60) {
                    newPixelDensity *= 1.05;
                } else if (this._fpsMedian < 10) {
                    newPixelDensity /= 1.5;
                } else if (this._fpsMedian < 25) {
                    newPixelDensity /= 1.2;
                } else if (this._fpsMedian < 50) {
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
                    this._adaptiveRendererDelay = 1000;
                    this._lastAdaptiveRendererTime = time;
                    Log.push('info', this, `Adapting renderer to c:salmon{${newPixelDensity}} pixelRatio because ${this._fpsMedian}fps`);
                }

            }

            //Reset vars to start a new cycle
            if (!hasBeenResized)
                this._performanceCycleNbr++;

            this._fpsMedian = 0;
        }
    }

    update(time) {
        if (!SceneManager.currentScene || !SceneManager.currentScene.mainCamera || !this.isPlaying) return;

        if(!this.interaction){
            this.interaction = new Interaction(this.renderer, SceneManager.currentScene.instance, SceneManager.currentScene.mainCamera);
        }
        
        this._requestId = window.requestAnimationFrame(time => this.update(time))

        // Calculate delta
        const delta = time - (this.lastTick || time);

        //Check if we need to downgrade the renderer
        if (this.hasAdapativeRenderer)
            this.adaptiveRenderer(time, delta);

        // Scale the time
        const deltaScaled = delta * this.timeScale;

        //Check if we're loading something in background
        if (this.hasBackgroundPreload)
            SceneManager.preloadScenesCheck();

        //Update & Render Post processing effects
        if (this.hasPostProd)
            this.postprod.update(this.elapsedTime, deltaScaled);

        //Update all entities
        // TODO: replace forEach by a more performant loop function
        this._updateFunctions.forEach(fct => {
            try {
                fct(this.elapsedTime, deltaScaled);
            } catch (error) {
                Log.push('error', this, `${error}`)
                this.pause();
            }
        });

        //Render the scene
        this.renderer.render(SceneManager.currentScene.instance, SceneManager.currentScene.mainCamera);

        //Store elapsed time
        this.elapsedTime += deltaScaled;

        //Store lastTick
        this.lastTick = time;

        if (Log.debug){
            this.rendererStats.update(this.renderer);
        }

    }
}

export default new Engine();