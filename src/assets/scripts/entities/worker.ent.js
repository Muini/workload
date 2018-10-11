import * as THREE from 'three';

import Engine from '../engine/core/engine';

import Sound from '../engine/classes/sound';
import Model from '../engine/classes/model';
import Random from '../engine/utils/random';
import { Ease, Tween } from '../engine/classes/tween';

import { Light } from './default/light.ent';
// import { PaperBlock } from './paperBlock.ent';
import { CashPile } from './cashPile.ent';
import { Bonhomme } from './bonhomme.ent';

export class Worker extends Model {
    constructor(opt) {
        super(opt);
        //Init variables
        this.name = 'worker';
        this.modelName = 'desk.model';
        this.hasShadows = true;

        // Init materials
        this.addMaterial('ABS');
        this.addMaterial('Metal');
        this.addMaterial('Placeholder', false);
        this.addMaterial('Screen', false);

        //Init Lights
        new Light({
            name: 'Desk_Light',
            type: 'point',
            parent: this,
            color: 'fc7223',
            power: 250,
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
            power: 2,
            fov: .6,
            castShadow: true,
        })

        this.bonhomme = new Bonhomme({ parent: this })
        this.placeholder = undefined;

        this.timeElapsed = 0;

        this.isPlaceholder = true;
        this.isWorking = false;
        this.isOff = true;
        this.isDead = false;

        this.numberOfWorkingHours = 8.0; // 8 hours per day. Up to 24 !
        this.workingSpeed = 1.0; // Will depend on happiness
        this.happiness = 0.5;

        this.cashPile = new CashPile({ parent: this }); // CASH !! €€€

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

            this.placeholder = await this.getChildModel('Placeholder');
            this.placeholder = this.placeholder[0];

            this.lights.get('Desk_Spot').setTarget(this.model);

            this.model.position.y -= 3;
            this.placeholder.position.y += 3;

        })();
    }

    awake() {
        return (async () => {
            await super.awake();

            this.turnScreenOff();
            this.turnLightOff();

            this.lights.get('Desk_Spot').setPower(2);
            this.lights.get('Desk_Spot').setVisibility(true);
        })();
    }

    onClick(e) {
        if(this.isPlaceholder){
            this.recruit();
            return;
        }else{
            this.turnLightOff();
            this.turnScreenOff();
        }
    }

    recruit() {
        console.log('Recruit');
        this.isPlaceholder = false;
        // Anim out placeholder
        this.materials.get('Placeholder').params.emissiveIntensity = 6.0;
        let initialPosY = this.model.position.y;
        let placeholderAnimOut = new Tween({
            opacity: 1
        })
        .to({
            opacity: 0
        }, 325)
        .onUpdate((props, progress) => {
            this.materials.get('Placeholder').params.opacity = props.opacity;
            this.placeholder.scale.setScalar(1 + (0.2 * progress));
        })
        .onComplete(_ => {
            // Remove placeholder
            this.placeholder.visible = false;
            this.lights.get('Desk_Spot').setVisibility(true);
            deskAnimIn.start();
        })

        // Anim in desk
        let deskAnimIn = new Tween({
            y: -3
        })
        .to({
            y: 0
        }, 1225)
        .ease(Ease.Expo.Out)
        .onUpdate((props, progress) => {
            this.model.position.y = props.y;
            this.lights.get('Desk_Spot').setPower(2 + (progress * 8));
            // console.log(this.lights.get('Desk_Spot').params.power);
        })
        .onComplete(_ => {
            // Bonhomme arrive at work
            this.bonhomme.arriveAtDesk();
            this.turnLightOn();
        })

        placeholderAnimOut.start();
    }

    leaveOffice(){
        this.stopWorking();
        this.turnScreenOff();
        //Anim out
        this.bonhomme.leaveFromDesk();
        this.turnLightOff();
    }

    arriveAtOffice(){
        this.turnLightOn();
        //Anim in
        this.bonhomme.arriveAtDesk();
        this.turnScreenOn();
        this.startWorking();
    }

    turnScreenOn(){
        this.materials.get('Screen').params.emissiveIntensity = Random.float(8, 9);
        this.lights.get('Desk_Screen_Light').setVisibility(true);
    }

    turnScreenOff(){
        this.materials.get('Screen').params.emissiveIntensity = 0.0;
        this.lights.get('Desk_Screen_Light').setVisibility(false);
    }

    turnLightOff(){
        this.lights.get('Desk_Spot').setVisibility(false);
        this.lights.get('Desk_Light').setVisibility(false);
    }

    turnLightOn(){
        this.lights.get('Desk_Spot').setVisibility(true);
        this.lights.get('Desk_Light').setVisibility(true);
    }

    startWorking() {
        if (this.isWorking) return;
        this.isWorking = true;
        this.sounds.get('working').setRate(1.0 + (this.happiness / 10.));
        this.sounds.get('working').play();
        // this.animator.play('Work');
    }

    stopWorking() {
        if (!this.isWorking) return;
        // this.animator.stop('Work');
        this.sounds.get('working').stop();
        this.isWorking = false;
    }

    working(){
        this.timeElapsed += delta;
        // this.animator.setSpeed(this.workingSpeed * this.happiness * 3.0)
        if (this.timeElapsed > (1000 / (this.workingSpeed * this.happiness))) {
            this.timeElapsed = 0;
            this.papersCount--;
            this.sounds.get('paperSound').play();
            this.paperBlock.removePaper().then(_ => {
                this.cashPile.addCash();
            });
        }
        this.materials.get('Screen').params.emissiveIntensity = Random.float(8, 9);
        this.lights.get('Desk_Screen_Light').setPower(Random.float(90, 110));
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.isPlaceholder) {
            this.materials.get('Placeholder').params.emissiveIntensity = (this.isHovering ? 1.0 : 0.0) + (Math.sin(time * 0.001) * 0.1);
            return;
        }

        if (this.isDead) {
            this.materials.get('Screen').params.emissiveIntensity = Random.float(9, 10);
            this.lights.get('Desk_Screen_Light').setPower(Random.float(90, 110));
            return;
        }

        // I'm off ! Yeay !
        if(this.isOff) return;

        if(!this.isWorking) return;
        // Is working !
        this.working();
    }

    die() {
        if (this.isWorking)
            this.stopWorking();
        // this.animator.stop();
        this.materials.get('Screen').params.emissive = 'ff0000';
        this.materials.get('Screen').params.emissiveIntensity = 6.0;
        this.lights.get('Desk_Screen_Light').setColor('fa0200');
        this.lights.get('Desk_Light').setPower(0);
        this.isDead = true;
    }
}