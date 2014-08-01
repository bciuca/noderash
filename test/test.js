'use strict';

var RPSwitch = require('../rx-gpio/rpswitch'),
    RPToggleSwitch = require('../rx-gpio/rplightedtoggleswitch'),
    RPLED = require('../rx-gpio/rpled'),
    RPBigRedButton = require('../rx-gpio/rpbigredbutton'),
    RPSwitchPanel = require('../rx-gpio/rpswitchpanel'),
    utils = require('../rx-gpio/rputils'),
    g2p = utils.gpioToPinMapping,
    Rx = require('rx');

console.log('Testing stub ...');

RPSwitchPanel.initialize({
    keySwitchAction: function(v) {
        console.log('key switch', v);
    },

    toggleSwitchAction: function(v) {
        console.log('toggle switch', v);
    },

    bigRedButtonAction: function() {
        console.log('BOOOOM!!!');
    }
});

// Kill everything here.
var killMe = function() {
    RPSwitchPanel.dispose()
        .subscribe(function() {
            process.exit();
        });
};

process.on('SIGINT', killMe);
process.on('SIGTERM', killMe);