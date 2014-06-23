var Rx = require('rx'),
    Observable = Rx.Observable,
    EventEmitter = new require('events').EventEmitter,
    _ = require('underscore'),
    gpio = require('rpi-gpio');

    // Use this stub to test without a Raspberry Pi.
    //gpio = require('../test/gpio-stub').stub;
    
RPiButton.UP = 'buttonup';
RPiButton.DOWN = 'buttondown';
RPiButton.ERROR= 'error';

function RPiButton(pin, initOnCreation, debounce) {
    // Constructor.
    // Reads pin and determines whether the button is down
    // or up. Option to use observables for chainable event
    // handling or other sequential logic flow.
    //
    // Once the button is initialized, the pin will be read
    // continuously to listen for changes.
    // @param {Number} pin - the pin number to listen for.
    // @param {Boolean} initOnCreation - init on instantiation.
    // @param {Integer} debounce - milliseconds to debounce 
    //   pin reading polling.

    var _pin = this._pin = pin,
        btnprev = true,
        btncurr = true,
        _pollDebounce = 10;
    
    this._isStarted = false;

    // Trigger to dispose internal observable.
    this._disposed = new Rx.Subject();

    this._disposed.subscribe(function() {
        this._isStarted = false;
    }.bind(this));

    _.extend(this, new EventEmitter());

    // Set debounceTime setter/getter
    Object.defineProperty(RPiButton.prototype, "debounceTime", {
        get: function() {
            return _pollDebounce;
        },
        set: function(val) {
            _pollDebounce = val;
        }
    });

    // The instance observable. Merge all possible observables.
    this._observable = Observable.fromEvent(this, RPiButton.UP)
                            .merge(Observable.fromEvent(this, RPiButton.DOWN))
                            .merge(Observable.fromEvent(this, RPiButton.ERROR))
                            .takeUntil(this._disposed);

    // Read the input of the pin recurively.
    // Debounce is setup incorrectly. Should probably fix this.
    this._readInput = _.debounce(function() {
        gpio.read(_pin, function(err, value) {
            var type;

            if (err) {
                type = RPiButton.ERROR;
               this.emit(type, {type: type, value: new Error(err)});
               this._isStarted = false;
            } else {
                btnprev = btncurr;
                btncurr = value;

                if (btnprev !== btncurr) {
                    type = btncurr ? RPiButton.UP : RPiButton.DOWN; 
                    this.emit(type, {type: type, value: value});
                }
                this._isStarted && this._readInput();
            }
        }.bind(this));
    }.bind(this), this.debounceTime);

    if (initOnCreation) {
        this.initialize(debounce);
    }
}

RPiButton.prototype.initialize = function(debounce) {
    // Initialize the button and start reading the pin values.
    //
    if (debounce) {
        this.debounceTime = debounce;
    }

    this._isStarted = true;
    gpio.setup(this._pin, gpio.DIR_IN, this._readInput);
};

RPiButton.prototype.toObservable = function() {
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
                    options.push(RPiButton.ERROR);
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

RPiButton.prototype.dispose = function() {
    // Cleanup and stop polling the pin.
    // Using Rx.Subject to trigger cleanup on observables
    // used in the instance.
    console.log('RPButton.dispose');
    this._disposed.onNext();
};

RPiButton.create = function(pin, initOnCreation, debounce) {
    // Factory method.
    // @return {RPiButton}
    return new RPiButton(pin, initOnCreation, debounce);
};

module.exports = RPiButton;