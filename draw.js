/*jshint browser:true*/
/*globals noise:false*/
(function() {

	'use strict';

	// Shortcuts
	var console = window.console;
	var storage = window.localStorage;

	// Variables
	var resizeInput = document.getElementById('resize');
	var zoomInput = document.getElementById('zoom');
	var canvas = document.getElementsByTagName('canvas')[0];
	var context = canvas.getContext('2d');

	// Functions
	function debounce(callback, ms) {
		var timeout;
		return function() {
			var args = arguments;
			var thisArg = this;
			clearTimeout(timeout);
			timeout = setTimeout(function() {
				timeout = null;
				callback.apply(thisArg, args);
			}, ms);
		};
	}

	var draw = debounce(function(fn) {
		if (fn) {
			storage.fn = fn;
		} else {
			fn = storage.fn;
		}

		var f = noise[fn]; // resolve noise function name to function
		var zoom = parseFloat(zoomInput.value);
		var w = canvas.width;
		var h = canvas.height;
		var start, x, y, sx, sy, rgb, i, di;
		var imageData = context.createImageData(w, h);
		var data = imageData.data;

		if (f) {
			console.log('draw(): ' + fn);
		} else {
			console.log('draw(): noise function undefined: ' + fn);
			return;
		}

		// Render
		start = Date.now();
		i = 0;
		for (y = 0; y < h; y++) {
			for (x = 0; x < w; x++) {
				// Scale input to normalized vector size
				sx = x / w * zoom;
				sy = y / h * zoom;

				// Calculate value
				rgb = f(sx, sy);

				// Store pixel in image data array
				di = i++ * 4;
				data[di] = rgb[0];
				data[di + 1] = rgb[1];
				data[di + 2] = rgb[2];
				data[di + 3] = 255;
			}
		}
		console.log('draw(): render ' + data.length + ' bytes, time: ' + (Date.now() - start));

		// Put image data
		start = Date.now();
		context.putImageData(imageData, 0, 0);
		console.log('draw(): put image data time: ' + (Date.now() - start));
	}, 500);

	// Initialize inputs
	resizeInput.checked = storage.resize === 'true' ? true : false;
	zoomInput.value = storage.zoom;

	// Bind inputs
	function onResize() {
		if (resizeInput.checked) {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			draw();
		}
	}

	resizeInput.addEventListener('change', function() {
		console.log('onChange: resize: ' + resizeInput.checked);
		storage.resize = resizeInput.checked;
		onResize();
	}, false);

	window.addEventListener('resize', onResize, false); // TODO: debounce

	zoomInput.addEventListener('change', function() {
		console.log('onChange: zoom: ' + zoomInput.value);
		storage.zoom = zoomInput.value;
		draw();
	}, false);

	// Perform initial draw
	if (resizeInput.checked) {
		onResize();
	} else {
		draw();
	}

	// Expose
	window.draw = draw;

}());
