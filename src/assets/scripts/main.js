import Engine from './engine/engine';
import SceneManager from './engine/sceneManager';
import './materials/index';
import Loader from './engine/loader';

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
(async() => {
    await requestAnimationFrame(async _ => {

        await Engine.init(document.getElementById('film'));
        Engine.setFixedRatio(2 / 1);

        // Set Scene will start the loading process of scenes
        SceneManager.setOrder([
            'city',
            'workload',
        ]);

        await Loader.show();

        // Start the engine ; It will start the preloading and launch the first scene
        await Engine.start();
    });
})();