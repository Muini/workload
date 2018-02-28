import * as THREE from 'three';

import Engine from '../engine/engine';
import Scene from '../engine/scene';

import { Worker } from '../objects/worker.obj';

// Create scene
export default new Scene({
    name: 'workload',
    setup: function() {
        // Create & Add camera
        let cameraController = new THREE.Group();
        cameraController.name = 'CameraController';
        cameraController.position.x = 15;
        cameraController.position.y = 15;
        cameraController.position.z = 15;
        cameraController.rotation.y = (45 / 180) * 3.14;

        // let camera = new THREE.PerspectiveCamera(50, Engine.width / Engine.height, 1, 180000);
        let cameraDistance = 150 * Engine.height / 1000;
        let camera = new THREE.OrthographicCamera(Engine.width / -cameraDistance, Engine.width / cameraDistance, Engine.height / cameraDistance, Engine.height / -cameraDistance, 1, 180000);
        camera.distance = cameraDistance;
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 0;
        camera.rotation.x = -(30 / 180) * 3.14;
        camera.name = 'Camera';

        cameraController.add(camera);

        // mainScene.addObject(cameraController);
        this.setCamera(camera);
        this.instance.add(cameraController);

        // Floor
        var floorGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
        var floorMaterial = new THREE.MeshStandardMaterial({
            name: 'Floor',
            color: new THREE.Color(0x383733),
            roughness: .9,
            metalness: .0,
            dithering: true,
        })
        var plane = new THREE.Mesh(floorGeometry, floorMaterial);
        plane.rotation.x = -3.14 / 2;
        plane.castShadow = true;
        plane.receiveShadow = true;
        this.instance.add(plane);

        // Ambient Light
        var ambientLight = new THREE.HemisphereLight(0x343c57, 0x323b2e, 1.2);
        this.instance.add(ambientLight);

        // Test Worker
        let worker = new Worker({ scene: this });

    },
});