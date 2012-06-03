/*jshint browser: true*/
/*globals noise2d:false, fBm2d:false, turbulence2d:false, ridgedmf2d:false*/
(function() {

	'use strict';

	// Constants
	var fitToWindow = false;
	var zoom = 5;
	var octaves = 4;

	// Variables
	var elem = document.getElementsByTagName('canvas')[0];
	var context = elem.getContext('2d');
	var canvas = context.canvas;

	// Functions
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

	// convert the result from [-1, 1] to [0, 1] and to [0, 255]
	function to255(v) {
		return (v * 0.5 + 0.5) * 255;
	}

	function draw(f) {
		f = f || window[window.localStorage.fn];
		if (!f) {
			return;
		}

		var w = fitToWindow ? window.innerWidth : canvas.width;
		var h = fitToWindow ? window.innerHeight : canvas.height;
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
				var v = to255(f(scaleX(x), scaleY(y), octaves));
				putPixel(x, y, v, v, v);
			}
		}

		var dataDone = Date.now();

		context.putImageData(imageData, 0, 0);

		var putDone = Date.now();

		window.localStorage.setItem('fn', f.name);

		window.console.log('Calc: ' + (dataDone - start) + ', Render: ' + (putDone - dataDone));
	}

	draw();

	if (fitToWindow) {
		window.addEventListener('resize', draw, false);
	}

	window.ctx = context;
	window.cnv = canvas;

	window.fbm1 = fbm1;
	window.fbm2 = fbm2;
	window.fbm3 = fbm3;
	window.draw = draw;

}());
