import Log from './log';

export default class Data {
    constructor(data = {}) {
        // TODO: Data class that handles datas through the engine. Can be used in object / scenes & global app
        
        this._updateFct = {};

        // this.onDataUpdate = this.onDataUpdate.bind(this);
        for(let dataName in data){
            console.log(dataName, data[dataName]);
            this[dataName] = data[dataName];
            this.watch(dataName, this.onDataUpdate)
            // this.data.updateFct[data] = function (){};
        }

        console.log(this);
    }

    onDataUpdate(data, oldval, newval){
        console.log('data update', data, oldval, newval);
        if (typeof this._updateFct[data] === 'function') {
            data = this._updateFct[data](newval);
        }else{
            data = newval;
        }
    }

    compute(data, fct){
        console.log('compute', data, fct);
        // if (!this.data[data]) return Log.push('error', this.constructor.name, `Data ${data} is not existing`);
        this._updateFct[data] = fct;
    }

}