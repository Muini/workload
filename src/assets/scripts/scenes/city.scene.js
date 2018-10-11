import * as THREE from 'three';

// Engine
import Engine from '../engine/core/engine';
import SceneManager from '../engine/core/sceneManager';

import Scene from '../engine/classes/scene';
import Sound from '../engine/classes/sound';
import { Ease,Tween } from '../engine/classes/tween';

// Entities
import { Camera } from '../entities/default/camera.ent';
import { Light } from '../entities/default/light.ent';
import { Cubemap } from '../entities/default/cubemap.ent';
import { Sky } from '../entities/default/sky.ent';
import { City } from '../entities/city.ent';

// Dom Entities
import { BlurDom } from '../entities/default/blur.dom.ent';

// Create scene
export default new Scene({
    name: 'city',
    data: {},
    setup: function() {
        // Create & Add camera
        this.camera = new Camera({
            parent: this,
            position: new THREE.Vector3(0, 45, 62),
            rotation: new THREE.Vector3(0, 0, 0),
            focalLength: 25, //25
            aperture: 4.0,
            focus: 50.0,
            far: 900,
        });

        this.mapTarget = new THREE.AxesHelper(5);
        this.mapTarget.position.y = 22;
        this.mapTarget.position.z = 7;
        this.mapTarget.visible = false;
        this.instance.add(this.mapTarget);

        this.camera.setTargetMAP(this.mapTarget);

        let cubemap = new Cubemap({
            parent: this,
            near: 1,
            far: 500,
            resolution: 256,
            // position: new THREE.Vector3(0, 30, 10),
            position: new THREE.Vector3(0, 30, -150),
            shouldUpdate: false,
            tickRate: 2,
            debug:false,
        });
        cubemap.rotation.z += -3.14 / 2;
        cubemap.rotation.x += 3.14 / 2;

        // Ambient Light
        let ambiantLight = new Light({
            name: 'Ambient Light',
            parent: this,
            type: 'ambient',
            // color: '222e56', //Day
            color: 'f9c5ac',
            // colorGround: '323b2e', //Day
            colorGround: '3d3463',
            // power: 10.0, //Day
            power: 1.0, //Sunset
        })

        this.sun = new Light({
            name: 'Sun',
            parent: this,
            type: 'directional',
            // color: 'FFF4E6',
            color: 'fa4f1d', //Day
            // power: 8.0, //Day
            power: 16.0,
            castShadow: true,
            shadowMapSize: 512,
            shadowCameraSize: 50.0,
            // position: new THREE.Vector3(-30, 100, 30), //Day
            position: new THREE.Vector3(150, 50, -250), //Sunset
        })
        
        this.sunTarget = new THREE.Object3D();
        this.sunTarget.position.x = 12.0;
        this.sunTarget.position.y = 20;
        this.sunTarget.position.z = -30;
        this.instance.add(this.sunTarget);

        let sky = new Sky({
            parent: this,
            size: 1000,
            sunPosition: this.sun.position,
            turbidity: 2.0,
            rayleigh: 3.0,
            mieCoefficient: 0.0008,
            mieDirectionalG: 0.8
        })

        // this.instance.fog = new THREE.FogExp2(0xd2dbe0, 0.002); //Day
        // this.instance.fog = new THREE.FogExp2(0x959fa5, 0.002); //Day
        this.instance.fog = new THREE.FogExp2(0x604f40, 0.002); //Sunset

        this.city = new City({
            parent: this
        });
        this.city.rotation.y = 3.14;
        this.sun.setTarget(this.city.model);

        this.citySound = new Sound({
            name: 'city-loop',
            parent: this,
            url: '/static/sounds/city-loop.m4a',
            loop: true,
            volume: 0.4,
        });

        this.startButton = new BlurDom({
            selector: '.btn-start',
            parent: this,
            active: false,
        })
        this.title = new BlurDom({
            selector: '.title',
            parent: this,
            active: false
        });
        this.subtitle = new BlurDom({
            selector: '.subtitle',
            parent: this,
            active: false
        });

    },
    onStart: async function () {

        // this.citySound.play(1000);

        let tween = new Tween({
                y: 45,
            })
            .to({
                y: 24,
            }, 6000)
            // .repeat(Infinity)
            // .yoyo(true)
            .ease(Ease.Sine.InOut)
            .onUpdate((props, progress) => {
                // console.log('update', props.y, props.z, progress)
                this.camera.model.position.y = props.y;
            })
            .onComplete(_ => {
                // console.log('complete')
            });

        let tween2 = new Tween({
                y: 24,
                z: 62
            })
            .to({
                y: 20,
                z: 10
            }, 3000)
            // .repeat(Infinity)
            // .yoyo(true)
            .ease(Ease.Expo.In)
            .onUpdate((props, progress) => {
                // console.log('update', props.y, props.z, progress)
                this.camera.model.position.y = props.y;
                this.camera.model.position.z = props.z;
            })
            .onComplete(_ => {
                // console.log('complete')
                SceneManager.next();
            });

        this.startButton.onClick = async e => {
            this.startButton.setActive(false);
            tween2.start();
            await Engine.wait(1000);
            this.subtitle.setVisibility(false);
            await Engine.wait(300);
            this.title.setVisibility(false);
        }

        await Engine.wait(1000);
        tween.start();
        await Engine.wait(1000);
        this.title.setActive(true);
        await Engine.wait(2000);
        this.subtitle.setActive(true);
        await Engine.wait(2000);
        this.startButton.setActive(true);

    }
})