import * as THREE from 'three';

import Object from '../engine/object';

import { Paper } from './paper.obj';

export class PaperBlock extends Object {
    constructor(opt = {}) {
        super(opt);
    }

    init() {
        //Init variables
        this.name = 'paper_block';

        super.init();

        this.papers = [];
        this.papersMax = 30;

        this.paperHeight = .12;

    }

    awake() {
        super.awake();

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
        newPaper.appear();
    }

    removePaper(onComplete) {
        if (this.papers.length <= 0) return;
        this.papers[0].disappear(onComplete);
        this.papers.splice(0, 1);
        this.movePapersDown();
    }

    movePapersDown() {
        for (let i = 0; i < this.papers.length; i++) {
            this.papers[i].moveDown(this.paperHeight);
        }
    }

}