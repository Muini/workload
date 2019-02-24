import * as THREE from 'three';

import Engine from '../engine/core/engine'
import Entity from '../engine/classes/entity';
import Pool from '../engine/classes/pool';

import { Paper } from './paper.ent';

export class PaperBlock extends Entity {
    constructor(opt = {}) {
        super(opt);
        //Init variables
        this.name = 'paper_block';

        this.papers = [];
        this.papersMax = 8;
        this.papersNbr = 0;
        
        this.paperHeight = .12;

        this.paperPool = new Pool(Paper, this, this.papersMax);
    }

    created() {
        return (async () => {
            await super.created();
        })();
    }

    awake() {
        return (async() => {
            await super.awake();
        })();
    }

    update(time, delta) {
        super.update(time, delta);
    }

    addPaper() {
        if (this.papersNbr >= this.papersMax) return;
        let newPaper = this.paperPool.getEntity();
        newPaper.model.position.set(
            THREE.Math.randFloat(-0.05, 0.05), 
            this.paperHeight * this.papersNbr, 
            THREE.Math.randFloat(-0.05, 0.05)
        )
        this.papers.push(newPaper)
        this.papersNbr++;
        Engine.waitNextTick().then(_ => {
            newPaper.appear();
        })
    }

    removePaper() {
        return (async () => {
            if (this.papersNbr <= 0) return;
            this.papers[0].disappear().then(_ => {
                this.paperPool.putEntity(this.papers[0]);
                this.papers.splice(0,1);
            });
            await this.movePapersDown();
            this.papersNbr--;
            return;
        })();
    }

    movePapersDown() {
        let i = this.papersNbr;
        while (i-- > 1) {
            this.papers[i].moveDown(this.paperHeight);
        }
    }

}