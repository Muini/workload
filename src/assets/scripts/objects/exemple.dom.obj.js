import * as THREE from 'three';

import DomObject from '../engine/domObject';


export class ExempleDom extends DomObject {
    constructor(opt = {}) {
        super(opt);
    }

    init() {
        //Init variables
        this.name = 'test';
        this.selector = '.hud-test';

        super.init();

        // Define & init here custom variables

        this.data = {
            score: 0,
        }
    }

    awake() {
        super.awake();

        // Is fired when the object is added to the scene
    }

    update(time, delta) {
        super.update(time, delta);
        if (this.scene.worker) {
            this.data.score = this.scene.worker.cashPile.cashs.length
        }
    }

}