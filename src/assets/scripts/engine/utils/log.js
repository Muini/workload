import UUID from './uuid';

class Log {
    constructor() {
        this.debug = true;

        this.logsAtScreen = new Map();

        this._styles = {
            'color': 'white',
            'font-size': '10px',
            'padding': '.5em .5em .5em 1em',
            'background': 'rgba(0,0,0,0.8)',
            'position': 'fixed',
            'top': '1em',
            'right': '1em',
            'border-radius': '.5em',
            'opacity': '0',
            'transition': `transform 325ms ease-out, opacity 325ms linear`,
        }

        this._STAYTIME = 10000; //ms
    }

    push(type, className, message){
        const log = {
            uuid: UUID(),
            type: type,
            class: className,
            message: this.parseMessage(message),
        }

        const logMessage = `%c${log.class}%c ${log.message}`;
        const styles = "color:white;background:" + this.selectColor(log.type) + ";padding:2px 4px;";

        // Write it in the console
        if (log.type === 'error')
            console.error(logMessage, styles, "color:black")
        else if(log.type === 'warn')
            console.warn(logMessage, styles, "color:black")
        else
            console.log(logMessage, styles, "color:black")

        if (this.debug) {
            this.createDomLog(log);
        }

        return false;
    }

    parseMessage(message){
        const parsedMessage = message;
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
        
            let elem = document.createElement('p');

            for(const style in this._styles){
                elem.style[style] = this._styles[style];
            }

            elem.innerHTML = `${log.message} <span style="background:${this.selectColor(log.type)};padding:.15em .5em">${log.class}</span>`;

            log.elem = elem;
            document.body.appendChild(elem);
            this.logsAtScreen.set(log.uuid, log);
            this.recalculateLogsPosition();

            requestAnimationFrame(_ => {
                elem.style['opacity'] = '.8';
                setTimeout(_ => {
                    elem.style['opacity'] = '0';
                    setTimeout(_ => {
                        document.body.removeChild(elem);
                        this.logsAtScreen.delete(log.uuid);
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
        let index = this.logsAtScreen.size;
        this.logsAtScreen.forEach((log) => {
            log.elem.style['transform'] = `translateZ(0) translateY(${2 * index}em)`;
            index--;
        });
    }

}

export default new Log();