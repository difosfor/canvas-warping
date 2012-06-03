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
	var elem = document.getElementsByTagName('canvas')[0];
	var context = elem.getContext('2d');
	var canvas = context.canvas;

	// Functions
	function draw(fn) {
		if (fn) {
			storage.fn = fn;
		} else {
			fn = storage.fn;
		}

		var f = noise[fn]; // resolve noise function name to function

		if (f) {
			console.log('draw(): ' + fn);
		} else {
			console.log('draw(): noise function undefined ' + fn);
			return;
		}

		var resize = resizeInput.checked;
		var zoom = parseFloat(zoomInput.value);
		var w = resize ? window.innerWidth : canvas.width;
		var h = resize ? window.innerHeight : canvas.height;
		var imageData = context.createImageData(w, h);
		var data = imageData.data;
		var x, y;

		canvas.width  = w;
		canvas.height = h;

		var start = Date.now();

		for (y = 0; y < h; y++) {
			for (x = 0; x < w; x++) {
				// scale input to normalized vector size
				var sx = x / w * zoom;
				var sy = y / h * zoom;

				// apply draw function
				var v = f(sx, sy);

				// convert the result from [-1, 1] to [0, 255]
				v = (v * 0.5 + 0.5) * 255;

				// store pixel in image data array
				var i = (y * w + x) * 4;
				data[i] = v; // red
				data[i + 1] = v; // green
				data[i + 2] = v; // blue
				data[i + 3] = 255; // alpha
			}
		}

		context.putImageData(imageData, 0, 0);

		console.log('draw(): render time: ' + (Date.now() - start));
	}

	// Initialize inputs
	resizeInput.checked = storage.resize === 'true' ? true : false;
	zoomInput.value = storage.zoom;

	// Perform initial draw
	draw();

	// Bind inputs
	resizeInput.addEventListener('change', function() {
		console.log('onChange: resize: ' + resizeInput.checked);
		storage.resize = resizeInput.checked;
		if (resizeInput.checked) {
			draw();
		}
	}, false);

	window.addEventListener('resize', function() {
		console.log('onResize: ' + resizeInput.checked);
		if (resizeInput.checked) {
			draw();
		}
	}, false); // TODO: debounce

	zoomInput.addEventListener('change', function() {
		console.log('onChange: zoom: ' + zoomInput.value);
		storage.zoom = zoomInput.value;
		draw();
	}, false);

	// Expose
	window.draw = draw;

}());
