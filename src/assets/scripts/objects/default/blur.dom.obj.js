import * as THREE from 'three';

import Engine from '../../engine/engine';
import Log from '../../engine/utils/log';
import DomObject from '../../engine/domObject';

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

        this.shouldUpdate = false;

        this.onDataChanged = _ => {
            this.shouldUpdate = true;
        }

    }

    updatePositions() {
        let bounding = this.dom.getBoundingClientRect();

        this.x = bounding.x - Engine.containerBoundingBox.x;
        this.y = bounding.y - Engine.containerBoundingBox.y;
        this.width = bounding.width;
        this.height = bounding.height;

        this.shouldUpdate = false;
    }

    awake() {
        return (async() => {
            await super.awake();

            Engine.addToResize(this.uuid, async _ => {
                await Engine.waitNextTick();
                this.shouldUpdate = true;
            });

            // Is fired when the object is added to the scene
        })();
    }

    setVisibility(bool) {
        super.setVisibility(bool);
        this.shouldUpdate = bool;
        if (bool === false && Engine.postprod)
            Engine.postprod.removeBlurPosition(this);
        else if (Engine.postprod)
            Engine.postprod.addBlurPosition(this);
        else
            Log.push('warn', this.constructor.name, `Blur Dom Objects require postprocessing effects on`);
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.shouldUpdate)
            this.updatePositions();
    }

    destroy() {
        if (Engine.postprod)
            Engine.postprod.removeBlurPosition(this);
        Engine.removeFromResize(this.uuid);
        super.destroy();
    }

}