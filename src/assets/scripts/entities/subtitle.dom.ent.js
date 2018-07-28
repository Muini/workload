import * as THREE from 'three';

import { BlurDom } from './default/blur.dom.ent';

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
        return (async() => {
            await super.awake();
        })();
    }

    update(time, delta) {
        super.update(time, delta);
    }

}