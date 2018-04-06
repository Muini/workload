import * as THREE from 'three';

import { BlurDom } from './blur.dom.obj';

export class SubtitleDom extends BlurDom {
    constructor(opt = {}) {
        super(opt);
    }

    init() {

        //Init variables
        this.name = 'Subtitle';
        this.selector = '.subtitle';

        super.init();

        // Define & init here custom variables

        this.data = {}
    }

    awake() {
        super.awake();

        // Is fired when the object is added to the scene
    }

    update(time, delta) {
        super.update(time, delta);
    }

}