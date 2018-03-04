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

        this.timeElapsed = 0;
        this.timeElapsed2 = 0;

    }

    awake() {
        super.awake();
    }

    update(time, delta) {
        this.timeElapsed += delta;
        this.timeElapsed2 += delta;

        if (this.timeElapsed > 2000) {
            this.timeElapsed = 0;

            if (this.papers.length < this.papersMax) {
                for (let i = 0; i < 5; i++) {
                    this.addPaper();
                }
            }
        }

        if (this.timeElapsed2 > 500 && this.papers.length > 0) {
            this.timeElapsed2 = 0;
            this.papers[0].disappear();
            this.papers.splice(0, 1);
            this.movePapersDown();
        }

    }

    addPaper() {
        let newPaper = new Paper({
            parent: this,
            position: new THREE.Vector3(THREE.Math.randFloat(-0.05, 0.05), this.paperHeight * (this.papers.length), THREE.Math.randFloat(-0.05, 0.05))
        })
        this.papers.push(newPaper)
        newPaper.appear();
    }

    movePapersDown() {
        for (let i = 0; i < this.papers.length; i++) {
            this.papers[i].moveDown(this.paperHeight);
        }
    }

}