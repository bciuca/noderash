var Button = require('../rx-gpio/rpreadable'),
    LED = require('../rx-gpio/rpwriteable'),
    utils = require('../rx-gpio/rputils'),
    g2p = utils.gpioToPinMapping,
    gpio = utils.getGpioLib(),
    Rx = require('rx');

console.log('testing stub ... ');

// var button1 = Button.create(g2p.$17);
// button1.changed().subscribe(function(val) {
//         console.log('onNext read pin ' + button1._pin + ':', val);
//     }, function(e) {
//         console.log('onError read pin ' + button1._pin + ':', e, e.stack);
//     }, function() {
//         console.log('onCompleted read pin', button1._pin);
//         button1.dispose();
//     });

// function RPTest() { this._val = false; }
// RPTest.prototype.toggle = function() {
//     return Rx.Observable.defer(function() {
//         console.log('toggle from', this._val, 'to', !this._val);
//         this._val = !this._val;
//         return Rx.Observable.return(this._val);
//     }.bind(this));
// };


// new RPTest().toggle()
// .delay(1000)
// .doWhile(function() {
//     return true;
// })
// .takeUntilWithTime(5000)
// .subscribe(function(v) { 
//     console.log(v)
// });

var light = LED.create(g2p.$18);
var toggleSwitch = Button.create(g2p.$22);
var toggleLed = LED.create(g2p.$25);
var keySwitch = Button.create(g2p.$27);
var delay = 50;
var isOn = function(val) { return !!val; };
var whileTrue = function() { return true; };
var killMe = function() {
    toggleLed.setValue(true).subscribe(function() {
        process.exit();
    });
};

toggleLed.setValue(false).subscribe();


process.on('SIGINT', killMe);
process.on('SIGTERM', function() {
    console.log('SIGTERM');
    killMe();
});

// Rx.Observable.defer(function() {
//     return Rx.Observable.zip(keySwitch.changed(), toggleSwitch.changed(), function(ks, ts) {
//         return {
//             key: ks,
//             toggle: ts
//         };
//     });
// })
// .filter(function(switches) {
//     return switches.key;
// })
// .flatMap(function(switches) {
//     toggleLed.setValue(false)
// })
// .filter(function(switches) {
//     return switches.key && switches.toggle;
// })
// .flatMap(function(val) {
//     console.log('switch is on');
//     return Rx.Observable.defer(function() {
//         return light.toggle();
//     })
//     .delay(delay)
//     .doWhile(whileTrue)
//     .takeUntil(toggleSwitch.changed())
//     .finally(function() {
//         light.setValue(false).subscribe();
//     });
// })
// .doWhile(whileTrue)
// .subscribe(function(val) {
//     console.log('onNext read pin ' + ':', val);
// }, function(e) {
//     console.log('onError read pin ', e, e.stack);
// }, function() {
//     console.log('onCompleted read pin');
// });

// var button2= Button.create(g2p.$22);
// button2.changed().subscribe(function(val) {
//         console.log('onNext read pin ' + button2._pin + ':', val);
//     }, function(e) {
//         console.log('onError read pin ' + button2._pin + ':', e, e.stack);
//     }, function() {
//         console.log('onCompleted read pin', button2._pin);
//     });

// var outPin = g2p.$18;
// var l = LED.create(outPin);
// l.setValue(true).subscribe(function(val) {
//         console.log('onNext write pin ' + l._pin + ':', val);
//     }, function(e) {
//         console.log('onError write pin ' + l._pin + ':', e, e.stack);
//     }, function() {
//         console.log('onCompleted write pin', l._pin);
//     });