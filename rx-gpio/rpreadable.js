'use strict';

var Rx = require('rx'),
    Observable = Rx.Observable,
    _ = require('underscore'),
    //gpio = require('rpi-gpio');

    // Use this stub to test without a Raspberry Pi.
    gpio = require('../test/gpio-stub').stub;

function RPReadable(pin) {
    // Constructor.
    // Reads pin -- direction IN -- and determines whether the pin is closed
    // or open. Option to use observables for chainable event
    // handling or other sequential logic flow.
    //
    // Once the pin is initialized, the pin will be read
    // continuously to listen for changes.
    // @param {Number} pin - the pin number to listen for.
    // @param {Integer} debounce - milliseconds to debounce 
    //   pin reading polling.

    this._pin = pin;
    this._debounceTime = 100;

    this.id = _.uniqueId('RPReadable__');

    var prevValue = true,
        currValue = true;

    // Trigger to dispose internal observable.
    this._disposed = new Rx.Subject();
    this._togglePolling = new Rx.Subject();

    gpio.setup(this._pin, gpio.DIR_IN);
}

RPReadable.prototype.changed = function() {
    return Observable.create(function(observer) {
        var isPolling = true;
        var poll = _.debounce(function RPReadable_changed_poll() {
            if (!isPolling) {
                observer.onCompleted();
                return;
            }

            // Read the pin recursively.
            gpio.read(this._pin, function(err, value) {
                if (err) {
                    observer.onError(err);
                } else {
                    this._prevValue = this._currValue;
                    this._currValue = value;
                    
                    if (this._prevValue !== this._currValue) {
                        observer.onNext(value);   
                    }

                    poll();
                }
            }.bind(this));
        }.bind(this), this._debounceTime);

        // Stop polling once instance is disposed.
        this._disposed.onNext(function() {
            isPolling = false;
        });

        poll();

        return function RPReadable_changed_poll_dispose() {
            isPolling = false;
        }.bind(this);
    }.bind(this));
};

RPReadable.prototype.read = function() {
    return Observable.create(function(observer) {
        gpio.read(this._pin, function(err, value) {
            if (err) {
                observer.onError(err);
            } else {
                observer.onNext(value);
            }
        }.bind(this));

        return function RPReadable_read_dispose() {};
    }.bind(this));
};

RPReadable.prototype.dispose = function() {
    // Cleanup and stop polling the pin.
    // Using Rx.Subject to trigger cleanup on observables
    // used in the instance.
    this._disposed.onNext();
};

RPReadable.create = function(pin) {
    // Factory method.
    // @return {RPReadable}
    return new RPReadable(pin);
};

Object.defineProperty(RPReadable.prototype, "debounceTime", {
    // Set debounceTime setter/getter
    //
    get: function() {
        return this._debounceTime;
    },
    set: function(val) {
        this._debounceTime = val;
    }
});

module.exports = RPReadable;