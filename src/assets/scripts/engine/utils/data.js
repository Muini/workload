import Log from './log';

export default class Data {
    constructor(opt) {
        // TODO: Data class that handles datas through the engine. Can be used in object / scenes & global app
        this.data = opt;
        this.dataFunctions = {};

        this.onDataUpdate = this.onDataUpdate.bind(this);
        for(data in this.data){
            this.data.watch(data, this.onDataUpdate)
            this.dataFunctions[data] = function(){};
        }
    }

    onDataUpdate(data, oldval, newval){
        if (typeof this.dataFunctions[data] === 'function') {
            this.dataFunctions[data]();
        }
        this.data[data] = newval;
        return;
    }

    compute(data, fct){
        if(!this.data[data]) return Log.push('error', this.constructor.name, `Data ${data} is not existing`);
        this.dataFunctions[data] = fct;
    }

}