# [Vue.js](https://vuejs.org/) Webpack Template

> A Vue.js blank template

---
## TODO
* Routine for updating vue-webpack-template from cli-tool
* Moving from Sass/Scss to Post-Css

---



## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

## Configuration

### Global Configuration

Configuration files are in the ```/build/config``` folder.

### Linter (esLint)

EsLint is setting up in the dev build process but disable in ```.eslintignore```
by default. To enable it, remove ```src/**/*.js``` line.

### Proxy

All proxy routes can be found in ```/build/config/proxy.routes.js```. This file is directly imported in the ```index.js``` configuration file set in the same folder.



## Components File Structure

All ```.vue``` files are in the ```/src/components``` folder. Please follow [BEM File Structure methodology](https://en.bem.info/methodology/filestructure/) for more details.



## Handling assets

### JS or VUE files
If your website goes to the root directory of your server, assets served from static folder in your ```.js``` files (or ```.vue``` files) should be formated as ```/static/{subfolder}/{file}.{ext}```.  In case of the hosting folder is a root's subfolder, path should be formated as a relative path : ```./static/{subfolder}/{file}.{ext}```.


### CSS url()
If your website goes to the root directory of your server, you must specify the ```assetsPublicPath``` in ```build/config/index.js```. It must correspond to your absolute subfolder path for production.


## Service Worker

We using [sw-precache](https://github.com/GoogleChrome/sw-precache) to setup our project's service worker. All sw configuration are located in ```/build/sw-precache.config.js```.
Run ```npm run sw``` to generate it in the dist folder, after build routine.



## Prerendering for SEO

Warning : This webpack plugin is installed but disabled by default. Uncomment it in ```/build/webpack.prod.conf.js``` in the ```plugins``` array to enable it.

> If you want to prerender routes that will not significantly change once pushed to production, use this Webpack plugin: [prerender-spa-plugin](https://www.npmjs.com/package/prerender-spa-plugin) ([more details for this template](http://vuejs-templates.github.io/webpack/prerender.html)), which has been tested for use with Vue.



## Vue Template & Webpack Doc
For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
