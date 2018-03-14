import * as THREE from 'three';

import Engine from '../engine/engine';
import DomObject from '../engine/domObject';

export class BlurDom extends DomObject {
    constructor(opt = {}) {
        super(opt);
    }

    init() {
        super.init();

        // Define & init here custom variables

        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;

        this.onDataChanged = _ => {
            this.updatePositions();
        }

    }

    updatePositions() {
        let bounding = this.dom.getBoundingClientRect();

        this.x = bounding.x;
        this.y = bounding.y;
        this.width = bounding.width;
        this.height = bounding.height;
    }

    awake() {
        super.awake();

        Engine.addToResize(_ => {
            Engine.waitNextTick(_ => {
                this.updatePositions();
            });
        });

        if (Engine.postprod)
            Engine.postprod.addBlurPosition(this);
        else
            console.warn('Blur Dom Objects require postprocessing effects on')

        // Is fired when the object is added to the scene
    }

    destroy() {
        super.destroy();
    }

}