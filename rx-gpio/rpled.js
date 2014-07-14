var RPWriteable = require('./rpwriteable');
var Rx = require('rx');

RPLED.prototype = new RPWriteable();

function RPLED(pin, onValue) {
    console.log('RPLED ', pin, onValue);
    RPWriteable.prototype.init.call(this, pin);
    this._onValue = onValue === undefined ? true : onValue;
    this._offValue = !this._onValue;

    console.log('on value is ', this._onValue, this._offValue);

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
    console.log('blinkOn', this._isBlinking);
    if (this._isBlinking) {
        throw new Error('Already blinking. Try stopping first.');
    }

    rate = rate || 300;

    return Rx.Observable.timer(1)
        .flatMap(function() {
            this._isBlinking = true;

            return Rx.Observable.interval(rate)
                .takeUntil(this._blinkMutex)
                .flatMap(function() {
                    return this.toggle();
                }.bind(this));
        }.bind(this));
};

RPLED.prototype.blinkOff = function() {
    return Rx.Observable.timer(1)
        .doAction(function() {
            this._blinkMutex.onNext();
            this._isBlinking = false;
            console.log('blinky is now false');
        }.bind(this))
        .flatMap(function() {
            console.log('now that blinky is doen, turn dat shitz off');
            return this.off();
        }.bind(this));
};

RPLED.prototype.blinkFor = function(rate, count, onOrOff) {
    count = count || 5;
    onOrOff = onOrOff || 'on';

    var current = 0;
    var blinky = this.blinkOn(rate)
        .doAction(function(val) {
            if (val === this._offValue) {
                current++;
            }
        }.bind(this));

    return blinky.takeWhile(function() {
        return current < count;
    })
    .concat(this.blinkOff())
    .concat(this[onOrOff]());
};


RPLED.create = function(pin, onValue) {
    return new RPLED(pin, onValue);
};

module.exports = RPLED;
