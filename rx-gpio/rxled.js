'use strict';

var RxGpio = require('./rxgpio'),
    Rx = require('rx'),
    utils = require('./rputils'),
    Class = utils.Class;

var RxLed = Class.extend(RxGpio, [],
    // Constructor
    function RxLed(gpio, onValue, edge) {
        
        this._onValue = onValue;
        this._offValue = +!onValue;
    },

    // prototype members
    {
        on: function() {
            return utils.rxify(this._gpio.write, this._gpio, true, [this._onValue]);
        },

        off: function() {
            return utils.rxify(this._gpio.write, this._gpio, true, [this._offValue]);
        },

        toggle: function() {
            return this.read()
                .flatMap(function(val) {
                    return this.write(+!val);
                }.bind(this))
        }
    },

    // static members
    {

    }
);

module.exports = RxLed;