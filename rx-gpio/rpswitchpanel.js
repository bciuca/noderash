'use strict';

var RPSwitch = require('../rx-gpio/rpswitch'),
    RPToggleSwitch = require('../rx-gpio/rplightedtoggleswitch'),
    RPLED = require('../rx-gpio/rpled'),
    RPBigRedButton = require('../rx-gpio/rpbigredbutton'),
    utils = require('../rx-gpio/rputils'),
    gpio = utils.getGpioLib(),
    g2p = utils.gpioToPinMapping,
    Rx = require('rx'),
    debug = false,
    keySwitch,
    toggleSwitch,
    bigRedButton,
    statusLED,
    noop = function() {},
    disposed = new Rx.Subject(),

    STATUS_LED_ERROR_BLINK_RATE = 1000;

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
        pin_statusLED = config.pins.statusLED || g2p.$24,       // 18

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
    statusLED = RPLED.create(pin_statusLED, true);

    var cleanupBeforeStart = dispose().onErrorResumeNext(Rx.Observable.empty());
    
    Rx.Observable.concat(
        cleanupBeforeStart,
        statusLED.on()
    )
    .subscribe(function(v) {console.log(v)}, onError, noop);


    keySwitch.closed()
        .doAction(keySwitchAction)
        .flatMap(function() {
            return toggleSwitch.activate();
        })
        .subscribe(noop, onError, noop);

    keySwitch.open()
        .doAction(keySwitchAction)
        .flatMap(function() {
            return toggleSwitch.deactivate();
        })
        .subscribe(noop, onError, noop);

    toggleSwitch.closed()
        .doAction(toggleSwitchAction)
        .doAction(function() {
            // reset the push count
            pushCount = 0;
        })
        .flatMap(function() {
            return bigRedButton.activate();
        })
        .subscribe(noop, onError, noop);

    toggleSwitch.open()
        .doAction(toggleSwitchAction)
        .flatMap(function() {
            return bigRedButton.deactivate();
        })
        .subscribe(noop, onError, noop);

    bigRedButton.up()
        .filter(function() {
            return allowedPresses === -1 || pushCount < allowedPresses;
        })
        .doAction(function() {
            pushCount++;
        })
        .doAction(bigRedButtonAction)
        .subscribe(noop, onError, noop);
}

function onError(err) {
    console.log(err);
    statusLED.blinkOn(STATUS_LED_ERROR_BLINK_RATE).takeUntil(disposed).subscribe();
}

function dispose() {
    return Rx.Observable.merge(
        toggleSwitch.deactivate(),
        statusLED.blinkOff(),
        statusLED.off(),
        bigRedButton.deactivate()
    );
}

module.exports = {
    initialize: initialize,
    dispose: dispose
};