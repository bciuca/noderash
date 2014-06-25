var Rx = require('rx'),
    Observable = Rx.Observable,
    EventEmitter = new require('events').EventEmitter,
    _ = require('underscore'),
    //gpio = require('rpi-gpio');
    
    // Use this stub to test without a Raspberry Pi.
    gpio = require('../test/gpio-stub').stub;
    
// Constants - event names.
RPWriteable.CHANGE = 'change';
RPWriteable.READ = 'read';
RPWriteable.ERROR = 'error';

// RPWriteable extends EventEmitter
_.extend(RPWriteable.prototype, new EventEmitter());

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

    // Trigger to dispose internal observable.
    this._disposed = new Rx.Subject();

    // The instance observable. Merge all possible observables.
    this._observable = Observable.fromEvent(this, RPWriteable.CHANGE)
                            .merge(Observable.fromEvent(this, RPWriteable.READ))
                            .merge(Observable.fromEvent(this, RPWriteable.ERROR))
                            .takeUntil(this._disposed);
}

RPWriteable.prototype.initialize = function(callback) {
    // Setup the pin for writing.
    // @param {Function} callback
    // @return {RPWriteable}
    if (this._initialized) {
        callback && callback();
        return this;
    }

    gpio.setup(this._pin, gpio.DIR_OUT, function() {
        this._initialized = true;
        callback && callback;
    }.bind(this));

    return this;
};  

RPWriteable.prototype.get = function(callback) {
    // Read the pin and emit event and fire callback.
    // @return {RPWriteable}

    if (!this._initialized) throw new Error('Must initialize before polling pin.');

    gpio.read(this._pin, function(err, value) {
        if (err) {
            this.emit(RPWriteable.ERROR, {type: RPWriteable.ERROR, value: new Error(err)});
        } else {
            this.emit(RPWriteable.READ, {type: RPWriteable.READ, value: value});
        }
        callback && callback(err, value);
    }.bind(this));

    return this;
};

RPWriteable.prototype.set = function(value, callback) {
    // Set the LED on or off.
    // @param {Boolean} value - 
    // @return {RPWriteable}
    
    if (!this._initialized) throw new Error('Must initialize before polling pin.');

    var self = this,
        pin = this._pin;

    gpio.write(pin, value, function(err) {
        if (err) {
            self.emit(RPWriteable.ERROR, {type: RPWriteable.ERROR, value: new Error(err)});
        } else {
            self.emit(RPWriteable.CHANGE, {type: RPWriteable.CHANGE, value: value});
        }
        callback && callback(err, value);
    });

    return this;
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

RPWriteable.prototype.debugSubscribe = function() {
    // Assign debug subscribe to print to console.
    var pin = this._pin;
    this.toObservable().subscribe(function(val) {
        console.log('onNext write pin ' + pin + ':', val);
    }, function(e) {
        console.log('onError write pin ' + pin + ':', e);
    }, function() {
        console.log('onCompleted write pin', pin);
        self.dispose();
    });
};


RPWriteable.prototype.dispose = function() {
    // Cleanup and stop polling the pin.
    // Using Rx.Subject to trigger cleanup on observables
    // used in the instance.
    this._disposed.onNext();
    this._initialized = false;
};

RPWriteable.create = function(pin) {
    // Factory method.
    // @return {RPWriteable}
    return new RPWriteable(pin);
};

module.exports = RPWriteable;
