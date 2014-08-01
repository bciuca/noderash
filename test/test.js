'use strict';

var RPSwitchPanel = require('../rx-gpio/rpswitchpanel');

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