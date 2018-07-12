import * as THREE from 'three';

import Engine from '../engine/engine'
import Obj from '../engine/obj';

import { Cash } from './cash.obj';

export class CashPile extends Obj {
    constructor(opt = {}) {
        super(opt);
    }

    init() {
        //Init variables
        this.name = 'cash_pile';
        
        this.cashs = [];
        this.cashsMax = 100;
        
        this.cashHeight = .1;
        
        this.pileColumn = 2;
        
        super.init();
    }

    created() {
        return (async () => {
            await super.created();
        })();
    }

    awake() {
        return (async () => {
            await super.awake();
        })();
    }

    update(time, delta) {
        super.update(time, delta);
    }

    addCash() {
        if (this.cashs.length >= this.cashsMax) return;
        let position = new THREE.Vector3(
            (0.225 * (this.cashs.length % this.pileColumn)) + THREE.Math.randFloat(-0.015, 0.015),
            this.cashHeight * ((this.cashs.length - (this.cashs.length % this.pileColumn)) / this.pileColumn),
            THREE.Math.randFloat(-0.01, 0.01),
        );
        let newCash = new Cash({
            parent: this,
            position: position
        })
        this.cashs.push(newCash)
        Engine.waitNextTick().then(_ => {
            newCash.appear();
        })
    }

    removeCash() {
        if (this.cashs.length <= 0) return;
        this.cashs[0].disappear();
        this.cashs.splice(0, 1);
        this.movecashsDown();
    }

    movecashsDown() {
        for (let i = 0; i < this.cashs.length; i++) {
            this.cashs[i].moveDown(this.cashHeight);
        }
    }

}