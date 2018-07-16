import * as THREE from 'three';
import UUID from './utils/uuid';
import MaterialManager from './materialManager';

import SwayShader from '../../shaders/sway/SwayShader';

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

        if (this.isSwayShader) {
            this.instance = new SwayShader({
                name: this.name,
                opacity: this.params.opacity,
                transparent: this.params.opacity < 1.0 ? true : false,
                dithering: false,
                fog: this.params.fog,
            }, {
                diffuse: { value: new THREE.Color().setHex('0x' + this.params.color) },
                map: { value: this.params.map },
                roughness: { value: this.params.roughness },
                roughnessMap: { value: this.params.roughnessMap },
                metalness: { value: this.params.metalness },
                metalnessMap: { value: this.params.metalnessMap },
                bumpMap: { value: this.params.bumpMap },
                bumpScale: { value: this.params.bumpScale },
                emissive: { value: new THREE.Color().setHex('0x' + this.params.emissive) },
                emissiveIntensity: { value: this.params.emissiveIntensity },
                envMapIntensity: { value: 6. },
                swayBlend: { value: this.params.sway },
                windForce: { value: new THREE.Vector3(25, -15) },
            });
        } else {
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
        }

        this.watchChanges();

        if (!isCloning)
            MaterialManager.register(this);
    }

    watchChanges() {
        for (let param in this.params) {
            this.params.watch(param, (id, oldval, newval) => {
                if (this.isSwayShader) {
                    if (id === 'color' || id === 'emissive')
                        this.instance.uniforms['diffuse'].setHex('0x' + newval);
                    else if (id === 'opacity') {
                        this.instance['transparent'] = newval < 1.0 ? true : false;
                        this.instance[id] = newval;
                    } else {
                        this.instance.uniforms[id] = newval;
                    }
                } else {
                    if (id === 'color' || id === 'emissive')
                        this.instance[id].setHex('0x' + newval);
                    else if (id === 'opacity') {
                        this.instance['transparent'] = newval < 1.0 ? true : false;
                        this.instance[id] = newval;
                    } else {
                        this.instance[id] = newval;
                    }
                }
            })
        }
    }

    clone() {
        return new Material(this.name, this.params, true);
    }
}