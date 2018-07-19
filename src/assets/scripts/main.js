import Engine from './engine/engine';
import SceneManager from './engine/sceneManager';
import './materials/index';
import Loader from './engine/loader';

//================
// Scenes
// 
// Register scene here
//================
import './scenes/city.scene';
import './scenes/workload.scene';

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
            'city', //This is the name of the scene, not of the file
            'workload',
        ]);

        await Loader.show();

        // Start the engine ; It will start the preloading and launch the first scene
        await Engine.start();
    });
})();