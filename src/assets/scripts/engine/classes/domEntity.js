import Engine from '../core/engine';
import UUID from '../utils/uuid';
import Log from '../utils/log';

const mustachRegEx = new RegExp(/{{\s*[\w\.]+\s*}}/g);

// TODO: Make the dom inherit the Entity class
export default class DomEntity {
    constructor(opt = {
        selector,
        parent,
        active,
    }) {
        this.uuid = UUID();
        this.name = 'unnamed dom entity';

        this.selector = opt.selector || undefined;
        this.dom = undefined;
        // TODO: Datas for every Entity & OnDataChanged function
        this.data = {};

        this.isActive = opt.active || false;
        this.isVisible = false;
        this.isDomEntity = true;

        this.parent = opt.parent || null;
        if (!this.parent) {
            if (this.constructor.name != 'Loader')
                Log.push('warn', this.constructor.name, `DomEntity parameter "parent" is mandatory and should be a Entity or Scene type`);
        } else {
            this.scene = this.parent.isScene ? this.parent : this.parent.scene;
            this.scene.addEntity(this);
            this.parent.addChildren(this);
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
        if (this.dom){
            if(bool === true){
                if (!this.isLoader) {
                    Engine.waitNextTick().then(_ => {
                        this.dom.style['visibility'] = bool ? 'visible' : 'hidden';
                    });
                } else {
                    requestAnimationFrame(_ => {
                        this.dom.style['visibility'] = bool ? 'visible' : 'hidden';
                    });
                }
                
            }else{
                this.dom.style['visibility'] = bool ? 'visible' : 'hidden';
            }
        }
        this.isVisible = bool;
    }

    setActive(bool) {
        this.isActive = bool;
        if (this.isActive) {
            if (!this._isUpdating) {
                if (!this.isLoader)
                    Engine.addToUpdate(this.uuid, this.update.bind(this));
                this._isUpdating = true;
            }
        } else {
            if (this._isUpdating) {
                if (!this.isLoader)
                    Engine.removeFromUpdate(this.uuid);
                this._isUpdating = false;
            }
        }
        this.setVisibility(bool);
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

            if (this.scene && this.scene.isPlaying) {
                await this.awake();
            }
        })();
    }

    // Awake happen when the scene is loaded into the engine & started to be used
    awake() {
        return (async() => {
            this.setActive(this.isActive);
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

    update(time, delta) {}

    destroy() {
        this.setActive(false);
        this.dom = null;
        this.selector = null;
    }
}