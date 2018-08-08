import * as THREE from 'three';

import Engine from './engine';
import Quality from './quality';
import Log from '../utils/log';

import '../../../shaders/postprocess/EffectComposer';
// import { ShaderPass } from 'three/examples/js/postprocessing/ShaderPass';
import '../../../shaders/postprocess/ShaderPass';
import '../../../shaders/postprocess/RenderPass';

import '../../../shaders/postprocess/CopyShader';
import '../../../shaders/postprocess/LuminosityHighPass/LuminosityHighPassShader';
import '../../../shaders/postprocess/FXAA/FXAAShader';
import '../../../shaders/postprocess/Bloom/BloomShader';
import '../../../shaders/postprocess/Filmic/FilmicShader';
import '../../../shaders/postprocess/BokehDOF/BokehShader';
import '../../../shaders/postprocess/BlurSharpen/BlurSharpenShader';

export default class PostProd {
    constructor(opt = {
        width,
        height,
        pixelDensity,
        camera,
        scene,
        renderer,
        passes,
    }) {
        this.width = opt.width;
        this.height = opt.height;
        this.pixelDensity = opt.pixelDensity;
        this.camera = opt.camera;
        this.scene = opt.scene;
        this.renderer = opt.renderer;
        this.passes = opt.passes || {
            fxaa: { enabled: false },
            bloom: { enabled: false, options: [1.0, 3.0, 0.85] },
            filmic: {
                enabled: false,
                noise: 0.05,
                useStaticNoise: true,
                rgbSplit: 1.0,
                vignette: 1.0,
                vignetteOffset: 1.0,
                brightness: 0.0,
                contrast: 1.0,
                gamma: 1.0,
                vibrance: 0.0,
                lut: 1.0,
                lutURL: '/static/img/lut.png',
            },
            bokehdof: {
                enabled: false,
            },
            blur: {
                enabled: false,
                strength: 0.5,
                sharpen: 0.1,
                blurRgbSplit: 1.5,
                gain: 1.05,
            }
        }

        if (Log.debug) {
            this.gui = window.gui.addFolder('Post Process');
            this.guiChanger = (value, shader, uniform) => {
                // console.log('change', value, item, subitem)
                try{
                    shader[uniform].value = value;
                }catch(e){
                    console.log(e)
                }
            }
        }

        let noiseTexture = new THREE.TextureLoader().load('/static/img/noise.png');
        noiseTexture.minFilter = THREE.NearestFilter;
        noiseTexture.magFilter = THREE.NearestFilter;

        this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height);
        this.renderTarget.texture.format = THREE.RGBAFormat;
        this.renderTarget.texture.minFilter = THREE.LinearFilter;
        this.renderTarget.texture.magFilter = THREE.LinearFilter;

        this.composer = new THREE.EffectComposer(this.renderer, this.renderTarget);

        if (!this.renderer.extensions.get('WEBGL_depth_texture')) {
            Log.push('warn', this.constructor.name, `WEBGL_depth_texture not supported`);
            this.passes.bokehdof.enabled = false;
        }
        // Bokeh DOF
        if (this.passes.bokehdof.enabled) {
            this.depthRenderTarget = this.renderTarget.clone();
            this.depthRenderTarget.texture.minFilter = THREE.NearestFilter;
            this.depthRenderTarget.texture.magFilter = THREE.NearestFilter;
            this.depthRenderTarget.texture.generateMipmaps = false;
            this.depthRenderTarget.depthBuffer = true;
            this.depthRenderTarget.depthTexture = new THREE.DepthTexture();
            this.depthRenderTarget.depthTexture.type = THREE.UnsignedShortType;
            this.depthComposer = new THREE.EffectComposer(this.renderer, this.depthRenderTarget);
            // this.depthComposer.reset();
            THREE.BokehShader.defines.ITERATIONS = Quality.settings.postprocess.bokeh.samples;
            this.bokeh = new THREE.ShaderPass(THREE.BokehShader)
            this.bokeh.name = "Bokeh DOF";
            this.bokeh.uniforms['near'].value = this.camera ? this.camera.near : 1.0;
            this.bokeh.uniforms['far'].value = this.camera ? this.camera.far : 1000.0;
            this.bokeh.uniforms['focalLength'].value = this.camera ? this.camera.getFocalLength() : 50.0;
            this.bokeh.uniforms['focus'].value = this.camera ? this.camera.focus : 100.0;
            this.bokeh.uniforms['aperture'].value = this.camera ? this.camera.aperture : 2.8;
            this.bokeh.uniforms['maxblur'].value = 1.25;
            this.bokeh.uniforms['threshold'].value = 0.1;
            this.bokeh.uniforms['tDepth'].value = this.depthRenderTarget.depthTexture;

            
            this.bokeh.uniforms['noiseTexture'].value = noiseTexture;
        }

