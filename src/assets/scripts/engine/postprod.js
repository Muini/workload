import * as THREE from 'three';
import '../../shaders/postprocess/EffectComposer';
import '../../shaders/postprocess/ShaderPass';
import '../../shaders/postprocess/RenderPass';
import '../../shaders/postprocess/FilmPass';

import '../../shaders/postprocess/CopyShader';
import '../../shaders/postprocess/Convolution/ConvolutionShader';
import '../../shaders/postprocess/LuminosityHighPass/LuminosityHighPassShader';
import '../../shaders/postprocess/FXAA/FXAAShader';
import '../../shaders/postprocess/Bloom/BloomShader';
import '../../shaders/postprocess/RGBSplit/RGBShiftShader';
import '../../shaders/postprocess/FilmShader/FilmShader';
import '../../shaders/postprocess/Vignette/VignetteShader';
import '../../shaders/postprocess/ZoomBlur/ZoomBlurShader';
import '../../shaders/postprocess/Sharpen/SharpenShader';

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
            film: { enabled: false, options: [-1.5, 1.5, 648, true] },
            vignette: { enabled: false, options: [.5, 1.4] },
            zoomBlur: { enabled: false, options: { center: .5, intensity: 20. } },
            chromatic: { enabled: false, options: { intensity: 10. } },
            bloom: { enabled: false, options: [1.0, 3.0, 0.85] },
            sharpen: { enabled: false },
        }

        /*
        this.occlusion = new THREE.WebGLRenderTarget(this.width * this.pixelDensity / 2, this.height * this.pixelDensity / 2, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat });

        this.screenSpacePosition = new THREE.Vector3(.0, .0, .0);
        this.screenSpacePosition.copy(new THREE.Vector3(.0, .0, .0)).project(this.camera);
        this.screenSpacePosition.x = (this.screenSpacePosition.x + 1) / 2;
        this.screenSpacePosition.y = (this.screenSpacePosition.y + 1) / 2;
        */

        this.composer = new THREE.EffectComposer(this.renderer);

        //Film Effect
        if (this.passes.film.enabled) {
            this.effectFilmPass = new THREE.FilmPass(
                this.passes.film.options[0],
                this.passes.film.options[1],
                this.passes.film.options[2],
                this.passes.film.options[3],
            );
        }

        //Vignette
        if (this.passes.vignette.enabled) {
            this.vignettePass = new THREE.ShaderPass(THREE.VignetteShader)
            this.vignettePass.uniforms['offset'].value = this.passes.vignette.options[0];
            this.vignettePass.uniforms['darkness'].value = this.passes.vignette.options[1];
        }

        //ZoomBlur
        if (this.passes.zoomBlur.enabled) {
            this.zoomBlurPass = new THREE.ShaderPass(THREE.ZoomBlurShader)
            this.zoomBlurPass.uniforms['center'].value = new THREE.Vector2(this.passes.zoomBlur.options.center, this.passes.zoomBlur.options.center);
            this.zoomBlurPass.uniforms['strength'].value = this.passes.zoomBlur.options.intensity;
            this.zoomBlurPass.uniforms['resolution'].value = new THREE.Vector2(this.width, this.height);
        }

        //RGB Split (Chromatic aberation)
        if (this.passes.chromatic.enabled) {
            this.rgbSplitPass = new THREE.ShaderPass(THREE.RGBShiftShader);
            this.rgbSplitPass.uniforms['delta'].value = new THREE.Vector2(this.passes.chromatic.options.intensity, this.passes.chromatic.options.intensity);
            this.rgbSplitPass.uniforms['resolution'].value = new THREE.Vector2(this.width, this.height);
        }

        //Sharpen
        if (this.passes.sharpen.enabled) {
            this.sharpenPass = new THREE.ShaderPass(THREE.SharpenShader);
            this.sharpenPass.uniforms['resolution'].value = new THREE.Vector2(this.width, this.height);
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
        if (this.passes.film.enabled) {
            this.composer.addPass(this.effectFilmPass);
        }
        if (this.passes.zoomBlur.enabled) {
            this.composer.addPass(this.zoomBlurPass);
        }
        if (this.passes.chromatic.enabled) {
            this.composer.addPass(this.rgbSplitPass);
        }
        if (this.passes.sharpen.enabled) {
            this.composer.addPass(this.sharpenPass);
        }
        if (this.passes.bloom.enabled) {
            this.composer.addPass(this.bloomPass);
        }
        if (this.passes.vignette.enabled) {
            this.composer.addPass(this.vignettePass);
        }
        this.composer.addPass(this.copyShader);


        this.renderer.autoClearColor = true;
    }

    update(time) {

        if (this.passes.zoomBlur.enabled) {
            this.zoomBlurPass.uniforms['strength'].value = this.passes.zoomBlur.options.intensity;
        }
        if (this.passes.chromatic.enabled) {
            this.rgbSplitPass.uniforms['delta'].value.x = this.passes.chromatic.options.intensity;
            this.rgbSplitPass.uniforms['delta'].value.y = this.passes.chromatic.options.intensity;
        }

        this.composer.render(time);

    }

    resize(width, height, pixelDensity) {
        this.width = width;
        this.height = height;
        this.pixelDensity = pixelDensity;
        this.composer.setSize(this.width * this.pixelDensity, this.height * this.pixelDensity);

        if (this.passes.chromatic.enabled) {
            this.rgbSplitPass.uniforms['resolution'].value = new THREE.Vector2(this.width, this.height);
        }
        if (this.passes.fxaa.enabled) {
            this.FXAAPass.uniforms['resolution'].value = new THREE.Vector2(1 / this.width, 1 / this.height);
        }
        if (this.passes.zoomBlur.enabled) {
            this.zoomBlurPass.uniforms['resolution'].value = new THREE.Vector2(this.width, this.height);
        }
        if (this.passes.sharpen.enabled) {
            this.sharpenPass.uniforms['resolution'].value = new THREE.Vector2(this.width, this.height);
        }
    }

    projectionOnScreen() {
        this.screenSpacePosition.copy(new THREE.Vector3(.0, .0, .0)).project(this.camera);
        this.screenSpacePosition.x = (this.screenSpacePosition.x + 1) / 2;
        this.screenSpacePosition.y = (this.screenSpacePosition.y + 1) / 2;
    }
}