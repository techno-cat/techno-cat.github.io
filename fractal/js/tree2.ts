/// <reference path="../typings/tsd.d.ts" />

$( document ).ready( () => {
    var btn = <HTMLButtonElement>$( '#draw_start' )[0];
    btn.onclick = () => {
        let canvas: HTMLCanvasElement = <HTMLCanvasElement>$( 'canvas' )[0];
        MyApp.startDraw( canvas );
    };
} );

namespace MyApp {
    class Color {
        static white: string = 'rgb(255, 255, 255)';
        static black: string = 'rgb(0, 0, 0)';
    }
 
    class TreeDrawer {
        margin = 50;
        lines = [
            [
                [ 300,    0 ],
                [ 300,  150 ]
            ]
        ];

        ctx: CanvasRenderingContext2D;
        canvasWidth: number;
        canvasHeight: number;
        
        public constructor(ctx: CanvasRenderingContext2D, w: number, h: number) {
            this.ctx = ctx;
            this.canvasWidth  = w;
            this.canvasHeight = h;

            let N = 9;
            let gen = [
                [ 0.6,  0.3 ],
                [ 0.6, -0.3 ]
            ];

            for (var i=0; i<N; i++) {
                this.lines = this.generate( Math.pow(gen.length, i), gen );
            }
        }
        
        public draw() {
            if ( this.counter === 0 ) {
                this.ctx.fillStyle = Color.white;
                this.ctx.fillRect( 0, 0, this.canvasWidth, this.canvasHeight );
            }

            if ( this.counter < this.lines.length ) {
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = Color.black;

                let x0 = 0, y0 = this.canvasHeight - this.margin;
                let n = this.lines.length;
                this.ctx.beginPath();
                let [ st, en ] = this.lines[this.counter];
                this.ctx.moveTo( x0 + st[0], y0 - st[1] );
                this.ctx.lineTo( x0 + en[0], y0 - en[1] );
                this.ctx.stroke();
                
                this.counter++;
            }
            else {
                this.completed = true;
            }
        }
    
        private generate(n: number, gen: number[][]) : number[][][] {
            var dst = this.lines.slice();
    
            for (var i=1; i<=n; i++) {
                let [ st, en ] = this.lines[this.lines.length - i];
                let dx = en[0] - st[0]; 
                let dy = en[1] - st[1];
                
                for (var j=0; j<gen.length; j++) {
                    let [ x, y ] = gen[j];
                    dst.push( [
                        en,
                        [
                            (x * dx) - (y * dy) + en[0],
                            (x * dy) + (y * dx) + en[1],
                        ]
                    ] );
                }
            }
    
            return dst;
        }
            
        public completed: boolean = false;
        public counter: number = 0;
    }

    let interval = Math.floor( 1000 / 30 );
    var drawer: TreeDrawer;

    function drawTree() {
        drawer.draw();
        if ( !drawer.completed ) {
            setTimeout( drawTree, interval );
        }
    }

    export function startDraw(canvas: HTMLCanvasElement) {
        let ctx: CanvasRenderingContext2D = canvas.getContext( '2d' );
        drawer = new TreeDrawer( ctx, canvas.clientWidth, canvas.clientHeight );
        drawTree();
    }
}
