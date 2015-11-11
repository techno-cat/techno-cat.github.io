/// <reference path="../typings/tsd.d.ts" />
$(document).ready(function () {
    var $btn = $('#draw_start');
    var klazz = (window.AudioContext) ? OfflineAudioContext : webkitOfflineAudioContext;
    if (klazz) {
        var context;
        $btn.on('click', function () {
            try {
                context = new klazz(1, 400 + 1, 44100);
            }
            catch (e) {
                $('#debug').text('Web Audio API is not supported in this browser.');
                $btn.prop('disabled', true);
                return;
            }
            var canvas = $('canvas')[0];
            MyApp.startDraw(canvas, context, 400);
        });
    }
    else {
        $('#debug').text('Web Audio API is not supported in this browser.');
        $btn.prop('disabled', true);
    }
});
var MyApp;
(function (MyApp) {
    var margin = 20;
    var Color = (function () {
        function Color() {
        }
        Color.white = 'rgb(255, 255, 255)';
        Color.black = 'rgb(0, 0, 0)';
        Color.gray = 'rgb(128, 128, 128)';
        return Color;
    })();
    var WaveDrawer = (function () {
        function WaveDrawer(ctx, w, h) {
            this.ctx = ctx;
            this.canvasWidth = w;
            this.canvasHeight = h;
        }
        WaveDrawer.prototype.draw = function (buf) {
            this.ctx.fillStyle = Color.white;
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            var graphWidth = this.canvasWidth - (margin * 2);
            var graphHeight = this.canvasHeight - (margin * 2);
            var ymax = graphHeight / 2;
            var x0 = margin, y0 = this.canvasHeight / 2;
            var data = buf.getChannelData(0);
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = Color.gray;
            this.ctx.beginPath();
            this.ctx.moveTo(x0, margin);
            this.ctx.lineTo(x0, this.canvasHeight - margin);
            this.ctx.moveTo(x0, y0);
            this.ctx.lineTo(x0 + graphWidth, y0);
            this.ctx.stroke();
            this.ctx.strokeStyle = Color.black;
            this.ctx.beginPath();
            this.ctx.moveTo(x0, y0 + (ymax * data[0]));
            for (var i = 1; i < data.length; i++) {
                this.ctx.lineTo(x0 + i, y0 + (ymax * data[i]));
            }
            this.ctx.stroke();
        };
        return WaveDrawer;
    })();
    var drawer;
    function startDraw(canvas, context, size) {
        drawer = new WaveDrawer(canvas.getContext('2d'), canvas.clientWidth, canvas.clientHeight);
        context.oncomplete = function (ev) {
            drawer.draw(ev.renderedBuffer);
        };
        var node = context.createOscillator();
        node.type = 'sine';
        node.frequency.value = 4.0 * (context.sampleRate / size);
        node.connect(context.destination);
        node.start();
        context.startRendering();
    }
    MyApp.startDraw = startDraw;
})(MyApp || (MyApp = {}));
