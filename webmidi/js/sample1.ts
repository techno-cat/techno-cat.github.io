/// <reference path="../typings/tsd.d.ts" />

$( document ).ready( () => {
    var btn = <HTMLButtonElement>$( '#scan_start' )[0];
    btn.onclick = () => {
        if ( navigator.requestMIDIAccess !== undefined ) {
            var sample = new MyApp.MidiSample();
        }
        else {
            var p = <HTMLParagraphElement>$( '#debug' )[0];
            p.textContent = "Sorry, WebMIDI API not supported.";
        }
    };
} );

namespace MyApp {
    export class MidiSample {
        private midiPort: WebMidi.MIDIAccess;
        private inputs = new Array<WebMidi.MIDIInput>();
        private outputs = new Array<WebMidi.MIDIOutput>();

        constructor() {
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
        };
    }
}
