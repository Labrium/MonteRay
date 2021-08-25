/*
 * MonteRay Alpha 2 Copyright (c) 2021 Tech Labs, Inc.
 * 
 * This renderer has been created as an alternative to the default Three.js
 * WebGL renderer, and will (at some future time) support most if not all
 * Three.js scenes and materials.
 * 
 * https://techlabsinc.github.io/MonteRay/LICENSE
 * 
 * @author TechLabsInc / http://github.com/TechLabsInc
 */
var MonteRay = MonteRay || {};


// Constants
MonteRay.DepthRenderMode = 0;
MonteRay.RandomRenderMode = 1;
MonteRay.LinearRenderMode = 2;
MonteRay.CenterRenderMode = 3;



// Custom classes
MonteRay.Color = function (r, g, b, a) {

	if (g === undefined && b === undefined) {
		return this.set(r);
	}

	if (a === undefined) {
		return this.setRGB(r, g, b);
	}

	return this.setRGBA(r, g, b, a);
}
Object.assign(MonteRay.Color.prototype, {

	isMonteRayColor: true,

	r: 1, g: 1, b: 1, a: 1,

	maxVal: function () {
		return Math.max(this.r, Math.max(this.g, this.b));
	},

	maxValA: function () {
		return Math.max(this.r, Math.max(this.g, Math.max(this.b, this.a)));
	},

	set: function (value) {
		if (value && value.isMonteRayColor) {
			this.copy(value);
		} else if (value && value.isColor) {
			this.fromTHREEColor(value, 1);
		} else if (typeof value === 'number') {
			this.setHex(value);
		} else if (typeof value === 'string') {
			this.fromTHREEColor(new THREE.Color().setStyle(value));
		}
		return this;
	},

	setRGB: function (r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;
		return this;
	},

	setRGBA: function (r, g, b, a) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
		return this;
	},

	setHex: function (hex) {
		hex = Math.floor(hex);
		if (hex.toString(16).length > 6) {
			this.r = (hex >> 24 & 255) / 255;
			this.g = (hex >> 16 & 255) / 255;
			this.b = (hex >> 8 & 255) / 255;
			this.a = (hex & 255) / 255;
		} else {
			this.r = (hex >> 16 & 255) / 255;
			this.g = (hex >> 8 & 255) / 255;
			this.b = (hex & 255) / 255;
		}
		return this;
	},

	setScalar: function (scalar) {
		this.r = scalar;
		this.g = scalar;
		this.b = scalar;
		return this;
	},

	setScalarA: function (scalar) {
		this.r = scalar;
		this.g = scalar;
		this.b = scalar;
		this.a = scalar;
		return this;
	},

	setR: function (r) {
		this.r = r;
		return this;
	},

	setG: function (g) {
		this.g = g;
		return this;
	},

	setB: function (b) {
		this.b = b;
		return this;
	},

	setA: function (a) {
		this.a = a;
		return this;
	},

	setComponent: function (index, value) {
		switch (index) {
			case 0: this.r = value; break;
			case 1: this.g = value; break;
			case 2: this.b = value; break;
			case 3: this.a = value; break;
			default: throw new Error('index is out of range: ' + index);
		}
		return this;
	},

	getComponent: function (index) {
		switch (index) {
			case 0: return this.r;
			case 1: return this.g;
			case 2: return this.b;
			case 3: return this.a;
			default: throw new Error('index is out of range: ' + index);
		}
	},

	clone: function () {
		return new this.constructor(this.r, this.g, this.b, this.a);
	},

	copy: function (c) {
		this.r = c.r;
		this.g = c.g;
		this.b = c.b;
		this.a = c.a;
		return this;
	},

	add: function (c) {
		this.r += c.r;
		this.g += c.g;
		this.b += c.b;
		return this;
	},

	addA: function (c) {
		this.r += c.r;
		this.g += c.g;
		this.b += c.b;
		this.a += c.a;
		return this;
	},

	addScalar: function (s) {
		this.r += s;
		this.g += s;
		this.b += s;
		return this;
	},

	addScalarA: function (s) {
		this.r += s;
		this.g += s;
		this.b += s;
		this.a += s;
		return this;
	},

	addColors: function (a, b) {
		this.r = a.r + b.r;
		this.g = a.g + b.g;
		this.b = a.b + b.b;
		return this;
	},

	addColorsA: function (a, b) {
		this.r = a.r + b.r;
		this.g = a.g + b.g;
		this.b = a.b + b.b;
		this.a = a.a + b.a;
		return this;
	},

	sub: function (c) {
		this.r -= c.r;
		this.g -= c.g;
		this.b -= c.b;
		return this;
	},

	subA: function (c) {
		this.r -= c.r;
		this.g -= c.g;
		this.b -= c.b;
		this.a -= c.a;
		return this;
	},

	subScalar: function (s) {
		this.r -= s;
		this.g -= s;
		this.b -= s;
		return this;
	},

	subScalarA: function (s) {
		this.r -= s;
		this.g -= s;
		this.b -= s;
		this.a -= s;
		return this;
	},

	subColors: function (a, b) {
		this.r = a.r - b.r;
		this.g = a.g - b.g;
		this.b = a.b - b.b;
		return this;
	},

	subColorsA: function (a, b) {
		this.r = a.r - b.r;
		this.g = a.g - b.g;
		this.b = a.b - b.b;
		this.a = a.a - b.a;
		return this;
	},

	multiply: function (c) {
		this.r *= c.r;
		this.g *= c.g;
		this.b *= c.b;
		return this;
	},

	multiplyA: function (c) {
		this.r *= c.r;
		this.g *= c.g;
		this.b *= c.b;
		this.a *= c.a;
		return this;
	},

	multiplyScalar: function (scalar) {
		this.r *= scalar;
		this.g *= scalar;
		this.b *= scalar;
		return this;
	},

	multiplyScalarA: function (scalar) {
		this.r *= scalar;
		this.g *= scalar;
		this.b *= scalar;
		this.a *= scalar;
		return this;
	},

	divideScalar: function (scalar) {
		return this.multiplyScalar(1 / scalar);
	},

	divideScalarA: function (scalar) {
		return this.multiplyScalarA(1 / scalar);
	},

	min: function (c) {
		this.r = Math.min(this.r, c.r);
		this.g = Math.min(this.g, c.g);
		this.b = Math.min(this.b, c.b);
		return this;
	},

	minA: function (c) {
		this.r = Math.min(this.r, c.r);
		this.g = Math.min(this.g, c.g);
		this.b = Math.min(this.b, c.b);
		this.a = Math.min(this.a, c.a);
		return this;
	},

	max: function (c) {
		this.r = Math.max(this.r, c.r);
		this.g = Math.max(this.g, c.g);
		this.b = Math.max(this.b, c.b);
		return this;
	},

	maxA: function (c) {
		this.r = Math.max(this.r, c.r);
		this.g = Math.max(this.g, c.g);
		this.b = Math.max(this.b, c.b);
		this.a = Math.max(this.a, c.a);
		return this;
	},

	clamp: function (min, max) {
		this.r = Math.max(min.r, Math.min(max.r, this.r));
		this.g = Math.max(min.g, Math.min(max.g, this.g));
		this.b = Math.max(min.b, Math.min(max.b, this.b));
		return this;
	},

	clampA: function (min, max) {
		this.r = Math.max(min.r, Math.min(max.r, this.r));
		this.g = Math.max(min.g, Math.min(max.g, this.g));
		this.b = Math.max(min.b, Math.min(max.b, this.b));
		this.a = Math.max(min.a, Math.min(max.a, this.a));
		return this;
	},

	clampScalar: function (minVal, maxVal) {
		this.r = Math.max(minVal, Math.min(maxVal, this.r));
		this.g = Math.max(minVal, Math.min(maxVal, this.g));
		this.b = Math.max(minVal, Math.min(maxVal, this.b));
		return this;
	},

	clampScalarA: function (minVal, maxVal) {
		this.r = Math.max(minVal, Math.min(maxVal, this.r));
		this.g = Math.max(minVal, Math.min(maxVal, this.g));
		this.b = Math.max(minVal, Math.min(maxVal, this.b));
		this.a = Math.max(minVal, Math.min(maxVal, this.a));
		return this;
	},

	clampV: function () {
		this.clampScalarA(0, 1);
	},

	invert: function () {
		this.r = - this.r;
		this.g = - this.g;
		this.b = - this.b;
		return this;
	},

	invertA: function () {
		this.r = - this.r;
		this.g = - this.g;
		this.b = - this.b;
		this.a = - this.a;
		return this;
	},

	lerp: function (c, alpha) {
		this.r += (c.r - this.r) * alpha;
		this.g += (c.g - this.g) * alpha;
		this.b += (c.b - this.b) * alpha;
		return this;
	},

	lerpA: function (c, alpha) {
		this.r += (c.r - this.r) * alpha;
		this.g += (c.g - this.g) * alpha;
		this.b += (c.b - this.b) * alpha;
		this.a += (c.a - this.a) * alpha;
		return this;
	},

	lerpColors: function (v1, v2, alpha) {
		this.r = v1.r + (v2.r - v1.r) * alpha;
		this.g = v1.g + (v2.g - v1.g) * alpha;
		this.b = v1.b + (v2.b - v1.b) * alpha;
		return this;
	},

	lerpColorsA: function (v1, v2, alpha) {
		this.r = v1.r + (v2.r - v1.r) * alpha;
		this.g = v1.g + (v2.g - v1.g) * alpha;
		this.b = v1.b + (v2.b - v1.b) * alpha;
		this.a = v1.a + (v2.a - v1.a) * alpha;
		return this;
	},

	equals: function (c) {
		return ((c.r === this.r) && (c.g === this.g) && (c.b === this.b));
	},

	equalsA: function (c) {
		return ((c.r === this.r) && (c.g === this.g) && (c.b === this.b) && (c.a === this.a));
	},

	fromArray: function (array, offset) {
		if (offset == undefined) {
			offset = 0;
		}
		this.r = array[offset];
		this.g = array[offset + 1];
		this.b = array[offset + 2];
		this.a = array[offset + 3];
		return this;
	},

	toArray: function (array, offset) {
		if (array == undefined) {
			array = [];
		}
		if (offset == undefined) {
			offset = 0;
		}
		array[offset] = this.r;
		array[offset + 1] = this.g;
		array[offset + 2] = this.b;
		array[offset + 3] = this.a;
		return array;
	},

	fromBufferAttribute: function (attribute, index) {
		this.r = attribute.getX(index);
		this.g = attribute.getY(index);
		this.b = attribute.getZ(index);
		this.a = attribute.getW(index);
		return this;
	},

	fromTHREEColor: function (c, a) {
		if (a == undefined) {
			a = 1;
		}
		this.setRGB(c.r, c.g, c.b, a);
		return this;
	},

	random: function () {
		this.r = Math.random();
		this.g = Math.random();
		this.b = Math.random();
		return this;
	},

	randomA: function () {
		this.r = Math.random();
		this.g = Math.random();
		this.b = Math.random();
		this.a = Math.random();
		return this;
	}
});

