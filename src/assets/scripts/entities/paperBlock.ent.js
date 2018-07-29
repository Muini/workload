import * as THREE from 'three';

import Engine from '../engine/core/engine'
import Entity from '../engine/classes/entity';

import { Paper } from './paper.ent';

export class PaperBlock extends Entity {
    constructor(opt = {}) {
        super(opt);
        //Init variables
        this.name = 'paper_block';

        this.papers = [];
        this.papersMax = 30;
        
        this.paperHeight = .12;
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
        if (this.papers.length >= this.papersMax) return;
        let newPaper = new Paper({
            parent: this,
            position: new THREE.Vector3(THREE.Math.randFloat(-0.05, 0.05), this.paperHeight * (this.papers.length), THREE.Math.randFloat(-0.05, 0.05))
        })
        this.papers.push(newPaper)
        Engine.waitNextTick().then(_ => {
            newPaper.appear();
        })
    }

    removePaper() {
        return (async () => {
            if (this.papers.length <= 0) return;
            this.papers[0].disappear();
            this.papers.splice(0, 1);
            await this.movePapersDown();
            return;
        })();
    }

    movePapersDown() {
        let i = this.papers.length;
        while (i--) {
            this.papers[i].moveDown(this.paperHeight);
        }
    }

}