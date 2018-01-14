import * as THREE from 'three';

import Engine from './engine/engine';
import Scene from './engine/scene';

// Create scene
let mainScene = new Scene({
    onLoaded: _ => {}
});

// Create & Add camera
let cameraController = new THREE.Group();
cameraController.name = 'CameraController';
cameraController.position.z = 1000;

let camera = new THREE.PerspectiveCamera(50, Engine.width / Engine.height, 1, 180000);
camera.position.z = 0;
camera.position.y = 0;
camera.position.x = 0;
camera.name = 'Camera';

cameraController.add(camera);

mainScene.addObject(cameraController);
mainScene.setCamera(camera);

// Start Engine
Engine.appendCanvas(document.getElementById('main'));

Engine.setScene(mainScene);
Engine.start();