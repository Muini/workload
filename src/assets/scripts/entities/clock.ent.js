
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
        this.addMaterial('ABS', true);
        this.addMaterial('Clock_color', true);
        this.addMaterial('Bonhomme', true);

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
        })();
    }

    awake() {
        return (async () => {
            await super.awake();
            // Is fired when the scene is starting
            // this.lights.get('Clock_Spot').setVisibility(false);
        })();
    }

    update(time, delta) {
        super.update(time, delta);

        this.minutesmodel.rotation.y -= 0.001 * delta;
        this.hoursmodel.rotation.y -= 0.0001 * delta;
    }

}