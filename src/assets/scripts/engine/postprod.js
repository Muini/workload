import * as THREE from 'three';
import '../../shaders/postprocess/EffectComposer';
// import { ShaderPass } from 'three/examples/js/postprocessing/ShaderPass';
import '../../shaders/postprocess/ShaderPass';
import '../../shaders/postprocess/RenderPass';

import '../../shaders/postprocess/CopyShader';
import '../../shaders/postprocess/LuminosityHighPass/LuminosityHighPassShader';
import '../../shaders/postprocess/FXAA/FXAAShader';
import '../../shaders/postprocess/Bloom/BloomShader';
import '../../shaders/postprocess/Filmic/FilmicShader';
import '../../shaders/postprocess/BokehDOF/BokehShader';
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

        if (!this.renderer.extensions.get('WEBGL_depth_texture')) {

            supportsExtension = false;
            throw "WEBGL_depth_texture not supported";
            return;

        }

        this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height);
        this.renderTarget.texture.format = THREE.RGBAFormat;
        this.renderTarget.texture.minFilter = THREE.LinearFilter;
        this.renderTarget.texture.magFilter = THREE.LinearFilter;

        this.composer = new THREE.EffectComposer(this.renderer, this.renderTarget);

        this.depthRenderTarget = this.renderTarget.clone();
        this.depthRenderTarget.texture.minFilter = THREE.NearestFilter;
        this.depthRenderTarget.texture.magFilter = THREE.NearestFilter;
        this.depthRenderTarget.texture.generateMipmaps = false;
        this.depthRenderTarget.depthBuffer = true;
        this.depthRenderTarget.depthTexture = new THREE.DepthTexture();
        this.depthRenderTarget.depthTexture.type = THREE.UnsignedShortType;
        this.depthComposer = new THREE.EffectComposer(this.renderer, this.depthRenderTarget);

    }

    updateComposer() {
        this.composer.reset();
        this.depthComposer.reset();

        // Bokeh DOF
        if (this.passes.bokehdof.enabled) {
            this.bokehPass = new THREE.ShaderPass(THREE.BokehShader)
            this.bokehPass.name = "Bokeh DOF";
            this.bokehPass.uniforms['nearClip'].value = this.camera.near;
            this.bokehPass.uniforms['farClip'].value = this.camera.far;
            this.bokehPass.uniforms['focalLength'].value = this.camera.getFocalLength();
            console.log(this.bokehPass.uniforms['focalLength'].value)
            this.bokehPass.uniforms['focusDistance'].value = 25.0;
            this.bokehPass.uniforms['aperture'].value = 0.9;
            this.bokehPass.uniforms['maxblur'].value = 1.25;
            this.bokehPass.uniforms['tDepth'].value = this.depthRenderTarget.depthTexture;
        }

        //FXAA
        if (this.passes.fxaa.enabled) {
            this.FXAAPass = new THREE.ShaderPass(THREE.FXAAShader);
            this.FXAAPass.name = "FXAA";
            this.FXAAPass.uniforms['resolution'].value = new THREE.Vector2(1 / this.width, 1 / this.height);
        }

        //Bloom
        if (this.passes.bloom.enabled) {
            this.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(this.width, this.height), this.passes.bloom.options[0], this.passes.bloom.options[1], this.passes.bloom.options[2]); //1.0, 9, 0.5, 512);
            this.bloomPass.name = "Bloom";
        }

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
            this.filmicPass.name = "Filmic";
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
            this.blurPass.name = "Blur & Sharpen";
        }

        //Copy Shader
        this.copyShader = new THREE.ShaderPass(THREE.CopyShader);
        this.copyShader.name = "Final Copy Shader";
        this.copyShader.renderToScreen = true;

        //Scene Render
        this.renderPassScene = new THREE.RenderPass(this.scene, this.camera);
        this.renderPassScene.name = "Scene Render";
        this.composer.addPass(this.renderPassScene);
        this.depthComposer.addPass(this.renderPassScene);



        if (this.passes.bokehdof.enabled) {
            this.bokehPass.uniforms['tDiffuse'].value = this.renderTarget.texture;
            this.composer.addPass(this.bokehPass);
        }
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

        // console.table(this.composer.passes)
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

        this.updateComposer();
    }

    update(time, delta) {
        if (!this.scene || !this.camera) return;

        if (this.passes.filmic.enabled) {
            this.filmicPass.uniforms['time'].value = Math.sin(time);
        }
        if (this.passes.blur.enabled) {
            this.updateBlurPositions();
        }

        this.depthComposer.render(delta);
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