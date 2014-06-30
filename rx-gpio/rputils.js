'use strict';

var fs = require('fs');
var _ = require('underscore');

// GPIO to physical pin mapping (mappings are rev B of raspberry pi)
var g2p = {
    $2:  3,
    $3:  5,
    $4:  7,
    $14:  8,
    $15: 10,
    $17: 11,
    $18: 12,
    $27: 13,
    $22: 15,
    $23: 16,
    $24: 18,
    $10: 19,
    $9: 21,
    $25: 22,
    $11: 23,
    $8: 24,
    $7: 26
};

// GPIO file path.
var PATH = '/sys/class/gpio';
var hardware = null;

// Ice to meet you.
Object.freeze(g2p);

function cleanupPin(pin, cb) {
    // Unwatch a pin.
    // Swiped from rpi-gpio private method (it's mines now bitch).
    fs.unwatchFile(PATH + '/gpio' + pin + '/value');
    fs.writeFile(PATH + '/unexport', pin, function(err) {
        if (cb) return cb(err);
    });
}

function getHardwareProfile() {
    if (hardware) {
        return hardware;
    }

    try {
        hardware = {};
        var hwString = fs.readFileSync('/proc/cpuinfo', 'utf-8');
        hwString = hwString.replace(/\t/g, '').replace(/\n/g, ',').split(',');
        hwString.forEach(function(str) {
            var opt = str.split(':');
            if (!opt[0]) return;
            hardware[opt[0].toLowerCase()] = opt[1];
        });
    } catch (err) {
        return hardware;
    }
}

function isRasPi() {
    // Try and guesss if this is a Raspberry Pi or not.
    if (getHardwareProfile()) {
        // Guess CPU info
        // http://raspberrypi.stackexchange.com/questions/840/why-is-the-cpu-sometimes-referred-to-as-bcm2708-sometimes-bcm2835
        return (hardware.hardware === 'BCM2708' || hardware.hardware === 'BCM2835')
            && hardware.revision !== undefined
            && hardware.serial !== undefined;
    } else {
        return process.arch === 'arm' && process.platform === 'linux';
    }
}

function getGpioLib() {
    // Run Raspberry Pi code if environment variable RPI is set to prod.
    // If environment variable is not set, then take a crappy guess by 
    // seeing what the platform and cpu is. (linux and arm gets you pi).
    // 
    // If Environment is set to 'test' or on a non-pi hardware, then run
    // the stub gpio shim for testing.
        
    return process.env.RPI === 'prod' || (isRasPi() && process.env.RPI !== 'test')
        ? require('rpi-gpio')
        : require('../test/gpio-stub').stub;
}

module.exports = {
    getGpioLib: getGpioLib,
    gpioToPinMapping: g2p,
    cleanupPin: cleanupPin,
    getHardwareProfile: getHardwareProfile,
    isRasPi: isRasPi
};