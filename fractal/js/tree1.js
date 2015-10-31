/// <reference path="../typings/tsd.d.ts" />
$(document).ready(function () {
    var canvas = $('canvas')[0];
    var ctx = canvas.getContext('2d');
    MyApp.drawTree(ctx, canvas.clientWidth, canvas.clientHeight);
});
var MyApp;
(function (MyApp) {
    var Color = (function () {
        function Color() {
        }
        Color.white = 'rgb(255, 255, 255)';
        Color.black = 'rgb(0, 0, 0)';
        return Color;
    })();
    var margin = 50;
    var N = 9;
    var gen = [
        [0.6, 0.3],
        [0.6, -0.3]
    ];
    function drawTree(ctx, w, h) {
        var lines = [
            [
                [300, 0],
                [300, 150]
            ]
        ];
        for (var i = 0; i < N; i++) {
            lines = generate(lines, Math.pow(gen.length, i));
        }
        ctx.fillStyle = Color.white;
        ctx.fillRect(0, 0, w, h);
        ctx.lineWidth = 1;
        ctx.strokeStyle = Color.black;
        var x0 = 0, y0 = h - margin;
        ctx.beginPath();
        for (var i = 0; i < lines.length; i++) {
            var _a = lines[i], st = _a[0], en = _a[1];
            ctx.moveTo(x0 + st[0], y0 - st[1]);
            ctx.lineTo(x0 + en[0], y0 - en[1]);
        }
        ctx.stroke();
    }
    MyApp.drawTree = drawTree;
    function generate(src, n) {
        var dst = src.slice();
        for (var i = 1; i <= n; i++) {
            var _a = src[src.length - i], st = _a[0], en = _a[1];
            var dx = en[0] - st[0];
            var dy = en[1] - st[1];
            for (var j = 0; j < gen.length; j++) {
                var _b = gen[j], x = _b[0], y = _b[1];
                dst.push([
                    en,
                    [
                        (x * dx) - (y * dy) + en[0],
                        (x * dy) + (y * dx) + en[1],
                    ]
                ]);
            }
        }
        return dst;
    }
})(MyApp || (MyApp = {}));
