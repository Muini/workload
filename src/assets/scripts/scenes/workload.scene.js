import * as THREE from 'three';

// Engine
import Engine from '../engine/engine';
import Scene from '../engine/scene';

// Objects
import { Worker } from '../objects/worker.obj';

// Dom Objects
import { ExempleDom } from '../objects/exemple.dom.obj';

// Create scene
export default new Scene({
    name: 'workload',
    data: {},
    setup: function() {
        // Create & Add camera
        let cameraController = new THREE.Group();
        cameraController.name = 'CameraController';
        cameraController.position.x = 10;
        cameraController.position.y = 11;
        cameraController.position.z = 10;
        cameraController.rotation.y = (45 / 180) * 3.14;

        let camera = new THREE.PerspectiveCamera(40, Engine.width / Engine.height, 1, 100);
        /*let cameraDistance = 150 * Engine.height / 1000;
        let camera = new THREE.OrthographicCamera(Engine.width / -cameraDistance, Engine.width / cameraDistance, Engine.height / cameraDistance, Engine.height / -cameraDistance, 1, 1500);
        Engine.addToResize(_ => {
            camera.distance = 150 * Engine.height / 1000;
        })
        camera.distance = cameraDistance;*/
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 0;
        camera.rotation.x = -(30 / 180) * 3.14;
        camera.setFocalLength(30); //30mm
        camera.focusDistance = 30.0;
        camera.aperture = 2.8;
        camera.name = 'Camera';

        cameraController.add(camera);

        this.setCamera(camera);
        this.instance.add(cameraController);

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
        plane.rotation.x = -3.14 / 2;
        plane.castShadow = true;
        plane.receiveShadow = true;
        this.instance.add(plane);

        // Ambient Light
        let ambientLight = new THREE.HemisphereLight(0x222e56, 0x323b2e, 5);
        this.instance.add(ambientLight);

        // Test Worker
        this.worker = new Worker({ parent: this });

        let work3 = new Worker({ parent: this, position: new THREE.Vector3(-8.0, 0.0, -8.0) });

        let work5 = new Worker({ parent: this, position: new THREE.Vector3(-16.0, 0.0, -16.0) });

        this.testdom = new ExempleDom({ parent: this });


    },
    onStart: function() {}
});