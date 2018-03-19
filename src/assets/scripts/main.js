import Engine from './engine/engine';

//================
// Scenes
// 
// Register scene here, order is important has it follows it to loads them
//================
import IntroPlan1 from './scenes/intro.plan1.scene';
Engine.registerScene(IntroPlan1);
import WorkloadScene from './scenes/workload.scene';
Engine.registerScene(WorkloadScene);

//================
// Load scene & Start Engine
//================
Engine.init(document.getElementById('film'));
Engine.setFixedRatio(2 / 1);
// Set Scene will start the loading process of scenes
// You can do it by using Engine.preloadScenes()
Engine.setScene('intro.plan1', _ => {
    Engine.start();
});