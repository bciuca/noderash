'use strict';

var RPSwitch = require('../rx-gpio/rpswitch'),
    RPToggleSwitch = require('../rx-gpio/rplightedtoggleswitch'),
    RPLED = require('../rx-gpio/rpled'),
    RPBigRedButton = require('../rx-gpio/rpbigredbutton'),
    utils = require('../rx-gpio/rputils'),
    g2p = utils.gpioToPinMapping,
    Rx = require('rx'),
    debug = false,
    keySwitch,
    toggleSwitch,
    bigRedButton,
    noop = function() {};

function log() {
    if (debug) {
        console.log.apply(console, arguments);
    }
}

function initialize(config) {
    config = config || { };
    config.pins = config.pins || {};
    debug = !!config.debug;

    var pin_keySwitch = config.pins.keySwitch || g2p.$17,       // 11
        pin_toggleSwitch = config.pins.toggleSwitch || g2p.$22, // 15
        pin_toggleLED = config.pins.toggleSwitchLED || g2p.$23, // 16
        pin_button = config.pins.button || g2p.$27,             // 13
        pin_buttonLED = config.pins.buttonLED || g2p.$18,       // 12

        // How many times to take action on big red button. -1 for infinite.
        // Default is inifinite.
        allowedPresses = config.actionCount || -1,
        pushCount = 0,

        keySwitchAction = config.keySwitchAction || noop,
        toggleSwitchAction = config.toggleSwitchAction || noop,
        bigRedButtonAction = config.bigRedButtonAction || noop;

    keySwitch = RPSwitch.create(pin_keySwitch);
    toggleSwitch = RPToggleSwitch.create(pin_toggleSwitch, pin_toggleLED);
    bigRedButton = RPBigRedButton.create(pin_button, pin_buttonLED);

    keySwitch.closed()
        .doAction(keySwitchAction)
        .flatMap(function() {
            return toggleSwitch.activate();
        })
        .subscribe(function(val) {
            log('Key switch is ON');
        }, function(e) {
            log('onError key switch read pin', e);
        }, function() {
            log('onCompleted key switch read pin');
        });

    keySwitch.open()
        .doAction(keySwitchAction)
        .flatMap(function() {
            return toggleSwitch.deactivate();
        })
        .flatMap(function() {
            return bigRedButton.deactivate();
        })
        .subscribe(function(val) {
            log('Key switch is OFF');
        }, function(e) {
            log('onError key switch read pin', e);
        }, function() {
            log('onCompleted key switch read pin');
        });

    toggleSwitch.closed()
        .doAction(toggleSwitchAction)
        .doAction(function() {
            // reset the push count
            pushCount = 0;
        })
        .flatMap(function() {
            return bigRedButton.activate();
        })
        .subscribe(function(val) {
            log('Toggle switch is ON');
        }, function(e) {
            log('onError toggle switch', e);
        }, function() {
            log('onCompleted toggle switch read pin');
        });

    toggleSwitch.open()
        .doAction(toggleSwitchAction)
        .flatMap(function() {
            return bigRedButton.deactivate();
        })
        .subscribe(function(val) {
            log('Toggle switch is OFF');
        }, function(e) {
            log('onError toggle switch', e);
        }, function() {
            log('onCompleted toggle switch read pin');
        });

    bigRedButton.up()
        .filter(function() {
            return allowedPresses === -1 || pushCount < allowedPresses;
        })
        .doAction(function() { pushCount++; })
        .doAction(bigRedButtonAction)
        .subscribe(function() {
            log('Big red button PRESSED');
        });
}

module.exports = {
    initialize: initialize,
    dispose: function() {
        return toggleSwitch._led.off()
            .merge(bigRedButton._led.off());
    }
};