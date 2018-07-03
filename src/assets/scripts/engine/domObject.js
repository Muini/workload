import Engine from './engine';

const mustachRegEx = new RegExp(/{{\s*[\w\.]+\s*}}/g);

export default class DomObject {
    constructor(opt = {
        parent,
        active,
    }) {
        this.uuid = Engine.uuid();
        this.name = 'unnamed dom object';

        this.selector = undefined;
        this.dom = undefined;
        this.data = {};

        this.isActive = opt.active || true;
        this.isVisible = false;
        this.isDomObject = true;

        this.parent = opt.parent || null;
        if (!this.parent) {
            if (window.DEBUG)
                console.warn('DomObject parameter "parent" is mandatory and should be a Object or Scene type', this)
        } else {
            this.scene = this.parent.isScene ? this.parent : this.parent.scene;
            this.scene.addObject(this);
        }

        this._vars = {};
        this._classes = {};

        this._isUpdating = false;

        this.onDataChanged = function() {};

        this.init();
    }

    // Init happen when the entire project is loaded
    init() {
        if (this.selector) {
            this.dom = document.querySelector(this.selector);
        }
        //If the engine has started, it means it's an instanciation
        if (this.parent && Engine.hasStarted) {
            this.created();
        }
    }

    setVisibility(bool) {
        if (this.dom)
            this.dom.style['visibility'] = bool ? 'visible' : 'hidden';
        this.isVisible = bool;
    }

    setActive(bool) {
        this.isActive = bool;
        if (this.isActive) {
            if (!this._isUpdating) {
                Engine.addToUpdate(this.uuid, this.update.bind(this));
                this._isUpdating = true;
            }
        } else {
            if (this._isUpdating) {
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
                        Engine.waitNextTick(_ => {
                            this.updateData(id);
                        });
                    }
                    return newval;
                });
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
            let classes = await this.dom.querySelectorAll('*[class]');


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