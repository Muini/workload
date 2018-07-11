import * as THREE from 'three';

import Obj from '../engine/obj';

import { Paper } from './paper.obj';

export class PaperBlock extends Obj {
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
        return (async() => {
            await super.awake();

            // Is fired when the object is added to the scene
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
        newPaper.appear();
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
        for (let i = 0; i < this.papers.length; i++) {
            this.papers[i].moveDown(this.paperHeight);
        }
    }

}