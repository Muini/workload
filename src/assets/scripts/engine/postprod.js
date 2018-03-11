import * as THREE from 'three';
import '../../shaders/postprocess/EffectComposer';
import '../../shaders/postprocess/ShaderPass';
import '../../shaders/postprocess/RenderPass';

import '../../shaders/postprocess/CopyShader';
import '../../shaders/postprocess/LuminosityHighPass/LuminosityHighPassShader';
import '../../shaders/postprocess/FXAA/FXAAShader';
import '../../shaders/postprocess/Bloom/BloomShader';
import '../../shaders/postprocess/Filmic/FilmicShader';
import '../../shaders/postprocess/BlurSharpen/BlurSharpenShader';

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
                rgbSplit: 1.0,
                vignette: 1.0,
                vignetteOffset: 1.0,
                lut: 1.0,
                lutURL: '/static/img/lut.png',
            },
            blur: {
                enabled: false,
                strength: 0.5,
                sharpen: 0.1,
                blurRgbSplit: 1.5,
                gain: 1.05,
            }
        }

        /*
        this.occlusion = new THREE.WebGLRenderTarget(this.width * this.pixelDensity / 2, this.height * this.pixelDensity / 2, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat });

        this.screenSpacePosition = new THREE.Vector3(.0, .0, .0);
        this.screenSpacePosition.copy(new THREE.Vector3(.0, .0, .0)).project(this.camera);
        this.screenSpacePosition.x = (this.screenSpacePosition.x + 1) / 2;
        this.screenSpacePosition.y = (this.screenSpacePosition.y + 1) / 2;
        */

        this.composer = new THREE.EffectComposer(this.renderer);

        //filmic
        if (this.passes.filmic.enabled) {
            this.filmicPass = new THREE.ShaderPass(THREE.FilmicShader);
            this.filmicPass.uniforms['resolution'].value = new THREE.Vector2(this.width, this.height);

            this.filmicPass.uniforms['noiseStrength'].value = this.passes.filmic.noise;

            this.filmicPass.uniforms['rgbSplitStrength'].value = this.passes.filmic.rgbSplit;

            this.filmicPass.uniforms['vignetteStrength'].value = this.passes.filmic.vignette;
            this.filmicPass.uniforms['vignetteOffset'].value = this.passes.filmic.vignetteOffset;

            let lutTexture = new THREE.TextureLoader().load(this.passes.filmic.lutURL);
            lutTexture.minFilter = THREE.NearestFilter;
            lutTexture.magFilter = THREE.NearestFilter;
            this.filmicPass.uniforms['LUTtexture'].value = lutTexture;
            this.filmicPass.uniforms['LUTstrength'].value = this.passes.filmic.lut;
        }

        // Blur & Sharpen
        if (this.passes.blur.enabled) {
            this.blurDomElems = [];
            this.blurPos = [
                new THREE.Vector4(0.0, 0.0, 0.0, 0.0),
                new THREE.Vector4(0.0, 0.0, 0.0, 0.0),
                new THREE.Vector4(0.0, 0.0, 0.0, 0.0),
                new THREE.Vector4(0.0, 0.0, 0.0, 0.0)
            ];

            this.blurPass = new THREE.ShaderPass(THREE.BlurSharpenShader);
            this.blurPass.uniforms['resolution'].value = new THREE.Vector2(this.width, this.height);

            this.blurPass.uniforms['blurPos'].value = this.blurPos;

            this.blurPass.uniforms['blurStrength'].value = this.passes.blur.strength;

            this.blurPass.uniforms['sharpenStrength'].value = this.passes.blur.sharpen;

            this.blurPass.uniforms['blurRgbSplitStrength'].value = this.passes.blur.blurRgbSplit;

            this.blurPass.uniforms['gain'].value = this.passes.blur.gain;
        }

        //Bloom
        if (this.passes.bloom.enabled) {
            this.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(this.width, this.height), this.passes.bloom.options[0], this.passes.bloom.options[1], this.passes.bloom.options[2]); //1.0, 9, 0.5, 512);
        }

        //FXAA
        if (this.passes.fxaa.enabled) {
            this.FXAAPass = new THREE.ShaderPass(THREE.FXAAShader);
            this.FXAAPass.uniforms['resolution'].value = new THREE.Vector2(1 / this.width, 1 / this.height);
        }

        //Copy Shader
        this.copyShader = new THREE.ShaderPass(THREE.CopyShader);
        this.copyShader.renderToScreen = true;

        //Scene Render
        this.renderPassScene = new THREE.RenderPass(this.scene, this.camera);


        //Render Order
        this.composer.addPass(this.renderPassScene);


        if (this.passes.fxaa.enabled) {
            this.composer.addPass(this.FXAAPass);
        }
        if (this.passes.bloom.enabled) {
            this.composer.addPass(this.bloomPass);
        }
        if (this.passes.filmic.enabled) {
            this.composer.addPass(this.filmicPass);
        }
        if (this.passes.blur.enabled) {
            this.composer.addPass(this.blurPass);
        }
        this.composer.addPass(this.copyShader);


        this.renderer.autoClearColor = true;
    }

    addBlurPosition(domblur) {
        if (!this.passes.blur.enabled) return;
        this.blurDomElems.push(domblur);
        this.updateBlurPositions();
    }

    updateBlurPositions() {
        if (!this.passes.blur.enabled) return;

        for (let i = 0; i < 4; i++) {
            if (this.blurDomElems[i]) {
                this.blurPos[i].set(
                    this.blurDomElems[i].x / this.width,
                    1.0 - (this.blurDomElems[i].y / this.height),
                    (this.blurDomElems[i].x + this.blurDomElems[i].width) / this.width,
                    1.0 - (this.blurDomElems[i].y / this.height) - (this.blurDomElems[i].height / this.height),
                );
            }
        }
        this.blurPass.uniforms['blurPos'].value = this.blurPos;
    }

    updateScene(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.renderPassScene.scene = this.scene;
        this.renderPassScene.camera = this.camera;
    }

    update(time, delta) {
        if (!this.scene || !this.camera) return;

        if (this.passes.filmic.enabled) {
            this.filmicPass.uniforms['time'].value = Math.sin(time);
        }
        if (this.passes.blur.enabled) {
            this.updateBlurPositions();
        }

        this.composer.render(delta);

    }

    resize(width, height, pixelDensity) {
        this.width = width;
        this.height = height;
        this.pixelDensity = pixelDensity;
        this.composer.setSize(this.width * this.pixelDensity, this.height * this.pixelDensity);

        if (this.passes.fxaa.enabled) {
            this.FXAAPass.uniforms['resolution'].value = new THREE.Vector2(1 / this.width, 1 / this.height);
        }
        if (this.passes.filmic.enabled) {
            this.filmicPass.uniforms['resolution'].value = new THREE.Vector2(this.width, this.height);
        }
        if (this.passes.blur.enabled) {
            this.blurPass.uniforms['resolution'].value = new THREE.Vector2(this.width, this.height);
        }

    }
}