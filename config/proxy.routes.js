'use strict'
module.exports = {
    // Proxy exemple
    // '/api': {
    //   target: 'http://jsonplaceholder.typicode.com',
    //   changeOrigin: true,
    //   pathRewrite: {
    //     '^/api': ''
    //   }
    // }
    '/static': {
        target: 'http://localhost:80/workload/static',
        changeOrigin: true,
        pathRewrite: {
            '^/static': ''
        }
    },
    /*'**': {
        target: 'http://localhost:80/vue-webpack-template',
        changeOrigin: true,
        pathRewrite: {
            '^/vue-webpack-template': ''
        }
    },*/
}