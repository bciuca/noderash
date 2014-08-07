'use strict';

var fs = require('fs');
var _ = require('underscore');
var Rx = require('rx');

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
var hardwareProfile = null;

// Ice to meet you.
Object.freeze(g2p);

function rxify(func, thisArg, final, args) {
    args = args || [];
    final = final === true;

    return Rx.Observable.create(function(observer) {
        args = args.concat(function(err, val) {
            if (err) {
                observer.onError(err);
            } else {
                observer.onNext(val);
                final && observer.onCompleted();
            }
        });
        func.apply(thisArg, args);
        return function() {};
    });
}

function cleanupPin(pin, cb) {
    // Unwatch a pin.
    // Swiped from rpi-gpio private method (it's mines now bitch).

    fs.unwatchFile(PATH + '/gpio' + pin + '/value');
    fs.writeFile(PATH + '/unexport', pin, function(err) {
        if (cb) return cb(err);
    });
}

function cleanupAll(cb) {
    var cbs = [];
    _.each(g2p, function(pin) {
        var func = (function(p) { 
            return function() { return p;};
        })(pin);
        cbs.push(func);
        cleanupPin(pin, func);
    });
}

function releaseGpio() {
    return Rx.Observable.create(function(observer) {
        cleanupAll(function() {
            var gpio = getGpioLib();
            gpio.dispose(function() {
                observer.onNext();
                observer.onCompleted();
            });
        })

        // noop dispose - called onCompleted
        return function() {};
    });
}

function getHardwareProfile() {
    // Returns hardware profile object of platform
    // as reported by /proc/cpuinfo
    // Return null if system call is not supported.

    if (hardwareProfile) {
        return hardwareProfile;
    }

    try {
        var hwString = fs.readFileSync('/proc/cpuinfo', 'utf-8');
        hwString = hwString.replace(/\t/g, '').replace(/\n/g, ',').split(',');
        hardwareProfile = {};

        // Parse string to object.
        hwString.forEach(function(str) {
            var opt = str.split(':');
            var key = opt[0];
            var val = opt[1];

            if (!key) return;

            // Camel case space seperated strings.
            var list = key.toLowerCase().split(' ');
            key = list.reduce(function(prev, curr) {
                return prev + curr.charAt(0).toUpperCase() + curr.substr(1).toLowerCase();
            });

            hardwareProfile[key] = val ? val.trim() : null;
        });

        return hardwareProfile;
    } catch (err) {
        console.error('Error getting profile:', err);
        hardwareProfile = null;
        return null;
    }
}

function isRasPi() {
    // Try and guesss if this is a Raspberry Pi or not.
    // Works on Raspian Linux and hardware rev B of the Pi.
    // Hardware name of the SoC family/implementation name used in Raspberry Pi.
    // http://raspberrypi.stackexchange.com/questions/840/why-is-the-cpu-sometimes-referred-to-as-bcm2708-sometimes-bcm2835

    var profile = getHardwareProfile() || {};
    return (profile.hardware === 'BCM2708' || profile.hardware === 'BCM2835')
        && profile.revision !== undefined
        && profile.serial !== undefined;
}

function getGpioLib() {
    // Run Raspberry Pi code if environment variable RPI is set to native.
    // If environment variable is not set, then take a crappy guess by 
    // seeing what the platform and cpu is. (linux and arm gets you pi).
    //
    // Default to running the rp-gpio lib if hardware is a Pi.
    // 
    // If Environment is set to 'test' or on a non-pi hardware, then run
    // the stub gpio shim for testing.
    //
    // Environment variable RPI: 
    //       native - run rp-gpio library.
    //       test - run gpio shim library.
        
    return process.env.RPI === 'native' || (isRasPi() && process.env.RPI !== 'test')
        ? require('onoff').Gpio
        : require('../test/gpio-stub').stub;
}

function defineClass(constructor, prototypeMembers, staticMembers) {
    constructor.prototype = prototypeMembers;
    _.extend(constructor, staticMembers);
    return constructor;
}

function extendClass(baseClass, baseClassArgs, constructor, prototypeMembers, staticMembers) {
    baseClassArgs = baseClassArgs || [];
    constructor.prototype = new baseClass.bind.apply(baseClass, baseClassArgs);
    _.extend(constructor.prototype, prototypeMembers);
    _.extend(constructor, staticMembers);
    return constructor;
}

module.exports = {
    getGpioLib: getGpioLib,
    gpioToPinMapping: g2p,
    cleanupPin: cleanupPin,
    getHardwareProfile: getHardwareProfile,
    isRasPi: isRasPi,
    releaseGpio: releaseGpio,
    rxify: rxify,
    Class: {
        define: defineClass,
        extend: extendClass
    }
};