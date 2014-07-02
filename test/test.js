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

var button2= Button.create(g2p.$23);
button2.changed().subscribe(function(val) {
        console.log('onNext read pin ' + button2._pin + ':', val);
    }, function(e) {
        console.log('onError read pin ' + button2._pin + ':', e, e.stack);
    }, function() {
        console.log('onCompleted read pin', button2._pin);
    });

//Button.create(g2p.$4).initialize().debugSubscribe();

var outPin = g2p.$18;
var l = LED.create(outPin);
l.setValue(false).subscribe(function(val) {
        console.log('onNext write pin ' + l._pin + ':', val);
    }, function(e) {
        console.log('onError write pin ' + l._pin + ':', e, e.stack);
    }, function() {
        console.log('onCompleted write pin', l._pin);
    });