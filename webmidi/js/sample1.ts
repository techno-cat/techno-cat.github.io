/// <reference path="../typings/tsd.d.ts" />

$( document ).ready( () => {
    var btn = $( '#scan_start' );
    if ( navigator.requestMIDIAccess !== undefined ) {
        btn.on( 'click', () => {
            MyApp.init();
        } );
    }
    else {
        btn.prop( 'disabled', true );
        var p = <HTMLParagraphElement>$( '#debug' )[0];
        p.textContent = "Sorry, WebMIDI API not supported.";
    }
} );

namespace MyApp {
    class MidiSample {
        private midiPort: WebMidi.MIDIAccess;
        private inputs = new Array<WebMidi.MIDIInput>();
        private outputs = new Array<WebMidi.MIDIOutput>();

        public constructor() {
            var promise = navigator.requestMIDIAccess();
            promise.then( (item: WebMidi.MIDIAccess) => {
                var p = <HTMLParagraphElement>$( '#debug' )[0];
                p.textContent = "Success!";

                this.midiPort = item;
                this.storeInputs();
                this.storeOutputs();
                
                if ( 0 < this.inputs.length ) {
                    this.inputs[0].onmidimessage = this.onMidiMessage;
                }
            }, (access: Error) => {
                var p = <HTMLParagraphElement>$( '#debug' )[0];
                p.textContent = "Error!";
            } );
        }

        public disconnect() {
            if ( 0 < this.inputs.length ) {
                this.inputs[0].onmidimessage = null;
            }
        }

        private storeInputs() {
            var ite = this.midiPort.inputs.values();
            var ul = <HTMLUListElement>$( '#input' )[0];
            ul.removeChild( ul.firstChild );
            for (var o=ite.next(); !o.done; o=ite.next()){
                this.inputs.push( o.value );
                var port: any = o.value;
                var html = '<li>' + port.name + '</li>';
                ul.insertAdjacentHTML( "beforeend", html );
            }
        }
        
        private storeOutputs() {
            var ite = this.midiPort.outputs.values();
            var ul = <HTMLUListElement>$( '#output' )[0];
            ul.removeChild( ul.firstChild );
            for (var o=ite.next(); !o.done; o=ite.next()){
                this.outputs.push( o.value );
                var port: any = o.value;
                var html = '<li>' + port.name + '</li>';
                ul.insertAdjacentHTML( "beforeend", html );
            }
        }
        
        private onMidiMessage(event: WebMidi.MIDIMessageEvent) {
            if ( event.data.length === 2 ) {
                console.log(
                    event.data[0].toString(16) +
                    " " +
                    event.data[1].toString(16) )
            }
            else if ( event.data.length === 3 ) {
                console.log(
                    event.data[0].toString(16) +
                    " " +
                    event.data[1].toString(16) +
                    " " +
                    event.data[2].toString(16) )
            }
            else {
                // nop
            }
        }
    }

    var sample: MidiSample;
    export function init() {
        if ( sample ) {
            sample.disconnect();
            console.log( "disconnect! ");
        }

        sample = new MidiSample();
    }
}
