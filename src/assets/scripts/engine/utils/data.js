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

    /*let test = {};

    for(let key in data){
        Object.assign(test, {
            get [key](){
                return data[key]
            },
            set [key](val){
                console.log('you set the', key, 'to', val)
                data[key] = val;
            }
        });
    }*/
    // console.log(test);

    return data
}