import Engine from './engine';
import AssetsManager from './assetsManager';
import DomObject from './domObject';

export default class Loader extends DomObject {
    constructor(opt = {}) {
        super(opt);
    }

    init() {
        //Init variables
        this.name = 'loader';
        this.selector = '.loader';

        super.init();

        this.data = {
            percentage: 0,
            chunkLoaded: 0,
            chunkToLoad: 0,
            chunkPercentage: 0,
        }

        this.awake();
    }

    awake() {
        super.awake();

        this.parts = this.dom.querySelectorAll('.part');
    }

    show() {
        // this.setVisibility(true);
        requestAnimationFrame(_ => {
            this.dom.classList.remove('hide');
        });
    }

    hide() {
        // this.setVisibility(false);
        requestAnimationFrame(_ => {
            this.dom.classList.add('hide');
        });
    }

    updateGraphLoader() {
        requestAnimationFrame(_ => {
            for (let i = 0; i < this.parts.length; i++) {
                if (this.data.percentage < 50) {
                    if (i === 0) {
                        this.parts[i].style['transform'] = `rotate(${ this.data.percentage / 50 * 180 }deg)`;
                        this.parts[i].style['webkitTransform'] = `rotate(${ this.data.percentage / 50 * 180 }deg)`;
                    } else {
                        this.parts[i].style['transform'] = `rotate(0deg)`;
                        this.parts[i].style['webkitTransform'] = `rotate(0deg)`;
                    }
                } else {
                    if (i === 0) {
                        this.parts[i].style['transform'] = `rotate(180deg)`;
                        this.parts[i].style['webkitTransform'] = `rotate(180deg)`;
                    } else {
                        this.parts[i].style['transform'] = `rotate(${ (this.data.percentage - 50) / 50 * 180 }deg)`;
                        this.parts[i].style['webkitTransform'] = `rotate(${ (this.data.percentage - 50) / 50 * 180 }deg)`;
                    }
                }
            }
        });
    }

    updateLoader(assetsLoaded, assetsToLoad, assetPercent) {
        this.data.chunkLoaded = assetsLoaded;
        this.data.chunkToLoad = assetsToLoad;
        if (this.data.assetsToLoad <= 0) return;
        this.data.chunkPercentage = assetPercent;
        if (this.data.chunkLoaded >= this.data.chunkToLoad) {
            this.data.percentage = 100;
            this.hide();
        } else {
            this.data.percentage = assetsToLoad > 1 ? parseInt(assetsLoaded / assetsToLoad * 100) + parseInt(assetPercent / assetsToLoad) : parseInt(assetPercent / assetsToLoad);
        }

        this.updateGraphLoader();
        // console.log('update loader', this.data.percentage, (assetPercent / assetsToLoad));
    }

}