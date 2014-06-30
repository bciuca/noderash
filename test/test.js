var Button = require('../rx-gpio/rpreadable'),
    LED = require('../rx-gpio/rpwriteable'),
    g2p = require('../rx-gpio/rppin'),
    gpio = require('../test/gpio-stub').stub,
    Rx = require('rx');

console.log('testing stub ... ');

var button1 = Button.create(g2p.$17);
button1.changed().subscribe(function(val) {
        console.log('onNext read pin ' + button1._pin + ':', val);
    }, function(e) {
        console.log('onError read pin ' + button1._pin + ':', e, e.stack);
    }, function() {
        console.log('onCompleted read pin', button1._pin);
    });

var button2= Button.create(g2p.$24);
button2.changed().delay(3000).take(3).subscribe(function(val) {
        console.log('onNext read pin ' + button2._pin + ':', val);
    }, function(e) {
        console.log('onError read pin ' + button2._pin + ':', e, e.stack);
    }, function() {
        console.log('onCompleted read pin', button2._pin);
    });

//Button.create(g2p.$4).initialize().debugSubscribe();

//var outPin = g2p.$23;
//LED.create(outPin).initialize().set(true).debugSubscribe();