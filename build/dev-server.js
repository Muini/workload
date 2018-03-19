require('./check-versions')()

var config = require('../config')
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

var os = require('os')
var opn = require('opn')
var path = require('path')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = require('./webpack.dev.conf')
var browserSync = require('browser-sync');
var browsersync = browserSync.create();

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
    // automatically open browser, if not set will be false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
    // Define HTTP proxies to your custom API backend
    // https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

// var app = express()
var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    noInfo: true,
    quiet: true,
    stats: { colors: true }
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
    noInfo: true,
    quiet: true,
    // log: () => {}
    log: false
})

// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function(compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function(data, cb) {
        hotMiddleware.publish({ action: 'reload' })
        cb()
    })
})

var middlewares = [];

// proxy api requests
Object.keys(proxyTable).forEach(function(context) {
    var options = proxyTable[context]
    if (typeof options === 'string') {
        options = { target: options }
    }
    middlewares.push(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
middlewares.push(require('connect-history-api-fallback')())

// serve webpack bundle output
middlewares.push(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
middlewares.push(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)

var _resolve
var readyPromise = new Promise(resolve => {
    _resolve = resolve
})

devMiddleware.waitUntilValid(() => {

    browsersync.init({
        proxy: {
            target: 'http://localhost:80/',
        },
        port: 8080,
        middleware: middlewares,
        files: [
            '/*.html',
            '/*.php'
        ],
        serveStatic: [{
            route: staticPath,
            dir: 'tmp'
        }],
        open: false,
        notify: false,
        logFileChanges: false,
        injectChanges: false,
        reload: false,
        ghostMode: {
            clicks: true,
            forms: false,
            scroll: true
        },
        ui: false
    });

    _resolve()
})

module.exports = {
    ready: readyPromise,
    close: () => {
        browsersync.exit()
    }
}