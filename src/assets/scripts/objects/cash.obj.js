import * as THREE from 'three';

import Object from '../engine/object';

// import { Tween } from 'es6-tween';

export class Cash extends Object {
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
        let tween = new Tween({ opacity: 0 }).to({ opacity: 1 }, 300)
        tween.on('update', ({ opacity }) => {
            this.materials['Paper'].opacity = opacity;
            this.materials['Money'].opacity = opacity;
            this.model.position.y = initialPosY + ((1 - opacity) * .25);
        })
        tween.start();
    }

    disappear() {
        let initialPosZ = this.model.position.z;
        let tween = new Tween({ opacity: 1 }).to({ opacity: 0 }, 400)
        tween.on('update', ({ opacity }) => {
            this.materials['Paper'].opacity = opacity;
            this.materials['Money'].opacity = opacity;
            this.model.position.z = initialPosZ + ((1 - opacity) * 1.);
        });
        tween.on('complete', _ => {
            this.destroy();
        });
        tween.start();
    }

    moveDown(value) {
        let initialPosY = this.model.position.y;
        let tween = new Tween({ y: 0 }).to({ y: value }, 300)
        tween.on('update', ({ y }) => {
            this.model.position.y = initialPosY - y;
        });
        tween.start();
    }

}