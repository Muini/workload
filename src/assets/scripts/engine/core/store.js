class Store {
    constructor() {
        this._data = new Map();
    }
    get(key){
        return this._data.get(key);
    }
    set(key, value){
        this._data.set(key, value);
    }
}
export default new Store();