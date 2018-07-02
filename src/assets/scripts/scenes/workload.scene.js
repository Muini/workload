import * as THREE from 'three';

// Engine
import Engine from '../engine/engine';
import Scene from '../engine/scene';

// Objects
import { Camera } from '../objects/default/camera.obj';
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
            position: new THREE.Vector3(10, 11, 10),
            rotation: new THREE.Vector3(0, 0, 0),
            focalLength: 50,
            focus: 16.0,
            aperture: 3.5,
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
        let ambiantLight = new THREE.HemisphereLight(0x222e56, 0x323b2e, 5);
        ambiantLight.name = "Ambient Light";
        this.instance.add(ambiantLight);

        // Test Worker
        this.worker = new Worker({ parent: this });

        let work3 = new Worker({ parent: this, position: new THREE.Vector3(-8.0, 0.0, -8.0) });

        let work5 = new Worker({ parent: this, position: new THREE.Vector3(-16.0, 0.0, -16.0) });

        this.testdom = new ExempleDom({ parent: this });


    },
    onStart: function() {
        this.camera.model.rotation.y = (45 / 180) * 3.14;
        this.camera.instance.rotation.x = -(30 / 180) * 3.14;
        this.setCamera(this.camera.instance);

        // setTimeout(_ => { Engine.nextScene(); }, 3000);
    }
});