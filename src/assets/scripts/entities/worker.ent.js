import * as THREE from 'three';

import Engine from '../engine/core/engine';

import Sound from '../engine/classes/sound';
import Model from '../engine/classes/model';
import Random from '../engine/utils/random';
import { Ease, Tween } from '../engine/classes/tween';
import DomEntity from '../engine/classes/domEntity';
import Data from '../engine/utils/data';

import { Light } from './default/light.ent';
import { PaperBlock } from './paperBlock.ent';
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
            power: 100,
            castShadow: false,
            active: false,
        })

        new Light({
            name: 'Desk_Screen_Light',
            type: 'point',
            parent: this,
            color: 'B1C0E7',
            power: 50,
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
            castShadow: false,
        })

        this.bonhomme = new Bonhomme({ parent: this })
        this.placeholder = undefined;
        this.isHoveringPlaceholder = false;

        this.isTheBoss = opt.isTheBoss ? opt.isTheBoss : false;

        this.timeElapsed = 0;

        this.isPlaceholder = this.isTheBoss ? false : true;
        this.canRecruitWorker = false;
        this.isWorking = false;
        this.isPaused = true;
        this.isOff = this.isTheBoss ? false : true;
        this.isDead = false;

        this.numberOfWorkingHours = 8.0; // 8 hours per day. Up to 24 !
        this.workingSpeed = 1.0; // Will depend on happiness
        this.happiness = 0.5;

        this.cashPile = new CashPile({
            parent: this,
            position: new THREE.Vector3(Random.float(-0.25, -0.75), 0, 1.0 + Random.float(-0.1, 0.1))
        });
        this.paperBlock = new PaperBlock({
            parent: this,
            position: new THREE.Vector3(Random.float(-0.4, 0.5), 0, Random.float(-0.1, 0.1))
        });

        new Sound({
            name: 'paperSound',
            url: '/static/sounds/worker-papermove.m4a',
            parent: this,
            loop: false,
            volume: 0.3,
        });

        new Sound({
            name: 'working',
            url: '/static/sounds/worker-working.m4a',
            parent: this,
            loop: true,
            volume: 0.4,
        });


        this.workerUtils = new DomEntity({
            parent: this,
            selector: '.worker-utils',
            name: 'Worker Utils',
            data: new Data({
                isRecruited: false
            }),
            debug: true,
            follow: true,
            position: new THREE.Vector3(0, 4, 0),
            active: false,
        });
    }

    created() {
        return (async _ => {
            await super.created();

            this.desk = await this.getChildModel('Desk_Model');
            this.desk = this.desk[0];
            this.desk.visible = false;

            this.deskBoss = await this.getChildModel('Desk_Model_Boss');
            this.deskBoss = this.deskBoss[0];

            let papersNbr = Random.int(1, 5);
            
            if (this.isTheBoss){
                papersNbr = Random.int(3, 8);
                this.paperBlock.model.position.set(3.25, 0.0, 0.0);
            }else{
                this.deskBoss.visible = false;
            }

            while (papersNbr--)
                this.paperBlock.addPaper()

            this.placeholder = await this.getChildModel('Placeholder');
            this.placeholder = this.placeholder[0];

            this.lights.get('Desk_Spot').setTarget(this.model);

            if (this.isTheBoss) return this.placeholder.visible = false;

            this.model.position.y -= 3;
            this.placeholder.position.y += 3;
            
            this.workerUtils.onClick = _ => {
                if(!this.workerUtils.data.isRecruited)
                    this.recruit();
            }
            this.workerUtils.onHover = _ => {
                if(this.workerUtils.data.isRecruited) return;
                this.isHoveringPlaceholder = true;
            }
            this.workerUtils.onOutHover = _ => {
                if (this.workerUtils.data.isRecruited) return;
                this.isHoveringPlaceholder = false;
            }

        })();
    }

    awake() {
        return (async () => {
            await super.awake();

            this.turnScreenOff();
            this.turnLightsOff();

            if (this.isTheBoss){
                this.lights.get('Desk_Spot').setPower(8);
                return;
            }

            this.lights.get('Desk_Spot').setPower(1);
            this.lights.get('Desk_Spot').setVisibility(true);
        })();
    }

    // onClick(e) {
    //     if(this.isPlaceholder || this.isDead || this.isTheBoss) return;
    //     this.die();
    // }

    pause(){
        this.isPaused = true;
        this.bonhomme.animator.pauseCurrent();
    }

    continue(){
        this.bonhomme.animator.continueCurrent();
        this.isPaused = false;
    }

    canRecruit(bool){
        if (!this.isPlaceholder) return;
        this.workerUtils.setVisibility(bool);
        this.canRecruitWorker = bool;
    }

    recruit() {
        if(!this.canRecruitWorker) return;
        // this.workerUtils.setActive(false);
        this.workerUtils.data.isRecruited = true;
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
            this.desk.visible = true;
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
            this.lights.get('Desk_Spot').setPower(2 + (progress * 6));
        })
        .onComplete(_ => {
            // Bonhomme arrive at work
            this.arriveAtOffice();
        })

        placeholderAnimOut.start();
    }

    assignNewWorkHours(startHour, endHour){}

    leaveOffice(){
        this.stopWorking();
        this.sounds.get('working').stop();
        this.turnScreenOff();
        //Anim out
        this.bonhomme.leaveFromDesk();
        this.turnLightsOff();
        this.isOff = true;
    }

    arriveAtOffice(){
        return new Promise((resolve, reject) => {
            this.turnLightsOn();
            //Anim in
            this.bonhomme.animator.play('ArriveAtWork', 0.0, false).then(_ => {
                this.turnScreenOn();
                // Worker will wait a bit before start working ?
                // await Engine.wait(100 - (100 * this.happiness))
                this.startWorking();
                this.isOff = false;
                resolve();
            })
            this.bonhomme.arriveAtDesk();
        })
    }

    turnScreenOn(){
        this.materials.get('Screen').params.emissiveIntensity = Random.float(8, 9);
        this.lights.get('Desk_Screen_Light').setVisibility(true);
    }

    turnScreenOff(){
        this.materials.get('Screen').params.emissiveIntensity = 0.0;
        this.lights.get('Desk_Screen_Light').setVisibility(false);
    }

    turnLightsOff(){
        this.lights.get('Desk_Spot').setVisibility(false);
        this.lights.get('Desk_Light').setVisibility(false);
    }

    turnLightsOn(){
        this.lights.get('Desk_Spot').setVisibility(true);
        if(this.isTheBoss) return;
        this.lights.get('Desk_Light').setVisibility(true);
    }

    startWorking() {
        if (this.isWorking || this.isOff || this.isPlaceholder) return;
        this.isWorking = true;
        this.sounds.get('working').setRate(1.0 + (this.happiness / 10.));
        this.sounds.get('working').play();
        this.bonhomme.animator.play('Working', 0.6, true); //Temp
    }

    stopWorking() {
        if (!this.isWorking || this.isOff || this.isPlaceholder) return;
        this.bonhomme.animator.stop('Working', 0.1); //Temp
        this.sounds.get('working').pause();
        this.isWorking = false;
    }

    working(delta) {
        this.timeElapsed += delta;
        this.bonhomme.animator.setSpeed(this.workingSpeed * this.happiness * 2.0)
        // this.lights.get('Desk_Light').setColor(new THREE.Color(1, 0.1 + (0.9 * this.happiness), 0.1 + (0.9 * this.happiness)).getHexString())
        if (this.timeElapsed > (1000 / (this.workingSpeed * this.happiness))) {
            this.timeElapsed = 0;
            // this.papersCount--;
            this.sounds.get('paperSound').play();
            // this.paperBlock.removePaper().then(_ => {
                this.cashPile.addCash();
            // });
        }
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.isPlaceholder) {
            this.materials.get('Placeholder').params.emissiveIntensity = (this.isHoveringPlaceholder ? 1.0 : 0.0) + (Math.sin(time * 0.001 * (this.canRecruitWorker ? 3.0 : 1.0)) * 0.1);
            return;
        }

        if (this.isDead) {
            this.lights.get('Desk_Screen_Light').setPower(Random.float(40, 60));
            return;
        }

        // Player is in new turn
        if(this.isPaused) return;

        // I'm off ! Yeay !
        if(this.isOff) return;

        this.materials.get('Screen').params.emissiveIntensity = Random.float(8, 9);
        this.lights.get('Desk_Screen_Light').setPower(Random.float(40, 60));

        if(!this.isWorking || this.isTheBoss) return;
        // Is working !
        this.working(delta);
    }

    die() {
        if (this.isWorking)
            this.stopWorking();
        // this.bonhomme.animator.stop();
        this.materials.get('Screen').params.emissive = 'ff0000';
        this.materials.get('Screen').params.emissiveIntensity = 2.0;
        this.lights.get('Desk_Screen_Light').setColor('fa0200');
        this.lights.get('Desk_Screen_Light').setVisibility(true);
        this.lights.get('Desk_Light').setVisibility(false);
        this.lights.get('Desk_Spot').setPower(2);
        this.isDead = true;
    }
}