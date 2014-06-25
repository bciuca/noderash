var Rx = require('rx'),
    Observable = Rx.Observable,
    EventEmitter = new require('events').EventEmitter,
    _ = require('underscore'),
    //gpio = require('rpi-gpio');

    // Use this stub to test without a Raspberry Pi.
    gpio = require('../test/gpio-stub').stub;

// Constants - event names
RPReadable.OPEN = 'pinopen';
RPReadable.CLOSED = 'pinclosed';
RPReadable.ERROR= 'error';

// RPReadable extends EventEmitter
_.extend(RPReadable.prototype, new EventEmitter());

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
    this._debounceTime = 10;

    var prevValue = true,
        currValue = true;
    
    this._isStarted = false;

    // Trigger to dispose internal observable.
    this._disposed = new Rx.Subject();

    this._disposed.subscribe(function() {
        // Stop reading the pin.
        this._isStarted = false;
    }.bind(this));

    // The instance observable. Merge all possible observables.
    this._observable = Observable.fromEvent(this, RPReadable.OPEN)
                            .merge(Observable.fromEvent(this, RPReadable.CLOSED))
                            .merge(Observable.fromEvent(this, RPReadable.ERROR))
                            .takeUntil(this._disposed);

    // Read the input of the pin recurively.
    // Debounce is setup incorrectly. Should probably fix this.
    this._readInput = _.debounce(function() {
        gpio.read(this._pin, function(err, value) {
            var type;

            if (err) {
                type = RPReadable.ERROR;
               this.emit(type, {type: type, value: new Error(err)});
               this._isStarted = false;
            } else {
                prevValue = currValue;
                currValue = value;

                if (prevValue !== currValue) {
                    type = currValue ? RPReadable.OPEN : RPReadable.CLOSED; 
                    this.emit(type, {type: type, value: value});
                }
                this._isStarted && this._readInput();
            }
        }.bind(this));
    }.bind(this), this.debounceTime);
}

RPReadable.prototype.initialize = function() {
    // Initialize the button and start reading the pin values.
    this._isStarted = true;
    gpio.setup(this._pin, gpio.DIR_IN, this._readInput);

    return this;
};

RPReadable.prototype.toObservable = function() {
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
                    options.push(RPReadable.ERROR);
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

RPReadable.prototype.debugSubscribe = function() {
    // Assign debug subscribe to print to console.
    var pin = this._pin;
    this.toObservable().subscribe(function(val) {
        console.log('onNext read pin ' + pin + ':', val);
    }, function(e) {
        console.log('onError read pin ' + pin + ':', e);
    }, function() {
        console.log('onCompleted read pin', pin);
        self.dispose();
    });
};

RPReadable.prototype.dispose = function() {
    // Cleanup and stop polling the pin.
    // Using Rx.Subject to trigger cleanup on observables
    // used in the instance.
    this._disposed.onNext();
};

RPReadable.create = function(pin, initOnCreation, debounce) {
    // Factory method.
    // @return {RPReadable}
    return new RPReadable(pin, initOnCreation, debounce);
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