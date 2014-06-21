var Button = require('../rx-gpio/rpbutton'),
    LED = require('../rx-gpio/rpwriteable'),
    //gpio = require('./gpio-stub').stub;
    gpio = require('rpi-gpio');

console.log('testing stub');

var btn = Button.create(11, true, 10000);
btn.toObservable()
    .take(1)
    .subscribe(function(r) {
        console.log('onNext', r);
    }, function(e) {
        console.log('onError', e);
    }, function() {
        console.log('onCompleted');
        btn.dispose();
        gpio.destroy();
    });


var led = LED.create(7);
led.set(true).toObservable()
    .take(1)
    .subscribe(function(r) {
        console.log('led onNext', r);
    }, function(e) {
        console.log('led onError', e);
    }, function() {
        console.log('led onCompleted');
        led.dispose();
        gpio.destroy();
    });