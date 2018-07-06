import * as THREE from 'three';

import Engine from '../engine/engine';

import Sound from '../engine/sound';
import Obj from '../engine/obj';

import { PaperBlock } from './paperBlock.obj';
import { CashPile } from './cashPile.obj';

export class Worker extends Obj {
    constructor(opt) {
        super(opt);
    }

    init() {
        //Init variables
        this.name = 'worker';
        this.modelName = 'worker.model';
        this.hasShadows = true;

        // Init materials
        this.materials['ABS'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x494742),
            roughness: .8,
            metalness: .0,
            dithering: true,
        })
        this.materials['Metal'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x616161),
            roughness: .7,
            metalness: .6,
            dithering: true,
        })
        this.materials['Screen'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x555555),
            emissive: new THREE.Color(0xB1C0E7),
            emissiveIntensity: 10
        })
        this.materials['Bonhomme'] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x222222),
            roughness: .9,
            metalness: .0,
            dithering: true,
        })

        //Init Lights
        this.lights['Desk_Light'] = new THREE.PointLight(0xffb66e, 1, 5);
        this.lights['Desk_Light'].power = 200;
        this.lights['Desk_Light'].castShadow = false;

        this.lights['Desk_Screen_Light'] = new THREE.PointLight(0xB1C0E7, 1, 5);
        this.lights['Desk_Screen_Light'].power = 150;
        this.lights['Desk_Screen_Light'].castShadow = false;

        this.lights['Desk_Spot'] = new THREE.SpotLight(0xDFEEFF);
        this.lights['Desk_Spot'].power = 6;
        this.lights['Desk_Spot'].castShadow = true;

        super.init();

        this.timeElapsed = 0;
        this.timeElapsed2 = 0;

        this.isWorking = false;
        this.isDead = false;

        this.paperBlock = new PaperBlock({ parent: this });
        this.papersCount = 0;
        this.cashPile = new CashPile({ parent: this });

        /*this.paperSound = new Sound({
            name: 'paperSound',
            parent: this,
            loop: false,
            volume: 1.0,
        });*/
    }

    created() {
        return (async() => {
            await super.created();

            this.lights['Desk_Spot'].target = this.model;

            this.bonhomme = [];
            // TODO: Make utils for getting children easily
            this.model.traverse(async(child) => {
                if (child.name == 'Bonhomme') {
                    this.bonhomme = child
                }
            });
            this.bonhomme.visible = false;

        })();
    }

    awake() {
        return (async() => {
            await super.awake();

            Engine.wait(_ => {
                for (let i = 0; i < 5; i++) {
                    this.papersCount++;
                    this.paperBlock.addPaper();
                }

                Engine.wait(_ => {
                    this.startWorking();
                }, 1000);
            }, 500);

        })();
    }

    die() {
        if (this.isWorking)
            this.stopWorking();
        this.animator.stop();
        this.materials['Screen'].emissive.r = .7;
        this.materials['Screen'].emissive.g = .01;
        this.materials['Screen'].emissive.b = 0;
        this.lights['Desk_Screen_Light'].color.r = .75;
        this.lights['Desk_Screen_Light'].color.g = .01;
        this.lights['Desk_Screen_Light'].color.b = 0;
        this.lights['Desk_Light'].power = 0;
        this.isDead = true;
    }

    startWorking() {
        if (this.isWorking) return;
        this.bonhomme.visible = true;
        this.isWorking = true;
        this.animator.play('Work');
    }

    stopWorking() {
        if (!this.isWorking) return;
        this.isWorking = false;
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.isDead) {
            this.materials['Screen'].emissiveIntensity = THREE.Math.randFloat(8, 9);
            this.lights['Desk_Screen_Light'].power = THREE.Math.randFloat(140, 160);
            return;
        }

        if (this.isWorking) {

            this.timeElapsed += delta;
            this.timeElapsed2 += delta;

            if (this.timeElapsed > 3000) {
                this.timeElapsed = 0;
                for (let i = 0; i < 5; i++) {
                    this.papersCount++;
                    this.paperBlock.addPaper();
                }
            }

            if (this.timeElapsed2 > 1000) {
                this.timeElapsed2 = 0;
                if (this.papersCount > 0) {
                    this.papersCount--;
                    this.paperBlock.removePaper(_ => {
                        this.cashPile.addCash();
                        if (this.cashPile.cashs.length >= this.cashPile.cashsMax) {
                            this.stopWorking();
                            Engine.wait(_ => {
                                this.die();
                            }, 500);
                        }
                    });
                }
            }

            this.materials['Screen'].emissiveIntensity = THREE.Math.randFloat(9, 11);
            this.lights['Desk_Screen_Light'].power = THREE.Math.randFloat(140, 160);

        } else {

            this.materials['Screen'].emissiveIntensity = 0;
            this.lights['Desk_Screen_Light'].power = 0;

        }
    }

}