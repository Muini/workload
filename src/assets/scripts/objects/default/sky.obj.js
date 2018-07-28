import * as THREE from 'three';

import Engine from '../../engine/engine';
import Log from '../../engine/utils/log'

import Obj from '../../engine/obj';
import '../../../shaders/sky/Sky';

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

        if (Log.debug) {
            let folder = window.gui.addFolder('Sky');
            let uniforms = {
                turbidity: this.uniforms.turbidity.value,
                rayleigh: this.uniforms.rayleigh.value,
                luminance: this.uniforms.luminance.value,
                mieCoefficient: this.uniforms.mieCoefficient.value,
                mieDirectionalG: this.uniforms.mieDirectionalG.value,
                sunPosition: this.uniforms.sunPosition.value,
            }
            try{
                folder.add(uniforms, 'turbidity', 0.0, 30.0).onChange(value => {
                    this.uniforms['turbidity'].value = value
                });
                folder.add(uniforms, 'rayleigh', 0.0, 10.0).onChange(value => { this.uniforms['rayleigh'].value = value });
                folder.add(uniforms, 'luminance', 0.5, 2.0).onChange(value => { this.uniforms['luminance'].value = value });
                folder.add(uniforms, 'mieCoefficient', 0.0, 1.0).onChange(value => { this.uniforms['mieCoefficient'].value = value });
                folder.add(uniforms, 'mieDirectionalG', 0.0, 1.0).onChange(value => { this.uniforms['mieDirectionalG'].value = value });
                folder.add(uniforms.sunPosition, 'x').onChange(value => { this.uniforms['sunPosition'].value.x = value });
                folder.add(uniforms.sunPosition, 'y').onChange(value => { this.uniforms['sunPosition'].value.y = value });
                folder.add(uniforms.sunPosition, 'z').onChange(value => { this.uniforms['sunPosition'].value.z = value });
            }catch(e){}
        }
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