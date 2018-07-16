import * as THREE from 'three';

import Engine from '../engine/engine';

import Obj from '../engine/obj';

import SwayShader from '../../shaders/sway/SwayShader';

export class City extends Obj {
    constructor(opt = {}) {
        super(opt);
    }

    init() {
        //Init variables
        this.name = 'city';
        this.modelName = 'city.model';
        this.hasShadows = true;

        // Init materials to be overwrite by name

        this.addMaterial('Grass', true);
        this.addMaterial('Floor', true);
        this.addMaterial('Concrete', true);
        this.addMaterial('Roof', true);
        this.addMaterial('Metal', true);
        this.addMaterial('White Metal', true);
        this.addMaterial('Glass', true);
        this.addMaterial('Glass2', true);
        this.addMaterial('Clouds', true);
        this.addMaterial('Leafs', true);

        super.init();
    }

    created() {
        return (async() => {

            await super.created();

            this.eoMotors = await this.getChildModel('Eolienne_motor');
            this.clouds = await this.getChildModel('Cloud');

            for (let i = 0; i < this.eoMotors.length; i++) {
                this.eoMotors[i].rotation.x += Math.random() * 3.14;
            }

        })();
    }

    awake() {
        return (async() => {
            await super.awake();
        })();
    }

    update(time, delta) {
        super.update(time, delta);

        // this.materials.get('Leafs').instance.uniforms['time'].value = time;
        for (let i = 0; i < this.eoMotors.length; i++) {
            this.eoMotors[i].rotation.x += 0.00025 * 3.14 * delta;
        }
        for (let i = 0; i < this.clouds.length; i++) {
            this.clouds[i].position.x += Math.cos(time * .000001) / 400. * delta;
        }
    }

}