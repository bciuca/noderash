var Observable = require('rx').Observable,
    gpio = require('rpi-gpio'),
    EventEmitter = new require('events').EventEmitter,
    emitter = new EventEmitter();
    out_pin = 7,
    in_pin = 11,
    ledStatus = false,
    btnprev = true,
    btncurr = true,

    BTNUP = 'buttonup',
    BTNDOWN = 'btndown';

gpio.setup(out_pin, gpio.DIR_OUT);
gpio.setup(in_pin, gpio.DIR_IN, readInput);

function write(isOn) {
    isOn === undefined ? false : isOn;
    console.log('attempting to write to pin', out_pin);
    gpio.write(out_pin, isOn, function(err) {
        if (err) throw err;
        console.log('Written to pin:', isOn);
    });
}


function readInput() {
    gpio.read(in_pin, function(err, value) {
        if (err) {
           throw err;
        }

        btnprev = btncurr;
        btncurr = value;

        if (btnprev !== btncurr) {
            emitter.emit(btncurr ? BTNUP : BTNDOWN);
        }
        readInput();
    });
}

// Button up handler
Observable.fromEvent(emitter, BTNUP)
    .subscribe(function() {
        console.log('btn is up');
        ledStatus = !ledStatus;
        write(ledStatus);
    }, function (err) {
        console.error(err);
    }, function() {
        console.log('completed');
    });

// Button down handler
Observable.fromEvent(emitter, BTNDOWN)
    .subscribe(function() {
        console.log('btn is down');
    }, function (err) {
        console.error(err);
    }, function() {
        console.log('completed');
    });

function destroy() {
    gpio.destroy(function() {
        console.log('All pins unexported');
        return process.exit(0);
    });
}
