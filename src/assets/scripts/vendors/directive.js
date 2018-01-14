//Simple directive by Corentin Flach

export default class Directive {
    constructor(opt = {
        name,
        callback,
    }) {
        this.name = opt.name || '';
        this.callback = opt.callback || function() {};

        if (this.name.length <= 0) return;

        let items = document.querySelectorAll('*[' + this.name + ']');
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if (item.getAttribute(this.name) !== '') {
                let data = eval('data=' + item.getAttribute(this.name));
                this.callback(item, data);
            } else {
                this.callback(item, undefined);
            }
            item.removeAttribute(this.name);
        }
    }
}