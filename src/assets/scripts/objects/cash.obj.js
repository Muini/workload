import * as THREE from 'three';

import Engine from '../engine/engine';
import Obj from '../engine/obj';
import { Ease, Tween } from '../engine/tween';

export class Cash extends Obj {
    constructor(opt = {}) {
        super(opt);
    }

    init() {
        //Init variables
        this.name = 'cash';
        this.modelName = 'cash.model';
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
        this.materials['Money'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x6A964D),
            roughness: .8,
            metalness: .0,
            dithering: true,
            opacity: 0,
            transparent: true,
        })

        super.init();
    }

    created() {
        return (async () => {
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
        let initialPosY = this.model.position.y;
        let tween = new Tween({ opacity: 0 })
            .to({ opacity: 1 }, 300)
            .onUpdate((props, progress) => {
                this.materials['Paper'].opacity = props.opacity;
                this.materials['Money'].opacity = props.opacity;
                this.model.position.y = initialPosY + ((1 - props.opacity) * .25);
            })
            .start();
    }

    disappear() {
        let initialPosZ = this.model.position.z;
        let tween = new Tween({ opacity: 1 })
            .to({ opacity: 0 }, 400)
            .onUpdate((props, progress) => {
                this.materials['Paper'].opacity = props.opacity;
                this.materials['Money'].opacity = props.opacity;
                this.model.position.z = initialPosZ + ((1 - props.opacity) * 1.);
            })
            .onComplete(_ => {
                this.destroy();
            })
            .start();
    }

    moveDown(value) {
        let initialPosY = this.model.position.y;
        let tween = new Tween({ y: 0 })
            .to({ y: value }, 300)
            .onUpdate((props, progress) => {
                this.model.position.y = initialPosY - props.y;
            })
            .start();
    }

}