/// <reference path="../typings/tsd.d.ts" />
$(document).ready(function () {
    var $btn = $('#draw_start');
    $btn.on('click', function () {
        var canvas = $('canvas')[0];
        MyApp.startDraw(canvas);
    });
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
    var TreeDrawer = (function () {
        function TreeDrawer(ctx, w, h) {
            this.margin = 50;
            this.lines = [
                [
                    [300, 0],
                    [300, 150]
                ]
            ];
            this.completed = false;
            this.counter = 0;
            this.ctx = ctx;
            this.canvasWidth = w;
            this.canvasHeight = h;
            var N = 9;
            var gen = [
                [0.6, 0.3],
                [0.6, -0.3]
            ];
            for (var i = 0; i < N; i++) {
                this.lines = this.generate(Math.pow(gen.length, i), gen);
            }
        }
        TreeDrawer.prototype.draw = function () {
            if (this.counter === 0) {
                this.ctx.fillStyle = Color.white;
                this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            }
            if (this.counter < this.lines.length) {
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = Color.black;
                var x0 = 0, y0 = this.canvasHeight - this.margin;
                var n = this.lines.length;
                this.ctx.beginPath();
                var _a = this.lines[this.counter], st = _a[0], en = _a[1];
                this.ctx.moveTo(x0 + st[0], y0 - st[1]);
                this.ctx.lineTo(x0 + en[0], y0 - en[1]);
                this.ctx.stroke();
                this.counter++;
            }
            else {
                this.completed = true;
            }
        };
        TreeDrawer.prototype.generate = function (n, gen) {
            var dst = this.lines.slice();
            for (var i = 1; i <= n; i++) {
                var _a = this.lines[this.lines.length - i], st = _a[0], en = _a[1];
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
        };
        return TreeDrawer;
    })();
    var interval = Math.floor(1000 / 30);
    var drawer;
    function drawTree() {
        drawer.draw();
        if (!drawer.completed) {
            setTimeout(drawTree, interval);
        }
    }
    function startDraw(canvas) {
        var ctx = canvas.getContext('2d');
        drawer = new TreeDrawer(ctx, canvas.clientWidth, canvas.clientHeight);
        drawTree();
    }
    MyApp.startDraw = startDraw;
})(MyApp || (MyApp = {}));
