/// <reference path="../typings/tsd.d.ts" />

$( document ).ready( () => {
    var $btn = $( '#draw_start' );
    let klazz = ( window.AudioContext ) ? OfflineAudioContext : webkitOfflineAudioContext;
    if ( klazz ) {
        var context;
        $btn.on( 'click', () => {
            try {
                context = new klazz( 1, 400 + 1, 44100 );
            }
            catch (e) {
                $( '#debug' ).text( 'Web Audio API is not supported in this browser.' );
                $btn.prop( 'disabled', true );
                return;
            }

            let canvas: HTMLCanvasElement = <HTMLCanvasElement>$( 'canvas' )[0];
            MyApp.startDraw( canvas, context, 400 );
        } );
    }
    else {
        $( '#debug' ).text( 'Web Audio API is not supported in this browser.' );
        $btn.prop( 'disabled', true );
    }
} );

namespace MyApp {
    let margin = 20;

    class Color {
        static white: string = 'rgb(255, 255, 255)';
        static black: string = 'rgb(0, 0, 0)';
        static gray: string = 'rgb(128, 128, 128)';
    }

    class WaveDrawer {
        private ctx: CanvasRenderingContext2D;
        private canvasWidth: number;
        private canvasHeight: number;

        public constructor(ctx: CanvasRenderingContext2D, w: number, h: number) {
            this.ctx = ctx;
            this.canvasWidth  = w;
            this.canvasHeight = h;
        }

        public draw(buf: AudioBuffer) {
            this.ctx.fillStyle = Color.white;
            this.ctx.fillRect( 0, 0, this.canvasWidth, this.canvasHeight );

            let graphWidth = this.canvasWidth - (margin * 2);
            let graphHeight = this.canvasHeight - (margin * 2);
            let ymax = graphHeight / 2;
            let x0 = margin, y0 = this.canvasHeight / 2;
            let data = <Float32Array>buf.getChannelData( 0 );

            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = Color.gray;

            this.ctx.beginPath();
            this.ctx.moveTo( x0, margin );
            this.ctx.lineTo( x0, this.canvasHeight - margin );
            this.ctx.moveTo( x0, y0 );
            this.ctx.lineTo( x0 + graphWidth, y0 );            
            this.ctx.stroke(); 

            this.ctx.strokeStyle = Color.black;

            this.ctx.beginPath();
            this.ctx.moveTo( x0, y0 + (ymax * data[0]) );
            for (var i=1; i<data.length; i++) {
                this.ctx.lineTo( x0 + i, y0 + (ymax * data[i]) );
            }
            this.ctx.stroke();    
        }
    }

    var drawer: WaveDrawer;
    export function startDraw(canvas: HTMLCanvasElement, context: OfflineAudioContext, size: number) {
        drawer = new WaveDrawer(
            canvas.getContext('2d'), canvas.clientWidth, canvas.clientHeight );
               context.oncomplete = (ev: OfflineAudioCompletionEvent) => {
            drawer.draw( ev.renderedBuffer );
        };

        var node = context.createOscillator();
        node.type = 'sine'; 
        node.frequency.value = 4.0 * (context.sampleRate / size);
        node.connect( context.destination );

        node.start();
        context.startRendering();
    }
}
