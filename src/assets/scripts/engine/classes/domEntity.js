import * as THREE from 'three';
import Engine from '../core/engine';
import Entity from './entity';

const mustachRegEx = new RegExp(/{{\s*[\w\.]+\s*}}/g);

// TODO: Make the dom inherit the Entity class
export default class DomEntity extends Entity {
    constructor(opt) {
        super(opt);

        this.name = opt.name || 'unnamed dom entity';

        this.selector = opt.selector || undefined;
        this.follow = opt.follow || false;
        this.dom = undefined;
        
        this.isDomEntity = true;
        this.debug = opt.debug || false;

        if(this.debug){
            this.model.add(new THREE.AxesHelper(1));
        }

        this._vars = {};
        this._classes = {};

        this._isUpdating = false;

        this.onDataChanged = function() {};
        this.onClick = function() {};

        if (this.selector) {
            this.dom = document.querySelector(this.selector);
        }

        this.bindEvents();
    }

    bindEvents(){
        this.dom.addEventListener('click', e => {
            e.preventDefault();
            this.onClick(e);
        }, false);
    }

    setVisibility(bool) {
        super.setVisibility(bool);
        if (this.dom){
            if(bool){
                if (!this.isLoader) {
                    Engine.waitNextTick().then(_ => {
                        this.dom.style['display'] = bool ? '' : 'none';
                    });
                } else {
                    requestAnimationFrame(_ => {
                        this.dom.style['display'] = bool ? '' : 'none';
                    });
                }
                
            }else{
                this.dom.style['display'] = bool ? '' : 'none';
            }
        }
    }

    setActive(bool) {
        super.setActive(bool);
    }

    created() {
        return (async() => {
            if (!this.dom) return;
            // Parse Dom to look for data
            await this.parseDom();
            // Watch data
            for (let data in this.data) {
                this.data.watch(data, (id, oldval, newval) => {
                    if (newval !== oldval) {
                        if (!this.isLoader){
                            Engine.waitNextTick().then(_ => {
                                this.updateData(id);
                            });
                        }else{
                            requestAnimationFrame(_ => {
                                this.updateData(id);
                            })
                        }
                    }
                    return newval;
                });
            }

            await super.created();
        })();
    }

    // Awake happen when the scene is loaded into the engine & started to be used
    awake() {
        return (async() => {
            await super.awake();
        })();
    }

    parseDom() {
        return (async() => {
            // find text vars
            let texts = await this.dom.querySelectorAll('p,div,span');
            for (let i = 0; i < texts.length; i++) {
                let data = texts[i].textContent;
                let vars = data.match(mustachRegEx);
                if (vars) {
                    vars = vars.map(function(x) {
                        return x.match(/[\w\.]+/)[0];
                    });
                    for (let v = 0; v < vars.length; v++) {
                        if (!this._vars[vars[v]]) {
                            this._vars[vars[v]] = [];
                        }
                        this._vars[vars[v]].push({
                            node: texts[i],
                            exp: data,
                        });
                        await this.updateData(vars[v]);
                    }
                }

            }
            // find class vars
            // TODO: Parse every attributes to find variables
            // let classes = await this.dom.querySelectorAll('*[]');
            
            // console.log(texts, this._vars);

            this._shouldUpdateVars = true;
        })();
    }

    updateData(data) {
        return (async() => {
            if (!this._vars[data] || !this.isActive) return;
            for (let i = 0; i < this._vars[data].length; i++) {
                let phrase = this._vars[data][i].exp.replace(mustachRegEx, (value) => {
                    let single = value.match(/[\w\.]+/)[0];
                    return this.data[single];
                });
                this._vars[data][i].node.textContent = phrase;
            }
            this.onDataChanged();
        })();
    }

    update(time, delta) {
        if(this.follow){
            const pos = this.model.position.project(this.scene.mainCamera);
            const x = (pos.x * (Engine.width / 2)) + (Engine.width / 2);
            const y = -(pos.y * (Engine.height / 2)) + (Engine.height / 2);
            this.dom.style['transform'] = `translateZ(0) translateX(-50%) translateY(-50%) translateX(${x}px) translateY(${y}px)`;
            this.dom.style['webkitTransform'] = `translateZ(0) translateX(-50%) translateY(-50%) translateX(${x}px) translateY(${y}px)`;
        }
    }

    destroy() {
        this.setActive(false);
        this.dom = null;
        this.selector = null;
    }
}