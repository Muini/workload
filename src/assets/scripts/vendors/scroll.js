'use strict'
import elementResizeDetector from 'element-resize-detector'
import Looper from './looper'

/* CustomEvent polyfill */
let CustomEvent;
CustomEvent = function(event, params) {
    let evt;
    params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
    };
    evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
};
CustomEvent.prototype = window.Event.prototype;
window.CustomEvent = CustomEvent;

var supportsPassive = false;
try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function() {
      supportsPassive = true;
    }
  });
  window.addEventListener("testPassive", null, opts);
  window.removeEventListener("testPassive", null, opts);
} catch (e) {}

/*
//IE & Edge Fixed elements jitter fixed
if (document.documentMode || /Edge/.test(navigator.userAgent)) { // if IE or Edge
    document.body.addEventListener("mousewheel", function() {
        // remove default behavior
        event.preventDefault();

        //scroll without smoothing
        let wheelDelta = event.wheelDelta;
        let currentScrollPosition = window.pageYOffset;
        window.scrollTo(0, currentScrollPosition - wheelDelta);
    });
}
*/
export default class Scroll {

    constructor(opt = {
        inner,
        smooth
    }) {
        // ==============
        // Set Default
        // ==============
        this.target = document.body;
        this.targetInner = opt.inner || undefined;
        this.isSmooth = opt.smooth;

        this.innerHeight = 0;
        this.windowHeight = window.innerHeight;

        this.isSafari = navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1;
        this.isTouchDevice = navigator.userAgent.indexOf('iPhone') > -1 || navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('iPad') > -1;
        this.params = opt || null;

        this.scrollTop = 0;
        this.lerpPosY = 0;
        this.posY = 0;
        this.relY = 0;
        this.shouldUpdateY = false;
        this.isScrolling = false;
        this.isDisabled = false;

        this.loop = new Looper(this);
        this.loop.add(this.onUpdate.bind(this));
        // ============================
        // Desktop exceptions
        // ============================
        this.defaultEase = this.isTouchDevice || !this.isSmooth ? 1 : 0.15;
        this.ease = this.defaultEase;

        if (this.isTouchDevice || !this.isSmooth)
            this.targetInner.classList.add('scroll');
        else
            this.targetInner.classList.add('scroll-smooth');

        //Dom modification & selection
        // ==============
        // Events Binding
        // ==============
        this.getScrollElements();
        this.handleStopScroll();
        this.bindEvents();
        // ==============
        // Children Resize
        // ==============
        let event = new CustomEvent('smoothscroll-resize');
        const erd = elementResizeDetector({
            strategy: 'scroll'
        });
        erd.listenTo(this.targetInner, el => {
            this.getScrollElements();
            this.calcHeight();
            window.dispatchEvent(event);
        });
        // ==============
        // Start RAF
        // ==============
        
        // Make it Global
        window.Smoothscroll = this;
    }

    bindEvents() {
        window.addEventListener('scroll', e => {
            this.shouldUpdateY = true;
            //if(!this.isSmooth) this.loop.start();
            this.loop.start();
        }, false);
        window.addEventListener('resize', e => {
            this.windowHeight = window.innerHeight;
        }, false);
    }

    getScrollElements() {
        this.fixedElements = this.targetInner.querySelectorAll('.is-fixed');
        this.hasScrollElements = this.targetInner.querySelectorAll('.has-scroll');
    }

    calcHeight() {
        requestAnimationFrame(_ => {
            this.innerHeight = this.targetInner.clientHeight;
            if (!this.isTouchDevice && this.isSmooth)
                document.body.style['height'] = this.innerHeight + 'px';
            this.loop.start();
        })
    }

