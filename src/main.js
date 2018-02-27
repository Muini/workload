// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/* Loading Global Scss */
require('./assets/styles/main.scss')

/* Loading Polyfills */
/*import 'promise-polyfill'
import fetch from 'unfetch'
if (!window.Promise) {
    window.Promise = Promise
}
if (!window.fetch) {
    window.fetch = fetch
}*/

/* Loading Vendors */
import * as WebFont from 'webfontloader';
import UAParser from 'ua-parser-js'

/* User Agent Info */
window.ua = new UAParser().getResult()

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(' ', '-');
}
const device = htmlEntities(window.ua.device.type == undefined ? 'desktop' : window.ua.device.type);
const browser = htmlEntities(window.ua.browser.name);
const os = htmlEntities(window.ua.os.name);

requestAnimationFrame(_ => {
    document.body.classList.add(device);
    document.body.classList.add(browser);
    document.body.classList.add(os);

});

// Import main scene file
import './assets/scripts/main';

/*
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
    .then(function (reg) {
      console.log('Registration succeeded. Scope is ' + reg.scope)
    }).catch(function (error) {
      console.log('Registration failed with ' + error)
    })
}
*/

// Load fonts
WebFont.load({
    google: {
        families: ['Open Sans', 'Quattrocento']
    }
});