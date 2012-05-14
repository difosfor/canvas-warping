/*jshint browser: true*/
/*globals noise2d:false, fBm2d:false, turbulence2d:false, ridgedmf2d:false*/
(function() {

	'use strict';


	var elem = document.getElementsByTagName('canvas')[0];
	var context = elem.getContext('2d');
	var canvas = context.canvas;

	function draw() {
		var w = window.innerWidth;
		var h = window.innerHeight;
		var imageData = context.createImageData(w, h);
		var data = imageData.data;
		var x, y;

		// convert the result from [-1, 1] to [0, 1] and to [0, 255]
		function to255(v) {
			return (v * 0.5 + 0.5) * 255;
		}

		function fbm(px, py) {
			var zoom = 5;
			var v = fBm2d(px / w * zoom, py / h * zoom, 8);
			return to255(v);
			// return v;
		}

		function pattern1(px, py) {
			var v = fbm(px, py);
			return [v, v, v];
		}

		function pattern2(px, py) {
			var qx = fbm(px, py);
			var qy = fbm(px + 5.2, py + 1.3);
			var v = fbm(px + 4 * qx, py + 4 * qy);
			return [v, v, v];
		}

		function pattern3(px, py) {
			var qx = fbm(px, py);
			var qy = fbm(px + 5.2, py + 1.3);
			var rx = fbm(px + 4 * qx + 1.7, py + 4 * qy + 9.2);
			var ry = fbm(px + 4 * qx + 8.3, py + 4 * qy + 2.8);
			var v = fbm(px + 4 * rx, py + 4 * ry);
			return [v, v, v];
		}

		function pattern4(px, py) {
			var qx = fbm(px, py);
			var qy = fbm(px + 5.2, py + 1.3);
			var rx = fbm(px + 4 * qx + 1.7, py + 4 * qy + 9.2);
			var ry = fbm(px + 4 * qx + 8.3, py + 4 * qy + 2.8);
			var v = fbm(px + 4 * rx, py + 4 * ry);
			return [v, v, v];
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
				// var v = pattern1(x, y);
				// var v = pattern2(x, y);
				var v = pattern3(x, y);
				// var v = pattern4(x, y);
				putPixel(x, y, v[0], v[1], v[2]);
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
