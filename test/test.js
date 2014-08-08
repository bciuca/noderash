'use strict';

var RPWriteable = require('../rx-gpio/rpwriteable');
var Rx = require('rx');
var RxGpio = require('../rx-gpio/rxgpio');
var RxLed = require('../rx-gpio/rxled');
var c = 0;

var led = RxLed.create(24, 1);
led.off().subscribe(function(v) {
    console.log('value led=', v);
}, function(err) {console.log('error', err.stack);}, function() {
    console.log('led completed');
});



var w = RxGpio.createReadable(27, 'both');
w.watch()
    .flatMap(function() {
        return led.toggle();
    })
    .subscribe(function(v) {
        console.log('value=', v);
        if (c++ > 5) w.destroy();
    }, function(err) {console.log('error', err.stack);}, function() {
        console.log('watch completed');
    });

// var led = RPWriteable.create(24);
//Rx.Observable.concat(
//        led.setValue(1),
//        led.getValue(),
//        led.setValue(0),
//        led.getValue()
//    )
//    .subscribe(function(val) {
//        //console.log('next', val);
//    },
//
//    function(err) {
//        console.log('error', err.stack);
//    },
//
//    function() {
//        console.log('done');
//    });
//
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