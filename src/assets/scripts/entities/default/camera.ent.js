import * as THREE from 'three';

import Engine from '../../engine/core/engine';
import Entity from '../../engine/classes/entity';
import Log from '../../engine/utils/log';

// TODO: make the camera virtual, only data driven. If active, it updates the scene camera
export class Camera extends Entity {
    constructor(opt = {}) {
        super(opt);

        this.params = {
            near: opt.near || 1.0,
            far: opt.far || 1000.0,
            focalLength: opt.focalLength || 30,
            aperture: opt.aperture || 2.8,
            focus: opt.focus || 100.0,
            threshold: 0.01,
        }

        //Init variables
        this.name = 'Camera controller';

        this.isCamera = true;

        this.instance = new THREE.PerspectiveCamera();
        this.instance.setFocalLength(this.params.focalLength);
        this.instance.aspect = Engine.width / Engine.height;
        this.instance.near = this.params.near;
        this.instance.far = this.params.far;
        this.instance.focus = this.params.focus;
        this.instance.aperture = this.params.aperture;
        this.instance.name = 'Camera';

        this.model.add(this.instance);

        this.watchParams();
    }

    watchParams(){
        for(const param in this.params){
            this.params.watch(param, (item, oldval, newval) => {
                if(item == 'focalLength'){
                    this.instance.setFocalLength(newval);
                }else{
                    this.instance[item] = newval;
                }
                this.updateBokehShader(item);
            });
        }
    }

    updateBokehShader(param){
        if (!Engine.postprod || !Engine.postprod.bokeh) return;
        if (param == 'focalLength') {
            Engine.postprod.bokeh.uniforms[param].value = this.instance.getFocalLength();
        } else {
            Engine.postprod.bokeh.uniforms[param].value = this.instance[param];
        }
    }

    setTargetMAP(target){
        this.targetMAP = target;
        this.updateMAP();
    }

    updateMAP(){
        if (!this.targetMAP) return;
        this.params.focus = this.targetMAP.position.distanceTo(this.model.position);
    }

    clearTargetMAP(){
        this.targetMAP = undefined;
    }

    awake() {
        return (async() => {
            await super.awake();

            for (const param in this.params) {
                if (param == 'focalLength') {
                    this.instance.setFocalLength(this.params[param]);
                } else {
                    this.instance[param] = this.params[param];
                }
                this.updateBokehShader(param);
            }

            if (Log.debug) {
                // Add GUI
                let guiChanger = (value, item) => {
                    // console.log(parseFloat(value), item)
                    try {
                        this.params[item] = value;
                    } catch (e) {
                        console.log(e)
                    }
                }

                if (window.gui.__folders['Camera'])
                    window.gui.removeFolder(window.gui.__folders['Camera']);

                let folder = window.gui.addFolder('Camera');
                folder.add(this.params, 'focalLength', 12.0, 200.0).onChange(value => guiChanger(value, 'focalLength'));
                folder.add(this.params, 'near').onChange(value => guiChanger(value, 'near'));
                folder.add(this.params, 'far').onChange(value => guiChanger(value, 'far'));
                folder.add(this.params, 'threshold', 0.0, 0.01).onChange(value => { console.log(value); Engine.postprod.bokeh.uniforms['threshold'].value = value });
                if(!this.targetMAP)
                    folder.add(this.params, 'focus').onChange(value => guiChanger(value, 'focus'));
                folder.add(this.params, 'aperture', 1.0, 22.0).onChange(value => guiChanger(value, 'aperture'));

            }
            // Is fired when the entity is added to the scene
        })();
    }

    update(time, delta) {
        super.update(time, delta);

        this.updateMAP();
    }

}