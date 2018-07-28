import * as THREE from 'three';

import Engine from '../engine/core/engine';
import Entity from '../engine/classes/entity';
import { Ease, Tween } from '../engine/classes/tween';

export class Cash extends Entity {
    constructor(opt = {}) {
        super(opt);
    }

    init() {
        //Init variables
        this.name = 'cash';
        this.modelName = 'cash.model';
        this.hasShadows = true;

        // Init materials
        this.addMaterial('Paper', false);
        this.addMaterial('Money', false);

        super.init();
    }

    created() {
        return (async() => {
            await super.created();
            this.materials.get('Paper').params.opacity = 0;
            this.materials.get('Money').params.opacity = 0;
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
        let initialPosY = this.model.position.y;
        let tween = new Tween({
                opacity: 0
            })
            .to({
                opacity: 1
            }, 300)
            .onUpdate((props, progress) => {
                this.materials.get('Paper').params.opacity = props.opacity;
                this.materials.get('Money').params.opacity = props.opacity;
                this.model.position.y = initialPosY + ((1 - props.opacity) * .25);
            })
            .start();
    }

    disappear() {
        let initialPosZ = this.model.position.z;
        let tween = new Tween({
                opacity: 1
            })
            .to({
                opacity: 0
            }, 400)
            .onUpdate((props, progress) => {
                this.materials.get('Paper').params.opacity = props.opacity;
                this.materials.get('Money').params.opacity = props.opacity;
                this.model.position.z = initialPosZ + ((1 - props.opacity) * 1.);
            })
            .onComplete(_ => {
                this.destroy();
            })
            .start();
    }

    moveDown(value) {
        let initialPosY = this.model.position.y;
        let tween = new Tween({
                y: 0
            })
            .to({
                y: value
            }, 300)
            .onUpdate((props, progress) => {
                this.model.position.y = initialPosY - props.y;
            })
            .start();
    }

}