import * as THREE from 'three';

import Engine from '../../engine/core/engine';

import Entity from '../../engine/classes/entity';

export class Exemple extends Entity {
    constructor(opt = {}) {
        super(opt);
    }

    init(opt) {
        //Init variables
        this.name = 'exemple';
        this.modelName = 'exemple.model';
        this.hasShadows = true;

        // Init materials to be overwrite by name, second argument is 'isInstancedMaterial'
        this.addMaterial('Grass', true);

        // Init lights to be overwrite by name
        this.lights['ExempleLight'] = new THREE.PointLight(0xE7B47F, 3, 5);
        this.lights['ExempleLight'].castShadow = false;

        super.init(opt);

        // Define & init here custom variables
    }

    created() {
        return (async() => {
            await super.created();
            // Is fired when the entity is created after assets are loaded
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