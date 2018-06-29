import * as THREE from 'three';

// Engine
import Engine from '../engine/engine';
import Scene from '../engine/scene';
import Sound from '../engine/sound';

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
            position: new THREE.Vector3(0, 80, 20),
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
        this.sun.position.x = 0;
        this.sun.position.y = 100;
        this.sun.position.z = 0;
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
            turbidity: 2.5,
            rayleight: 2.5,
            mieCoefficient: 0.01,
            mieDirectionalG: 0.9
        })

        this.instance.fog = new THREE.FogExp2(0xDAE1E5, 0.0075);

        this.city = new City({ parent: this });

        let citySound = new Sound({
            name: 'city-loop',
            parent: this,
            url: '/static/sounds/city-loop.m4a',
            loop: true,
            volume: 0.4,
        });

        this.title = new TitleDom({ parent: this });
        this.subtitle = new SubtitleDom({ parent: this });

    },
    onStart: function() {
        // this.camera.model.rotation.y = (0 / 180) * 3.14;
        // this.camera.instance.rotation.x = -(10 / 180) * 3.14;
        this.setCamera(this.camera.instance);

        let sunTarget = new THREE.Object3D();
        sunTarget.position.x = 12.0;
        sunTarget.position.y = 20;
        sunTarget.position.z = -30;
        this.instance.add(sunTarget);
        this.sun.target = sunTarget;

        // this.sounds['city-loop'].play();


        let tween = new Engine.Tween({ y: 30, z: 62 })
            .to({ y: 22, z: 30 }, 6000)
            // .repeat(Infinity)
            // .yoyo(true)
            .easing(Engine.Easing.Cubic.InOut)
            .on('update', ({ y, z }) => {
                this.camera.model.position.y = y;
                this.camera.model.position.z = z;
                this.camera.focus = this.mapTarget.position.distanceTo(this.camera.model.position);
                if (Engine.postprod.bokehPass)
                    Engine.postprod.bokehPass.uniforms['focusDistance'].value = this.camera.focus;
            })
            .on('complete', _ => {
                Engine.nextScene();
            })
            .start();

    }
})