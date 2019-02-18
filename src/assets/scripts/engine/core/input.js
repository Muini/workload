
class Input {
    constructor() {

        this.mouse = {
            x: window.innerWidth / 2.0,
            y: window.innerHeight / 2.0,
            relX: 0.0,
            relY: 0.0,
            velocity: 0.0,
            isInScreen: true,
        }

        this.bindEvents();

    }

    bindEvents(){
        window.addEventListener('mouseenter', e => {
            this.onMouseMove(e);
            this.isInScreen = true;
        });
        window.addEventListener('mousemove', e => {
            this.onMouseMove(e);
            this.isInScreen = true;
        });
        window.addEventListener('mouseleave', e => {
            this.onMouseMove(e);
            this.isInScreen = false;
        });
    }

    onMouseMove(e){
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.relX = (this.mouse.x / window.innerWidth) * 2 - 1;
        this.mouse.relY = (this.mouse.y / window.innerHeight) * 2 - 1;
    }

    bindActionOnKeyDown(key, fn){}

}

export default new Input();