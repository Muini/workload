import * as THREE from 'three';
import Stats from 'stats.js';
import Looper from '../vendors/looper';
import PostProd from './postprod';
import SoundEngine from './soundEngine';
import * as TWEEN from 'es6-tween';

window.DEBUG = true;

/*
 * object.watch polyfill
 *
 * 2012-04-03
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

// object.watch
if (!Object.prototype.watch) {
    Object.defineProperty(Object.prototype, "watch", {
        enumerable: false,
        configurable: true,
        writable: false,
        value: function(prop, handler) {
            var
                oldval = this[prop],
                newval = oldval,
                getter = function() {
                    return newval;
                },
                setter = function(val) {
                    oldval = newval;
                    return newval = handler.call(this, prop, oldval, val);
                };

            if (delete this[prop]) { // can't watch constants
                Object.defineProperty(this, prop, {
                    get: getter,
                    set: setter,
                    enumerable: true,
                    configurable: true
                });
            }
        }
    });
}

// object.unwatch
if (!Object.prototype.unwatch) {
    Object.defineProperty(Object.prototype, "unwatch", {
        enumerable: false,
        configurable: true,
        writable: false,
        value: function(prop) {
            var val = this[prop];
            delete this[prop]; // remove accessors
            this[prop] = val;
        }
    });
}

class Engine {
    constructor(opt = {}) {

        if (window.DEBUG) {
            this.stats = new Stats();
            this.stats.showPanel(0);
        }

        this.currentScene = undefined;

        // this.fixedRatio = (16 / 9);
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.scenes = {};

        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
        this.renderer.setSize(this.width, this.height);
        this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap
        this.pixelDensity = window.devicePixelRatio;
        this.renderer.setPixelRatio(this.pixelDensity);
        this.renderer.toneMapping = THREE.Uncharted2ToneMapping; //THREE.ACESToneMapping
        this.renderer.toneMappingExposure = Math.pow(0.68, 5.0);
        this.renderer.physicallyCorrectLights = false;
        this.renderer.gammaFactor = 2.2;
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;

        this.startTick = undefined;
        this.lastTick = undefined;
        this.fpsMedian = 0;
        this.tickNbr = 0;
        this.performanceCycleNbr = 0;
        this.performanceCycleLength = 10; //Every 8 frames
        this.maxPerformanceCycle = 6; //3 Cycles

        this.loop = new Looper();
        this.loop.add(this.update.bind(this));
        this.hasStarted = false;
        this.isPlaying = false;

        this.updateFunctions = {};
        this.resizeFunctions = [];

        this.bindEvents();

        this.postprod = new PostProd({
            width: this.width,
            height: this.height,
            pixelDensity: this.pixelDensity,
            camera: this.mainCamera,
            scene: undefined,
            renderer: this.renderer,
            passes: {
                fxaa: { enabled: true },
                bloom: { enabled: true, options: [0.5, 1.0, 0.9] },
                filmic: {
                    enabled: true,
                    noise: 0.05,
                    rgbSplit: 5.0,
                    vignette: 10.0,
                    vignetteOffset: 0.2,
                    lut: .7,
                    lutURL: '/static/img/lut-gamma.png',
                },
                bokehdof: {
                    enabled: true,
                },
                blur: {
                    enabled: true,
                    strength: 0.4,
                    sharpen: 0.15,
                    blurRgbSplit: 1.15,
                    gain: 1.6,
                }
            }
        });

        if (window.DEBUG) {
            window.THREE = THREE;
            window.renderer = this.renderer;
            console.log('%cEngine%c Init - width: ' + this.width + 'px - height: ' + this.height + 'px - pixelRatio: ' + this.pixelDensity + ' - Three.js r' + THREE.REVISION, "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
        }
    }

    uuid() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }

    appendCanvas(container) {
        container.appendChild(this.renderer.domElement);
        if (window.DEBUG)
            container.appendChild(this.stats.dom);
    }

    bindEvents() {
        window.addEventListener('resize', _ => {
            this.performanceCycleNbr = 0;
            this.resize();
        }, false);
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

    addToResize(fct) {
        if (typeof fct !== 'function') return;
        this.resizeFunctions.push(fct);
    }

    addToUpdate(fct, callback) {
        if (typeof fct !== 'function') return;
        let uid = this.uuid();
        this.updateFunctions[uid] = fct;
        callback(uid);
    }

    waitNextTick(fct) {
        requestAnimationFrame(_ => {
            fct();
        });
    }

    wait(fct, timeToWait) {
        setTimeout(_ => {
            this.waitNextTick(fct);
        }, timeToWait);
    }

    removeToUpdate(uid) {
        if (!this.updateFunctions[uid]) return;
        delete this.updateFunctions[uid];
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        for (let i = 0; i < this.resizeFunctions.length; i++) {
            this.resizeFunctions[i]();
        }

        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(this.pixelDensity);

        this.postprod.resize(this.width, this.height, this.pixelDensity);

        if (!this.isPlaying && this.hasStarted) {
            this.play();
            this.waitNextTick(_ => {
                this.pause();
            });
        }
    }

    registerScene(scene) {
        scene.setup();
        this.scenes[scene.name] = scene;
    }

    setScene(sceneName, callback) {
        if (this.scenes[sceneName] === undefined) return;
        this.currentScene = this.scenes[sceneName];
        this.postprod.updateScene(this.currentScene.instance, this.currentScene.mainCamera);
        if (window.DEBUG)
            window.scene = this.currentScene.instance;
        this.currentScene.load(callback);
    }

    start() {
        if (this.currentScene == undefined) throw 'No scene has been loaded or specified, please use Engine.setScene(...) function';
        if (this.currentScene.mainCamera == undefined) throw 'No camera has been added or specified, please use scene.setCamera(...) function';
        if (window.DEBUG)
            console.log('%cEngine%c ⏺️ Start', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
        this.currentScene.onStart();
        this.hasStarted = true;
        this.play();
    }

    play() {
        if (!this.hasStarted || this.isPlaying) return;
        this.loop.start();
        this.isPlaying = true;
        if (window.DEBUG)
            console.log('%cEngine%c ▶️ Play', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
    }

    pause() {
        if (!this.hasStarted || !this.isPlaying) return;
        this.loop.stop();
        this.isPlaying = false;
        if (window.DEBUG)
            console.log('%cEngine%c ⏸️ Pause', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
    }

    stop() {
        if (window.DEBUG)
            console.log('%cEngine%c ⏹️ Stop', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
        this.pause();
        this.hasStarted = false;
    }

    adaptiveRenderer(time, delta) {
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

            //Adjust pixelDensity based on the fps but not on the first cycle
            if (this.performanceCycleNbr !== 0) {
                let newPixelDensity = this.pixelDensity;
                if (this.fpsMedian < 10) {
                    newPixelDensity /= 2.;
                } else if (this.fpsMedian < 25) {
                    newPixelDensity /= 1.5;
                } else if (this.fpsMedian < 50) {
                    newPixelDensity /= 1.25;
                }
                if (newPixelDensity <= .5)
                    newPixelDensity = .5;

                if (newPixelDensity != this.pixelDensity) {
                    this.pixelDensity = newPixelDensity;
                    //Trigger the resize
                    this.resize();
                    // console.log(this.fpsMedian, this.pixelDensity);
                    if (window.DEBUG)
                        console.log('%cEngine%c Adapting renderer to ' + newPixelDensity + ' pixelRatio', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
                }
            }

            //Reset vars to start a new cycle
            this.performanceCycleNbr++;
            this.fpsMedian = 0;
        }
    }

    update(time, delta) {
        if (window.DEBUG)
            this.stats.begin();

        //Check if we need to downgrade the renderer
        this.adaptiveRenderer(time, delta);

        //Render the scene
        //this.renderer.clear();
        // if (this.currentScene && this.currentScene.mainCamera)
        this.renderer.render(this.currentScene.instance, this.currentScene.mainCamera);

        //Update & Render Post processing effects
        this.postprod.update(time, delta);

        TWEEN.update(time);

        //Update all objects
        for (let key in this.updateFunctions) {
            this.updateFunctions[key](time, delta);
        }

        //Store lastTick
        this.lastTick = time;

        if (window.DEBUG)
            this.stats.end();
    }
}

// const Engine = new FourEngine()
export default new Engine();