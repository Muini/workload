import * as THREE from 'three';

import Engine from '../engine/core/engine'
import Entity from '../engine/classes/entity';
import Pool from '../engine/classes/pool';

import { Cash } from './cash.ent';

export class CashPile extends Entity {
    constructor(opt = {}) {
        super(opt);
        //Init variables
        this.name = 'cash_pile';
        
        this.cashs = [];
        this.cashsMax = 20;
        this.cashsNbr = 0;
        
        this.cashHeight = .1;
        
        this.pileColumn = 2;

        this.cashPool = new Pool(Cash, this, this.cashsMax);
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
        if (this.cashsNbr >= this.cashsMax) return;
        let newCash = this.cashPool.getEntity();
        newCash.model.position.set(
            (0.225 * (this.cashsNbr % this.pileColumn)) + THREE.Math.randFloat(-0.015, 0.015),
            this.cashHeight * ((this.cashsNbr - (this.cashsNbr % this.pileColumn)) / this.pileColumn),
            THREE.Math.randFloat(-0.01, 0.01),
        );
        this.cashs.push(newCash)
        this.cashsNbr++;
        Engine.waitNextTick().then(_ => {
            newCash.appear();
        })
    }

    removeCash() {
        return (async () => {
            if (this.cashsNbr <= 0) return;
            this.cashs[0].disappear().then(_ => {
                this.cashPool.putEntity(this.cashs[0]);
                this.cashs.splice(0, 1);
            });
            this.cashs.splice(0, 1);
            await this.movecashsDown();
            this.papersNbr--;
            return;
        })();
    }

    movecashsDown() {
        for (let i = 0; i < this.cashsNbr; i++) {
            this.cashs[i].moveDown(this.cashHeight);
        }
    }

}