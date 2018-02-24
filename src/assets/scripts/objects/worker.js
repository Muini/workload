import * as THREE from 'three';

import Object from '../engine/object';

export const modelUrl = '/static/models/worker.dae';

export class Worker extends Object {
    constructor(opt = {}) {
        super(opt);
        this.name = 'worker';
        this.modelUrl = modelUrl;
        this.castShadow = true;
    }

    init() {
        // Init materials
        let abs = new THREE.MeshStandardMaterial({
            name: 'ABS',
            color: new THREE.Color(0x494742),
            roughness: .8,
            metalness: .0,
            dithering: true,
        })
        this.materials.push(abs);

        let metal = new THREE.MeshStandardMaterial({
            name: 'Metal',
            color: new THREE.Color(0x616161),
            roughness: .7,
            metalness: .6,
            dithering: true,
        })
        this.materials.push(metal);

        let screen = new THREE.MeshStandardMaterial({
            name: 'Screen',
            color: new THREE.Color(0xB1C0E7),
            emissive: new THREE.Color(0xB1C0E7),
            roughness: 1.,
            metalness: 0.0,
            emissiveIntensity: 1
        })
        this.materials.push(screen);

        let bonhomme = new THREE.MeshStandardMaterial({
            name: 'Bonhomme',
            color: new THREE.Color(0x111111),
            roughness: .9,
            metalness: .0,
            dithering: true,
        })
        this.materials.push(bonhomme);

    }

    awake() {
        super.awake();
    }

    update(time) {

    }

}