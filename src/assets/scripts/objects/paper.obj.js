import * as THREE from 'three';

import Engine from '../engine/core/engine';
import Obj from '../engine/classes/obj';
import { Ease, Tween } from '../engine/classes/tween';

export class Paper extends Obj {
    constructor(opt = {}) {
        super(opt);
    }

    init() {
        //Init variables
        this.name = 'paper';
        this.modelName = 'paper.model';
        this.hasShadows = true;

        // Init materials
        this.addMaterial('Paper', false);

        super.init();
    }

    created() {
        return (async() => {
            await super.created();
            this.materials.get('Paper').params.opacity = 0;
        })();
    }

    awake() {
        return (async() => {
            await super.awake();
        })();
    }

    update(time, delta) {
        super.update(time, delta);
    }

    appear() {
        return new Promise((resolve, reject) => {
            let initialPosX = this.model.position.x;
            let tween = new Tween({ opacity: 0 })
                .to({ opacity: 1 }, 300)
                .onUpdate((props, progress) => {
                    this.materials.get('Paper').params.opacity = props.opacity;
                    this.model.position.x = initialPosX + ((1 - props.opacity) * .25);
                })
                .onComplete(_ => {
                    resolve();
                })
                .start();
        });
    }

    disappear() {
        return new Promise((resolve, reject) => {
            let initialPosZ = this.model.position.z;
            let tween = new Tween({ opacity: 1 })
                .to({ opacity: 0 }, 400)
                .onUpdate((props, progress) => {
                    this.materials.get('Paper').params.opacity = props.opacity;
                    this.model.position.z = initialPosZ + ((1 - props.opacity) * 1.);
                })
                .onComplete(_ => {
                    this.destroy();
                    resolve();
                })
                .start();
        });
    }

    moveDown(value) {
        return new Promise((resolve, reject) => {
            let initialPosY = this.model.position.y;
            let tween = new Tween({ y: 0 })
                .to({ y: value }, 300)
                .onUpdate((props, progress) => {
                    this.model.position.y = initialPosY - props.y;
                })
                .onComplete(_ => {
                    resolve();
                })
                .start();
        });
    }

}