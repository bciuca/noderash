'use strict';

var RPWriteable = require('../rx-gpio/rpwriteable');

RPWriteable.create(24).setValue(1).subscribe(function(val) {
    console.log('next', val);
},

function(err) {
    console.log('error', err);
}, 

function() {
    console.log('done');
});

// var RPSwitchPanel = require('../rx-gpio/rpswitchpanel'),
//     noop = function() {};

// console.log('Testing stub ...');

// RPSwitchPanel.initialize({
//     keySwitchAction: function(v) {
//         console.log('key switch', v);
//     },

//     toggleSwitchAction: function(v) {
//         console.log('toggle switch', v);
//     },

//     bigRedButtonAction: function() {
//         console.log('Should do something cool here.');
//     }
// });

// // Kill everything here.
// var killMe = function() {
//     RPSwitchPanel.dispose()
//         .subscribe(noop, noop, function() {
//             process.exit();
//         });
// };

// process.on('SIGINT', killMe);