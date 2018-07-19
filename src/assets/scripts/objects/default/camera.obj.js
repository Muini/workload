import * as THREE from 'three';

import Engine from '../../engine/engine';
import Obj from '../../engine/obj';

// TODO: make the camera virtual, only data driven. If active, it updates the scene camera
export class Camera extends Obj {
    constructor(opt = {}) {
        super(opt);
    }

    init(opt) {
        this.params = {
            near: opt.near || 1.0,
            far: opt.far || 1000.0,
            focalLength: opt.focalLength || 30,
            aperture: opt.aperture || 2.8,
            focus: opt.focus || 100.0,
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

        super.init(opt);

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
        if (!Engine.postprod || !Engine.postprod.bokehPass) return;
        if (param == 'focalLength') {
            Engine.postprod.bokehPass.uniforms[param].value = this.instance.getFocalLength();
        } else {
            Engine.postprod.bokehPass.uniforms[param].value = this.instance[param];
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
            // Is fired when the object is added to the scene
        })();
    }

    update(time, delta) {
        super.update(time, delta);

        this.updateMAP();
    }

}