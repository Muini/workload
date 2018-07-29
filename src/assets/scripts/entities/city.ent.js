import * as THREE from 'three';

import Engine from '../engine/core/engine';

import Model from '../engine/classes/model';

export class City extends Model {
    constructor(opt = {}) {
        super(opt);

        //Init variables
        this.name = 'city';
        this.modelName = 'city.model';
        this.hasShadows = true;

        // Init materials to be overwrite by name
        this.addMaterial('Grass');
        this.addMaterial('Floor');
        this.addMaterial('Concrete');
        this.addMaterial('Roof');
        this.addMaterial('Metal');
        this.addMaterial('White Metal');
        this.addMaterial('Glass');
        this.addMaterial('Glass2');
        this.addMaterial('Clouds');
        this.addMaterial('Leafs');
        this.addMaterial('Mountain');
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