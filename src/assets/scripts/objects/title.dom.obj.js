import * as THREE from 'three';

import { BlurDom } from './default/blur.dom.obj';

export class TitleDom extends BlurDom {
    constructor(opt = {}) {
        super(opt);
    }

    init() {

        //Init variables
        this.name = 'Title';
        this.selector = '.title';

        super.init();

        // Define & init here custom variables

        this.data = {}
    }

    awake() {
        return (async() => {
            await super.awake();

            // Is fired when the object is added to the scene
        })();
    }

    update(time, delta) {
        super.update(time, delta);
    }

}