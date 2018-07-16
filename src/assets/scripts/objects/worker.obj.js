import * as THREE from 'three';

import Engine from '../engine/engine';

import Material from '../engine/material';
import Sound from '../engine/sound';
import Obj from '../engine/obj';

import { Light } from '../objects/default/light.obj';
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
        new Light({
            name: 'Desk_Light',
            type: 'point',
            parent: this,
            color: 'ff9356',
            power: 200,
            castShadow: false,
        })

        new Light({
            name: 'Desk_Screen_Light',
            type: 'point',
            parent: this,
            color: 'B1C0E7',
            power: 100,
            distance: 5.0,
            castShadow: false,
        })

        new Light({
            name: 'Desk_Spot',
            type: 'spot',
            parent: this,
            color: 'DFEEFF',
            power: 10,
            castShadow: true,
        })
        
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

            this.lights.get('Desk_Spot').setTarget(this.model);
            this.materials.get('Screen').params.emissiveIntensity = 0.0;
            this.lights.get('Desk_Screen_Light').setPower(0);

            this.bonhomme = await this.getChildModel('Bonhomme');

        })();
    }

    awake() {
        return (async () => {
            await super.awake();
            this.bonhomme.visible = false;
        })();
    }

    die() {
        if (this.isWorking)
            this.stopWorking();
        this.animator.stop();
        this.materials.get('Screen').params.emissive = 'ff0000';
        this.materials.get('Screen').params.emissiveIntensity = 5.0;
        this.lights.get('Desk_Screen_Light').setColor('fa0200');
        this.lights.get('Desk_Light').setPower(0);
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
        this.lights.get('Desk_Screen_Light').setPower(0);
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
            this.lights.get('Desk_Screen_Light').setPower(THREE.Math.randFloat(90, 110));
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
            this.lights.get('Desk_Screen_Light').setPower(THREE.Math.randFloat(90, 110));
        }
    }

}