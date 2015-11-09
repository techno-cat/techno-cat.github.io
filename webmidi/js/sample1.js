/// <reference path="../typings/tsd.d.ts" />
$(document).ready(function () {
    var btn = $('#scan_start');
    if (navigator.requestMIDIAccess !== undefined) {
        btn.on('click', function () {
            MyApp.init();
        });
    }
    else {
        btn.prop('disabled', true);
        var p = $('#debug')[0];
        p.textContent = "Sorry, WebMIDI API not supported.";
    }
});
var MyApp;
(function (MyApp) {
    var MidiSample = (function () {
        function MidiSample() {
            var _this = this;
            this.inputs = new Array();
            this.outputs = new Array();
            var promise = navigator.requestMIDIAccess();
            promise.then(function (item) {
                var p = $('#debug')[0];
                p.textContent = "Success!";
                _this.midiPort = item;
                _this.storeInputs();
                _this.storeOutputs();
                if (0 < _this.inputs.length) {
                    _this.inputs[0].onmidimessage = _this.onMidiMessage;
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
            var ul = $('#input')[0];
            ul.removeChild(ul.firstChild);
            for (var o = ite.next(); !o.done; o = ite.next()) {
                this.inputs.push(o.value);
                var port = o.value;
                var html = '<li>' + port.name + '</li>';
                ul.insertAdjacentHTML("beforeend", html);
            }
        };
        MidiSample.prototype.storeOutputs = function () {
            var ite = this.midiPort.outputs.values();
            var ul = $('#output')[0];
            ul.removeChild(ul.firstChild);
            for (var o = ite.next(); !o.done; o = ite.next()) {
                this.outputs.push(o.value);
                var port = o.value;
                var html = '<li>' + port.name + '</li>';
                ul.insertAdjacentHTML("beforeend", html);
            }
        };
        MidiSample.prototype.onMidiMessage = function (event) {
            if (event.data.length === 2) {
                console.log(event.data[0].toString(16) +
                    " " +
                    event.data[1].toString(16));
            }
            else if (event.data.length === 3) {
                console.log(event.data[0].toString(16) +
                    " " +
                    event.data[1].toString(16) +
                    " " +
                    event.data[2].toString(16));
            }
            else {
            }
        };
        return MidiSample;
    })();
    var sample;
    function init() {
        if (sample) {
            sample.disconnect();
            console.log("disconnect! ");
        }
        sample = new MidiSample();
    }
    MyApp.init = init;
})(MyApp || (MyApp = {}));
