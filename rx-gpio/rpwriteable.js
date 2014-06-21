var Rx = require('rx'),
    Observable = Rx.Observable,
    EventEmitter = new require('events').EventEmitter,
    _ = require('underscore'),
    //gpio = require('rpi-gpio');
    
    // Use this stub to test without a Raspberry Pi.
    gpio = require('../test/gpio-stub').stub;
    
RPWriteable.CHANGE = 'change';
RPWriteable.READ = 'read';
RPWriteable.ERROR = 'error';

function RPWriteable(pin) {
    // Constructor.
    // Writes to pin (turn on LEDs and stuff).
    // Extends EventEmitter.
    //
    // Option to use observables for chainable event
    // handling or other sequential logic flow.
    //
    // @param {Integer} pin - the physical pin to listen for.
    //
    var _pin = this._pin = pin;
    
    this._initialized = false;


    // Trigger to dispose internal observable.
    this._disposed = new Rx.Subject();

    _.extend(this, new EventEmitter());

    this._observable = Observable.fromEvent(this, RPWriteable.CHANGE)
                            .merge(Observable.fromEvent(this, RPWriteable.READ))
                            .merge(Observable.fromEvent(this, RPWriteable.ERROR))
                            .takeUntil(this._disposed);

    this._setupObservable = Observable.create(function(observer) {
        if (this._initialized) {
            observer.onNext();
            observer.onCompleted();
        } else {
            console.log('setting observable for setup');
            gpio.setup(this._pin, gpio.DIR_OUT, function() {
                this._initialized = true;
                observer.onNext();
                observer.onCompleted();
            }.bind(this));
        }

        // NoOp dispose method.
        return function() {};
    }.bind(this));
}

RPWriteable.prototype.get = function(callback) {
    // Read the pin and return the value in a
    // callback.
    // @return {RPWriteable}

    // Must call this async. Need to wait for setup to complete.
    this._setupObservable.subscribe(function() {
        gpio.read(this._pin, function(err, value) {
            if (err) {
                this.emit(RPWriteable.ERROR, {type: RPWriteable.ERROR, value: new Error(err)});
            } else {
                this.emit(RPWriteable.READ, {type: RPWriteable.READ, value: value});
            }
            callback && callback(err, value);
        }.bind(this));
    }.bind(this));

    // Override toObservable to only fire on the READ event ONE time.
    return {
        toObservable: function() {
            return this.toObservable(RPWriteable.READ).take(1);
        }.bind(this)
    };
};

RPWriteable.prototype.set = function(isOn) {
    // Set the LED on or off.
    // @param {Boolean} isOn - 
    // @return {RPWriteable}
    var self = this,
        pin = this._pin;

    // Must call this async. Need to wait for setup to complete.
    this._setupObservable.subscribe(function() {
        gpio.write(pin, isOn, function(err) {
            if (err) {
                self.emit(RPWriteable.ERROR, {type: RPWriteable.ERROR, value: new Error(err)});
            } else {
                self.emit(RPWriteable.CHANGE, {type: RPWriteable.CHANGE, value: isOn});
            }
        });
    });

    // Override toObservable to only fire ONE time.
    return {
        toObservable: function() {
            return this.toObservable(RPWriteable.CHANGE).take(1);
        }.bind(this)
    };
};

RPWriteable.prototype.toObservable = function() {
    // Returns an observable.
    // @param (optional) - Event names to filter for.
    // @return {Rx.Observable}
    var options = arguments.length ? Array.prototype.slice.call(arguments) : [];
    return this._observable
        .filter(function(ev) {
            if (options.length === 0) {
                return true;
            } else {
                // always listen for error
                if (options.length === 1) {
                    options.push(RPWriteable.ERROR);
                }
                return options.some(function(val) {
                    return ev.type === val;
                });
            }
        })
        .map(function(ev) {
            if (ev.value instanceof Error) {
                throw ev.value;
            }
            return ev && ev.value;
        });
};

RPWriteable.prototype.dispose = function() {
    // Cleanup and stop polling the pin.
    // Using Rx.Subject to trigger cleanup on observables
    // used in the instance.
    this._initialized = false;
    this._disposed.onNext();
};

RPWriteable.create = function(pin) {
    // Factory method.
    // @return {RPWriteable}
    return new RPWriteable(pin);
};

module.exports = RPWriteable;
