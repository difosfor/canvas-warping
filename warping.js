/*jshint browser: true*/
/*globals noise2d:false, fBm2d:false, turbulence2d:false, ridgedmf2d:false*/
(function() {

	'use strict';

	var zoom = 5;
	var octaves = 8;

	var elem = document.getElementsByTagName('canvas')[0];
	var context = elem.getContext('2d');
	var canvas = context.canvas;

	function draw() {
		var w = window.innerWidth;
		var h = window.innerHeight;
		var imageData = context.createImageData(w, h);
		var data = imageData.data;
		var x, y;

		// scale input to normalized vector size
		function scaleX(x) {
			return x / w * zoom;
		}

		function scaleY(y) {
			return y / h * zoom;
		}

		// convert the result from [-1, 1] to [0, 1] and to [0, 255]
		function to255(v) {
			return (v * 0.5 + 0.5) * 255;
		}

		function fbm(sx, sy) {
			return fBm2d(sx, sy, octaves);
		}

		function fbm1(sx, sy) {
			return fbm(sx, sy);
		}

		function fbm2(sx, sy) {
			var qx = fbm(sx, sy);
			var qy = fbm(sx + 5.2, sy + 1.3);
			return fbm(sx + 4 * qx, sy + 4 * qy);
		}

		function fbm3(sx, sy) {
			var qx = fbm(sx, sy);
			var qy = fbm(sx + 5.2, sy + 1.3);
			var rx = fbm(sx + 4 * qx + 1.7, sy + 4 * qy + 9.2);
			var ry = fbm(sx + 4 * qx + 8.3, sy + 4 * qy + 2.8);
			return fbm(sx + 4 * rx, sy + 4 * ry);
		}

		function putPixel(x, y, r, g, b, a) {
			a = a !== undefined ? a : 255;
			var i = (y * w + x) * 4;
			data[i] = r;
			data[i + 1] = g;
			data[i + 2] = b;
			data[i + 3] = a;
		}

		canvas.width  = w;
		canvas.height = h;

		var start = Date.now();

		for (y = 0; y < h; y++) {
			for (x = 0; x < w; x++) {
				var sx = scaleX(x);
				var sy = scaleY(y);

				// var v = fbm1(sx, sy);
				// var v = fbm2(sx, sy);
				var v = fbm3(sx, sy);

				// var v = noise2d(sx, sy);
				// var v = turbulence2d(sx, sy, octaves);
				// var v = ridgedmf2d(sx, sy, octaves);

				v = to255(v);

				putPixel(x, y, v, v, v);
			}
		}

		var dataDone = Date.now();

		context.putImageData(imageData, 0, 0);

		var putDone = Date.now();

		window.console.log('Calc: ' + (dataDone - start) + ', Render: ' + (putDone - dataDone));
	}

	draw();

	window.addEventListener('resize', draw, false);

	window.ctx = context;
	window.cnv = canvas;

}());
