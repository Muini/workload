import * as THREE from 'three';

import Object from '../engine/object';

import { PaperBlock } from './paperBlock.obj';

export class Worker extends Object {
    constructor(opt) {
        super(opt);
    }

    init() {
        //Init variables
        this.name = 'worker';
        this.modelName = 'worker.model';
        this.hasShadows = true;

        // Init materials
        this.materials['ABS'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x494742),
            roughness: .8,
            metalness: .0,
            dithering: true,
        })
        this.materials['Metal'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x616161),
            roughness: .7,
            metalness: .6,
            dithering: true,
        })
        this.materials['Screen'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xB1C0E7),
            emissive: new THREE.Color(0xB1C0E7),
            roughness: 1.,
            metalness: 0.0,
            emissiveIntensity: 1
        })
        this.materials['Bonhomme'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x222222),
            roughness: .9,
            metalness: .0,
            dithering: true,
        })

        //Init Lights
        this.lights['Desk_Light'] = new THREE.PointLight(0xE7B47F, 3, 5);
        this.lights['Desk_Light'].castShadow = false;

        this.lights['Desk_Screen_Light'] = new THREE.PointLight(0xB1C0E7, 2, 5);
        this.lights['Desk_Screen_Light'].castShadow = false;

        this.lights['Desk_Spot'] = new THREE.SpotLight(0xDFEEFF);
        this.lights['Desk_Spot'].intensity = 0.6;
        this.lights['Desk_Spot'].castShadow = true;

        super.init();

        this.paperBlock = new PaperBlock({ parent: this.scene });
    }

    awake() {
        super.awake();

    }

    update(time, delta) {
        this.materials['Screen'].emissiveIntensity = THREE.Math.randFloat(0.9, 1.);
        this.lights['Desk_Screen_Light'].intensity = THREE.Math.randFloat(1.9, 2.1);
    }

}