        //FXAA
        if (this.passes.fxaa.enabled) {
            this.fxaa = new THREE.ShaderPass(THREE.FXAAShader);
            this.fxaa.name = "FXAA";
            this.fxaa.uniforms['resolution'].value = new THREE.Vector2(1 / this.width, 1 / this.height);
        }

        // TODO: Implement TAA

        //Bloom
        if (this.passes.bloom.enabled) {
            this.bloom = new THREE.UnrealBloomPass(new THREE.Vector2(this.width, this.height), this.passes.bloom.options[0], this.passes.bloom.options[1], this.passes.bloom.options[2]); //1.0, 9, 0.5, 512);
            this.bloom.name = "Bloom";
        }

        //filmic
        if (this.passes.filmic.enabled) {

            THREE.FilmicShader.defines.STATIC_NOISE = this.passes.filmic.useStaticNoise ? 1 : 0;

            this.filmic = new THREE.ShaderPass(THREE.FilmicShader);
            this.filmic.uniforms['resolution'].value = new THREE.Vector2(this.width, this.height);

            this.filmic.uniforms['noiseStrength'].value = this.passes.filmic.noise;

            this.filmic.uniforms['noiseTexture'].value = noiseTexture;

            this.filmic.uniforms['rgbSplitStrength'].value = this.passes.filmic.rgbSplit;

            this.filmic.uniforms['vignetteStrength'].value = this.passes.filmic.vignette;
            this.filmic.uniforms['vignetteOffset'].value = this.passes.filmic.vignetteOffset;

            this.filmic.uniforms['brightness'].value = this.passes.filmic.brightness;
            this.filmic.uniforms['contrast'].value = this.passes.filmic.contrast;
            this.filmic.uniforms['gamma'].value = this.passes.filmic.gamma;
            this.filmic.uniforms['vibrance'].value = this.passes.filmic.vibrance;

            let lutTexture = new THREE.TextureLoader().load(this.passes.filmic.lutURL);
            lutTexture.minFilter = THREE.NearestFilter;
            lutTexture.magFilter = THREE.NearestFilter;
            this.filmic.uniforms['LUTtexture'].value = lutTexture;
            this.filmic.uniforms['LUTstrength'].value = this.passes.filmic.lut;
            this.filmic.name = "Filmic";

            if (Log.debug) {
                // Add GUI
                let folder = this.gui.addFolder('Filmic');
                let uniforms = {
                    noiseStrength: this.passes.filmic.noise,
                    rgbSplitStrength: this.passes.filmic.rgbSplit,
                    vignetteStrength: this.passes.filmic.vignette,
                    vignetteOffset: this.passes.filmic.vignetteOffset,
                    brightness: this.passes.filmic.brightness,
                    contrast: this.passes.filmic.contrast,
                    gamma: this.passes.filmic.gamma,
                    vibrance: this.passes.filmic.vibrance,
                    LUTstrength: this.passes.filmic.lut,
                }
                folder.add(uniforms, 'noiseStrength', 0.0, 1.0).onChange(value => this.guiChanger(value, this.filmic.uniforms, 'noiseStrength'));
                folder.add(uniforms, 'rgbSplitStrength', -10.0, 10.0).onChange(value => this.guiChanger(value, this.filmic.uniforms, 'rgbSplitStrength'));
                folder.add(uniforms, 'vignetteStrength', 0.0, 100.0).onChange(value => this.guiChanger(value, this.filmic.uniforms, 'vignetteStrength'));
                folder.add(uniforms, 'vignetteOffset', 0.0, 1.0).onChange(value => this.guiChanger(value, this.filmic.uniforms, 'vignetteOffset'));
                folder.add(uniforms, 'brightness', -0.5, 1.0).onChange(value => this.guiChanger(value, this.filmic.uniforms, 'brightness'));
                folder.add(uniforms, 'contrast', 0.5, 2.0).onChange(value => this.guiChanger(value, this.filmic.uniforms, 'contrast'));
                folder.add(uniforms, 'gamma', 1.0, 3.0).onChange(value => this.guiChanger(value, this.filmic.uniforms, 'gamma'));
                folder.add(uniforms, 'vibrance', -1.0, 1.0).onChange(value => this.guiChanger(value, this.filmic.uniforms, 'vibrance'));
                folder.add(uniforms, 'LUTstrength', 0.0, 1.0).onChange(value => this.guiChanger(value, this.filmic.uniforms, 'LUTstrength'));
            }
        }

