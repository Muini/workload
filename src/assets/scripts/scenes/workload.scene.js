import * as THREE from 'three';

// Engine
import Engine from '../engine/core/engine';
import MaterialManager from '../engine/core/materialManager';
import Scene from '../engine/classes/scene';
import Sound from '../engine/classes/sound';
import { Ease, Tween } from '../engine/classes/tween';
import DomEntity from '../engine/classes/domEntity';

// Objects
import { Camera } from '../entities/default/camera.ent';
import { Light } from '../entities/default/light.ent';
import { Cubemap } from '../entities/default/cubemap.ent';
import { Worker } from '../entities/worker.ent';
import { Clock } from '../entities/clock.ent';
import { Gamerules } from '../entities/gamerules.ent';
import { RTSCameraMovement } from '../entities/rtsCameraMovement.ent';
import Data from '../engine/utils/data';

// Create scene
export default new Scene({
    name: 'workload',
    data: {},
    onInit: function () {

        this.gamerules = new Gamerules({ parent: this });

        // Create & Add camera
        this.camera = new Camera({
            parent: this,
            position: new THREE.Vector3(0, 40, -60),
            rotation: new THREE.Vector3(0, 0, 0),
            focalLength: 50,
            focus: 38.0, //42
            aperture: 1.8,
        });
        this.camera.model.rotation.y = Math.PI;
        this.camera.instance.rotation.x = -(30 / 180) * Math.PI;

        this.RTSCameraMovement = new RTSCameraMovement({
            parent: this,
            camera: this.camera,
            easeFactor: 0.1,
            sensitivity: 0.5,
            active: false
        })

        let cubemap = new Cubemap({
            parent: this,
            near: 1,
            far: 500,
            resolution: 32,
            position: new THREE.Vector3(0, 4, 0),
            shouldUpdate: false,
            tickRate: 2
        });

        // Floor
        let floorGeometry = new THREE.PlaneGeometry(150, 150, 1, 1);
        let floorMaterial = MaterialManager.get('Floor').instance;
        let plane = new THREE.Mesh(floorGeometry, floorMaterial);
        plane.name = "Floor";
        plane.rotation.x = -Math.PI / 2;
        // plane.castShadow = true;
        plane.receiveShadow = true;
        this.instance.add(plane);

        // Ambient Light
        let ambiantLight = new Light({
            name: 'Ambient Light',
            parent: this,
            type: 'ambient',
            color: '2f364f',
            colorGround: '323b2e',
            power: 12.0,
        })

        this.instance.fog = new THREE.FogExp2(0x30364c, 0.001);

        this.clock = new Clock({
            parent: this,
            position: new THREE.Vector3(0, 0.0, 3.0),
            lengthOfADay: this.gamerules.data.lengthOfADay
        });

        this.currentStatus = new DomEntity({
            selector: '.current-status',
            name: 'Current status infos',
            parent: this,
            data: new Data({
                currentDay: 1,
                currentMoney: this.gamerules.data.safeMoney,
                wokersNbr: 0
            }),
            active: true,
            visible: false
        });
        /*this.gamerules.data.safeMoney.onDataUpdate(_ => {
            this.currentStatus.data.currentMoney = this.gamerules.data.safeMoney;
        })*/

        this.nextStatus = new DomEntity({
            selector: '.next-status',
            name: 'Next status infos',
            parent: this,
            data: new Data({
                nextCosts: -8,
                recruitNbr: '+1'
            }),
            active: true,
            visible: false
        });

        this.endTurnSound = new Sound({
            name: 'endTurn',
            parent: this,
            url: '/static/sounds/endturn.m4a',
            loop: false,
            volume: 0.4,
        });

        this.citySound = new Sound({
            name: 'city-loop',
            parent: this,
            url: '/static/sounds/city-loop.m4a',
            loop: true,
            volume: 0.2,
        });

        this.mainMusic = new Sound({
            name: 'music',
            parent: this,
            url: '/static/sounds/workload_music_by_jeremy_blake.m4a',
            loop: true,
            volume: 0.5,
        });

        this.workers = [6];
        this.workers[0] = new Worker({ parent: this, position: new THREE.Vector3(0, 0.0, 12.0) });
        this.workers[1] = new Worker({ parent: this, position: new THREE.Vector3(0, 0.0, 6.0) });
        this.workers[2] = new Worker({ parent: this, position: new THREE.Vector3(6.0, 0.0, 12.0) });
        this.workers[3] = new Worker({ parent: this, position: new THREE.Vector3(-6.0, 0, 12.0) });
        this.workers[4] = new Worker({ parent: this, position: new THREE.Vector3(6.0, 0.0, 6.0) });
        this.workers[5] = new Worker({ parent: this, position: new THREE.Vector3(-6.0, 0, 6.0) });

        this.boss = new Worker({
            parent: this,
            position: new THREE.Vector3(0, 0.0, 0.0),
            rotation: new THREE.Vector3(0, Math.PI, 0.0), 
            isTheBoss: true
        })
    },
    onUpdate: function(time, delta){
    },
    onStart: async function() {

        this.citySound.play(1000);

        this.onNewTurnAnimationIn = new Tween({ pro: 0, }).to({ pro: 1, }, 2000)
            .ease(Ease.Expo.Out)
            .onUpdate((props, progress) => {
                Engine.postprod.filmic.uniforms['vibrance'].value = 0.3 - (0.8 * progress);
                Engine.postprod.filmic.uniforms['rgbSplitStrength'].value = 6.0 + (24 * progress);
            })
        
        this.onNewTurnAnimationOut = new Tween({ pro: 0, }).to({ pro: 1, }, 2000)
            .ease(Ease.Expo.Out)
            .onUpdate((props, progress) => {
                Engine.postprod.filmic.uniforms['vibrance'].value = -0.5 + (0.8 * progress);
                Engine.postprod.filmic.uniforms['rgbSplitStrength'].value = 30.0 - (24 * progress);
            })

        // =====================
        // ON NEW TURN
        // =====================
        this.gamerules.onNewTurn = async _ => {
            // Make the screen black and white 
            console.log('New turn', this.gamerules.data.turn)
            this.onNewTurnAnimationIn.start();
            this.endTurnSound.play();

            // Block controls
            this.RTSCameraMovement.disableControls();
            this.RTSCameraMovement.moveTo(new THREE.Vector3(0, 20, -30));
            this.RTSCameraMovement.setFovTo(24);

            // Pause the game
            for (let w = 0; w < this.workers.length; w++) {
                const worker = this.workers[w];
                worker.pause()
                worker.canRecruit(true);
            }
            this.boss.pause();
            this.clock.isTurning = false;

            // Show HUD
            this.currentStatus.setVisibility(true);
            this.nextStatus.setVisibility(true);

            // Gather all the money created by workers
            this.gamerules.endTheDay();

            await Engine.wait(3000)

            this.gamerules.data.safeMoney += 10;

            // Set Timeout if turn is > 2
            await Engine.wait(10000 - (1000 * this.gamerules.data.turn));
            // Else let the player decide when to start the day

            // Start the new turn
            this.gamerules.startTheDay();

            // Continue the game
            for (let w = 0; w < this.workers.length; w++) {
                const worker = this.workers[w];
                worker.continue()
                worker.canRecruit(false);
            }
            this.boss.continue();
            this.clock.resetTime();
            this.clock.isTurning = true;
            this.onNewTurnAnimationOut.start();
            this.RTSCameraMovement.setFovTo(20);
            this.RTSCameraMovement.enableControls();
            // Hide HUD
            this.currentStatus.setVisibility(false);
            this.nextStatus.setVisibility(false);

        }

        // Start animation
        this.startAnimation = new Tween({
                x: 0,
                y: 40,
                z: -60,
                aperture: 1.8
            })
            .to({
                x: 0,
                y: 23,
                z: -30,
                aperture: 3.5
            }, 2000)
            // .repeat(Infinity)
            // .yoyo(true)
            .ease(Ease.Sine.Out)
            .onUpdate((props, progress) => {
                this.camera.model.position.x = props.x;
                this.camera.model.position.y = props.y;
                this.camera.model.position.z = props.z;
                this.camera.params.aperture = props.aperture;
            })
            .onComplete(async _ => {
                // this.addWorker.setActive(true);
                this.RTSCameraMovement.setActive(true);
                this.RTSCameraMovement.moveTo(new THREE.Vector3(0, 23, -30));
                // await Engine.wait(3000)
                // this.RTSCameraMovement.disableControls();
                // this.RTSCameraMovement.moveTo(new THREE.Vector3(0, 20, -30));
                // this.RTSCameraMovement.setFovTo(30);

                await this.boss.arriveAtOffice();
                this.boss.continue();

                Engine.wait(3000);

                this.mainMusic.play(3000);
                
                this.gamerules.startTheDay();
                this.clock.isTurning = true;
            })
        this.startAnimation.start();

    },
    // onDestroy: async function () {
    //     Engine.removeFromUpdate(this.uuid, this.update);
    // }
});