MonteRay.Color.imageDataToHex = function (r, g, b, a) {
	return (r) << 24 ^ (g) << 16 ^ (b) << 8 ^ (a) << 0;
}




MonteRay.PathtracingRenderer = function (parameters) {

	this.VERSION = "Alpha 2";
	var EPSILON = Math.pow(0.1, -52);

	parameters = parameters || {};
	var self = this;

	console.log("Rendering provided by MonteRay " + this.VERSION + " https://techlabsinc.github.io/MonteRay/LICENSE");
	var canvas;
	if (parameters.canvas) {
		canvas = parameters.canvas;
	} else {
		canvas = document.createElement('canvas');
	}
	var context = canvas.getContext('2d', {
		alpha: parameters.alpha === true
	});

	var canvasWidth, canvasHeight;
	var canvasHalfWidth, canvasHalfHeight;
	var pixelRatio;

	var clearColor = new MonteRay.Color(0x000000);

	this.domElement = canvas;

	this.autoClear = true;

	this.setClearColor = function (color, alpha) {
		clearColor.setScalar(color);
		clearColor.setA(alpha);

	};

	this.getClearColor = function () {
		return clearColor.toColor();
	};

	this.setPixelRatio = function (res) {
		pixelRatio = res;
		this.setSize(canvasWidth * pixelRatio, canvasHeight * pixelRatio);
	};

	this.setSize = function (width, height) {

		canvasWidth = Math.round(width / pixelRatio);
		canvasHeight = Math.round(height / pixelRatio);
		canvasHalfWidth = canvasWidth / 2;
		canvasHalfHeight = canvasHeight / 2;
		canvas.style.width = width + "px";
		canvas.style.height = height + "px";

	};

	this.setSize(canvas.width, canvas.height);
	this.setPixelRatio(1);

	this.clear = function () {

	};
	if (!parameters.BVHAcceleration || parameters.BVHAcceleration && parameters.BVHAcceleration != false) {
		THREE.BufferGeometry.prototype.computeBoundsTree = MeshBVHLib.computeBoundsTree;
		THREE.BufferGeometry.prototype.disposeBoundsTree = MeshBVHLib.disposeBoundsTree;
		THREE.Mesh.prototype.raycast = MeshBVHLib.acceleratedRaycast;
	}

	var dnumber = 1;
	this.download = function () {
		var el = document.createElement("a");
		el.setAttribute("href", canvas.toDataURL());
		el.setAttribute("download", document.title + "_" + dnumber + ".png");
		dnumber++;
		el.style.display = "none";
		document.body.appendChild(el);
		el.onclick = function (e) {
			e.stopPropagation();
		}
		el.click();
		document.body.removeChild(el);
	}


	var lngth = 1;
	var len = 1;
	var uod = true;
	var spp = 1;
	var cw = canvasWidth;
	var ch = canvasHeight;

	var textureCache = [];

	this.clearTextureCache = function () {
		textureCache = [];
	};

	this.currentSamples = function () {
		return spp;
	};

	this.getSize = function () {
		return new THREE.Vector2(cw, ch);
	};

	this.getPixelRatio = function () {
		return pixelRatio;
	};

	var toRender = [];
	var crender = 0;

	this.resetSamples = function () {
		for (var s = 0; s < toRender.length; s++) {
			toRender[s][2] = 2;
		}
		crender = 0;
		spp = 1;
	};

	this.render = function (scene, camera) {
		var rayIn = false;
		cw = canvasWidth;
		ch = canvasHeight;
		var chw = canvasHalfWidth;
		var chh = canvasHalfHeight;
		canvas.width = cw;
		canvas.height = ch;

		spp = 1;
		var TAU = Math.PI * 2;
		var nullcolor = new MonteRay.Color(0x000000);
		// setup
		//context.clearRect(0, 0, canvasWidth, canvasHeight);
		var eye = new THREE.Raycaster();
		eye.firstHitOnly = true;


		// In-render functions
		function calcNormal(intersect) {
			var norm = new THREE.Vector3();
			var localPoint = new THREE.Vector3();
			localPoint.copy(intersect.point).applyMatrix4(new THREE.Matrix4().copy(intersect.object.matrixWorld).invert());
			computePixelNormal(norm, localPoint, intersect.object.material.flatShading, intersect.face, intersect.object.geometry);
			norm.applyMatrix3(new THREE.Matrix3().getNormalMatrix(intersect.object.matrixWorld)).normalize();
			//return intersect.face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(intersect.object.matrixWorld)).normalize();
			return norm;
		}
		var computePixelNormal = (function () {
			var vA = new THREE.Vector3();
			var vB = new THREE.Vector3();
			var vC = new THREE.Vector3();
			var tmpVec1 = new THREE.Vector3();
			var tmpVec2 = new THREE.Vector3();
			var tmpVec3 = new THREE.Vector3();
			return function computePixelNormal(outputVector, point, flatShading, face, geometry) {
				try {
					var faceNormal = face.normal;
					if (flatShading === true) {
						outputVector.copy(faceNormal);
					} else {
						try {
							var positions = geometry.attributes.position;
							var normals = geometry.attributes.normal;
						} catch (e) {
							var positions = geometry._bufferGeometry.attributes.position;
							var normals = geometry._bufferGeometry.attributes.normal;
						}
						vA.fromBufferAttribute(positions, face.a);
						vB.fromBufferAttribute(positions, face.b);
						vC.fromBufferAttribute(positions, face.c);
						// compute barycentric coordinates
						tmpVec3.crossVectors(tmpVec1.subVectors(vB, vA), tmpVec2.subVectors(vC, vA));
						var areaABC = faceNormal.dot(tmpVec3);
						tmpVec3.crossVectors(tmpVec1.subVectors(vB, point), tmpVec2.subVectors(vC, point));
						var areaPBC = faceNormal.dot(tmpVec3);
						var a = areaPBC / areaABC;
						tmpVec3.crossVectors(tmpVec1.subVectors(vC, point), tmpVec2.subVectors(vA, point));
						var areaPCA = faceNormal.dot(tmpVec3);
						var b = areaPCA / areaABC;
						var c = 1.0 - a - b;
						// compute interpolated vertex normal
						tmpVec1.fromBufferAttribute(normals, face.a);
						tmpVec2.fromBufferAttribute(normals, face.b);
						tmpVec3.fromBufferAttribute(normals, face.c);
						tmpVec1.multiplyScalar(a);
						tmpVec2.multiplyScalar(b);
						tmpVec3.multiplyScalar(c);
						outputVector.addVectors(tmpVec1, tmpVec2);
						outputVector.add(tmpVec3);
					}
				} catch (e) {
					computePixelNormal(outputVector, point, flatShading, face, new THREE.BufferGeometry().fromGeometry(geometry));
				}
			};
		}());

		function randDir() {
			var rd = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() * 0.5);
			while (rd.normalize().dot(new THREE.Vector3(0, 0, 1)) < Math.random()) {
				rd = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() * 0.5);
			}
			return rd;
		}

		function getTexel(texture, uv) {
			if (!textureCache[texture.id]) {
				var c = document.createElement('canvas').getContext('2d');
				c.canvas.width = texture.image.width;
				c.canvas.height = texture.image.height;
				c.drawImage(texture.image, 0, 0);
				var texd = [].slice.call(c.getImageData(0, 0, c.canvas.width, c.canvas.height).data);
				var texdrows = [];
				for (var i = 0; i < texd.length; i += 4) {
					texdrows.push(MonteRay.Color.imageDataToHex(texd[i], texd[i + 1], texd[i + 2], texd[i + 3]));
				}
				textureCache[texture.id] = [];
				for (var i = 0; i < texdrows.length; i += c.canvas.width) {
					textureCache[texture.id].push(texdrows.slice(i, i + c.canvas.width));
				}
			}
			var texCoords = new THREE.Vector2();
			var repeat = new THREE.Vector2(1, 1);
			texCoords.x = Math.floor((uv.x * repeat.x) * (texture.image.width));
			texCoords.y = Math.floor((1 - (uv.y * repeat.y)) * (texture.image.height));
			try {
				var data = textureCache[texture.id][texCoords.y][texCoords.x];
			} catch (e) {
				console.log(uv);
			}
			if (data) {
				return new MonteRay.Color(data);
			} else {
				return new MonteRay.Color();
			}
		}

		function getBackground() {
			if (scene.background.isColor) {
				return new MonteRay.Color().fromTHREEColor(scene.background);
			} else {
				var coords = {};
				coords.radius = Math.sqrt(eye.ray.direction.x * eye.ray.direction.x + eye.ray.direction.y * eye.ray.direction.y + (-eye.ray.direction.z) * (-eye.ray.direction.z));
				if (coords.radius === 0) {
					coords.theta = 0;
					coords.phi = 0;
				} else {
					coords.theta = Math.atan2(eye.ray.direction.x, -eye.ray.direction.z);
					coords.phi = Math.acos(THREE.MathUtils.clamp(eye.ray.direction.y / coords.radius, - 1, 1));
				}
				return getTexel(scene.background, new THREE.Vector2((coords.theta + Math.PI) / TAU, 1 - coords.phi / Math.PI));
			}
		}

		function getPixelMaterial(intersect) {
			var pixmat = {};
			if (intersect) {
				if (!nullcolor.equals(new MonteRay.Color().fromTHREEColor(intersect.object.material.emissive)) || intersect.object.material.isMeshBasicMaterial) {
					pixmat.type = "GLOW";
				} else if (intersect.object.material.mirror || intersect.object.material.metalness == 1) {
					pixmat.type = "SPEC";
				} else if (intersect.object.material.glass) {
					pixmat.type = "REFR";
				} else {
					pixmat.type = "DIFF";
					//pixmat.type = "GLOW"; //for ALB rendering
					//pixmat.type = "NORM"; //for normal rendering
				}
				pixmat.color = new MonteRay.Color().fromTHREEColor(intersect.object.material.color);
				if (intersect.object.material.map) {
					pixmat.color.multiply(getTexel(intersect.object.material.map, intersect.uv));
				}
				pixmat.emissive = new MonteRay.Color().fromTHREEColor(intersect.object.material.emissive);
				if (intersect.object.material.emissiveIntensity) {
					pixmat.emissiveIntensity = intersect.object.material.emissiveIntensity;
				} else {
					pixmat.emissiveIntensity = 0;
				}
				if (intersect.object.material.refractionRatio) {
					pixmat.refractionRatio = intersect.object.material.refractionRatio;
				} else {
					pixmat.refractionRatio = 0;
				}
				pixmat.point = intersect.point;
				pixmat.normal = calcNormal(intersect).normalize();
				if (intersect.object.material.normalMap) {
					var clr = getTexel(intersect.object.material.normalMap, intersect.uv);
					pixmat.normal.x += (clr.r - 0.5) * 2;
					pixmat.normal.y += (clr.g - 0.5) * 2;
					pixmat.normal.normalize();
				}
				return pixmat;
			} else {
				return { type: "DIFF", color: getBackground(), point: new THREE.Vector3(), normal: new THREE.Vector3() };
			}
		}

		function reflect(intersect, norm) {
			eye.ray.origin.copy(intersect.point);
			eye.ray.direction.reflect(norm);
		}

		function refract(intersect, norm) {
			if (rayIn == false) {
				eye.ray.origin.copy(intersect.point.addScaledVector(norm, -EPSILON));
				eye.ray.direction.lerp(norm.clone().negate(), intersect.refractionRatio);
				rayIn = true;
			} else {
				eye.ray.origin.copy(intersect.point.addScaledVector(norm, EPSILON));
				eye.ray.direction.lerp(norm, intersect.refractionRatio);
				rayIn = false;
			}
		}



		var ptr = [];
		var pixSize = new THREE.Vector2(1 / cw, 1 / ch);
		for (var y = 0; y < ch; y++) {
			for (var x = 0; x < cw; x++) {
				ptr.push(new THREE.Vector2((((x + 0.5) / cw) * 2 - 1), (-((y + 0.5) / ch) * 2 + 1)));
			}
		}


		scene.updateMatrixWorld();
		camera.updateMatrixWorld();

		//register emissive objects for explicit lighting
		try { document.getElementById("sa").innerHTML = "Analyzing scene..."; } catch (e) { }
		var lights = [];
		scene.traverseVisible(function (obj) {
			try {
				if (!parameters.BVHAcceleration || parameters.BVHAcceleration && parameters.BVHAcceleration != false) {
					if (obj instanceof THREE.Mesh == true) {
						obj.geometry.computeBoundsTree();
					}
				}
				if (!nullcolor.equals(new MonteRay.Color().fromTHREEColor(obj.material.emissive))) {
					lights.push([obj, new MeshSurfaceSampler(obj).build()]);
				}
			} catch (e) { }
		});
		var ll = lights.length;

		// pre-rendering cycle
		try { document.getElementById("sa").innerHTML = "Pre-rendering..."; } catch (e) { }
		var renderedImage = [];
		var rl = ptr.length;
		for (var j = 0; j < rl; j++) {
			var outputColor = new MonteRay.Color(0x000000);
			var pixelcast = ptr[j];
			eye.setFromCamera(pixelcast, camera);
			var intersect = eye.intersectObjects(scene.children, true)[0];
			if (intersect == undefined) {
				outputColor.add(getBackground());
				if (parameters.antialiasBackground) {
					//outputColor.setRGB(Math.random(), Math.random(), Math.random());
					//outputColor.setScalar3(Math.random());
					toRender.push([pixelcast, { distance: Infinity }, 2, new MonteRay.Color(0, 0, 0, 1), j * 4]);
				}
			} else {
				try {
					var mat = getPixelMaterial(intersect);
					if (mat.type == "GLOW") {
						var intense = 1;
						if (mat.emissiveIntensity) {
							intense = mat.emissiveIntensity;
						}
						outputColor.copy(mat.color);
						outputColor.add(mat.emissive.multiplyScalar(intense));
						if (parameters.antialiasBackground) {
							toRender.push([pixelcast, intersect, 2, new MonteRay.Color(0, 0, 0, 1), j * 4]);
						}
					} else {
						outputColor.setScalar(intersect.distance / camera.far);
						toRender.push([pixelcast, intersect, 2, new MonteRay.Color(0, 0, 0, 1), j * 4]);
						if (parameters.alpha) {
							outputColor.setA(0);
						}
					}
				} catch (e) {
					console.log(e);
					outputColor.setScalar(intersect.distance / camera.far);
					toRender.push([pixelcast, intersect, 2, new MonteRay.Color(0, 0, 0, 1), j * 4]);
					if (parameters.alpha) {
						outputColor.setA(0);
					}
				}
			}
			renderedImage.push(outputColor.r * 255);
			renderedImage.push(outputColor.g * 255);
			renderedImage.push(outputColor.b * 255);
			renderedImage.push(outputColor.a * 255);
		}
		context.putImageData(new ImageData(new Uint8ClampedArray(renderedImage), cw, ch), 0, 0);

		if (!parameters.renderMode || (parameters.renderMode && parameters.renderMode == MonteRay.DepthRenderMode)) {
			toRender.sort(function (a, b) {
				return a[1].distance - b[1].distance;
			});
		} else if (parameters.renderMode && parameters.renderMode == MonteRay.CenterRenderMode) {
			toRender.sort(function (a, b) {
				var c = new THREE.Vector3(0, 0);
				var v1 = new THREE.Vector2(a[0].x * camera.aspect, a[0].y);
				var v2 = new THREE.Vector2(b[0].x * camera.aspect, b[0].y);
				return v1.distanceTo(c) - v2.distanceTo(c);
			});
		} else if (parameters.renderMode && parameters.renderMode == MonteRay.RandomRenderMode) {
			for (var i = 0; i < toRender.length; i++) {
				var swap = Math.random() * toRender.length | 0;
				var tmp = toRender[swap];
				toRender[swap] = toRender[i];
				toRender[i] = tmp;
			}
		}

		function tracePath(pixelcast, depth) {
			rayIn = false;
			var intersect;
			intersect = eye.intersectObjects(scene.children, true)[0];

			if (intersect == undefined) {
				return getBackground();
			}

			var mat = getPixelMaterial(intersect);

			if (depth > 4 && (depth > 20 || Math.random() > mat.color.maxVal())) {
				return nullcolor;
			}


			var norm = mat.normal;

			if (mat.type == "NORM") {
				return new MonteRay.Color((norm.x * 0.5) + 0.5, (norm.y * 0.5) + 0.5, (norm.z * 0.5) + 0.5);
			}

			// Recurse
			var lightSampling = nullcolor.clone();
			if (mat.type == "GLOW") {
				var intense = 1;
				if (mat.emissiveIntensity) {
					intense = mat.emissiveIntensity;
				}
				return mat.color.clone().add(mat.emissive.clone().multiplyScalar(intense));
			} else if (mat.type == "SPEC") { // Mirror
				reflect(mat, norm);
				return tracePath([pixelcast[0], intersect, pixelcast[2], pixelcast[3], pixelcast[4]], depth + 1).multiply(mat.color);
			} else if (mat.type == "REFR") { // Refractive
				refract(mat, norm);
				if (rayIn == false) {
					return tracePath([pixelcast[0], intersect, pixelcast[2], pixelcast[3], pixelcast[4]], depth + 1);
				} else {
					return tracePath([pixelcast[0], intersect, pixelcast[2], pixelcast[3], pixelcast[4]], depth);
				}
			} else { // Diffuse
				// Work out the contribution from directly sampling the emitters
				var q = 0;
				var qlength = 1;
				if (parameters.lightSamples) {
					qlength = Math.floor(Math.random() * parameters.lightSamples);
				}
				while (q < qlength) {
					var samplePos = new THREE.Vector3();
					var sampleLight = lights[Math.floor(Math.random() * ll)];
					if (sampleLight != undefined) {
						sampleLight[1].sample(samplePos, new THREE.Vector3());
						samplePos.copy(sampleLight[0].localToWorld(samplePos));
					} else {
						hemisphere.lookAt(norm);
						samplePos.copy(randDir().applyQuaternion(hemisphere.quaternion));
					}
					eye.set(mat.point.addScaledVector(norm, 0.000000000001), new THREE.Vector3().normalize());
					eye.ray.lookAt(samplePos);
					if (parameters.advancedLighting) {
						if (Math.random() > 0.5) {
							var lightHit = tracePath([pixelcast[0], intersect, pixelcast[2], pixelcast[3], pixelcast[4]], depth + 1);
							var cos_theta = norm.dot(eye.ray.direction);
							lightSampling.add(mat.color.clone().multiply(lightHit.clone().multiplyScalar(cos_theta)));
						} else {
							var lightHit = eye.intersectObjects(scene.children, true)[0];
							var mat2 = getPixelMaterial(lightHit);
							var cos_theta = norm.dot(eye.ray.direction);
							if (parameters.recursiveLighting) {





								if (lightHit != undefined) {
									var intense = 1;
									if (mat2.type == "GLOW") {
										intense = lightHit.object.material.emissiveIntensity;
									}
									lightSampling.add(mat2.color.clone().add(mat2.emissive.clone().multiplyScalar(intense)));
								} else if (mat2.type == "SPEC") { // Mirror
									reflect(mat2, norm);
									lightSampling.add(tracePath([pixelcast[0], lightHit, pixelcast[2], pixelcast[3], pixelcast[4]], depth + 1).multiply(mat.color));
								} else if (mat2.type == "REFR") { // Refractive
									refract(mat2, norm);
									if (rayIn == false) {
										lightSampling.add(tracePath([pixelcast[0], lightHit, pixelcast[2], pixelcast[3], pixelcast[4]], depth + 1));
									} else {
										lightSampling.add(tracePath([pixelcast[0], lightHit, pixelcast[2], pixelcast[3], pixelcast[4]], depth));
									}
								} else {
									lightSampling.add(getBackground());
								}
								lightSampling.multiply(mat2.color);




							} else {
								if (lightHit != undefined) {
									var cos_theta = norm.dot(eye.ray.direction);
									var intense = 1;
									if (mat2.emissiveIntensity) {
										intense = mat2.emissiveIntensity;
									}
									lightSampling.add(mat.color.clone().multiply(mat2.color.clone().multiply(mat2.emissive.clone().multiplyScalar(cos_theta).multiplyScalar(ll).multiplyScalar(intense))));
								}
							}
						}
					} else {
						var lightHit = eye.intersectObjects(scene.children, true)[0];
						var mat2 = getPixelMaterial(lightHit);
						var cos_theta = norm.dot(eye.ray.direction);
						if (parameters.recursiveLighting) {





							if (lightHit != undefined) {
								var intense = 1;
								if (mat2.emissiveIntensity) {
									intense = mat2.emissiveIntensity;
								}
								lightSampling.add(mat2.color.clone().multiply(mat2.emissive.clone().multiplyScalar(intense)));
							} else if (mat2.type == "SPEC") { // Mirror
								reflect(mat2, norm);
								lightSampling.add(tracePath([pixelcast[0], lightHit, pixelcast[2], pixelcast[3], pixelcast[4]], depth + 1).multiply(mat.color));
							} else if (mat2.type == "REFR") { // Refractive
								refract(mat2, norm);
								if (rayIn == false) {
									lightSampling.add(tracePath([pixelcast[0], lightHit, pixelcast[2], pixelcast[3], pixelcast[4]], depth + 1));
								} else {
									lightSampling.add(tracePath([pixelcast[0], lightHit, pixelcast[2], pixelcast[3], pixelcast[4]], depth));
								}
							} else {
								lightSampling.add(getBackground());
							}
							lightSampling.multiply(mat.color).multiplyScalar(norm.dot(eye.ray.direction));




						} else {
							if (lightHit != undefined) {
								var cos_theta = norm.dot(eye.ray.direction);
								var intense = 1;
								if (mat2.emissiveIntensity) {
									intense = mat2.emissiveIntensity;
								}
								/*var attenuation = lightHit.distance;
								attenuation = 1.0 / (attenuation * attenuation);
								var oc = new MonteRay.Color();
								oc.copy(mat.color);
								oc.multiply(mat2.color.clone().multiply(mat2.emissive.clone().multiplyScalar(ll)));
								oc.multiplyScalar(cos_theta * intense * attenuation);
								lightSampling.add(oc);*/

								lightSampling.add(mat.color.clone().multiply(mat2.color.clone().multiply(mat2.emissive.clone().multiplyScalar(cos_theta).multiplyScalar(ll).multiplyScalar(intense))));

							}
						}
					}
					q++;
				}
				if (parameters.lightSamples) {
					lightSampling.divideScalar(q + 1);
				}

				hemisphere.lookAt(norm);
				var randnorma = randDir().applyQuaternion(hemisphere.quaternion);
				eye.set(intersect.point, randnorma);

				var p = 1 / (2 * Math.PI);
				var cos_theta = norm.dot(eye.ray.direction);
				var BRDF = 1 / Math.PI;

				var reflected = tracePath([pixelcast[0], intersect, pixelcast[2], pixelcast[3], pixelcast[4]], depth + 1);
				return lightSampling.multiplyScalar(1).add(mat.color.clone().multiply(reflected).multiplyScalar(cos_theta));
			}
		}
		var hemisphere = new THREE.Object3D();
		crender = 0;
		if (!parameters.fps) {
			lngth = toRender.length;
			if (parameters.pixelBatchSize) {
				lngth = parameters.pixelBatchSize;
			}
		}
		var ts = 0;
		//var ping = 0;
		try { document.getElementById("sa").innerHTML = cw + "x" + ch + "<br />" + "Rendering 1 sample per pixel..."; } catch (e) { }
		function renderPixel() {
			try {
				for (var q = 0; q < lngth; q++) {
					var pixelcast = toRender[crender];
					var cf = toRender[crender][2] - 1;
					if (cf < 1) {
						cf = 1;
					}
					eye.setFromCamera(new THREE.Vector2(pixelcast[0].x + ((Math.random() - 0.5) * pixSize.x * 2), pixelcast[0].y + ((Math.random() - 0.5) * pixSize.y * 2)), camera);
					pixelcast[3].multiplyScalar(cf - 1);
					pixelcast[3].add(tracePath(pixelcast, 0));
					pixelcast[3].divideScalar(cf);
					pixelcast[3].clampV();
					toRender[crender][2]++;
					crender++;
					renderedImage[pixelcast[4]] = pixelcast[3].r * 255;
					renderedImage[pixelcast[4] + 1] = pixelcast[3].g * 255;
					renderedImage[pixelcast[4] + 2] = pixelcast[3].b * 255;
					renderedImage[pixelcast[4] + 3] = pixelcast[3].a * 255;
					if (crender >= toRender.length) {
						/*if (ping++ % 1 == 0) {
							for (var j = 0; j < 10 - cf; j++) {
								for (var i = 0; i < renderedImage.length; i += 4) {
									try {
										if (renderedImage[(i - (cw * 4)) - 4] && renderedImage[i + (cw * 4)]) {
											renderedImage[i] = (renderedImage[i - 4] + renderedImage[i] + renderedImage[i + 4] + renderedImage[i - (cw * 4)] + renderedImage[i + (cw * 4)]) / 5;
											renderedImage[i + 1] = (renderedImage[(i - 4) + 1] + renderedImage[i + 1] + renderedImage[(i + 4) + 1] + renderedImage[(i - (cw * 4)) + 1] + renderedImage[(i + (cw * 4)) + 1]) / 5;
											renderedImage[i + 2] = (renderedImage[(i - 4) + 2] + renderedImage[i + 2] + renderedImage[(i + 4) + 2] + renderedImage[(i - (cw * 4)) + 2] + renderedImage[(i + (cw * 4)) + 2]) / 5;
										}
									} catch (e) { }
								}
							}
							for (var i = 0; i < toRender.length; i++) {
								toRender[i][3].setRGB(renderedImage[toRender[i][4]] / 255, renderedImage[toRender[i][4] + 1] / 255, renderedImage[toRender[i][4] + 2] / 255);
							}
						}*/
						crender = 0;
						if (parameters.maxSamples || parameters.downloadInterval) {
							if (spp >= parameters.maxSamples || spp % parameters.downloadInterval == 0) {
								context.putImageData(new ImageData(new Uint8ClampedArray(renderedImage), cw, ch), 0, 0);
								self.download();
								if (spp >= parameters.maxSamples) {
									try { document.getElementById("sa").innerHTML = "Render Complete"; } catch (e) { }
									return parameters.nextFrame();
								}
							}
						}
						spp++;
						try { document.getElementById("sa").innerHTML = cw + "x" + ch + "<br />" + "Rendering " + spp + " samples per pixel..."; } catch (e) { }
					}
				}
				context.putImageData(new ImageData(new Uint8ClampedArray(renderedImage), cw, ch), 0, 0);
				if (parameters.fps) {
					var tts = Date.now();
					if (tts - ts > (1000 / parameters.fps)) {
						if (uod == true) {
							len = 0;
							uod = false;
						}
						len -= 1;
					} else if (tts - ts < (1000 / parameters.fps)) {
						if (uod == false) {
							len = 0;
							uod = true;
						}
						len += 1;
					}
					lngth += len;
					if (lngth < 1) {
						lngth = 1;
					}
					try { document.getElementById("sa").innerHTML = cw + "x" + ch + "<br />" + spp + "spp " + lngth + "ppf " + Math.round(1 / ((tts - ts) / 1000)) + "fps"; } catch (e) { }
					ts = Date.now();
				}
			} catch (e) { console.log(e); }
			requestAnimationFrame(renderPixel);
		}
		requestAnimationFrame(renderPixel);
	};

};

//esm var PathtracingRenderer = MonteRay.PathtracingRenderer;
//esm var Color = MonteRay.Color;
//esm export { PathtracingRenderer, Color };