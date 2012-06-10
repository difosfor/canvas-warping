/*jshint browser:true*/
/*globals noise:false*/
(function() {

	'use strict';

	// Constants
	var DEFAULT_ZOOM = 7;

	// Shortcuts
	var console = window.console;
	var storage = window.localStorage;

	// Variables
	var resizeInput = document.getElementById('resize');
	var zoomInput = document.getElementById('zoom');
	var canvas = document.getElementsByTagName('canvas')[0];
	var context = canvas.getContext('2d');
	var originalWidth = canvas.width;
	var originalHeight = canvas.height;

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
		var zoom = parseFloat(storage.zoom) || DEFAULT_ZOOM;
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

	// Initialize and bind zoom input
	if (zoomInput) {
		zoomInput.value = storage.zoom || DEFAULT_ZOOM;

		zoomInput.addEventListener('change', function() {
			console.log('onChange: zoom: ' + zoomInput.value);
			storage.zoom = zoomInput.value;
			draw();
		}, false);
	}

	// Initialize and bind resize input
	if (resizeInput) {
		resizeInput.checked = storage.resize === 'true' ? true : false;

		var onResize = function() {
			if (resizeInput.checked) {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
				draw();
			} else if (canvas.width !== originalWidth || canvas.height !== originalHeight) {
				canvas.width = originalWidth;
				canvas.height = originalHeight;
				draw();
			}
		};

		resizeInput.addEventListener('change', function() {
			console.log('onChange: resize: ' + resizeInput.checked);
			storage.resize = resizeInput.checked;
			onResize();
		}, false);

		window.addEventListener('resize', onResize, false);

		// Perform initial resize
		onResize();
	}

	// Perform initial draw
	draw();

	// Expose
	window.draw = draw;

}());
