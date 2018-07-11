import * as THREE from 'three';

import Engine from '../engine/engine';
import Obj from '../engine/obj';
import { Ease, Tween } from '../engine/tween';
import { resolve } from 'uri-js';

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
        this.materials['Paper'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xe5e5e5),
            roughness: .85,
            metalness: .0,
            dithering: true,
            opacity: 0,
            transparent: true,
        })

        super.init();
    }

    created() {
        return (async() => {
            await super.created();
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
                .onUpdate((value, progress) => {
                    this.materials['Paper'].opacity = value.opacity;
                    this.model.position.x = initialPosX + ((1 - value.opacity) * .25);
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
                .onUpdate((value, progress) => {
                    this.materials['Paper'].opacity = value.opacity;
                    this.model.position.z = initialPosZ + ((1 - value.opacity) * 1.);
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
                .onUpdate((value, progress) => {
                    this.model.position.y = initialPosY - value.y;
                })
                .onComplete(_ => {
                    resolve();
                })
                .start();
        });
    }

}