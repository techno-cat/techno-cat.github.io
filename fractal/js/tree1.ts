/// <reference path="../typings/tsd.d.ts" />

$( document ).ready( () => {
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>$( 'canvas' )[0];
    let ctx: CanvasRenderingContext2D = canvas.getContext( '2d' );
    MyApp.drawTree( ctx, canvas.clientWidth, canvas.clientHeight );
} );

namespace MyApp {
    class Color {
        static white: string = 'rgb(255, 255, 255)';
        static black: string = 'rgb(0, 0, 0)';
    }

    let margin = 50;
    let N = 9;
    let gen = [
        [ 0.6,  0.3 ],
        [ 0.6, -0.3 ]
    ];

    export function drawTree(ctx: CanvasRenderingContext2D, w: number, h: number) {
        var lines = [
            [
                [ 300,    0 ],
                [ 300,  150 ]
            ]
        ];

        for (var i=0; i<N; i++) {
            lines = generate( lines, Math.pow(gen.length, i) );
        }

        ctx.fillStyle = Color.white;
        ctx.fillRect( 0, 0, w, h );

        ctx.lineWidth = 1;
        ctx.strokeStyle = Color.black;

        let x0 = 0, y0 = h - margin;
        ctx.beginPath();
        for (var i=0; i<lines.length; i++) {
            let [ st, en ] = lines[i];
            ctx.moveTo( x0 + st[0], y0 - st[1] );
            ctx.lineTo( x0 + en[0], y0 - en[1] );
        }
        ctx.stroke();
    }
    
    function generate(src: number[][][], n: number) : number[][][] {
        var dst = src.slice();

        for (var i=1; i<=n; i++) {
            let [ st, en ] = src[src.length - i];
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
}
