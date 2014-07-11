'use strict';

var Rx = require('rx'),
    gpioUtils = require('./rputils'),
    Observable = Rx.Observable,
    EventEmitter = require('events').EventEmitter,
    _ = require('underscore'),
    gpio = gpioUtils.getGpioLib();

function RPWriteable(pin) {
    // Constructor.
    // Writes to pin -- pin direction OUT (turn on LEDs and stuff).
    // Extends EventEmitter.
    //
    // Option to use observables for chainable event
    // handling or event stream management.
    //
    // @param {Integer} pin - the physical pin to listen for.
    //
    
    this._pin = pin;
    this._initialized = false;
    this._pinValue = undefined;

    // Trigger to dispose internal observable.
    this._disposed = new Rx.Subject();

    // Lazy initialization. Init only when need to write the pin.
    this._init = Observable.create(function(observer) {
        if (this._initialized) {
            observer.onNext(true);
            observer.onCompleted();
        } else {
            try {
                gpio.setup(this._pin, gpio.DIR_OUT, function() {
                    this._initialized = true;
                    observer.onNext(true);
                    observer.onCompleted();
                }.bind(this));    
            } catch (err) {
                observer.onError(err);
            }
        }
        
        // noop dispose
        return function() {}
    }.bind(this));
}

RPWriteable.prototype.getValue = function() {
    // Read the pin
    // @return {Rx.Observable}
    return Observable.return(this._pinValue);
};

RPWriteable.prototype.setValue = function(value, force) {
    // Set the LED on or off.
    // @param {Boolean} value - 
    // @param {Boolean} force - force write the value. Default is false.
    // @return {RPWriteable}

    if (this._pinValue === value && !force) {
        return Rx.Observable.return(this._pinValue);
    }

    return this._init.flatMap(function() {
        return Observable.create(function(observer) {
            gpio.write(this._pin, value, function(err) {
                if (err) {
                    observer.onError(err);
                } else {
                    this._pinValue = value;
                    observer.onNext(value);
                    observer.onCompleted();
                }
            }.bind(this));

            // noop dispose
            return function() {};
        }.bind(this));
    }.bind(this));
};

RPWriteable.prototype.toggle = function() {
    console.log('toggle from', this._pinValue, 'to', !this._pinValue);
    return this.setValue(!this._pinValue);
};


RPWriteable.prototype.dispose = function() {
    // Cleanup and stop polling the pin.
    // Using Rx.Subject to trigger cleanup on observables
    // used in the instance.
    this._disposed.onNext();
    this._initialized = false;
    gpioUtils.cleanupPin(this._pin);
};

RPWriteable.create = function(pin) {
    // Factory method.
    // @return {RPWriteable}
    return new RPWriteable(pin);
};

module.exports = RPWriteable;
