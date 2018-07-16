import * as THREE from 'three';

import Engine from '../engine/engine';

import Material from '../engine/material';
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
        this.addMaterial('ABS');
        this.addMaterial('Metal');
        this.addMaterial('Screen', false);
        this.addMaterial('Bonhomme');

        //Init Lights
        this.lights['Desk_Light'] = new THREE.PointLight(0xffa756, 1, 10);
        this.lights['Desk_Light'].decay = 2;
        this.lights['Desk_Light'].power = 200;
        this.lights['Desk_Light'].castShadow = false;

        this.lights['Desk_Screen_Light'] = new THREE.PointLight(0xB1C0E7, 1, 10);
        this.lights['Desk_Screen_Light'].decay = 2;
        this.lights['Desk_Screen_Light'].power = 150;
        this.lights['Desk_Screen_Light'].castShadow = false;

        this.lights['Desk_Spot'] = new THREE.SpotLight(0xDFEEFF);
        this.lights['Desk_Spot'].decay = 2;
        this.lights['Desk_Spot'].power = 30;
        this.lights['Desk_Spot'].castShadow = true;

        super.init();

        this.timeElapsed = 0;

        this.isWorking = false;
        this.isDead = false;

        this.workingSpeed = 1.0;
        this.happiness = 0.5;

        this.paperBlock = new PaperBlock({ parent: this });
        this.papersCount = 0;
        this.cashPile = new CashPile({ parent: this });

        new Sound({
            name: 'paperSound',
            url: '/static/sounds/worker-papermove.m4a',
            parent: this,
            loop: false,
            volume: 0.4,
        });

        new Sound({
            name: 'working',
            url: '/static/sounds/worker-working.m4a',
            parent: this,
            loop: true,
            volume: 0.5,
        });
    }

    created() {
        return (async() => {
            await super.created();

            this.lights['Desk_Spot'].target = this.model;
            this.materials.get('Screen').params.emissiveIntensity = 0.0;
            this.lights['Desk_Screen_Light'].power = 0;

            this.bonhomme = await this.getChildModel('Bonhomme');
            this.bonhomme.visible = false;

        })();
    }

    awake() {
        return (async () => {
            await super.awake();
        })();
    }

    die() {
        if (this.isWorking)
            this.stopWorking();
        this.animator.stop();
        this.materials.get('Screen').params.emissive = 'ff0000';
        this.materials.get('Screen').params.emissiveIntensity = 5.0;
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
        this.sounds.get('working').setRate(1.0 + (this.happiness / 10.));
        this.sounds.get('working').play();
        this.animator.play('Work');
    }

    stopWorking() {
        if (!this.isWorking) return;
        this.animator.stop('Work');
        this.sounds.get('working').stop();
        this.isWorking = false;
        this.materials.get('Screen').params.emissiveIntensity = 0.0;
        this.lights['Desk_Screen_Light'].power = 0;
    }

    addWork(number){
        let i = number;
        while(i--) {
            this.papersCount++;
            this.paperBlock.addPaper();
        }
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.isDead) {
            this.materials.get('Screen').params.emissiveIntensity = THREE.Math.randFloat(8, 9);
            this.lights['Desk_Screen_Light'].power = THREE.Math.randFloat(140, 160);
            return;
        }

        if (this.papersCount > 0) {
            this.startWorking();
            this.timeElapsed += delta;
            this.animator.setSpeed(this.workingSpeed * this.happiness * 3.0)
            if (this.timeElapsed > (1000 / (this.workingSpeed * this.happiness))) {
                this.timeElapsed = 0;
                this.papersCount--;
                this.sounds.get('paperSound').play();
                this.paperBlock.removePaper().then(_ => {
                    this.cashPile.addCash();
                });
            }
        } else {
            this.stopWorking();
        }

        if(this.isWorking){
            this.materials.get('Screen').params.emissiveIntensity = THREE.Math.randFloat(5, 6);
            this.lights['Desk_Screen_Light'].power = THREE.Math.randFloat(140, 160);
        }
    }

}