import * as THREE from 'three';
import Stats from 'stats.js';
import Looper from '../vendors/looper';
import PostProd from './postprod';

const DEBUG = true;

class Engine {
    constructor(opt = {}) {
        // if (window.Engine != undefined) throw 'Engine is already defined, please use it as a singleton';

        if (DEBUG) {
            this.stats = new Stats();
            this.stats.showPanel(0);
        }

        this.currentScene = undefined;

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
        this.renderer.setSize(this.width, this.height);
        this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap; //THREE.BasicShadowMap
        this.pixelDensity = window.devicePixelRatio;
        this.renderer.setPixelRatio(this.pixelDensity);

        this.startTick = undefined;
        this.lastTick = undefined;
        this.fpsMedian = 0;
        this.tickNbr = 0;
        this.performanceCycleNbr = 0;
        this.performanceCycleLength = 8; //Every 8 frames
        this.maxPerformanceCycle = 3; //3 Cycles

        this.loop = new Looper();
        this.loop.add(this.update.bind(this));

        this.updateFunctions = [];
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
                film: { enabled: false },
                vignette: { enabled: false, options: [.6, 1.4] },
                zoomBlur: { enabled: false, options: { center: 0.5, intensity: 0. } },
                chromatic: { enabled: false, options: { intensity: 5.0 } },
                bloom: { enabled: true, options: [0.25, -1.0, 0.9] },
                sharpen: { enabled: true },
            }
        });

        if (DEBUG) {
            window.THREE = THREE;
            window.renderer = this.renderer;
            console.log('%cEngine%c Init : width ' + this.width + 'px, height ' + this.height + 'px, pixelRatio ' + this.pixelDensity, "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
        }

        // window.Engine = this;
    }

    appendCanvas(container) {
        container.appendChild(this.renderer.domElement);
        if (DEBUG)
            container.appendChild(this.stats.dom);
    }

    bindEvents() {
        window.addEventListener('resize', _ => {
            this.performanceCycleNbr = 0;
            this.resize();
        }, false);
    }

    addToResize(fct) {
        if (typeof fct !== 'function') return;
        this.resizeFunctions.push(fct);
    }

    addToUpdate(fct) {
        if (typeof fct !== 'function') return;
        this.updateFunctions.push(fct);
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
    }

    setScene(scene, callback) {
        this.currentScene = scene
        this.postprod.updateScene(this.currentScene.instance, this.currentScene.mainCamera);
        if (DEBUG)
            window.scene = this.currentScene.instance;
        this.currentScene.load(callback);
    }

    start() {
        if (this.currentScene == undefined) throw 'No scene has been loaded or specified, please use Engine.setScene(...) function';
        if (this.currentScene.mainCamera == undefined) throw 'No camera has been added or specified, please use scene.setCamera(...) function';
        if (DEBUG)
            console.log('%cEngine%c Start', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
        this.loop.start();
    }

    stop() {
        if (DEBUG)
            console.log('%cEngine%c Stop', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
        this.loop.stop();
    }

    adaptiveRenderer(time) {
        if (this.lastTick == null) return;
        if (this.performanceCycleNbr >= this.performanceCycleLength) return;

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
                    if (DEBUG)
                        console.log('%cEngine%c Adapting renderer to ' + newPixelDensity + ' pixelRatio', "color:white;background:DodgerBlue;padding:2px 4px;", "color:black");
                }
            }

            //Reset vars to start a new cycle
            this.performanceCycleNbr++;
            this.fpsMedian = 0;
        }
    }

    update(time) {
        if (DEBUG)
            this.stats.begin();

        //Check if we need to downgrade the renderer
        this.adaptiveRenderer(time);

        //Render the scene
        //this.renderer.clear();
        // if (this.currentScene && this.currentScene.mainCamera)
        this.renderer.render(this.currentScene.instance, this.currentScene.mainCamera);

        //Update & Render Post processing effects
        this.postprod.update(time);

        //Update all objects
        for (let i = 0; i < this.updateFunctions.length; i++) {
            this.updateFunctions[i]();
        }

        //Store lastTick
        this.lastTick = time;

        if (DEBUG)
            this.stats.end();
    }
}

// const Engine = new FourEngine()
export default new Engine();