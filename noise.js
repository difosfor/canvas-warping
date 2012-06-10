(function() {

	'use strict';

	// Helper functions
	function to1(v) {
		return (v + 1) / 2;
	}

	function to255(v) {
		return to1(v) * 255;
	}

	function grayscale(v) {
		v = to255(v);
		return [ v, v, v ];
	}

	// Basic noise functions
	var p = [
		151,160,137,91,90,15,
		131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
		190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
		88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
		77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
		102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
		135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
		5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
		223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
		129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
		251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
		49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
		138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,
		151,160,137,91,90,15,
		131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
		190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
		88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
		77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
		102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
		135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
		5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
		223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
		129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
		251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
		49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
		138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
	];

	function fade(t) {
		return t * t * t * (t * (t * 6 - 15) + 10);
	}

	function lerp(t, a, b) {
		return a + t * (b - a);
	}

	function grad(hash, x, y, z) {
		var h = hash & 15; // CONVERT LO 4 BITS OF HASH CODE
		var u = h < 8 ? x : y; // INTO 12 GRADIENT DIRECTIONS.
		var v = h < 4 ? y : h === 12 || h === 14 ? x : z;
		return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
	}

	function noise2d(x, y) {
		var X = Math.floor(x) & 255;
		var Y = Math.floor(y) & 255;

		x -= Math.floor(x);
		y -= Math.floor(y);

		var u = fade(x);
		var v = fade(y);

		var A = p[X] + Y;
		var AA = p[A];
		var AB = p[A + 1];

		var B = p[X + 1] + Y;
		var BA = p[B];
		var BB = p[B + 1];

		return lerp(v,
			lerp(u, grad(p[AA], x, y, 0), grad(p[BA], x - 1, y, 0)),
			lerp(u, grad(p[AB], x, y - 1, 0), grad(p[BB], x - 1, y - 1, 0))
		);
	}

	function noise3d(x, y, z) {
		var X = Math.floor(x) & 255; // FIND UNIT CUBE THAT
		var Y = Math.floor(y) & 255; // CONTAINS POINT.
		var Z = Math.floor(z) & 255;

		x -= Math.floor(x); // FIND RELATIVE X,Y,Z
		y -= Math.floor(y); // OF POINT IN CUBE.
		z -= Math.floor(z);

		var u = fade(x); // COMPUTE FADE CURVES
		var v = fade(y); // FOR EACH OF X,Y,Z.
		var w = fade(z);

		var A = p[X] + Y; // HASH COORDINATES OF
		var AA = p[A] + Z; // THE 8 CUBE CORNERS,
		var AB = p[A + 1] + Z;

		var B = p[X + 1] + Y;
		var BA = p[B] + Z;
		var BB = p[B + 1] + Z;

		return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), // AND ADD
		grad(p[BA], x - 1, y, z)), // BLENDED
		lerp(u, grad(p[AB], x, y - 1, z), // RESULTS
		grad(p[BB], x - 1, y - 1, z))), // FROM  8
		lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1), // CORNERS
		grad(p[BA + 1], x - 1, y, z - 1)), // OF CUBE
		lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))));
	}

	// fractal sum
	function fBm2d(x, y, octaves) {
		var lacunarity = 2.0;
		var gain = 0.5;

		var freq = 1.0;
		var amp = 0.5;

		var sum = 0;
		for (var i = 0; i < octaves; i++) {
			sum += noise2d(x * freq, y * freq) * amp;
			freq *= lacunarity;
			amp *= gain;
		}
		return sum;
	}

	function fBm3d(x, y, z, octaves) {
		var lacunarity = 2.0;
		var gain = 0.5;

		var freq = 1.0;
		var amp = 0.5;

		var sum = 0;
		for (var i = 0; i < octaves; i++) {
			sum += noise3d(x * freq, y * freq, z * freq) * amp;
			freq *= lacunarity;
			amp *= gain;
		}
		return sum;
	}

	// Turbulence - absolute value of noise summed
	function turbulence2d(x, y, octaves) {
		var lacunarity = 2.0;
		var gain = 0.5;

		var sum = 0;
		var freq = 1.0;
		var amp = 1.0;

		for (var i = 0; i < octaves; i++) {
			sum += Math.abs(noise2d(x * freq, y * freq)) * amp;
			freq *= lacunarity;
			amp *= gain;
		}
		return sum;
	}

	function turbulence3d(x, y, z, octaves) {
		var lacunarity = 2.0;
		var gain = 0.5;

		var sum = 0;
		var freq = 1.0;
		var amp = 1.0;

		for (var i = 0; i < octaves; i++) {
			sum += Math.abs(noise3d(x * freq, y * freq, z * freq)) * amp;
			freq *= lacunarity;
			amp *= gain;
		}
		return sum;
	}

	// Ridged multifractal
	// See "Texturing & Modeling, A Procedural Approach", Chapter 12
	function ridge(h, offset) {
		h = Math.abs(h);
		h = offset - h;
		h = h * h;
		return h;
	}

	function ridgedmf2d(x, y, octaves) {
		var lacunarity = 2.0;
		var gain = 0.5;
		var offset = 1.0;

		var sum = 0;
		var freq = 1.0;
		var amp = 0.5;
		var prev = 1.0;

		for (var i = 0; i < octaves; i++) {
			var n = ridge(noise2d(x * freq, y * freq), offset);
			sum += n * amp * prev;
			prev = n;
			freq *= lacunarity;
			amp *= gain;
		}
		return sum;
	}

	function ridgedmf3d(x, y, z, octaves) {
		var lacunarity = 2.0;
		var gain = 0.5;
		var offset = 1.0;

		var sum = 0;
		var freq = 1.0;
		var amp = 0.5;
		var prev = 1.0;

		for (var i = 0; i < octaves; i++) {
			var n = ridge(noise3d(x * freq, y * freq, z * freq), offset);
			sum += n * amp * prev;
			prev = n;
			freq *= lacunarity;
			amp *= gain;
		}
		return sum;
	}

	function fbm1(x, y) {
		return fBm2d(x, y, 8);
	}

	function fbm2(x, y) {
		var qx = fbm1(x, y);
		var qy = fbm1(x + 5.2, y + 1.3);
		return fbm1(x + 4 * qx, y + 4 * qy);
	}

	function fbm3(x, y) {
		var qx = fbm1(x, y);
		var qy = fbm1(x + 5.2, y + 1.3);
		var rx = fbm1(x + 4 * qx + 1.7, y + 4 * qy + 9.2);
		var ry = fbm1(x + 4 * qx + 8.3, y + 4 * qy + 2.8);
		return fbm1(x + 4 * rx, y + 4 * ry);
	}

	function fbmAdH(x, y) {
		var qx = fbm1(x, y);
		var qy = fbm1(x + 5.2, y + 1.3);

		var rx = fbm1(x + 4 * qx + 1.7, y + 4 * qy + 9.2);
		var ry = fbm1(x + 4 * qx + 8.3, y + 4 * qy + 2.8);

		var v = fbm1(x + 4 * rx, y + 4 * ry);

		var ramp_start = [0, 0, 0];
		var ramp_end = [100, 150, 150];

		var v_smooth = Math.sin(Math.PI*((v+0.5)/8));

		var red = ramp_start[0] + v_smooth*(ramp_end[0]-ramp_start[0]);
		var green = ramp_start[1] + v_smooth*(ramp_end[1]-ramp_start[1]);
		var blue = ramp_start[2] + v_smooth*(ramp_end[2]-ramp_start[2]);

		var qx_abs = Math.sin(Math.PI*(qx));
		red += qx_abs*173;
		green += qx_abs*112;
		blue += qx_abs*14;

		var qy_abs = Math.sin(Math.PI*(qy));
		red += qy_abs*158;
		green += qy_abs*151;
		blue += qy_abs*125;

		var rx_abs = Math.sin(Math.PI*(rx));
		red += rx_abs*36;
		green += rx_abs*38;
		blue += rx_abs*79;

		var ry_abs = Math.sin(Math.PI*((ry+0.5)/8));
		red += ry_abs*255;
		green += ry_abs*255;
		blue += ry_abs*255;

		return [ red, green, blue ];
	}

	function fbmPPE(x, y) {
		var brightness = 0;
		// var brightness = 50;

		// var gain = 0;
		// var gain = 0.5;
		var gain = 1;

		var qx = fbm1(x, y);
		var qy = fbm1(x + 5.2, y + 1.3);

		var qv = Math.sqrt(qx * qx + qy * qy); // length of q
		// var qv = Math.abs(qx);
		// var qv = Math.abs(qy);
		// var qv = to1(qx);
		// var qv = to1(qy);

		var qr = qv * 227;
		var qg = qv * 168;
		var qb = qv * 32;

		var rx = fbm1(x + 4 * qx + 1.7, y + 4 * qy + 9.2);
		var ry = fbm1(x + 4 * qx + 8.3, y + 4 * qy + 2.8);

		var rv = Math.sqrt(rx * rx + ry * ry); // length of r
		// var rv = Math.abs(rx);
		// var rv = Math.abs(ry);
		// var rv = to1(rx);
		// var rv = to1(ry);

		var rr = rv * 227;
		var rg = rv * 242;
		var rb = rv * 250;

		var v = to1(fbm1(x + 4 * rx, y + 4 * ry)) + gain;

		var r = v * (qr + rr + brightness);
		var g = v * (qg + rg + brightness);
		var b = v * (qb + rb + brightness);

		return [ r, g, b ];
	}

	// Expose
	window.noise = {
		noise: function(x, y) {
			return grayscale(noise2d(x, y));
		},
		turbulence: function(x, y) {
			return grayscale(turbulence2d(x, y, 8));
		},
		ridged: function(x, y) {
			return grayscale(ridgedmf2d(x, y, 8));
		},
		fbm1: function(x, y) {
			return grayscale(fbm1(x, y));
		},
		fbm2: function(x, y) {
			return grayscale(fbm2(x, y));
		},
		fbm3: function(x, y) {
			return grayscale(fbm3(x, y));
		},
		fbmAdH: function(x, y) {
			return fbmAdH(x, y);
		},
		fbmPPE: function(x, y) {
			return fbmPPE(x, y);
		}
	};
}());
