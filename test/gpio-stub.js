// Stub for testing without a Raspberry Pi.
var bool = true,
    pins = {},
    _ = require('underscore');

for (var i = 1; i <= 26; i++) {
    pins[i] = {
        id: i,
        value: false
    };
}


module.exports = {
    stub: {
        read: function(pin, callback) {
            var b = pins[pin].value = !pins[pin].value;
            
            pins[i].readHandle = setTimeout(function() {
                callback(null, b)
            }, 1000);
        },

        write: function(pin, value, callback) {
            pins[i].writeHandle = setTimeout(function() {
                console.log('writing pin', pin, value);
                pins[pin].value = value;
                callback && callback(null);
            }, 100);
        }, 

        setup: function(pin, dir, callback) {
            callback && setTimeout(callback, 100);
        },

        destroy: function() { 
            pins.forEach(function(pin) {
                pin.readHandle && clearTimeout(pin.readHandle);
                pin.writeHandle && clearTimeout(pin.writeHandle);
            });
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