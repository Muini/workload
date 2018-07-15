import * as THREE from 'three';

// Engine
import Engine from '../engine/engine';
import Scene from '../engine/scene';
import SceneManager from '../engine/sceneManager';
import Sound from '../engine/sound';
import { Ease, Tween } from '../engine/tween';

// Objects
import { Camera } from '../objects/default/camera.obj';
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
            position: new THREE.Vector3(0, 30, 62),
            rotation: new THREE.Vector3(0, 0, 0),
            focalLength: 45,
            aperture: 10.0,
            focus: 55.0, //76.0 //32.0
            far: 500,
        });

        this.mapTarget = new THREE.AxesHelper(2);
        this.mapTarget.position.y = 22;
        this.mapTarget.position.z = 7;
        this.mapTarget.visible = false;
        this.instance.add(this.mapTarget);

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
        let ambiantLight = new THREE.HemisphereLight(0x222e56, 0x323b2e, 10.0);
        ambiantLight.name = "Ambient Light";
        this.instance.add(ambiantLight);

        // Sun
        this.sun = new THREE.DirectionalLight(0xFFF4E6, 10.0);
        this.sun.name = "Sun";
        this.sun.position.x = -30;
        this.sun.position.y = 100;
        this.sun.position.z = 30;
        this.sun.castShadow = Engine.isMobile ? false : true;
        this.instance.add(this.sun);

        this.sun.shadow.mapSize.width = Engine.quality < 4 ? 512 : 1024; // default
        this.sun.shadow.mapSize.height = Engine.quality < 4 ? 512 : 1024; // default
        this.sun.shadow.camera.near = 1.0; // default
        this.sun.shadow.camera.far = 150; // default
        let size = 50.0;
        this.sun.shadow.camera.left = -size; // default
        this.sun.shadow.camera.right = size; // default
        this.sun.shadow.camera.top = size; // default
        this.sun.shadow.camera.bottom = -size; // default
        // this.sun.shadow.bias = -0.0025;

        let sky = new Sky({
            parent: this,
            size: 1000,
            sunPosition: this.sun.position,
            turbidity: 1.0,
            rayleight: 10.0,
            mieCoefficient: 0.01,
            mieDirectionalG: 0.75
        })

        this.instance.fog = new THREE.FogExp2(0xd2dbe0, 0.0075);

        this.city = new City({ parent: this });

        this.citySound = new Sound({
            name: 'city-loop',
            parent: this,
            url: '/static/sounds/city-loop.m4a',
            loop: true,
            volume: 0.4,
        });

        this.title = new TitleDom({ parent: this });
        this.subtitle = new SubtitleDom({ parent: this });

    },
    onStart: async function() {
        // this.camera.model.rotation.y = (0 / 180) * 3.14;
        // this.camera.instance.rotation.x = -(10 / 180) * 3.14;
        this.setCamera(this.camera.instance);

        let sunTarget = new THREE.Object3D();
        sunTarget.position.x = 12.0;
        sunTarget.position.y = 20;
        sunTarget.position.z = -30;
        this.instance.add(sunTarget);
        this.sun.target = sunTarget;

        this.citySound.play(1000);

        this.title.setVisibility(false)
        this.subtitle.setVisibility(false)

        let tween = new Tween({ y:30, z:62 })
            .to({ y: 22, z: 10 }, 6000)
            // .repeat(Infinity)
            // .yoyo(true)
            .ease(Ease.Expo.In)
            .onUpdate((props, progress) => {
                // console.log('update', props.y, props.z, progress)
                this.camera.model.position.y = props.y;
                this.camera.model.position.z = props.z;
                this.camera.focus = this.mapTarget.position.distanceTo(this.camera.model.position);
                if (Engine.postprod && Engine.postprod.bokehPass)
                    Engine.postprod.bokehPass.uniforms['focusDistance'].value = this.camera.focus;
            })
            .onComplete( _ => {
                // console.log('complete')
                SceneManager.next();
            });
        
        await Engine.wait(2000);
        tween.start();
        await Engine.wait(1000);
        this.title.setVisibility(true);
        await Engine.wait(1000);
        this.subtitle.setVisibility(true);
        await Engine.wait(3000);
        this.title.setVisibility(false);
        this.subtitle.setVisibility(false);

    }
})