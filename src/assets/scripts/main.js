import * as THREE from 'three';

import Engine from './engine/engine';

//================
// Scenes
//================
import WorkloadScene from './scenes/workload.scene';
Engine.registerScene(WorkloadScene);


// Load scene & Start Engine
Engine.appendCanvas(document.getElementById('main'));
Engine.setScene('workload', _ => {
    // console.log(Engine.currentScene.instance)
    Engine.start();
});