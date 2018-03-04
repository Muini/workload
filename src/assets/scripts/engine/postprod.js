import * as THREE from 'three';
import '../../shaders/postprocess/EffectComposer';
import '../../shaders/postprocess/ShaderPass';
import '../../shaders/postprocess/RenderPass';

import '../../shaders/postprocess/CopyShader';
import '../../shaders/postprocess/Convolution/ConvolutionShader';
import '../../shaders/postprocess/LuminosityHighPass/LuminosityHighPassShader';
import '../../shaders/postprocess/FXAA/FXAAShader';
import '../../shaders/postprocess/Bloom/BloomShader';
import '../../shaders/postprocess/Filmic/FilmicShader';

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
            filmic: { enabled: false },
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
            let lutTexture = new THREE.TextureLoader().load('/static/img/lut-gamma.png');
            lutTexture.minFilter = THREE.NearestFilter;
            lutTexture.magFilter = THREE.NearestFilter;
            this.filmicPass.uniforms['LUTtexture'].value = lutTexture;
            this.filmicPass.uniforms['resolution'].value = new THREE.Vector2(this.width, this.height);
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
        if (this.passes.filmic.enabled) {
            this.composer.addPass(this.filmicPass);
        }
        if (this.passes.bloom.enabled) {
            this.composer.addPass(this.bloomPass);
        }
        this.composer.addPass(this.copyShader);


        this.renderer.autoClearColor = true;
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
    }
}