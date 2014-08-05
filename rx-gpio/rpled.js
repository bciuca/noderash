'use strict';

var RPWriteable = require('./rpwriteable');
var Rx = require('rx');

RPLED.prototype = new RPWriteable();

function RPLED(pin, onValue) {
    RPWriteable.prototype.init.call(this, pin);
    this._onValue = onValue === undefined ? true : onValue;
    this._offValue = !this._onValue;

    this._isBlinking = false;
    this._blinkMutex = new Rx.Subject();
}

RPLED.prototype.on = function() {
    return this.setValue(this._onValue);
};

RPLED.prototype.off = function() {
    return this.setValue(this._offValue);
};

RPLED.prototype.toggle = function() {
    return this.setValue(!this._pinValue);
};

RPLED.prototype.blinkOn = function(rate) {
    if (this._isBlinking) {
        throw new Error('Already blinking. Try stopping first.');
    }

    rate = rate || 300;

    return Rx.Observable.timer(1)
        .flatMap(function() {
            return Rx.Observable.interval(rate)
                .takeUntil(this._blinkMutex)
                .flatMap(function() {
                    return this.toggle();
                }.bind(this));
        }.bind(this))
        .doAction(function() {
            this._isBlinking = true;
        }.bind(this));
};

RPLED.prototype.blinkOff = function() {
    return Rx.Observable.timer(1)
        .doAction(function() {
            this._blinkMutex.onNext();
            this._isBlinking = false;
        }.bind(this))
        .flatMap(function() {
            return this.off();
        }.bind(this));
};

RPLED.prototype.blinkFor = function(rate, count, onOrOff) {
    // Blinks the led for a number of times at a specified rate.
    // @param rate - the rate in ms at which to blink the led
    // @param count - the number of cycles to blink
    // @param onOrOff - 'on' to leave the led on after the cycle, 
    //                  or 'off' to turn off.
    // @return Rx.Observable
    count = count || 5;
    onOrOff = onOrOff || 'on';

    var current = 0;
    var blinky = this.blinkOn(rate)
        .doAction(function(val) {
            if (val === this._offValue) {
                current++;
            }
        }.bind(this));

    return Rx.Observable.concat(
        blinky.takeWhile(function() {
            return current < count;
        }),
        this.blinkOff(),
        this[onOrOff]()
    )
    .reduce(function(acc) {
        return acc;
    });
};


RPLED.create = function(pin, onValue) {
    return new RPLED(pin, onValue);
};

module.exports = RPLED;
