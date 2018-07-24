import * as THREE from 'three';

// Engine
import Engine from '../engine/engine';
import Scene from '../engine/scene';
import SceneManager from '../engine/sceneManager';
import Sound from '../engine/sound';
import { Ease,Tween } from '../engine/tween';

// Objects
import { Camera } from '../objects/default/camera.obj';
import { Light } from '../objects/default/light.obj';
import { Cubemap } from '../objects/default/cubemap.obj';
import { Sky } from '../objects/default/sky.obj';
import { City } from '../objects/city.obj';

// Dom Objects
import { TitleDom } from '../objects/title.dom.obj';
import { SubtitleDom } from '../objects/subtitle.dom.obj';

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
            resolution: 128,
            position: new THREE.Vector3(0, 30, 10),
            shouldUpdate: false,
            tickRate: 2,
        });

        // Ambient Light
        let ambiantLight = new Light({
            name: 'Ambient Light',
            parent: this,
            type: 'ambient',
            color: '222e56',
            colorGround: '323b2e',
            power: 10.0,
        })

        this.sun = new Light({
            name: 'Sun',
            parent: this,
            type: 'directional',
            color: 'FFF4E6',
            power: 8.0,
            castShadow: true,
            shadowMapSize: 1024,
            shadowCameraSize: 50.0,
            position: new THREE.Vector3(-30, 100, 30),
        })
        
        this.sunTarget = new THREE.Object3D();
        this.sunTarget.position.x = 12.0;
        this.sunTarget.position.y = 20;
        this.sunTarget.position.z = -30;
        this.instance.add(this.sunTarget);
        this.sun.setTarget(this.sunTarget)

        let sky = new Sky({
            parent: this,
            size: 1000,
            sunPosition: this.sun.position,
            turbidity: 2.0,
            rayleight: 2.0,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.75
        })

        this.instance.fog = new THREE.FogExp2(0xd2dbe0, 0.002);

        this.city = new City({
            parent: this
        });

        this.citySound = new Sound({
            name: 'city-loop',
            parent: this,
            url: '/static/sounds/city-loop.m4a',
            loop: true,
            volume: 0.4,
        });

        this.title = new TitleDom({
            parent: this
        });
        this.subtitle = new SubtitleDom({
            parent: this
        });

    },
    onStart: async function () {
        
        this.title.setVisibility(false)
        this.subtitle.setVisibility(false)

        this.citySound.play(1000);

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
                tween2.start();
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

        await Engine.wait(1000);
        tween.start();
        await Engine.wait(1000);
        this.title.setVisibility(true);
        await Engine.wait(2000);
        this.subtitle.setVisibility(true);
        await Engine.wait(4000);
        this.title.setVisibility(false);
        this.subtitle.setVisibility(false);

    }
})