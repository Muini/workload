import * as THREE from 'three';

// Engine
import Engine from '../engine/engine';
import Scene from '../engine/scene';
import { Easing, Tween } from 'es6-tween';

// Objects
import { Camera } from '../objects/camera.obj';
import { Cubemap } from '../objects/cubemap.obj';
import { Sky } from '../objects/sky.obj';
import { City } from '../objects/city.obj';

// Dom Objects

// Create scene
export default new Scene({
    name: 'intro.plan1',
    data: {},
    setup: function() {
        // Create & Add camera
        this.camera = new Camera({
            parent: this,
            position: new THREE.Vector3(0, 22, 48),
            rotation: new THREE.Vector3(0, 0, 0),
            focalLength: 40,
            aperture: 4.0,
            focus: 76.0, //76.0 //32.0
            far: 500,
        });

        let cubemap = new Cubemap({
            parent: this,
            near: 1,
            far: 500,
            resolution: Engine.isMobile ? 16 : 64,
            position: new THREE.Vector3(0, 35, 30),
            shouldUpdate: false,
            tickRate: 4,
        });


        // Ambient Light
        let ambiantLight = new THREE.HemisphereLight(0x222e56, 0x323b2e, 10.0);
        ambiantLight.name = "Ambient Light";
        this.instance.add(ambiantLight);

        // Sun
        this.sun = new THREE.DirectionalLight(0xFFF4E6, 8.0);
        this.sun.name = "Sun";
        this.sun.position.x = 0;
        this.sun.position.y = 100;
        this.sun.position.z = 0;
        this.sun.castShadow = Engine.isMobile ? false : true;
        this.instance.add(this.sun);

        this.sun.shadow.mapSize.width = Engine.isMobile ? 512 : 1024; // default
        this.sun.shadow.mapSize.height = Engine.isMobile ? 512 : 1024; // default
        this.sun.shadow.camera.near = 1.0; // default
        this.sun.shadow.camera.far = 150; // default
        let size = 80.0;
        this.sun.shadow.camera.left = -size; // default
        this.sun.shadow.camera.right = size; // default
        this.sun.shadow.camera.top = size; // default
        this.sun.shadow.camera.bottom = -size; // default
        // this.sun.shadow.bias = 0.0025;

        let sky = new Sky({
            parent: this,
            size: 1000,
            sunPosition: this.sun.position,
            turbidity: 2.5,
            rayleight: 2.5,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.9
        })

        this.instance.fog = new THREE.FogExp2(0xd3dee5, 0.006);

        this.city = new City({ parent: this });

    },
    onStart: function() {
        // this.camera.model.rotation.y = (0 / 180) * 3.14;
        // this.camera.instance.rotation.x = -(10 / 180) * 3.14;
        this.setCamera(this.camera.instance);
        let sunTarget = new THREE.Object3D();
        sunTarget.position.x = 22.0;
        sunTarget.position.y = 20;
        sunTarget.position.z = -45;
        this.instance.add(sunTarget);
        this.sun.target = sunTarget;

        /*let tween = new Tween({ y: 30, z: 48 })
            .to({ y: 22, z: 44 }, 3000)
            .repeat(Infinity)
            .yoyo(true)
            .easing(Easing.Cubic.InOut)
            .on('update', ({ y, z }) => {
                this.camera.model.position.y = y;
                this.camera.model.position.z = z;
                this.camera.focus = 48 * 76 / z
            })
            .start();*/
    }
})