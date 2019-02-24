import Engine from './engine/core/engine';
import SceneManager from './engine/core/sceneManager';
import './materials/index';

//================
// Scenes
// 
// Register scene here
//================
import './scenes/city.scene';
import './scenes/workload.scene';
import './scenes/worker-test.scene';

//================
// Load scene & Start Engine
//================
(async _ => {
    await Engine.init(
        document.getElementById('film'), //Container
        (2 / 1) //Film Ratio
    );

    // Set Scene will start the loading process of scenes
    SceneManager.setOrder([
        'city',
        'workload',
        'worker-test', //This is the name of the scene, not of the file
    ]);

    await SceneManager.preloadAllScenes();

    // Start the engine ; It will start the preloading and launch the first scene
    await Engine.start();
})();