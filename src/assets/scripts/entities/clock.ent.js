
import Model from '../engine/classes/model';
import { Light } from './default/light.ent';

export class Clock extends Model {
    constructor(opt = {}) {
        super(opt);

        //Init variables
        this.name = 'clock';
        this.modelName = 'clock.model';
        this.hasShadows = true;

        // Init materials to be overwrite by name, second argument is 'isInstancedMaterial'
        this.addMaterial('ABS');
        this.addMaterial('Clock_color');
        this.addMaterial('Bonhomme');

        this.lengthOfADay = opt.lengthOfADay || 1000;

        this.timeElapsed = 0.0;
        this.hours = 0.0;
        this.minutes = 0.0;

        this.isTurning = false;

        // Init lights to be overwrite by namenew Light({
        new Light({
            name: 'Clock_Spot',
            type: 'spot',
            parent: this,
            color: 'CBFFE4',
            power: 2,
            fov: .4,
            castShadow: false,
        })
    }

    created() {
        return (async () => {
            await super.created();

            this.hoursmodel = await this.getChildModel('Clock_hours');
            this.hoursmodel = this.hoursmodel[0];
            this.minutesmodel = await this.getChildModel('Clock_minutes');
            this.minutesmodel = this.minutesmodel[0];
            this.centermodel = await this.getChildModel('Clock_ticks');
            this.centermodel = this.centermodel[0];
            
            this.lights.get('Clock_Spot').setTarget(this.centermodel);

            this.calcTime();
        })();
    }

    awake() {
        return (async () => {
            await super.awake();
            // Is fired when the scene is starting
        })();
    }

    resetTime(){
        this.timeElapsed = 0;
        this.calcTime();
    }

    calcTime(){
        this.minutes = this.timeElapsed / this.lengthOfADay * 1440;
        this.hours = this.minutes / 60;
        this.minutesmodel.rotation.y = (-Math.PI * 0.5) + -Math.PI * (this.minutes / 60)
        this.hoursmodel.rotation.y = (-Math.PI * 0.5) + -Math.PI * 2 * (this.hours / 24);
    }

    update(time, delta) {
        if(!this.isTurning) return;

        super.update(time, delta);

        this.timeElapsed += delta;

        this.calcTime();
    }

}