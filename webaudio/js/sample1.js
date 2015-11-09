/// <reference path="../typings/tsd.d.ts" />
$(document).ready(function () {
    var C3 = 48;
    var $mute = $('#mute');
    var synth;
    try {
        synth = new MyApp.Synth(new (window.AudioContext || webkitAudioContext));
    }
    catch (e) {
        $('#debug').text('Web Audio API is not supported in this browser.');
        $mute.prop('disabled', true);
        return;
    }
    synth.setMute($mute.is(':checked'));
    $mute.on('click', function () {
        //console.log( 'mute: ', $mute.is(':checked') );
        synth.setMute($mute.is(':checked'));
    });
    var touchedFlags = {};
    var hasTouched = false;
    $('.note_on', 'g').each(function (i, elem) {
        touchedFlags[i] = false;
        var $elem = $(elem);
        $elem.on('mousedown', function (eventObject) {
            $elem.css('fill-opacity', '1.0');
            touchedFlags[i] = true;
            synth.noteOn(i + C3);
            hasTouched = true;
        });
        $elem.on('mouseup', function (eventObject) {
            $elem.css('fill-opacity', '0.0');
            touchedFlags[i] = false;
            synth.noteOff(i + C3);
            hasTouched = false;
        });
        $elem.on('mouseover', function (eventObject) {
            if (hasTouched) {
                touchedFlags[i] = true;
                synth.noteOn(i + C3);
                $elem.css('fill-opacity', '1.0');
            }
        });
        $elem.on('mouseout', function (eventObject) {
            if (touchedFlags[i]) {
                touchedFlags[i] = false;
                synth.noteOff(i + C3);
                $elem.css('fill-opacity', '0.0');
            }
        });
    });
});
var MyApp;
(function (MyApp) {
    var A4 = 69;
    var Synth = (function () {
        function Synth(context) {
            this.mute = true;
            this.playingNote = 0;
            this.context = context;
            this.nodeOsc = this.context.createOscillator();
            this.nodeOsc.type = 'sine';
            this.nodeOsc.frequency.value = 440; // freq
            this.nodeGain = this.context.createGain();
            this.nodeGain.gain.value = 0.0;
            this.nodeOsc.connect(this.nodeGain);
            this.nodeGain.connect(this.context.destination);
            this.nodeOsc.start();
        }
        Synth.prototype.setMute = function (mute) {
            this.mute = mute;
            if (this.mute) {
                this.nodeGain.gain.value = 0.0;
            }
            else if (this.playingNote !== 0) {
                this.nodeGain.gain.value = 1.0;
            }
        };
        Synth.prototype.noteOn = function (note) {
            this.playingNote = note;
            this.nodeOsc.frequency.value = 440.0 * Math.pow(2.0, (this.playingNote - A4) / 12.0);
            if (!this.mute) {
                this.nodeGain.gain.value = 1.0;
            }
        };
        Synth.prototype.noteOff = function (note) {
            if (this.playingNote === note) {
                this.playingNote = 0;
                this.nodeGain.gain.value = 0.0;
            }
        };
        return Synth;
    })();
    MyApp.Synth = Synth;
})(MyApp || (MyApp = {}));
