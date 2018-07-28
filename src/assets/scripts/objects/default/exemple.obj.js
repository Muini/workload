import * as THREE from 'three';

import Engine from '../../engine/core/engine';

import Obj from '../../engine/classes/obj';

export class Exemple extends Obj {
    constructor(opt = {}) {
        super(opt);
    }

    init(opt) {
        //Init variables
        this.name = 'exemple';
        this.modelName = 'exemple.model';
        this.hasShadows = true;

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

        super.init(opt);

        // Define & init here custom variables
    }

    created() {
        return (async() => {
            await super.created();
            // Is fired when the object is created after assets are loaded
        })();
    }

    awake() {
        return (async() => {
            await super.awake();
            // Is fired when the scene is starting
        })();
    }

    update(time, delta) {
        super.update(time, delta);
    }

}