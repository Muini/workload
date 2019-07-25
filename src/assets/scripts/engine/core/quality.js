import MobileGPUs from '../utils/gpu/mobile';
import LaptopGPUs from '../utils/gpu/laptop';
import DesktopGPUs from '../utils/gpu/desktop';

import Engine from './engine';
import Log from '../utils/log';

const clamp = function(value, min, max){
    return Math.min(Math.max(value, min), max);
}

const nearestPow2 = function(n) {
    let m = n;
    for (var i = 0; m > 1; i++) {
        m = m >>> 1;
    }
    // Round to nearest power
    if (n & 1 << i - 1) {
        i++;
    }
    return 1 << i;
}

class Quality{
    constructor(){
        this.gpu = 'Unknown';
        this.score = 0;

        this.isMobile = false;
        this.isTablet = false;
        this.isLaptop = false;
        this.isDesktop = false;
    }

    init(){

        const screenWidth = window.innerWidth;
        if(screenWidth <= 640){
            this.isMobile = true;
        }else if(screenWidth <= 1200){
            this.isTablet = true;
        }else if(screenWidth <= 1440){
            this.isLaptop = true;
        }else{
            this.isDesktop = true;
        }

        this.detectGPU();

        this.setupSettings();

    }

    setupSettings(){

        this.settings = {
            // Global settings
            global: {
                pixelDensity: (() => {
                    // return Math.min(Math.max(this.score / (this.isMobile ? 300 : 1200) > window.devicePixelRatio ? window.devicePixelRatio : this.score / (this.isMobile ? 300 : 1200), 0.5), 2.0);
                    if ((this.isMobile || this.isDesktop) && this.score > 500 ) {
                        return (window.devicePixelRatio > 1.5 ? 1.5 : window.devicePixelRatio);
                    } else if ((this.isTablet || this.isLaptop) && this.score > 1500) {
                        return (window.devicePixelRatio > 1.5 ? 1.5 : window.devicePixelRatio);
                    /*} else if (this.score < 400) {
                        return (window.devicePixelRatio > 0.75 ? 0.75 : window.devicePixelRatio);*/
                    } else
                        return 1.0;
                })(),

            },
            // Postprocess settings
            postprocess: {
                bokeh: {
                    enabled: false,
                    samples: clamp(parseInt(this.score / 150), 4, 64),
                },
                blur: {
                    enabled: true,
                    samples: clamp(nearestPow2(parseInt(this.score / 300)), 4, 16),
                }
            },
            // Lights settings
            lights: {

            },
            // Shadows settings
            shadows: {
                enabled: this.score >= 500 ? true : false,
                quality: this.score < 1000 ? 0 : (this.score > 3000 ? 2 : 1),
                resolutionDivider: clamp(nearestPow2(10 - parseInt(this.score / 400)), 1, 4),
            },
            // Cubemaps settings
            cubemaps: {
                resolutionDivider: clamp(nearestPow2(10 - parseInt(this.score / 400)), 1, 8),
                canBeRealtime: this.score >= 1000 ? true : false,
            }
        }
        console.log(this.settings)
    }

    detectGPU() {
        const sanitizeString = function (str) {
            str = str.toString().replace('(R)', '').replace('(TM)', '').replace(/[\W*]+/gim, ' ');
            return str.trim();
        }

        // Hack: Get the GPU name 
        let GPUdetected = sanitizeString(Engine.renderer.getContext().getParameter(Engine.renderer.extensions.get('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL));

        this.gpu = GPUdetected;

        // Check if the GPU is phone or tablet
        MobileGPUs.forEach((score, name) => {
            if (sanitizeString(name).indexOf(GPUdetected) > -1 || GPUdetected.indexOf(sanitizeString(name)) > -1) {
                this.gpu = name;
                this.score = parseInt(parseFloat(score) * 5);
            }
        })
        if (this.score !== 0)
            return;
        // Check if the GPU is laptop
        LaptopGPUs.forEach((score, name) => {
            if (sanitizeString(name).indexOf(GPUdetected) > -1 || GPUdetected.indexOf(sanitizeString(name)) > -1) {
                this.gpu = name;
                this.score = parseInt(parseFloat(score) * 0.8);
            }
        })
        if (this.score !== 0)
            return;
        // Check if the GPU is desktop
        DesktopGPUs.forEach((score, name) => {
            if (sanitizeString(name).indexOf(GPUdetected) > -1 || GPUdetected.indexOf(sanitizeString(name)) > -1) {
                this.gpu = name;
                this.score = parseInt(parseFloat(score) / 2);
            }
        })
        if (this.score !== 0)
            return;

        // If we fail to detect GPU, assume it's low end graphics & set score based on device type
        if (this.isMobile || this.isTablet) {
            this.score = 100;
        } else if (this.isLaptop) {
            this.score = 500;
        } else
            this.score = 1000;
    }

    detectCPU(){
        /*
        const thread = Thread(_ => {
            function factorial(num) {
                if (num < 0) {
                    throw new Error("Number cannot be negative.");
                }
                if (num % 1 !== 0) {
                    throw new Error("Number must be an integer.");
                }
                if (num === 0 || num === 1) {
                    return 1;
                }
                return num * factorial(num - 1);
            }
            const iterations = 100000;
            for (let i = 1; i < iterations; i++) {
                factorial(100);
            }
            return;
        }, null, false);

        (async() => {
            let startTime = performance.now();
            await thread.run();
            let durationTime = performance.now() - startTime;
            if (Log.debug) {
                console.log('Performance Test: ' + durationTime + ' ms');
            }
        })();
        */
    }
}

export default new Quality();