import * as THREE from 'three';

import Object from '../engine/object';

export class Exemple extends Object {
    constructor(opt = {}) {
        super(opt);
        this.name = 'exemple';
        this.modelName = 'exemple.model';
        this.hasShadows = true;
    }

    init() {
        // Init materials to be overwrite by name
        this.materials['ExempleMaterial'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xCFCFCF),
            roughness: .85,
            metalness: .0,
            dithering: true,
        })

        // Init lights to be overwrite by name
        this.lights['ExempleLight'] = new THREE.PointLight(0xE7B47F, 3, 5);
        this.lights['ExempleLight'].castShadow = false;

        super.init();

        // Define & init here custom variables
    }

    awake() {
        super.awake();

        // Is fired when the object is added to the scene
    }

    update(time) {}

}