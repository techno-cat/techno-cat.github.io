/// <reference path="../typings/tsd.d.ts" />
$(document).ready(function () {
    var $btn = $('#draw_start');
    var klazz = (window.AudioContext) ? OfflineAudioContext : webkitOfflineAudioContext;
    if (klazz) {
        var context;
        $btn.on('click', function () {
            try {
                context = new klazz(1, 44100, 44100);
            }
            catch (e) {
                $('#debug').text('Web Audio API is not supported in this browser.');
                $btn.prop('disabled', true);
                return;
            }
            var canvas = $('canvas')[0];
            var drawer = new MyApp.WaveDrawer(canvas.getContext('2d'), canvas.clientWidth, canvas.clientHeight);
            context.oncomplete = function (ev) {
                drawer.draw(ev.renderedBuffer);
                var url = MyApp.download(ev.renderedBuffer);
                $('#download')
                    .removeClass('disabled')
                    .addClass('enabled')
                    .attr('href', url)
                    .attr('download', 'sample.wav');
            };
            MyApp.startDraw(context, 440);
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
    var samplesPerSec = 44100;
    var bitsPerSample = 16;
    var cacsh = null;
    var Color = (function () {
        function Color() {
        }
        Color.white = 'rgb(255, 255, 255)';
        Color.black = 'rgb(0, 0, 0)';
        Color.gray = 'rgb(128, 128, 128)';
        return Color;
    })();
    var WaveFile = (function () {
        function WaveFile(renderedBuffer) {
            this.offset = 0;
            this.dataView = null;
            var blockSize = bitsPerSample / 8;
            var dataSize = renderedBuffer.length * blockSize;
            var bytesPerSec = blockSize * samplesPerSec;
            var buf = new ArrayBuffer(8 + 36 + dataSize);
            this.dataView = new DataView(buf);
            this.writeString('RIFF'); // ChunkID
            this.writeUint32(36 + dataSize); // ChunkSize
            this.writeString('WAVE'); // FormType
            /* format chunk */
            this.writeString('fmt '); // ChunkID
            this.writeUint32(16); // ChunkSize
            this.writeUint16(1); // WaveFormatType
            this.writeUint16(1); // Channel
            this.writeUint32(samplesPerSec); // SamplesPerSec
            this.writeUint32(bytesPerSec); // BytesPerSec
            this.writeUint16(blockSize); // BlockSize
            this.writeUint16(bitsPerSample); // BitsPerSample
            /* data chunk */
            this.writeString('data'); // ChunkID
            this.writeUint32(dataSize); // ChunkSize
            this.writeWave(renderedBuffer);
        }
        WaveFile.prototype.writeString = function (str) {
            var n = str.length;
            for (var i = 0; i < n; i++) {
                this.dataView.setInt8(this.offset, str.charCodeAt(i));
                this.offset++;
            }
        };
        WaveFile.prototype.writeUint32 = function (val) {
            this.dataView.setUint32(this.offset, val, true);
            this.offset += 4;
        };
        WaveFile.prototype.writeUint16 = function (val) {
            this.dataView.setUint16(this.offset, val, true);
            this.offset += 2;
        };
        WaveFile.prototype.writeWave = function (buf) {
            var data = buf.getChannelData(0);
            var n = data.length;
            for (var i = 0; i < n; i++) {
                var val = data[i];
                val = (1.0 < val) ? 32767 : ((val < -1.0) ? -32767 : (val * 32767.0));
                this.dataView.setInt16(this.offset, val, true);
                this.offset += 2;
            }
        };
        WaveFile.prototype.getDataView = function () {
            return this.dataView;
        };
        return WaveFile;
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
            var n = Math.min(graphWidth, data.length);
            for (var i = 1; i < n; i++) {
                this.ctx.lineTo(x0 + i, y0 + (ymax * data[i]));
            }
            this.ctx.stroke();
        };
        return WaveDrawer;
    })();
    MyApp.WaveDrawer = WaveDrawer;
    function startDraw(context, freq) {
        var node = context.createOscillator();
        node.type = 'sine';
        node.frequency.value = freq;
        node.connect(context.destination);
        node.start();
        context.startRendering();
    }
    MyApp.startDraw = startDraw;
    function download(renderedBuffer) {
        var view = (new WaveFile(renderedBuffer)).getDataView();
        var blob = new Blob([view], { 'type': 'audio/wave' });
        // todo:
        // 不要になったObjectは、revokeObjectURL(string)で削除するので、
        // 戻り値のURL文字列は、確保しておく必要がある
        var ret = window.URL.createObjectURL(blob);
        if (cacsh != null) {
            window.URL.revokeObjectURL(cacsh);
            cacsh = ret;
        }
        return ret;
    }
    MyApp.download = download;
})(MyApp || (MyApp = {}));
