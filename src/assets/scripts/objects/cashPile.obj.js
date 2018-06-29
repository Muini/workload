import * as THREE from 'three';

import Object from '../engine/object';

import { Cash } from './cash.obj';

export class CashPile extends Object {
    constructor(opt = {}) {
        super(opt);
    }

    init() {
        //Init variables
        this.name = 'Cash_block';

        super.init();

        this.cashs = [];
        this.cashsMax = 20;

        this.cashHeight = .1;

        this.pileColumn = 2;

    }

    awake() {
        return (async() => {
            await super.awake();
        })();
    }

    update(time, delta) {
        super.update(time, delta);
    }

    addCash() {
        if (this.cashs.length >= this.cashsMax) return;
        let position = new THREE.Vector3(
            (0.275 * (this.cashs.length % this.pileColumn)) + THREE.Math.randFloat(-0.01, 0.01),
            this.cashHeight * (this.cashs.length / this.pileColumn),
            THREE.Math.randFloat(-0.01, 0.01) + (.05 * (this.cashs.length % this.pileColumn)),
        );
        let newCash = new Cash({
            parent: this,
            position: position
        })
        this.cashs.push(newCash)
        newCash.appear();
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