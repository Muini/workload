import * as THREE from 'three';

// Engine
import Engine from '../engine/engine';
import Scene from '../engine/scene';
import { Ease, Tween } from '../engine/tween';

// Objects
import { Camera } from '../objects/default/camera.obj';
import { Light } from '../objects/default/light.obj';
import { Cubemap } from '../objects/default/cubemap.obj';
import { Worker } from '../objects/worker.obj';

// Dom Objects
import { ExempleDom } from '../objects/default/exemple.dom.obj';

// Create scene
export default new Scene({
    name: 'workload',
    data: {},
    setup: function() {
        // Create & Add camera
        this.camera = new Camera({
            parent: this,
            position: new THREE.Vector3(50, 45, 50),
            rotation: new THREE.Vector3(0, 0, 0),
            focalLength: 50,
            focus: 42.0, //42
            aperture: 1.2,
        });
        this.camera.model.rotation.y = (45 / 180) * 3.14;
        this.camera.instance.rotation.x = -(30 / 180) * 3.14;

        let cubemap = new Cubemap({
            parent: this,
            near: 1,
            far: 500,
            resolution: 128,
            position: new THREE.Vector3(0, 4, 0),
            shouldUpdate: false,
            tickRate: 2,
        });

        // Floor
        let floorGeometry = new THREE.PlaneGeometry(150, 150, 1, 1);
        let floorMaterial = new THREE.MeshStandardMaterial({
            name: 'Floor',
            color: new THREE.Color(0x383733),
            roughness: .9,
            metalness: .0,
            dithering: true,
        })
        let plane = new THREE.Mesh(floorGeometry, floorMaterial);
        plane.name = "Floor";
        plane.rotation.x = -3.14 / 2;
        plane.castShadow = true;
        plane.receiveShadow = true;
        this.instance.add(plane);

        // Ambient Light
        let ambiantLight = new Light({
            name: 'Ambient Light',
            parent: this,
            type: 'ambient',
            color: '222e56',
            colorGround: '323b2e',
            power: 5.0,
        })

        this.instance.fog = new THREE.FogExp2(0x30364c, 0.001);

        // Test Worker
        this.worker = new Worker({ parent: this });

        this.worker2 = new Worker({ parent: this, position: new THREE.Vector3(-8.0, 0.0, -8.0) });
        this.worker2.happiness = 0.4;

        this.worker3 = new Worker({ parent: this, position: new THREE.Vector3(-16.0, 0.0, -16.0) });
        this.worker3.happiness = 0.6;

        this.testdom = new ExempleDom({ parent: this });


    },
    onStart: async function() {
        // await Engine.wait(1000)

        this.testdom.setVisibility(false);

        let tween = new Tween({ x:50, y:45, z:50, aperture: 1.2 })
            .to({ x:25, y:26, z:25, aperture: 3.5 }, 2000)
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
                this.testdom.setVisibility(true);
                this.worker.addWork(10);
                await Engine.wait(200);
                this.worker2.addWork(10);
                await Engine.wait(200);
                this.worker3.addWork(10);
            })
            .start();
    }
});