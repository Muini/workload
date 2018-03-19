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
        // console.log('update loader', this.data.percentage, (assetPercent / assetsToLoad));
    }

}