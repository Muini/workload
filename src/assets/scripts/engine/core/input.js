
import Engine from './engine';

class Input {
    constructor() {

        this.mouse = {
            x: window.innerWidth / 2.0,
            y: window.innerHeight / 2.0,
            relX: 0.0,
            relY: 0.0,
            velocity: 0.0,
            isInScreen: true,
            onClick: false,
            isDown: false,
            isTouch: false,
            wheelDelta: 0.0
        }

        this.bindEvents();

    }

    bindEvents(){
        window.addEventListener('mouseenter', e => {
            this.onMouseMove(e, false);
            this.mouse.isInScreen = true;
        });
        window.addEventListener('mousemove', e => {
            this.onMouseMove(e, false);
            this.mouse.isInScreen = true;
        });
        window.addEventListener('touchmove', e => {
            this.onMouseMove(e, true);
            this.mouse.isInScreen = true;
            this.mouse.isTouch = true;
        });
        window.addEventListener('mouseleave', e => {
            this.mouse.isInScreen = false;
            this.mouse.isDown = false;
        });
        window.addEventListener('mousedown', e => {
            this.mouse.isDown = true;
        });
        window.addEventListener('touchstart', e => {
            this.onMouseMove(e, true);
            this.mouse.isDown = true;
            this.mouse.isInScreen = true;
            this.mouse.isTouch = true;
        });
        window.addEventListener('mouseup', e => {
            this.mouse.isDown = false;
        });
        window.addEventListener('touchend', e => {
            this.mouse.isDown = false;
            this.mouse.isInScreen = false;
            this.mouse.isTouch = false;
        });
        window.addEventListener('touchcancel', _ => {
            this.mouse.isDown = false;
            this.mouse.isInScreen = false;
            this.mouse.isTouch = false;
        })
        window.addEventListener('click', e => {
            // this.onClick(e);
            this.mouse.onClick = true;
            Engine.waitNextTick().then(_ => {
                this.mouse.onClick = false;
            })
        })
        window.addEventListener('mousewheel', e => {
            this.mouse.wheelDelta = e.wheelDelta;
            Engine.waitNextTick().then(_ => {
                this.mouse.wheelDelta = 0.0;
            })
        })
    }

    onMouseMove(e, isTouch){
        if(!e.clientX && !e.touches) return;
        this.mouse.x = !isTouch ? e.clientX : e.touches[0].clientX;
        this.mouse.y = !isTouch ? e.clientY : e.touches[0].clientY;
        this.mouse.relX = (this.mouse.x / window.innerWidth) * 2 - 1;
        this.mouse.relY = (this.mouse.y / window.innerHeight) * 2 - 1;
    }

    bindActionOnKeyDown(key, fn){}

}

export default new Input();