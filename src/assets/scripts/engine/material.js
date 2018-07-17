import * as THREE from 'three';
import UUID from './utils/uuid';
import MaterialManager from './materialManager';

export default class Material {
    constructor(name, opt, isCloning = false) {
        this.uuid = UUID();

        this.name = name || 'unnamed material';

        this.params = {
            color: opt.color || '999999',
            map: opt.map || null,
            roughness: opt.roughness || 1.0,
            roughnessMap: opt.roughnessMap || null,
            metalness: opt.metalness || 0.0,
            metalnessMap: opt.metalnessMap || null,
            bumpMap: opt.bumpMap || null,
            bumpScale: opt.bumpScale || 1.0,
            opacity: opt.opacity || 1.0,
            emissive: opt.emissive || 'ffffff',
            emissiveIntensity: opt.emissiveIntensity || 0.0,
            fog: opt.fog || true,
            sway: opt.sway || 0.0,
        }

        this.isSwayShader = this.params.sway > 0.0;

        this.instance = new THREE.MeshStandardMaterial({
            name: this.name,
            color: new THREE.Color().setHex('0x' + this.params.color),
            map: this.params.map,
            roughness: this.params.roughness,
            roughnessMap: this.params.roughnessMap,
            metalness: this.params.metalness,
            metalnessMap: this.params.metalnessMap,
            bumpMap: this.params.bumpMap,
            bumpScale: this.params.bumpScale,
            opacity: this.params.opacity,
            transparent: this.params.opacity < 1.0 ? true : false,
            emissive: new THREE.Color().setHex('0x' + this.params.emissive),
            emissiveIntensity: this.params.emissiveIntensity,
            dithering: false,
            envMapIntensity: 6.,
            fog: this.params.fog,
        });

        if (this.isSwayShader) {
            this.instance.onBeforeCompile = (shader) => {

                shader = this.addSwayShader(shader);

                shader = this.modifyFogShader(shader);

                this.instance.uniforms = shader.uniforms;

            };
        }else{
            this.instance.onBeforeCompile = (shader) => {

                shader = this.modifyFogShader(shader);

                this.instance.uniforms = shader.uniforms;
            };
        }
        
        this.watchChanges();

        if (!isCloning)
            MaterialManager.register(this);
    }

    modifyFogShader(shader){
        shader.vertexShader = shader.vertexShader.replace(
            '#include <fog_vertex>', require('../../shaders/heightfog/fog.vert')
        );
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <fog_fragment>', require('../../shaders/heightfog/fog.frag')
        );
        return shader
    }

    addSwayShader(shader){
        if(!this.isSwayShader) return shader;

        shader.uniforms.time = {
            value: 0
        };
        shader.uniforms.swayBlend = {
            value: this.params.sway
        };
        shader.uniforms.windForce = {
            value: new THREE.Vector3(25, -15)
        };
        shader.vertexShader = 'uniform float time;\n' + shader.vertexShader;
        shader.vertexShader = 'uniform float swayBlend;\n' + shader.vertexShader;
        shader.vertexShader = 'uniform vec2 windForce;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
            '#include <project_vertex>', require('../../shaders/sway/sway.vert')
        );

        return shader;
    }

    watchChanges() {
        for (let param in this.params) {
            this.params.watch(param, (id, oldval, newval) => {
                if (id === 'color' || id === 'emissive')
                    this.instance[id].setHex('0x' + newval);
                else if (id === 'opacity') {
                    this.instance['transparent'] = newval < 1.0 ? true : false;
                    this.instance[id] = newval;
                } else {
                    this.instance[id] = newval;
                }
            })
        }
    }

    clone() {
        return new Material(this.name, this.params, true);
    }
}