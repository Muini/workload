'use strict'
module.exports = {
    staticFileGlobs: [
        '_DIST/**/**.css',
        '_DIST/**.html',
        '_DIST/**.php',
        '_DIST/**/**.*',
        '_DIST/js/**.js'
    ],
    handleFetch: true,
    stripPrefix: '_DIST/',
    runtimeCaching: [{
        urlPattern: /this\\.is\\.a\\.regex/,
        handler: 'cacheFirst'
    }]
}