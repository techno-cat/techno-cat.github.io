/// <reference path="../typings/tsd.d.ts" />

$( document ).ready( () => {
    var elements: Element[] = $( '.note_on', 'g' ).toArray();

    var btn = $( '#scan_start' );
    if ( navigator.requestMIDIAccess !== undefined ) {
        btn.on( 'click', () => {
            MyApp.init( elements, 36 /* = C3 */ ); 
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
                
                if ( 0 < this.inputs.length ) {
                    this.inputs[0].onmidimessage = (event: WebMidi.MIDIMessageEvent) => {
                         this.onMidiMessage( event );
                    };
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
            for (var o=ite.next(); !o.done; o=ite.next()){
                this.inputs.push( o.value );
                var port: any = o.value;
                var p = <HTMLParagraphElement>$( '#debug' )[0];
                p.textContent = port.name;
                break;
            }
        }
        
        private onMidiMessage(event: WebMidi.MIDIMessageEvent) {
            if ( event.data.length === 3 ) {
                let d0 = event.data[0], d1 = event.data[1], d2 = event.data[2];
                if ( (d0 & 0xF0) === 0x90 ) {
                    if ( d2 == 0 ) {
                        console.log( "note off: " + d1.toString() );
                    }
                    else {
                        console.log( "note on: " + d1.toString() );
                    }

                    let i = d1 - this.noteOffset;
                    if ( i < 0 || this.keyboardElements.length <= i ) {
                        //nop
                    }
                    else {
                        if ( d2 == 0 ) {
                            $( this.keyboardElements[i] ).css( 'fill-opacity', '0.0' );
                            
                        }
                        else {
                            $( this.keyboardElements[i] ).css( 'fill-opacity', '1.0' );
                        }
                    }
                }
                else if ( (d0 & 0xF0) === 0x80 ) {
                    console.log( "note off: " + d1.toString() );

                    let i = d1 - this.noteOffset;
                    if ( i < 0 || this.keyboardElements.length <= i ) {
                        //nop
                    }
                    else {
                        console.log( this.keyboardElements[i].nodeName );
                        $( this.keyboardElements[i] ).css( 'fill-opacity', '0.0' );
                    }
                }
                else {
                    console.log(
                        event.data[0].toString(16) +
                        " " +
                        event.data[1].toString(16) +
                        " " +
                        event.data[2].toString(16) );
                }
            }
            else {
                // nop
            }
        };
        
        public keyboardElements: Element[] = [];
        public noteOffset = 0;
    }
    
    var sample: MidiSample;
    export function init(elements: Element[], offset: number) {
        if ( sample ) {
            sample.disconnect();
            console.log( "disconnect! ");
        }

        sample = new MidiSample();
        sample.keyboardElements = elements;
        sample.noteOffset = offset;
    }
}
