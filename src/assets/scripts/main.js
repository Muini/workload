import * as THREE from 'three';

import Engine from './engine/engine';

//================
// Scenes
//================
import IntroPlan1 from './scenes/intro.plan1.scene';
Engine.registerScene(IntroPlan1);
import WorkloadScene from './scenes/workload.scene';
Engine.registerScene(WorkloadScene);

//================
// Load scene & Start Engine
//================
Engine.setFixedRatio(16 / 9);
Engine.appendCanvas(document.getElementById('main'));
Engine.setScene('workload', _ => {
    Engine.start();
});