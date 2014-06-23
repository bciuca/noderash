var Button = require('../rx-gpio/rpbutton'),
    LED = require('../rx-gpio/rpwriteable'),
    //gpio = require('./gpio-stub').stub;
    gpio = require('rpi-gpio');

console.log('testing stub');

// The + end
// GPIO 25 - pin 22
// GPIO 17  - pin 11
// var btn = Button.create(22, true);
// btn.toObservable()
//     .subscribe(function(r) {
//         console.log('onNext read', r);
//     }, function(e) {
//         console.log('onError read', e);
//     }, function() {
//         console.log('onCompleted read');
//         btn.dispose();
//         gpio.destroy();
//     });

// Ground wire
// GPIO 23 - pin 16
var led = LED.create(16);
led.set(true).toObservable()
    .subscribe(function(r) {
        console.log('led onNext', r);
    }, function(e) {
        console.log('led onError', e);
    }, function() {
        console.log('led onCompleted');
        led.dispose();
        gpio.destroy();
    });