        // Blur & Sharpen
        // TODO: Merge Filmic shader & Blur & Sharpen in one pass
        if (this.passes.blur.enabled) {
            THREE.BlurSharpenShader.defines.SAMPLE = Quality.settings.postprocess.blur.samples;
            this.blurDomElems = [];
            this.blurPos = [
                new THREE.Vector4(0.0, 0.0, 0.0, 0.0),
                new THREE.Vector4(0.0, 0.0, 0.0, 0.0),
                new THREE.Vector4(0.0, 0.0, 0.0, 0.0),
                new THREE.Vector4(0.0, 0.0, 0.0, 0.0)
            ];

            this.blur = new THREE.ShaderPass(THREE.BlurSharpenShader);
            this.blur.uniforms['resolution'].value = new THREE.Vector2(this.width, this.height);

            this.blur.uniforms['blurPos'].value = this.blurPos;

            this.blur.uniforms['noiseTexture'].value = noiseTexture;

            this.blur.uniforms['blurStrength'].value = this.passes.blur.strength;

            this.blur.uniforms['sharpenStrength'].value = this.passes.blur.sharpen;

            this.blur.uniforms['blurRgbSplitStrength'].value = this.passes.blur.blurRgbSplit;

            this.blur.uniforms['gain'].value = this.passes.blur.gain;
            this.blur.name = "Blur & Sharpen";

            if (Log.debug) {
                // Add GUI
                let folder = this.gui.addFolder('Blur & Sharpen');
                let uniforms = {
                    blurStrength: this.passes.blur.strength,
                    sharpenStrength: this.passes.blur.sharpen,
                    blurRgbSplitStrength: this.passes.blur.blurRgbSplit,
                    gain: this.passes.blur.gain,
                }
                folder.add(uniforms, 'blurStrength', 0.0, 100.0).onChange(value => this.guiChanger(value, this.blur.uniforms, 'blurStrength'));
                folder.add(uniforms, 'sharpenStrength', 0.0, 1.0).onChange(value => this.guiChanger(value, this.blur.uniforms, 'sharpenStrength'));
                folder.add(uniforms, 'blurRgbSplitStrength', 0.0, 20.0).onChange(value => this.guiChanger(value, this.blur.uniforms, 'blurRgbSplitStrength'));
                folder.add(uniforms, 'gain', 0.0, 10.0).onChange(value => this.guiChanger(value, this.blur.uniforms, 'gain'));
            }
        }

        //Copy Shader
        this.copyShader = new THREE.ShaderPass(THREE.CopyShader);
        this.copyShader.name = "Final Copy Shader";
        this.copyShader.renderToScreen = true;

