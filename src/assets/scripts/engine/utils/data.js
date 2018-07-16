export default class Data {
    constructor(opt) {
        // TODO: Data class that handles datas through the engine. Can be used in object / scenes & global app
        this.data = opt;

        this.onDataUpdate = this.onDataUpdate.bind(this);
        for(data in this.data){
            this.data.watch(data, this.onDataUpdate)
        }
    }

    onDataUpdate(data, oldval, newval){
        this.data[data] = newval;
        return;
    }

}