var Button = require('../rx-gpio/rpreadable'),
    LED = require('../rx-gpio/rpwriteable'),
    g2p = require('../rx-gpio/rppin'),
    //gpio = require('./gpio-stub').stub;
    gpio = require('rpi-gpio');

console.log('testing stub ... ');

var inPin = g2p.$25;
Button.create(inPin).initialize().debugSubscribe();

var outPin = g2p.$23;
LED.create(outPin).initialize().set(true).debugSubscribe();