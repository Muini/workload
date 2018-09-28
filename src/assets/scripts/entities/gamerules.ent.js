import * as THREE from 'three';

import Engine from '../../engine/core/engine';

import Entity from '../engine/classes/entity';
import Data from '../engine/utils/data';

export class Exemple extends Entity {
    constructor(opt = {}) {
        super(opt);

        //Init variables
        this.name = 'gamerules';

        this.data = new Data({
            safeMoney: 0,
            workerNbr: 0,
            turn: 0,
            costOfWorkerPerDay: 2, //in k€
            costForNewWorker: 10, //in k€
            workerProductivity: 6, //in k€
            timeIsGoingOn: false,
            gameTimeElapsed: 0,
            timeOfTheDay: 0, //from 0 to 23
            lengthOfADay: 900, //in ms
        });

        this.data.compute('gameTimeElapsed', _ => {
            this.data.timeOfTheDay = Math.floor(this.data.gameTimeElapsed / this.data.lengthOfADay * 24);
        });
    }

    gatherMoney(){

    }

    created() {
        return (async () => {
            await super.created();
            // Is fired when the entity is created after assets are loaded
        })();
    }

    awake() {
        return (async () => {
            await super.awake();
            // Is fired when the scene is starting
        })();
    }

    update(time, delta) {
        super.update(time, delta);

        if(this.data.timeIsGoingOn){
            this.gameTimeElapsed += delta;
        }
    }

}