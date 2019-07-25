import UUID from './uuid';

class Log {
    constructor() {
        this.debug = false;

        this._logsAtScreen = new Map();

        this._styles = {
            'display': 'flex',
            'align-items': 'center',
            'color': 'white',
            'font-size': '10px',
            'line-height': '1.2em',
            'padding': '0 0 0 1em',
            'background': 'rgba(0,0,0,0.8)',
            'position': 'fixed',
            'bottom': '2em',
            'right': '2em',
            'border-radius': '.5em',
            'opacity': '0',
            'transition': `transform 325ms ease-out, opacity 325ms linear`,
        }

        this._STAYTIME = 10000; //ms
    }

    push(type, caller, message){
        const log = {
            uuid: UUID(),
            type: type,
            class: caller.constructor.name,
            message: message,
        }

        const logMessage = `%c${log.class}%c ${this.parseMessage(log.message)}`;
        const styles = "color:white;background:" + this.selectColor(log.type) + ";padding:2px 4px;";

        // Write it in the console
        if (log.type === 'error')
            console.error(logMessage, styles, "color:black", caller)
        else if(log.type === 'warn')
            console.warn(logMessage, styles, "color:black")
        else
            console.info(logMessage, styles, "color:black")

        if (this.debug) {
            this.createDomLog(log);
        }

        return false;
    }

    parseMessage(message){
        const parsedMessage = message.replace(/c:(\w*){(.*)}/gi, (cores, color, message) => {
            return `${message}`;
        });
        return parsedMessage;
    }

    parseMessageForHtml(message) {
        // new RegExp(/{{\s*[\w\.]+\s*}}/g);
        const parsedMessage = message
        .replace(/c:(\w*){(.*)}/g, (cores, color, message) => {
            return `<span style="color:${color};">${message}</span>`;
        })
        .replace(/(\r\n|\n|\r)/g, '<br />')
        ;
        return parsedMessage;
    }

    selectColor(type){
        let color = undefined;
        switch (type) {
            case 'success':
                color = 'LimeGreen';
                break;

            case 'info':
                color = 'DodgerBlue';
                break;

            case 'warn':
                color = 'Orange';
                break;

            case 'error':
            default:
                color = 'OrangeRed';
                break;
        }
        return color;
    }

    createDomLog(log){
        return (async() => {
        
            let elem = document.createElement('div');

            for(const style in this._styles){
                elem.style[style] = this._styles[style];
            }

            elem.innerHTML = `<p style="height:100%;padding:.25em 0;">${this.parseMessageForHtml(log.message)}</p><span style="flex-shrink:0;align-self:flex-start;margin-left:1em;height:100%;background:${this.selectColor(log.type)};padding:.5em .5em">${log.class}</span>`;

            log.elem = elem;
            document.body.appendChild(elem);
            this._logsAtScreen.set(log.uuid, log);
            this.recalculateLogsPosition();

            requestAnimationFrame(_ => {
                elem.style['opacity'] = '.8';
                setTimeout(_ => {
                    elem.style['opacity'] = '0';
                    setTimeout(_ => {
                        document.body.removeChild(elem);
                        this._logsAtScreen.delete(log.uuid);
                        this.recalculateLogsPosition();
                    }, 325);
                }, this.getDrawTime(log.type));
            });
        })();
    }

    getDrawTime(type){
        let time = this._STAYTIME;
        switch (type) {
            case 'success':
                time /= 1.5;
                break;

            case 'info':
                time /= 2;
                break;

            case 'warn':
                break;

            case 'error':
            default:
                time *= 2;
                break;
        }
        return time;
    }

    recalculateLogsPosition(){
        let index = this._logsAtScreen.size;
        this._logsAtScreen.forEach((log) => {
            log.elem.style['transform'] = `translateZ(0) translateY(-${2.5 * index}em)`;
            index--;
        });
    }

}

export default new Log();