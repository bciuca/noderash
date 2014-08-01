/**
 * Created by bogdan on 7/13/14.
 */
 'use strict';
 
var RPButton = require('./rpbutton');
var RPLightedToggleSwitch = require('./rplightedtoggleswitch');
var RPLED = require('./rpled');
var Rx = require('rx');

function RPBigRedButton() {
    this._activated = false;
}

RPBigRedButton.prototype.init = function(buttonPin, ledPin) {
    this._button = RPButton.create(buttonPin);
    this._led = RPLED.create(ledPin, true);
    return this;
};

RPBigRedButton.prototype.activate = function() {
    return RPLightedToggleSwitch.prototype.activate.call(this);
};

RPBigRedButton.prototype.deactivate = function() {
    return RPLightedToggleSwitch.prototype.deactivate.call(this);
};

RPBigRedButton.prototype.up = function() {
    return this._button.up().filter(function() {
        return this._activated;
    }.bind(this));
};

RPBigRedButton.prototype.down = function() {
    return this._button.down().filter(function() {
        return this._activated;
    }.bind(this));
};


RPBigRedButton.create = function(buttonPin, ledPin) {
    return new RPBigRedButton().init(buttonPin, ledPin);
};

module.exports = RPBigRedButton;