        //Scene Render
        this.renderPassScene = new THREE.RenderPass(this.scene, this.camera);
        this.renderPassScene.name = "Scene Render";
        this.composer.addPass(this.renderPassScene);

        if (this.passes.bokehdof.enabled) {
            this.depthComposer.addPass(this.renderPassScene);
            this.bokeh.uniforms['tDiffuse'].value = this.renderTarget.texture;
            this.composer.addPass(this.bokeh);
        }
        
        if (this.passes.filmic.enabled) {
            this.composer.addPass(this.filmic);
        }
        if (this.passes.bloom.enabled) {
            this.composer.addPass(this.bloom);
        }
        if (this.passes.fxaa.enabled) {
            this.composer.addPass(this.fxaa);
        }
        if (this.passes.blur.enabled) {
            this.composer.addPass(this.blur);
        }
        this.composer.addPass(this.copyShader);

    }

    updateComposer() {
        // this.composer.reset();

        if (this.passes.bokehdof.enabled) {
            this.composer.reset();
        }

        this.renderPassScene.scene = this.scene;
        this.renderPassScene.camera = this.camera;

        // console.table(this.composer.passes)
    }

    addBlurPosition(domblur) {
        if (!this.passes.blur.enabled) return;
        this.blurDomElems.push(domblur);
        if (this.blurDomElems.length > this.blurPos.length) {
            Log.push('warn', this.constructor.name, `Blur Doms Elems exceed limits of ${this.blurPos.length}. First item is deleted ${this.blurDomElems[0]}`);
            this.blurDomElems.splice(0, 1);
        }
    }

    removeBlurPosition(domblur) {
        for (let i = 0; i < this.blurDomElems.length; i++) {
            if (this.blurDomElems[i].uuid === domblur.uuid) {
                this.blurDomElems.splice(i, 1);
            }
        }
    }

    updateBlurPositions() {
        if (!this.passes.blur.enabled) return;

        for (let i = 0; i < 4; i++) {
            if (this.blurDomElems[i]) {
                this.blurPos[i].set(
                    (this.blurDomElems[i].x / this.width),
                    1.0 - (this.blurDomElems[i].y / this.height),
                    (this.blurDomElems[i].x + this.blurDomElems[i].width) / this.width,
                    1.0 - (this.blurDomElems[i].y / this.height) - (this.blurDomElems[i].height / this.height)
                );
            } else {
                this.blurPos[i].set(0.0, 0.0, 0.0, 0.0);
            }
        }
        this.blur.uniforms['blurPos'].value = this.blurPos;
    }

    updateScene(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.updateComposer();
    }

    update(time, delta) {
        if (!this.scene || !this.camera) return;

        if (this.passes.filmic.enabled) {
            this.filmic.uniforms['time'].value = time;
        }
        if (this.passes.blur.enabled) {
            this.updateBlurPositions();
        }
        if (this.passes.bokehdof.enabled) {
            this.depthComposer.render(delta);
        }
        this.composer.render(delta);

    }

    resize(width, height, pixelDensity) {
        this.width = width;
        this.height = height;
        this.pixelDensity = pixelDensity;
        this.composer.setSize(this.width * this.pixelDensity, this.height * this.pixelDensity);

        if (this.passes.bokehdof.enabled) {
            this.depthComposer.setSize(this.width * this.pixelDensity, this.height * this.pixelDensity);
            this.depthRenderTarget.depthTexture.width = this.width;
            this.depthRenderTarget.depthTexture.height = this.height;
            this.depthRenderTarget.depthTexture.needsUpdate = true;
        }
        if (this.passes.fxaa.enabled) {
            this.fxaa.uniforms['resolution'].value = new THREE.Vector2(1 / this.width, 1 / this.height);
        }
        if (this.passes.filmic.enabled) {
            this.filmic.uniforms['resolution'].value = new THREE.Vector2(this.width, this.height);
        }
        if (this.passes.blur.enabled) {
            this.blur.uniforms['resolution'].value = new THREE.Vector2(this.width, this.height);
        }

    }
}