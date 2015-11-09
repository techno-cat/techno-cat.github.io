/// <reference path="../typings/tsd.d.ts" />
$(document).ready(function () {
    var elements = $('.note_on', 'g').toArray();
    var $btn = $('#scan_start');
    if (navigator.requestMIDIAccess !== undefined) {
        $btn.on('click', function () {
            MyApp.init(elements, 36 /* = C3 */);
        });
    }
    else {
        $btn.prop('disabled', true);
        $('#debug').text('Sorry, WebMIDI API not supported.');
    }
});
var MyApp;
(function (MyApp) {
    var MidiSample = (function () {
        function MidiSample() {
            var _this = this;
            this.inputs = new Array();
            this.outputs = new Array();
            this.keyboardElements = [];
            this.noteOffset = 0;
            var promise = navigator.requestMIDIAccess();
            promise.then(function (item) {
                var p = $('#debug')[0];
                p.textContent = "Success!";
                _this.midiPort = item;
                _this.storeInputs();
                if (0 < _this.inputs.length) {
                    _this.inputs[0].onmidimessage = function (event) {
                        _this.onMidiMessage(event);
                    };
                }
            }, function (access) {
                var p = $('#debug')[0];
                p.textContent = "Error!";
            });
        }
        MidiSample.prototype.disconnect = function () {
            if (0 < this.inputs.length) {
                this.inputs[0].onmidimessage = null;
            }
        };
        MidiSample.prototype.storeInputs = function () {
            var ite = this.midiPort.inputs.values();
            for (var o = ite.next(); !o.done; o = ite.next()) {
                this.inputs.push(o.value);
                var port = o.value;
                var p = $('#debug')[0];
                p.textContent = port.name;
                break;
            }
        };
        MidiSample.prototype.onMidiMessage = function (event) {
            if (event.data.length === 3) {
                var d0 = event.data[0], d1 = event.data[1], d2 = event.data[2];
                if ((d0 & 0xF0) === 0x90) {
                    if (d2 == 0) {
                        console.log("note off: " + d1.toString());
                    }
                    else {
                        console.log("note on: " + d1.toString());
                    }
                    var i = d1 - this.noteOffset;
                    if (i < 0 || this.keyboardElements.length <= i) {
                    }
                    else {
                        if (d2 == 0) {
                            $(this.keyboardElements[i]).css('fill-opacity', '0.0');
                        }
                        else {
                            $(this.keyboardElements[i]).css('fill-opacity', '1.0');
                        }
                    }
                }
                else if ((d0 & 0xF0) === 0x80) {
                    console.log("note off: " + d1.toString());
                    var i = d1 - this.noteOffset;
                    if (i < 0 || this.keyboardElements.length <= i) {
                    }
                    else {
                        console.log(this.keyboardElements[i].nodeName);
                        $(this.keyboardElements[i]).css('fill-opacity', '0.0');
                    }
                }
                else {
                    console.log(event.data[0].toString(16) +
                        " " +
                        event.data[1].toString(16) +
                        " " +
                        event.data[2].toString(16));
                }
            }
            else {
            }
        };
        ;
        return MidiSample;
    })();
    var sample;
    function init(elements, offset) {
        if (sample) {
            sample.disconnect();
            console.log("disconnect! ");
        }
        sample = new MidiSample();
        sample.keyboardElements = elements;
        sample.noteOffset = offset;
    }
    MyApp.init = init;
})(MyApp || (MyApp = {}));
