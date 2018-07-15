import * as THREE from 'three';
import UUID from './utils/uuid';
import MaterialManager from './materialManager';

export default class Material{
    constructor(opt){
        this.uuid = UUID();

        this.name = opt.name || 'unnamed material';
        
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
        }

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
            dithering: true,
            envMapIntensity: 6.,
        });

        this.watchChanges();

        MaterialManager.register(this);
    }

    watchChanges(){
        for (let param in this.params) {
            this.params.watch(param, (id, oldval, newval) => {
                console.log('watch', id, oldval, newval)
                if (id === 'color' || id === 'emissive')
                    this.instance[id].setHex('0x' + newval);
                else if(id === 'opacity')
                    this.instance['transparent'] = newval < 1.0 ? true : false;
                else
                    this.instance[id] = newval;
            })
        }
    }

    clone(){
        let clone = Object.assign(Object.create(this), this);
        clone.uuid = UUID();
        return clone;
    }
}