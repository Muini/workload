import * as THREE from 'three';
import Engine from './engine';
import AssetsManager from './assetsManager';

const mustachRegEx = new RegExp(/{{\s*[\w\.]+\s*}}/g);

export default class DomObject {
    constructor(opt = {
        parent,
    }) {
        this.name = 'unnamed dom object';

        this.selector = undefined;
        this.dom = undefined;
        this.data = {};

        this.isActive = true;
        this.isVisible = true;
        this.isDomObject = true;

        this.parent = opt.parent || undefined;
        if (!this.parent) throw 'Object parameter "parent" is mandatory and should be a Object or Scene type';
        this.scene = this.parent.isScene ? this.parent : this.parent.scene;
        this.scene.addObject(this);

        this._vars = {};
        this._classes = {};

        this.updateUID = '';
        Engine.addToUpdate(this.update.bind(this), (uid) => { this.updateUID = uid });
        this._isUpdating = true;

        this.init();
    }

    // Init happen when the entire project is loaded
    init() {
        if (this.selector) {
            this.dom = document.querySelector(this.selector);
        }
        //If the engine has started, it means it's an instanciation
        if (Engine.hasStarted) {
            this.awake();
        }
    }

    setVisibility(bool) {
        this.dom.style['visibility'] = bool ? 'visible' : 'hidden';
        this.isVisible = bool;
    }

    setActive(bool) {
        this.isActive = bool;
        if (this.isActive) {
            if (!this._isUpdating) {
                Engine.addToUpdate(this.update.bind(this), (uid) => { this.updateUID = uid });
                this._isUpdating = true;
            }
        } else {
            if (this._isUpdating) {
                Engine.removeToUpdate(this.updateUID);
                this._isUpdating = false;
            }
        }
        this.setVisibility(bool);
    }

    // Awake happen when the scene is loaded into the engine & started to be used
    awake() {
        // Parse Dom to look for data
        this.parseDom();
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
    }

    parseDom() {
        // find text vars
        let texts = this.dom.querySelectorAll('p,div,span');
        for (let i = 0; i < texts.length; i++) {
            let data = texts[i].textContent;
            let vars = data.match(mustachRegEx);
            if (vars) {
                vars = vars.map(function(x) { return x.match(/[\w\.]+/)[0]; });
                for (let v = 0; v < vars.length; v++) {
                    if (!this._vars[vars[v]]) {
                        this._vars[vars[v]] = [];
                    }
                    this._vars[vars[v]].push({
                        node: texts[i],
                        exp: data,
                    });
                    this.updateData(vars[v]);
                }
            }

        }
        // find class vars
        let classes = this.dom.querySelectorAll('*[class]');

        console.log(this._vars);

        this._shouldUpdateVars = true;
    }

    updateData(data) {
        if (!this._vars[data] || !this.isActive) return;
        for (let i = 0; i < this._vars[data].length; i++) {
            let phrase = this._vars[data][i].exp.replace(mustachRegEx, (value) => {
                let single = value.match(/[\w\.]+/)[0];
                return this.data[single];
            });
            this._vars[data][i].node.textContent = phrase;
        }
    }

    update(time, delta) {}

    destroy() {
        this.setActive(false);
        if (this._isUpdating) {
            Engine.removeToUpdate(this.updateUID);
            this._isUpdating = false;
        }
        this.dom = null;
        this.selector = null;
    }
}