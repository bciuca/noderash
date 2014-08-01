var RPSwitch = require('../rx-gpio/rpswitch'),
    RPToggleSwitch = require('../rx-gpio/rplightedtoggleswitch'),
    RPLED = require('../rx-gpio/rpled'),
    RPBigRedButton = require('../rx-gpio/rpbigredbutton'),
    utils = require('../rx-gpio/rputils'),
    g2p = utils.gpioToPinMapping,
    Rx = require('rx');

console.log('testing stub ... ');

var G_KEY   = 11;//g2p.$17;
var G_TGL   = 15;//g2p.$27;
var G_BR    = 13;//g2p.$22;
var G_BRLED = 12;//g2p.$18;
var G_TGLED = 16;//g2p.$23;

var keySwitch = RPSwitch.create(G_KEY);
var toggleSwitch = RPToggleSwitch.create(G_TGL, G_TGLED);
var bigRedButton = RPBigRedButton.create(G_BR, G_BRLED);

keySwitch.closed()
    .map(function() {
        return toggleSwitch.activate();
    })
    .switch()
    .subscribe(function(val) {
        console.log('onNext key switch is ON');
    }, function(e) {
        console.log('onError key switch read pin', e);
    }, function() {
        console.log('onCompleted key switch read pin');
    });

keySwitch.open()
    .flatMap(function() {
        return toggleSwitch.deactivate();
    })
    .flatMap(function() {
        return bigRedButton.deactivate();
    })
    .subscribe(function(val) {
        console.log('onNext key switch is OFF');
    }, function(e) {
        console.log('onError key switch read pin', e);
    }, function() {
        console.log('onCompleted key switch read pin');
    });

toggleSwitch.closed()
    .flatMap(function() {
        console.log('activate red button');
        return bigRedButton.activate();
    })
    .subscribe(function(val) {
        console.log('onNext toggle switch is ON');
    }, function(e) {
        console.log('onError toggle switch', e);
    }, function() {
        console.log('onCompleted toggle switch read pin');
    });

toggleSwitch.open()
    .flatMap(function() {
        console.log('toggle switch is off');
        return bigRedButton.deactivate();
    })
    .subscribe(function(val) {
        console.log('onNext toggle switch is OFF');
    }, function(e) {
        console.log('onError toggle switch', e);
    }, function() {
        console.log('onCompleted toggle switch read pin');
    });

bigRedButton.up()
    .subscribe(function() {
        console.log('Big red button PRESSED');
    });

var killMe = function() {
    toggleSwitch._led.off()
        .merge(bigRedButton._led.off())
        .subscribe(function() {
            process.exit();
        });
};

process.on('SIGINT', killMe);
process.on('SIGTERM', function() {
    console.log('killin it');
    killMe();
});