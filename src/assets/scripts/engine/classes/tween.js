import Engine from '../core/engine';
import UUID from '../utils/uuid';

// Almost everything here comes from https://github.com/tweenjs/tween.js

export const Ease = {
    Linear: {
        None: function (k) {
            return k;
        }
    },

    Quadratic: {
        In: function (k) {
            return k * k;
        },
        Out: function (k) {
            return k * (2 - k);
        },
        InOut: function (k) {
            if ((k *= 2) < 1) return 0.5 * k * k;
            return -0.5 * (--k * (k - 2) - 1);
        }
    },

    Cubic: {
        In: function (k) {
            return k * k * k;
        },
        Out: function (k) {
            return --k * k * k + 1;
        },
        InOut: function (k) {
            if ((k *= 2) < 1) return 0.5 * k * k * k;
            return 0.5 * ((k -= 2) * k * k + 2);
        }

    },

    Quartic: {
        In: function (k) {
            return k * k * k * k;
        },
        Out: function (k) {
            return 1 - (--k * k * k * k);
        },
        InOut: function (k) {
            if ((k *= 2) < 1) return 0.5 * k * k * k * k;
            return -0.5 * ((k -= 2) * k * k * k - 2);
        }

    },

    Quintic: {
        In: function (k) {
            return k * k * k * k * k;
        },
        Out: function (k) {
            return --k * k * k * k * k + 1;
        },
        InOut: function (k) {
            if ((k *= 2) < 1) return 0.5 * k * k * k * k * k;
            return 0.5 * ((k -= 2) * k * k * k * k + 2);
        }

    },

    Sine: {
        In: function (k) {
            return 1 - Math.cos(k * Math.PI / 2);
        },
        Out: function (k) {
            return Math.sin(k * Math.PI / 2);
        },
        InOut: function (k) {
            return 0.5 * (1 - Math.cos(Math.PI * k));
        }

    },

    Expo: {
        In: function (k) {
            return k === 0 ? 0 : Math.pow(1024, k - 1);
        },
        Out: function (k) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
        },
        InOut: function (k) {
            if (k === 0) return 0;
            if (k === 1) return 1;
            if ((k *= 2) < 1) return 0.5 * Math.pow(1024, k - 1);
            return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
        }
    },

    Circ: {
        In: function (k) {
            return 1 - Math.sqrt(1 - k * k);
        },
        Out: function (k) {
            return Math.sqrt(1 - (--k * k));
        },
        InOut: function (k) {
            if ((k *= 2) < 1) return -0.5 * (Math.sqrt(1 - k * k) - 1);
            return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
        }

    },

    Elastic: {
        In: function (k) {
            let s, a = 0.1,
                p = 0.4;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            } else s = p * Math.asin(1 / a) / (2 * Math.PI);
            return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
        },
        Out: function (k) {
            let s, a = 0.1,
                p = 0.4;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            } else s = p * Math.asin(1 / a) / (2 * Math.PI);
            return (a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);
        },
        InOut: function (k) {
            let s, a = 0.1,
                p = 0.4;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            } else s = p * Math.asin(1 / a) / (2 * Math.PI);
            if ((k *= 2) < 1) return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
            return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
        }
    },

    Back: {
        In: function (k) {
            let s = 1.70158;
            return k * k * ((s + 1) * k - s);
        },
        Out: function (k) {
            let s = 1.70158;
            return --k * k * ((s + 1) * k + s) + 1;
        },
        InOut: function (k) {
            let s = 1.70158 * 1.525;
            if ((k *= 2) < 1) return 0.5 * (k * k * ((s + 1) * k - s));
            return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
        }
    },

    Bounce: {
        In: function (k) {
            return 1 - Ease.Bounce.Out(1 - k);
        },
        Out: function (k) {
            if (k < (1 / 2.75)) {
                return 7.5625 * k * k;
            } else if (k < (2 / 2.75)) {
                return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
            } else if (k < (2.5 / 2.75)) {
                return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
            } else {
                return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
            }
        },
        InOut: function (k) {
            if (k < 0.5) return Ease.Bounce.In(k * 2) * 0.5;
            return Ease.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
        }
    }
}

export class Tween {
    constructor(properties) {
        this.uuid = UUID();
        this.easingFunction = Ease.Sine.InOut;
        this.startTime = Engine.elapsedTime;
        this.delay = 0;
        this.startProperties = {};
        this.currentProperties = properties || {};
        this.endProperties = {};
        this.duration = 0;

        this.isTweening = false;

        this.update = this.update.bind(this);
    }

    start(){
        if(this.isTweening) return this;

        this.startTime = Engine.elapsedTime;
        this.startTime += this.delay;

        for (const property in this.endProperties) {
            // This prevents the interpolation of null values or of non-existing properties
            if (this.currentProperties[property] === null || !(property in this.currentProperties)) {
                continue;
            }
            // check if an Array was provided as property value
            if (this.endProperties[property] instanceof Array) {
                if (this.endProperties[property].length === 0) {
                    continue;
                }
                // create a local copy of the Array with the start value at the front
                this.endProperties[property] = [this.currentProperties[property]].concat(this.endProperties[property]);
            }
            if (this.currentProperties[property] === undefined) {
                continue;
            }
            this.startProperties[property] = this.currentProperties[property];

            if ((this.startProperties[property] instanceof Array) === false) {
                this.startProperties[property] *= 1.0; // Ensures we're using numbers, not strings
            }
        }

        // console.log(this.startProperties, this.currentProperties, this.endProperties)

        Engine.addToUpdate(this.uuid, this.update);

        this.isTweening = true;

        return this;
    }

    pause(){
        if(!this.isTweening) return this;

        this.isTweening = false;

        Engine.removeFromUpdate(this.uuid);

        return this;
    }

    onUpdate(callback){
        this.onUpdateCallback = callback;

        return this;
    }

    onComplete(callback) {
        this.onCompleteCallback = callback;

        return this;
    };

    stop(){
        this.pause();

        return this;
    }

    delay(duration){
        this.delay = duration;
        
        return this;
    }

    to(properties, duration){
        this.endProperties = properties;
        this.duration = duration;

        return this;
    }
    
    ease(ease){
        this.easingFunction = ease;

        return this;
    }

    update(time, delta){
        if (time < this.startTime) {
            return;
        }

        let elapsed = (Engine.elapsedTime - this.startTime) / this.duration;
        elapsed = (this.duration === 0 || elapsed > 1) ? 1 : elapsed;

        const value = this.easingFunction(elapsed);

        for (const property in this.startProperties) {

            if (this.startProperties[property] === undefined) {
                continue;
            }
            
            const start = this.startProperties[property];
            const end = this.endProperties[property];

            if (typeof (end) === 'string') {
                if (end.charAt(0) === '+' || end.charAt(0) === '-') {
                    end = start + parseFloat(end);
                } else {
                    end = parseFloat(end);
                }
            }

            if (typeof (end) === 'number') {
                this.currentProperties[property] = start + (end - start) * value;
            }

        }

        this.onUpdateCallback(this.currentProperties, value);

        if (elapsed == 1) {
            if (this.onCompleteCallback !== null && typeof this.onCompleteCallback == 'function') {
                this.onCompleteCallback(this.currentProperties);
            }
            return this.stop();
        }

    }

    destroy(){
        this.stop();
        this.uuid = null;
        this.currentProperties = null;
        this.startProperties = null;
        this.endProperties = null;
        this.duration = null;
        this.easingFunction = null;
        this.update = null;
    }
}

