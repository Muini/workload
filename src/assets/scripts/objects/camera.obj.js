import * as THREE from 'three';

import Engine from '../engine/engine';
import Object from '../engine/object';

export class Camera extends Object {
    constructor(opt = {}) {
        super(opt);
    }

    init(opt) {
        this.focalLength = opt.focalLength || 30;
        this.aperture = opt.aperture || 2.8;

        //Init variables
        this.name = 'Camera controller';

        this.isCamera = true;

        this.instance = new THREE.PerspectiveCamera();
        this.instance.setFocalLength(this.focalLength);
        this.instance.aspect = Engine.width / Engine.height;
        this.instance.near = opt.near || 1.0;
        this.instance.far = opt.far || 100.0;
        this.instance.focus = opt.focus || 30.0;
        this.instance.aperture = this.aperture;
        this.instance.name = 'Camera';

        this.model.add(this.instance);

        super.init(opt);
    }

    awake() {
        super.awake();

        // Is fired when the object is added to the scene

    }

    update(time, delta) {
        super.update(time, delta);
    }

}