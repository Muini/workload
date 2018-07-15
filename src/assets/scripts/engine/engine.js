import * as THREE from 'three';
// import '../vendors/WebGLDeferredRenderer';
import Log from './utils/log';
import Stats from 'stats.js';
import PostProd from './postprod';
import SceneManager from './sceneManager';
import SoundEngine from './soundEngine'; 

import { Thread } from '@thmsdmcrt_/concurrence';

import './utils/watch-polyfill';
import UUID from './utils/uuid';

class Engine {
    constructor(opt = {}) {

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

        this.isMobile = (function(){
            let check = false;
            (function (a) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
            })(navigator.userAgent || navigator.vendor || window.opera);
            return check;
        })();
        
        this.quality = this.isMobile ? 2 : 3;
        /*
        const thread = Thread(_ => {
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
            const iterations = 100000;
            for (let i = 1; i < iterations; i++) {
                factorial(100);
            }
            return;
        }, null, false);

        (async() => {
            let startTime = performance.now();
            await thread.run();
            let durationTime = performance.now() - startTime;
            if (Log.debug) {
                console.log('Performance Test: ' + durationTime + ' ms');
            }
            if (durationTime > 22)
                this.quality--;
        })();
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
        this.adaptiveRendererDelay = 0;
        this.lastAdaptiveRendererTime = 0;
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

        Log.push(
            'success', 
            this.constructor.name, 
            'Init - width: ' + this.width + 'px - height: ' + this.height + 'px - Quality: ' + this.quality + ' - pixelRatio: ' + this.pixelDensity + ' - Three.js r' + THREE.REVISION
        );

        if (Log.debug) {
            window.THREE = THREE;
            window.renderer = this.renderer;
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
                    // bloom: { enabled: false, options: [0.5, 1.0, 0.9] },
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
                    // bokehdof: { enabled: this.quality < 3 ? false : true, },
                    bokehdof: { enabled: false, },
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
        if (Log.debug)
            this.container.appendChild(this.stats.dom);

        this.waitNextTick().then(_ => {
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
        return new Promise(async (resolve, reject) => {
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
                if(elapsed >= timeToWait){
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

        this.container.style['width'] = this.width + 'px';
        this.container.style['height'] = this.height + 'px';
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

                if (SceneManager.currentScene.mainCamera == undefined) return Log.push('error', this.constructor.name, 'No camera has been added or specified, please use scene.setCamera(...) function');

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

        if (this.lastTick == null || 
            // this.performanceCycleNbr >= this.maxPerformanceCycle || 
            (time - this.lastAdaptiveRendererTime < this.adaptiveRendererDelay)
        ) return;

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
                    this.adaptiveRendererDelay = 500;
                    this.lastAdaptiveRendererTime = time;
                    Log.push('info', this.constructor.name, `Adapting renderer to ${newPixelDensity} pixelRatio`);
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
        SceneManager.preloadScenesCheck();

        //Update & Render Post processing effects
        if (this.hasPostProd)
            this.postprod.update(time, delta);

        //Update all objects
        this.updateFunctions.forEach(fct => {
            try{
                fct(time, delta);
            }catch(error){
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