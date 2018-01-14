export default class Looper {

    constructor(context) {
        this.bind([
            'add',
            'remove',
            'loop',
            'start',
            'stop'
        ])

        this.context = context || this
        this.id = undefined

        this.actions = []
        this.actionsName = []
        this.actionsLength = 0
    }

    bind(arr) {
        arr.forEach((f) => {

            this[f] = this[f].bind(this)
        })
    }

    loop(time) {
        let i
        let l = this.actionsLength

        if (l.length === 0) return

        const actionsCall = function() {
            for (i = 0; i < l; i++) {
                if (i > l) return
                this.actions[i].call(this, time)
            }
        }

        this.id = requestAnimationFrame(this.loop.bind(this))
        actionsCall.call(this)
        return false
    }

    start() {
        if (!this.id) {
            if (this.onStart) {
                if (typeof this.onStart === 'function') {
                    this.onStart.call(this)
                } else {
                    throw new Error('onStart is not a function.')
                }
            }
            this.then = Date.now()
            requestAnimationFrame(time => this.loop(time))
        }
    }

    stop() {
        if (this.id) {
            if (this.onStop) {
                if (typeof this.onStop === 'function') {
                    this.onStop.call(this)
                } else {
                    throw new Error('onStop is not a function.')
                }
            }
            window.cancelAnimationFrame(this.id)
            this.id = undefined
        }
    }

    add(obj) {
        const self = this

        const addFunction = function(obj) {
            obj.bind(self)
            self.actionsName.push(obj.name)
            self.actions.push(obj)
            self.actionsLength = self.actions.length
        }

        if (typeof obj === 'function') {
            addFunction(obj)
        } else if (obj instanceof Array) {
            obj.forEach(f => addFunction(f))
        } else {
            throw new Error('Cannot add ' + f + ' to loop. ' + f + ' is not a type of function, array of function, or is undefined.')
        }
    }

    remove(obj) {
        const self = this

        const removeFunction = function(obj) {
            let name = self.actionsName.indexOf(obj.name)
            if (name !== -1) {
                self.actions.splice(name, 1)
                self.actionsName.splice(name, 1)
                self.actionsLength = self.actions.length
            } else {
                throw new Error('The function ' + obj + " to remove doesn't exist.")
            }
        }

        if (typeof obj === 'function') {
            removeFunction(obj)
        } else if (obj instanceof Array) {
            obj.forEach(f => removeFunction(f))
        } else {
            throw new Error('Cannot remove ' + f + ' from loop. ' + f + ' is not a type of function, array of function, or is undefined.')
        }
    }
}