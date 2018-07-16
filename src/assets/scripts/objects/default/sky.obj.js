import * as THREE from 'three';

import Engine from '../../engine/engine';

import Obj from '../../engine/obj';
import '../../../shaders/Sky';

export class Sky extends Obj {
    constructor(opt = {}) {
        super(opt);
    }

    init(opt) {
        //Init variables
        this.name = 'sky';

        this.sky = new THREE.Sky();
        this.sky.scale.setScalar(opt.size || 500);
        this.sky.name = 'Sky';
        this.model.add(this.sky);

        this.uniforms = this.sky.material.uniforms;
        this.uniforms.turbidity.value = opt.turbidity || 10.0;
        this.uniforms.rayleigh.value = opt.rayleigh || 2.0;
        this.uniforms.luminance.value = opt.luminance || 1.0;
        this.uniforms.mieCoefficient.value = opt.mieCoefficient || 0.005;
        this.uniforms.mieDirectionalG.value = opt.mieDirectionalG || 0.8;
        this.uniforms.sunPosition.value.copy(opt.sunPosition || new THREE.Vector3(0, 100, 0));

        super.init(opt);

        // Define & init here custom variables
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