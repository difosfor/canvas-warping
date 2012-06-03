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
	var marbleCanvas = document.createElement('canvas');
	var marbleContext = marbleCanvas.getContext('2d');
	var marbleMapLength = 1000;

	// Prepare marble color map
	(function() {
		marbleCanvas.width = marbleMapLength;
		marbleCanvas.height = 10;

		var grad = marbleContext.createLinearGradient(0, 0, marbleCanvas.width, 0);

		grad.addColorStop(0, '#000000');
		grad.addColorStop(0.07, '#806638');
		grad.addColorStop(0.14, '#E3D6AC');
		grad.addColorStop(0.18, '#806638');
		grad.addColorStop(0.2, '#000000');
		grad.addColorStop(0.6, '#8AA78D');
		grad.addColorStop(0.95, '#F5FFEE');
		grad.addColorStop(1.0, '#FFFFFF');

		marbleContext.fillStyle = grad;
		marbleContext.fillRect(0, 0, marbleCanvas.width, marbleCanvas.height);
	}());

	// Functions
	var rgbas = []; // cache
	function marble(v) {
		var i = Math.floor(v * (marbleMapLength - 1));
		return rgbas[i] || (rgbas[i] = marbleContext.getImageData(i, 0, 1, 1).data);
	}

	function draw(fn) {
		if (fn) {
			storage.fn = fn;
		} else {
			fn = storage.fn;
		}

		var f = noise[fn]; // resolve noise function name to function
		var zoom = parseFloat(zoomInput.value);
		var w = canvas.width;
		var h = canvas.height;
		var vs = new Array(w * h);
		var start, x, y, sx, sy, rgba, i, di;
		var imageData = context.createImageData(w, h);
		var data = imageData.data;

		if (f) {
			console.log('draw(): ' + fn);
		} else {
			context.drawImage(marbleCanvas, 0, 0, marbleCanvas.width, marbleCanvas.height, 0, 0, w, h);
			console.log('draw(): noise function undefined: ' + fn);
			return;
		}

		// Calculate values
		start = Date.now();
		i = 0;
		for (y = 0; y < h; y++) {
			for (x = 0; x < w; x++) {
				// Scale input to normalized vector size
				sx = x / w * zoom;
				sy = y / h * zoom;

				// Store draw function value
				vs[i++] = f(sx, sy);
			}
		}
		console.log('draw(): calculate ' + vs.length + ' values time: ' + (Date.now() - start));

		// Normalize values (use full range of color map)
		start = Date.now();
		var minV = Number.MAX_VALUE;
		var maxV = Number.MIN_VALUE;
		for (i = 0; i < vs.length; i++) {
			if (vs[i] < minV) {
				minV = vs[i];
			}
			if (vs[i] > maxV) {
				maxV = vs[i];
			}
		}
		var vFac = 1 / (maxV - minV);
		for (i = 0; i < vs.length; i++) {
			vs[i] = (vs[i] - minV) * vFac;
		}
		console.log('draw(): normalize values time (' + minV + ' - ' + maxV + '): ' + (Date.now() - start));

		// Prepare image data array
		start = Date.now();
		for (i = 0; i < vs.length; i++) {
			// apply marble color mapping
			rgba = marble(vs[i]);

			// store pixel in image data array
			di = i * 4;
			data[di] = rgba[0];
			data[di + 1] = rgba[1];
			data[di + 2] = rgba[2];
			data[di + 3] = rgba[3];
		}
		console.log('draw(): prepare image data time: ' + (Date.now() - start));

		// Put image data
		start = Date.now();
		context.putImageData(imageData, 0, 0);
		console.log('draw(): put image data time: ' + (Date.now() - start));
	}

	// Initialize inputs
	resizeInput.checked = storage.resize === 'true' ? true : false;
	zoomInput.value = storage.zoom;

	// Perform initial draw
	draw();

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

	// Expose
	window.draw = draw;

}());
