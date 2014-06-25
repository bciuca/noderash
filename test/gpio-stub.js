// Stub for testing without a Raspberry Pi.
var bool = true;

module.exports = {
    stub: {
        read: function(pin, callback) {
            setTimeout(function() {
                bool = !bool;
                callback(null, bool);
            }, 1000);
        },

        write: function(pin, value, callback) {
            setTimeout(function() {
                callback(null);
            }, 10);
        }, 

        setup: function(pin, dir, callback) {
            callback && callback();
        },

        destroy: function() { }
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