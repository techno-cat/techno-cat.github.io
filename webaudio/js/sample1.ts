/// <reference path="../typings/tsd.d.ts" />

$( document ).ready( () => {
    let C3 = 48;

    let $mute = $( '#mute' );
    var synth;
    try {
        synth = new MyApp.Synth( new (window.AudioContext || webkitAudioContext) );
    } catch (e) {
        $( '#debug' ).text( 'Web Audio API is not supported in this browser.' );
        $mute.prop( 'disabled', true );
        return;
    }

    synth.setMute( $mute.is(':checked') );
    $mute.on( 'click', () => {
        //console.log( 'mute: ', $mute.is(':checked') );
        synth.setMute( $mute.is(':checked') );
    } );

    var touchedFlags: { [key: number]: boolean; } = {};
    var hasTouched: boolean = false;
    $( '.note_on', 'g' ).each( (i:number, elem: Element) => {
        touchedFlags[i] = false;
        var $elem = $( elem );
        $elem.on( 'mousedown', (eventObject: JQueryEventObject) => {
            $elem.css( 'fill-opacity', '1.0' );
            touchedFlags[i] = true;
            synth.noteOn( i + C3 );
            hasTouched = true;
        } );
        $elem.on( 'mouseup', (eventObject: JQueryEventObject) => {
            $elem.css( 'fill-opacity', '0.0' );
            touchedFlags[i] = false;
            synth.noteOff( i + C3 );
            hasTouched = false;
        } );
        $elem.on( 'mouseover', (eventObject: JQueryEventObject) => {
            if ( hasTouched ) {
                touchedFlags[i] = true;
                synth.noteOn( i + C3 );
                $elem.css( 'fill-opacity', '1.0' );
            }
        } );
        $elem.on( 'mouseout', (eventObject: JQueryEventObject) => {
            if ( touchedFlags[i] ) {
                touchedFlags[i] = false;
                synth.noteOff( i + C3 );
                $elem.css( 'fill-opacity', '0.0' );
            }
        } );
    } );
} );

namespace MyApp {
    let A4 = 69;

    export class Synth {
        private mute: boolean = true;
        private playingNote: number = 0;
        private context: AudioContext;
        private nodeOsc: OscillatorNode;
        private nodeGain: GainNode;

        public constructor(context: AudioContext) {
            this.context = context;

            this.nodeOsc = this.context.createOscillator();
            this.nodeOsc.type = 'sine'; 
            this.nodeOsc.frequency.value = 440; // freq
            
            this.nodeGain = this.context.createGain();
            this.nodeGain.gain.value = 0.0;
            
            this.nodeOsc.connect( this.nodeGain );
            this.nodeGain.connect( this.context.destination );

            this.nodeOsc.start();
        }

        public setMute(mute: boolean) {
            this.mute = mute;
            if ( this.mute ) {
                this.nodeGain.gain.value = 0.0;
            }
            else if ( this.playingNote !== 0 ) {
                this.nodeGain.gain.value = 1.0;
            }
        }
        public noteOn(note: number) {
            this.playingNote = note;
            this.nodeOsc.frequency.value = 440.0 * Math.pow( 2.0, (this.playingNote - A4) / 12.0 );

            if ( !this.mute ) {
                this.nodeGain.gain.value = 1.0;
            }
        }
        public noteOff(note: number) {
            if ( this.playingNote === note ) {
                this.playingNote = 0;
                this.nodeGain.gain.value = 0.0;
            }
        }
    }
}
