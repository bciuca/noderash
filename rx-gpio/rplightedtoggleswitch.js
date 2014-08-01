/**
 * Created by bogdan on 7/13/14.
 */
var RPSwitch = require('./rpswitch');
var RPLED = require('./rpled');
var Rx = require('rx');

function activate(instance, isActive) {
    if (instance._activated === isActive) {
        return Rx.Observable.return(isActive);
    }

    if (isActive) {
        // Add a delay for issue with writing to pin immediately.
        Rx.Observable.timer(10)
            .flatMap(function() {
                return instance._led.blinkFor(50, 5);
            })
            .doAction(function() {
                instance._activated = true;
            })
            .subscribe();
        return Rx.Observable.return(instance._activated);
    } else {
        return instance._led.off().doAction(function() {
            instance._activated = false;
        });
    }
}

function RPLightedToggleSwitch() {
    this._activated = false;
}

RPLightedToggleSwitch.prototype.init = function(switchPin, ledPin) {
    this._switch = new RPSwitch(switchPin);
    this._led = new RPLED(ledPin, false);
    return this;
};

RPLightedToggleSwitch.prototype.activate = function() {
    return activate(this, true);
};

RPLightedToggleSwitch.prototype.deactivate = function() {
    return activate(this, false);
};

RPLightedToggleSwitch.prototype.closed = function() {
    return this._switch.closed()
        .doAction(function() {
        }.bind(this))
        .filter(function() {
            return this._activated;
        }.bind(this))
        .concat(this._led.blinkOn(250));
};

RPLightedToggleSwitch.prototype.open = function() {
    return this._switch.open().filter(function() {
        return this._activated;
    }.bind(this))
    .concat(this._led.blinkOff());
};

RPLightedToggleSwitch.prototype.switchState = function() {
    return this._switch.state();
};

/**
 * Factory.
 * @param switchPin
 * @param ledPin
 * @returns {RPLightedToggleSwitch}
 */
RPLightedToggleSwitch.create = function(switchPin, ledPin) {
    return new RPLightedToggleSwitch().init(switchPin, ledPin);
};

module.exports = RPLightedToggleSwitch;