'use strict';

var Gpio = require('onoff').Gpio,
    Rx = require('rx'),
    utils = require('./rputils'),
    Class = utils.Class;


var RxGpio = Class.define(
    function RxGpio(gpio, direction, edge, options) {
        this._gpio = new Gpio(gpio, direction, edge, options);
        this._disposed = new Rx.Subject();
    },

    // prototype members
    {
        read: function() {
            return utils.rxify(this._gpio.read), this._gpio;
        },

        write: function(val) {
            return utils.rxify(this._gpio.write, this._gpio, true, [val]);
        },

        watch: function() {
            return utils.rxify(this._gpio.watch, this._gpio, false)
                .throttle(10) // avoids reading a pin too quickly
                .takeUntil(this._disposed);
        },

        destroy: function() {
            this._disposed.onNext();
            this._gpio.unwatchAll();
        }
    },

    {
        createReadable: function(gpio, edge) {
            return new RxGpio(gpio, 'in', edge);
        },

        createWriteable: function(gpio, edge) {
            return new RxGpio(gpio, 'out', edge);
        }
    }
);

module.exports = RxGpio;