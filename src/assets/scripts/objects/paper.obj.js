import * as THREE from 'three';

import Object from '../engine/object';

export class Paper extends Object {
    constructor(opt = {}) {
        super(opt);
        this.name = 'paper';
        this.modelName = 'paper.model';
        this.hasShadows = true;
    }

    init() {
        // Init materials
        this.materials['Paper'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xCFCFCF),
            roughness: .85,
            metalness: .0,
            dithering: true,
        })

        super.init();
    }

    awake() {
        super.awake();

    }

    update(time) {}

}