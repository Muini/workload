import UUID from "../utils/uuid";

let Entity = function () {
    return {
        uuid: UUID(),
        components: [], // List of components a.k.a componentes database
    }
}

let Components = function(data){
    return {
        uuid: UUID(),
        data
    }
}

let System = function(){
    return {
        entities: [],
        start: _ => {},
        update: (time, deltaTime) => {}
    }
}

let Scene = function(){

    let _i = 0;
    return {
        uuid: UUID(),
        scene: 0,
        index: 0,
        entities: [], // List of entities a.k.a entities database
        start: _ => {
            _i = this.entities.length;
            while (_i--) {
                this.entities[i].start(time, deltaTime);
            }
        },
        update: (time, deltaTime) => {
            _i = this.entities.length;
            while (_i--) {
                this.entities[i].update(time, deltaTime);
            }
        }
    }
}


let Engine = function(){

    return {
        scenes: [], // List of scenes a.k.a scenes database
        currentSceneIndex: 0,
        start: _ => {
            this.scenes[currentSceneIndex].start();
        },
        update: (time, deltaTime) => {
            this.scenes[currentSceneIndex].update(time, deltaTime);
        }
    }
    
}
