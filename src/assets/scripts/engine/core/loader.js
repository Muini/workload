import Engine from './engine';
import DomEntity from '../classes/domEntity';

class Loader extends DomEntity {
    constructor(opt = {}) {
        super(opt);
        this.isLoader = true;
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

        this.created();
    }

    created() {
        return (async() => {
            await super.created();

            this.domProgress = await this.dom.querySelector('.progress');

            this.awake();
        })();
    }

    awake() {
        return (async() => {
            super.awake();
        })();
    }

    show() {
        this.setActive(true);
        this.dom.style['visibility'] = 'visible';
        this.dom.classList.remove('hide');
        this.data.percentage = 0;
        this.updateGraphLoader();
    }

    hide() {
        requestAnimationFrame(_ => {
            this.setActive(false);
            this.dom.style['visibility'] = 'visible';
            this.dom.classList.add('hide');
        });    
    }

    updateGraphLoader() {
        if(!this.isActive) return;
        requestAnimationFrame(_ => {
            this.domProgress.style['transform'] = `translateZ(0) scaleX(${ (this.data.percentage / 100) })`;
            this.domProgress.style['webkitTransform'] = `translateZ(0) scaleX(${ (this.data.percentage / 100) })`;
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
    }

}

export default new Loader();