    handleStopScroll() {
        const keys = { '38': 'arrowup', '40': 'arrowdown', '33': 'pageup', '34': 'pagedown', '35': 'end', '9': 'tab', '32': 'spacebar' }

        function preventDefault(e) {
            e = e || window.event
            if (e.preventDefault) {
                e.preventDefault()
            }
            e.returnValue = false
        }

        function preventDefaultForScrollKeys(e) {
            if (keys[e.keyCode]) {
                preventDefault(e)
                return false
            }
        }

        function disableScroll() {
            if (window.addEventListener) // older FF
            {
                window.addEventListener('DOMMouseScroll', preventDefault, false)
            }
            window.onwheel = preventDefault // modern standard
            window.onmousewheel = document.onmousewheel = preventDefault // older browsers, IE
            window.addEventListener('touchstart', preventDefault, { passive: supportsPassive })
            window.addEventListener('touchmove', preventDefault, { passive: supportsPassive })
            document.onkeydown = preventDefaultForScrollKeys
        }

        function enableScroll() {
            if (window.removeEventListener) { window.removeEventListener('DOMMouseScroll', preventDefault, { passive: supportsPassive }) }
            window.onmousewheel = document.onmousewheel = null
            window.onwheel = null
            window.removeEventListener('touchstart', preventDefault, { passive: supportsPassive })
            window.removeEventListener('touchmove', preventDefault, { passive: supportsPassive })
            document.onkeydown = null
        }

        this.disable = _ => {
            this.isDisabled = true;
            return disableScroll()
        }

        this.enable = _ => {
            this.isDisabled = false;
            return enableScroll()
        }

        for (let i = 0; i < this.hasScrollElements.length; i++) {
            let el = this.hasScrollElements[i]

            if (this.isTouchDevice) {
                el.removeEventListener('touchstart', this.disable.bind(this), true)
                el.removeEventListener('touchend', this.enable.bind(this), true)
                el.addEventListener('touchstart', this.disable.bind(this), true)
                el.addEventListener('touchend', this.enable.bind(this), true)
            } else {
                el.removeEventListener('mouseenter', this.disable.bind(this), false)
                el.removeEventListener('mouseleave', this.enable.bind(this), false)
                el.addEventListener('mouseenter', this.disable.bind(this), false)
                el.addEventListener('mouseleave', this.enable.bind(this), false)
            }
        }
    }

    onUpdate() {

        //Get pageYOffset when needed
        if (this.shouldUpdateY) {
            this.scrollTop = window.pageYOffset;
            this.shouldUpdateY = false;
        }
        //Calculate Y pos
        this.lerpPosY += (this.scrollTop - this.lerpPosY) * this.ease;
        this.posY = Math.round(this.lerpPosY);
        //Update relative Y
        this.relY = this.posY / (this.innerHeight - this.windowHeight);
        //So we are scrolling
        this.isScrolling = true;
        //Apply CSS
        this.applyStyles();
        //Have we finished scrolling yet ?
        if (this.posY === this.scrollTop) {
            //Then stop raf
            if (!this.isTouchDevice && this.isSmooth) {
                this.targetInner.style['pointerEvents'] = `inherit`;
                if(!this.isSafari) this.targetInner.style['willChange'] = 'inherit';
            }
            this.ease = this.defaultEase;
            this.isScrolling = false;
            //if(!this.isSmooth) this.loop.stop();
            this.loop.stop();
            return;
        }
    }

    applyStyles() {
        if (this.isTouchDevice || !this.isSmooth) return;
        //Handle inner elem
        this.targetInner.style['pointerEvents'] = `none`;

        this.targetInner.style['willChange'] = 'transform';
        this.targetInner.style['webkitTransform'] = `translate3d(0, ${-this.posY}px, 0)`;
        this.targetInner.style['transform'] = `translate3d(0, ${-this.posY}px, 0)`;
        //Handle fixed elems
        if (this.fixedElements.length > 0) {
            for (let i = 0; i < this.fixedElements.length; i++) {
                this.fixedElements[i].style['webkitTransform'] = `translate3d(0, ${-this.posY}px, 0)`;
                this.fixedElements[i].style['transform'] = `translate3d(0, ${-this.posY}px, 0)`;
            }
        }
    }

    //Scroll to function
    to(value, duration, callback, ease) {
        // if (this.isDisabled) return;
        if (value === undefined || value === null) { throw '@params value is undefined. Cannot scroll to undefined' }

        if (typeof value === 'number') {
            value = parseInt(value);
            if (value > this.innerHeight)
                value = this.innerHeight - window.innerHeight;
        } else if (typeof value === 'string' && (value.indexOf('.') === 0 || value.indexOf('#') === 0)) {
            let node = document.querySelector(value);
            if (!node) return;
            value = node.getBoundingClientRect().top + this.posY;
        } else if (typeof value === 'object') {
            value = value.getBoundingClientRect().top + this.posY;
        } else {
            return;
        }

        this.ease = 1;

        function easeInOutQuad(t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t };

        let start = performance.now(),
            from = this.posY;

        if (from === value) {
            if (typeof callback === 'function')
                callback();
            return;
        }

        function scroll() {
            let currentTime = performance.now(),
                time = Math.min(1, ((currentTime - start) / duration)),
                easedTime = easeInOutQuad(time);
            let _value = Math.round((easedTime * (value - from)) + from)
            window.scrollTo(0, _value)

            if (time < 1) {
                requestAnimationFrame(scroll);
            } else if (callback) {
                if (typeof callback === 'function')
                    callback();
            }
        }

        requestAnimationFrame(scroll)

    }
}