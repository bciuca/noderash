/**
 * Created by bogdan on 7/13/14.
 */
var RPReadable = require('./rpreadable');
var Rx = require('rx');

RPButton.prototype = new RPReadable();

function RPButton(pin) {
    RPReadable.prototype.init.call(this, pin);

    this._hasBeenPushed = false;
    this._changes = new Rx.Subject();

    this.changed()
        .subscribe(function(value) {
            if (!this._hasBeenPushed && value) {
                this._hasBeenPushed = true;
            }
            this._changes.onNext(value);
        }.bind(this));
}

RPButton.prototype.up = function() {
    return this._changes
        .filter(function(value) {
            return !value && this._hasBeenPushed;
        }.bind(this));
};

RPButton.prototype.down = function() {
    return this._changes
        .filter(function(value) {
            return !!value;
        });
};

RPButton.create = function(pin) {
    return new RPButton(pin);
};

module.exports = RPButton;