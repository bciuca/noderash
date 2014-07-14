var RPReadable = require('./rpreadable');
var Rx = require('rx');

RPSwitch.prototype = new RPReadable();

RPSwitch.OPEN = 'open';
RPSwitch.CLOSED = 'closed';

function RPSwitch(pin) {
    RPReadable.prototype.init.call(this, pin);

    this._changes = new Rx.Subject();

    this.changed()
        .subscribe(function(value) {
            this._changes.onNext(value);
        }.bind(this));
}

RPSwitch.prototype.closed = function() {
    return this._changes
        .filter(function(value) {
            return !!value;
        });
};

RPSwitch.prototype.open = function() {
    return this._changes
        .filter(function(value) {
            return !value;
        });
};

RPSwitch.prototype.state = function() {
    return this.read().map(function(state) {
        if (state) {
            return RPSwitch.CLOSED;
        } else {
            return RPSwitch.OPEN;
        }
    });
};

RPSwitch.create = function(pin) {
    return new RPSwitch(pin);
};


module.exports = RPSwitch;