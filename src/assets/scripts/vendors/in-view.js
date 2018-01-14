export default class InView {

    constructor(opt = {
        elem,
        ratio,
        classes,
        delay,
        onUpdate,
        onInView,
        onInViewOnce,
        onOutView,
    }) {
        this.elem = {
            el: opt.elem || undefined,
            height: 0,
            top: 0,
            bottom: 0,
            inView: false,
            inViewOnce: false,
        };

        this.customScroll = window.Smoothscroll;
        if (!this.customScroll) {
            throw 'InView.js needs Scroll.js, please implement Scroll.js and pass Scroll object in constructor as param customScroll';
        }

        this.scroll = {
            elem: undefined,
            posY: 0,
            height: 0,
            relY: 0,
        };

        this.ratio = opt.ratio || (1 / 2);
        this.delay = opt.delay || 0;

        this.classes = {
            shouldShow: opt.classes || false,
            once: 'in-view-once',
            in: 'in-view',
            out: 'out-view',
            outUp: 'out-view_up',
            outDown: 'out-view_down',
        };

        this.isDestroyed = false;

        this.onUpdate = opt.onUpdate || undefined;
        this.onInView = opt.onInView || undefined;
        this.onOutView = opt.onOutView || undefined;
        this.onInViewOnce = opt.onInViewOnce || undefined;

        if (!this.elem.el) return;

        // Create instanciable functions to bind & unbind them
        this.onScroll = (e => {
            const inViewScroll = e => {
                this.onScrollUpdate(e);
                this.check();
            }
            return inViewScroll;
        })();

        this.onResize = _ => {
            requestAnimationFrame(_ => {
                this.onScrollUpdate();
                this.updateValues();
                this.check();
            });
        }

        // Get scroll values
        this.scroll.posY = this.customScroll.posY;
        this.scroll.relY = this.customScroll.relY;
        this.scroll.height = this.customScroll.windowHeight;
        this.customScroll.loop.add(this.onScroll.bind(this));

        // Bind event to closest scroll & window
        window.addEventListener('smoothscroll-resize', this.onResize);

        // CheckViewport
        this.updateValues();
        this.check();
        this.updateClasses();
    };

    onScrollUpdate(e) {
        if (!this.customScroll)
            return;
        this.scroll.posY = this.customScroll.posY;
        this.scroll.relY = this.customScroll.relY;
        this.scroll.height = this.customScroll.windowHeight;
    };

    updateValues() {
        //Set value that are expensive to get
        this.elem.height = this.elem.el.offsetHeight;
        this.elem.top = this.elem.el.getBoundingClientRect().top + this.scroll.posY;
        this.elem.bottom = this.elem.top + this.elem.height;
    };

    check() {
        if (this.isDestroyed)
            return;
        //Check if item is inView
        if ((this.scroll.posY + (this.scroll.height * this.ratio)) > this.elem.top && (this.scroll.posY + this.scroll.height - (this.scroll.height * this.ratio)) < this.elem.bottom) {
            //Toggle inView boolean & classes
            if (this.elem.inView !== true) {
                this.elem.inView = true;
                this.updateClasses(false);
                if (this.onInView && typeof this.onInView === 'function')
                    this.onInView(this.scroll, this.elem);
            }
            //Check if we already have been in view before
            if (this.elem.inView && !this.elem.inViewOnce) {
                this.elem.inViewOnce = true;
                this.updateClasses(true);
                if (this.onInViewOnce && typeof this.onInViewOnce === 'function')
                    this.onInViewOnce(this.scroll, this.elem);
            }
        } else {
            //Toggle inView boolean & classes
            if (this.elem.inView !== false) {
                this.elem.inView = false;
                this.updateClasses(false);
                if (this.onOutView && typeof this.onOutView === 'function')
                    this.onOutView(this.scroll, this.elem);
            }
        }
        //Fire custom function
        if (this.onUpdate && typeof this.onUpdate === 'function') {
            this.onUpdate(this.scroll, this.elem);
        }
    };

    updateClasses(once) {
        if (!this.classes.shouldShow) return;
        setTimeout(_ => {
            requestAnimationFrame(_ => {
                if (once) {
                    this.elem.el.classList.add(this.classes.once);
                } else {
                    if (this.elem.inView) {
                        this.elem.el.classList.remove(this.classes.out);
                        this.elem.el.classList.remove(this.classes.outUp);
                        this.elem.el.classList.remove(this.classes.outDown);
                        this.elem.el.classList.add(this.classes.in);
                    } else {
                        this.elem.el.classList.remove(this.classes.in);
                        this.elem.el.classList.add(this.classes.out);
                        if (this.scroll.posY + (this.scroll.height * this.ratio) <= this.elem.top) {
                            this.elem.el.classList.add(this.classes.outDown);
                        } else {
                            this.elem.el.classList.add(this.classes.outUp);
                        }
                    }
                }
            });
        }, this.delay);
    }

    destroy() {
        this.customScroll.loop.remove(this.onScroll.bind(this));
        window.removeEventListener('smoothscroll-resize', this.onResize);
        this.elem = null;
        this.customScroll = null;
        this.scroll = null;
        this.classes = null;
        this.onResize = null;
        this.onScroll = null;
        this.isDestroyed = true;
    };
}