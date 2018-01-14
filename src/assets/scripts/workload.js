import * as THREE from 'three';

import Engine from './engine/engine';
import Scene from './engine/scene';

import Worker from './objects/worker';

// Create scene
let mainScene = new Scene({ name: 'Workload' });

// Create & Add camera
let cameraController = new THREE.Group();
cameraController.name = 'CameraController';
cameraController.position.x = 15;
cameraController.position.y = 15;
cameraController.position.z = 15;
cameraController.rotation.y = (45 / 180) * 3.14;

// let camera = new THREE.PerspectiveCamera(50, Engine.width / Engine.height, 1, 180000);
let camera = new THREE.OrthographicCamera(Engine.width / -150, Engine.width / 150, Engine.height / 150, Engine.height / -150, 1, 180000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 0;
camera.rotation.x = -(30 / 180) * 3.14;
camera.name = 'Camera';

cameraController.add(camera);

// mainScene.addObject(cameraController);
mainScene.setCamera(camera);
mainScene.instance.add(cameraController);

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
mainScene.instance.add(plane);

// Ambient Light
var ambientLight = new THREE.HemisphereLight(0x343c57, 0x323b2e, 1.);
mainScene.instance.add(ambientLight);

// Test Worker
let worker = new Worker();
mainScene.addObject(worker);

// Load scene & Start Engine
Engine.appendCanvas(document.getElementById('main'));
Engine.setScene(mainScene, _ => {
    // console.log(Engine.currentScene.instance)
    Engine.start();
});