import * as THREE from 'three';

// Engine
import Engine from '../engine/core/engine';
import MaterialManager from '../engine/core/materialManager';
import Scene from '../engine/classes/scene';
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

// Create scene
export default new Scene({
    name: 'workload',
    data: {},
    setup: function() {

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
        this.camera.model.rotation.y = 3.14;
        this.camera.instance.rotation.x = -(30 / 180) * 3.14;

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
            resolution: 16,
            position: new THREE.Vector3(0, 4, 0),
            shouldUpdate: false,
            tickRate: 2,
        });

        // Floor
        let floorGeometry = new THREE.PlaneGeometry(150, 150, 1, 1);
        let floorMaterial = MaterialManager.get('Floor').instance;
        let plane = new THREE.Mesh(floorGeometry, floorMaterial);
        plane.name = "Floor";
        plane.rotation.x = -3.14 / 2;
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
            power: 10.0,
        })

        this.instance.fog = new THREE.FogExp2(0x30364c, 0.001);

        this.clock = new Clock({ parent: this });

        // Test Worker
        this.worker = new Worker({ parent: this, position: new THREE.Vector3(0, 0.0, 6.0) });
        this.worker2 = new Worker({ parent: this, position: new THREE.Vector3(0, 0.0, 0.0) });
        this.worker3 = new Worker({ parent: this, position: new THREE.Vector3(0, 0.0, -6.0) });
        this.worker4 = new Worker({ parent: this, position: new THREE.Vector3(-8.0, 0, 6.0) });
        this.worker5 = new Worker({ parent: this, position: new THREE.Vector3(-8.0, 0, 0.0) });
        this.worker6 = new Worker({ parent: this, position: new THREE.Vector3(-8.0, 0, -6.0) });
        this.worker7 = new Worker({ parent: this, position: new THREE.Vector3(8.0, 0, 6.0) });
        this.worker8 = new Worker({ parent: this, position: new THREE.Vector3(8.0, 0, 0.0) });
        this.worker9 = new Worker({ parent: this, position: new THREE.Vector3(8.0, 0, -6.0) });


    },
    onStart: async function() {
        // await Engine.wait(1000)

        let tween = new Tween({ x:0, y:40, z:-60, aperture: 1.8 })
            .to({ x:0, y:20, z:-30, aperture: 3.5 }, 2000)
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
                this.RTSCameraMovement.moveTo(new THREE.Vector3(0, 20, -30));
                // await Engine.wait(3000)
                // this.RTSCameraMovement.disableControls();
                // this.RTSCameraMovement.moveTo(new THREE.Vector3(0, 20, -30));
                // this.RTSCameraMovement.setFovTo(30);
            })
            .start();
    }
});