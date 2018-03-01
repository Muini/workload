import * as THREE from 'three';

import Object from '../engine/object';

import { Paper } from './paper.obj';

export class PaperBlock extends Object {
    constructor(opt = {}) {
        super(opt);
        this.name = 'paper_block';
    }

    init() {
        super.init();

        this.papers = [];
        this.papersCount = 10;
        this.papersMax = 30;

        const paperHeight = .1;
        for (let i = 0; i < this.papersCount; i++) {
            let newPaper = new Paper({ parent: this, position: new THREE.Vector3(THREE.Math.randFloat(-0.05, 0.05), paperHeight * i, THREE.Math.randFloat(-0.05, 0.05)) })
            this.papers.push(newPaper)
        }
    }

    awake() {
        super.awake();
    }

    update(time) {}

}