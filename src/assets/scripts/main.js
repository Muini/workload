import Engine from './engine/core/engine';
import SceneManager from './engine/core/sceneManager';
import Loader from './engine/core/loader';
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
(async() => {
    await requestAnimationFrame(async _ => {

        await Engine.init(
            document.getElementById('film'), //Container
            (2 / 1) //Film Ratio
        );

        // Set Scene will start the loading process of scenes
        SceneManager.setOrder([
            'workload',
            //'worker-test', //This is the name of the scene, not of the file
            // 'city',
        ]);

        await Loader.show();

        // Start the engine ; It will start the preloading and launch the first scene
        await Engine.start();
    });
})();