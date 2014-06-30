// Stub for testing without a Raspberry Pi.
var bool = true,
    pins = {},
    _ = require('underscore'),
    initialized = false;

for (var i = 1; i <= 26; i++) {
    pins[i] = {
        id: i,
        value: false
    };
}


module.exports = {
    stub: {
        read: function(pin, callback) {
            if (!initialized) {
                callback && callback('Not initialized.', null);
                return;
            }
            var b = pins[pin].value = !pins[pin].value;
            
            pins[pin].readHandle = setTimeout(function() {
                callback(null, b)
            }, 1000);
        },

        write: function(pin, value, callback) {
            if (!initialized) {
                callback && callback('Not initialized.', null);
                return;
            }

            pins[pin].writeHandle = setTimeout(function() {
                console.log('writing pin', pin, value);
                pins[pin].value = value;
                callback && callback(null);
            }, 100);
        }, 

        setup: function(pin, dir, callback) {
            initialized = true;
            callback && setTimeout(callback, 100);
        },

        destroy: function() { 
            pins.forEach(function(pin) {
                pin.readHandle && clearTimeout(pin.readHandle);
                pin.writeHandle && clearTimeout(pin.writeHandle);
            });
            initialized = false;
        }
    },

    stubError: {
      read: function(pin, callback) {
            setTimeout(function() {
                callback('Error reading pin ' + pin, null);
            }, 10);
        },

        write: function(pin, value, callback) {
            setTimeout(function() {
                callback('Error writing pin ' + pin);
            }, 10);
        },

        setup: function(pin, dir, callback) {
            callback && callback();
        },

        destroy: function() { }
    }
};