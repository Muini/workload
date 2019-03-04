
import Entity from '../engine/classes/entity';
import Data from '../engine/utils/data';

export class Gamerules extends Entity {
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
            dayTimeElapsed: 0,
            gameTimeElapsed: 0,
            lengthOfADay: 1000, //in ms
            timeOfTheDay: function(){
                return Math.floor(this.dayTimeElapsed / this.lengthOfADay * 24);
            },
            isNight: function(){
                if(this.timeOfTheDay < 7 || this.timeOfTheDay > 19){
                    return true
                }else{
                    return false
                }
            }
        });

        console.log('gamerules data', this.data)

        this.onNewTurn = opt.onNewTurn || function(){};
    }

    endTheDay(){
        this.gatherMoney();
        this.canRecruit = true;
        this.data.timeIsGoingOn = false;
    }

    startTheDay(){
        this.canRecruit = false;
        this.data.timeIsGoingOn = true;
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

        this.data.gameTimeElapsed += delta;

        if(!this.data.timeIsGoingOn) return;

        // Time is going on
        this.data.dayTimeElapsed += delta;

        // New turn
        // console.log(this.data, this.data.dayTimeElapsed, this.data.turn, this.data.timeOfTheDay())
        if(this.data.timeOfTheDay() >= 24){
            this.data.dayTimeElapsed = 0;
            this.data.turn++;
            if(typeof this.onNewTurn === 'function')
                this.onNewTurn();
        }
    }

}