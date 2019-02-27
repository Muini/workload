// import Log from './log';
// import '../utils/watch-polyfill';
import WatchJS from 'melanke-watchjs';
const watch = WatchJS.watch;

export default function Data(data){

    data.onDataUpdate = function(param, oldval, newval){};

    watch(data, (name, type, newval, oldval) => {
        if(typeof data.onDataUpdate === 'function')
        data.onDataUpdate(name, oldval, newval);
    });

    return data
}