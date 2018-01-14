'use strict'
import VueRouter from 'vue-router'
import Home from './components/views/home/home'

export default function(vue) {
    const routes = [{
        path: '/',
        component: Home
    }]

    vue.use(VueRouter)

    return new VueRouter({
        mode: 'history',
        scrollBehavior(to, from, savedProsition) {
            return { x: 0, y: 0 }
        },
        //base: '/',
        routes
    })
}