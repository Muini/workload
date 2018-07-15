import Engine from './engine/engine';
import SceneManager from './engine/sceneManager';
import './materials/index';

//================
// Scenes
// 
// Register scene here
//================
import CityScene from './scenes/city.scene';
SceneManager.register(CityScene);
import WorkloadScene from './scenes/workload.scene';
SceneManager.register(WorkloadScene);

//================
// Load scene & Start Engine
//================
Engine.init(document.getElementById('film'));
Engine.setFixedRatio(2 / 1);

// Set Scene will start the loading process of scenes
SceneManager.setOrder([
    'workload',
    'city',
]);

// Start the engine ; It will start the preloading and launch the first scene
Engine.start();