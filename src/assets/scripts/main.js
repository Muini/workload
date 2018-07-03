import Engine from './engine/engine';

//================
// Scenes
// 
// Register scene here
//================
import CityScene from './scenes/city.scene';
Engine.registerScene(CityScene);
import WorkloadScene from './scenes/workload.scene';
Engine.registerScene(WorkloadScene);

//================
// Load scene & Start Engine
//================
Engine.init(document.getElementById('film'));
Engine.setFixedRatio(2 / 1);

// Set Scene will start the loading process of scenes
Engine.setScenesOrder([
    'workload',
    'city',
]);

// Start the engine ; It will start the preloading and launch the first scene
Engine.start();