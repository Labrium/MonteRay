/*
 * MonteRay v1.0 alpha Copyright (c) 2021 Tech Labs, Inc.
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
MonteRay.PathtracingRenderer = function (parameters) {

	this.VERSION = "1.0 alpha";
	var EPSILON = 0.00001;

	parameters = parameters || {};

	console.log("Rendering provided by MonteRay v" + this.VERSION + " https://techlabsinc.github.io/MonteRay/LICENSE");
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

	var clearColor = new THREE.Color(0x000000);

	this.domElement = canvas;

	this.autoClear = true;

	this.setClearColor = function (color /*, alpha */) {

		clearColor.set(color);

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
	//THREE.Raycaster().firstHitOnly = true;

	function randomBetween(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
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
		parameters.nextFrame();
	}
	var lngth = 1;
	this.render = function (scene, camera) {
		var cw = canvasWidth;
		var ch = canvasHeight;
		var chw = canvasHalfWidth;
		var chh = canvasHalfHeight;
		canvas.width = cw;
		canvas.height = ch;

		var spp = 1;
		var TAU = Math.PI * 2;
		var nullcolor = new THREE.Color(0x000000);
		// setup
		//context.clearRect(0, 0, canvasWidth, canvasHeight);
		var eye = new THREE.Raycaster();
		eye.firstHitOnly = true;

		var ptr = [];
		var pixSize = new THREE.Vector2(1 / cw, 1 / ch);
		for (var y = 0; y < ch; y++) {
			for (var x = 0; x < cw; x++) {
				ptr.push(new THREE.Vector2(((x / cw) * 2 - 1), (-(y / ch) * 2 + 1)));
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
				if (!nullcolor.equals(obj.material.emissive)) {
					lights.push([obj, new MeshSurfaceSampler(obj).build()]);
				}
			} catch (e) { }
		});
		var ll = lights.length;

		// pre-rendering cycle
		try { document.getElementById("sa").innerHTML = "Pre-rendering..."; } catch (e) { }
		var toRender = [];
		var renderedImage = [];
		var rl = ptr.length;
		for (var j = 0; j < rl; j++) {
			var outputColor = new THREE.Color(0x000000);
			var pixelcast = ptr[j];
			eye.setFromCamera(pixelcast, camera);
			var intersect = eye.intersectObjects(scene.children, true)[0];
			var opacity = 1;
			if (intersect == undefined) {
				outputColor.add(scene.background);
			} else {
				try {
					if (!nullcolor.equals(intersect.object.material.emissive)) {
						var intense = 1;
						if (intersect.object.material.emissiveIntensity) {
							intense = intersect.object.material.emissiveIntensity;
						}
						outputColor.copy(intersect.object.material.color);
						outputColor.multiply(intersect.object.material.emissive.clone().multiplyScalar(intense));
					} else if (intersect.object.material.isMeshBasicMaterial) {
						outputColor.copy(intersect.object.material.colors);
					} else {
						outputColor.setScalar(intersect.distance / camera.far);
						toRender.push([pixelcast, intersect, 2, new THREE.Color(0x000000), j * 4]);
					}
				} catch (e) {
					outputColor.setScalar(intersect.distance / camera.far);
					toRender.push([pixelcast, intersect, 2, new THREE.Color(0x000000), j * 4]);
				}
			}
			renderedImage.push(outputColor.r * 255);
			renderedImage.push(outputColor.g * 255);
			renderedImage.push(outputColor.b * 255);
			renderedImage.push(opacity * 255);
		}
		var imagedata = new ImageData(new Uint8ClampedArray(renderedImage), cw, ch);
		context.putImageData(imagedata, 0, 0);

		toRender.sort(function (a, b) {
			return a[1].distance - b[1].distance;
		});

		function calcNormal(intersect) {
			return intersect.face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(intersect.object.matrixWorld)).normalize();
		}
		var rayIn = false;
		function tracePath(pixelcast, depth) {
			var intersect;
			intersect = eye.intersectObjects(scene.children, true)[0];

			if (intersect == undefined) {
				return scene.background;
			}

			if (depth > 4 && (depth > 20 || Math.random() > Math.max(intersect.object.material.color.r, Math.max(intersect.object.material.color.g, intersect.object.material.color.b)))) {
				return nullcolor;
			}

			var norm = calcNormal(intersect);

			// Recurse
			var lightSampling = nullcolor.clone();
			if (!nullcolor.equals(intersect.object.material.emissive)) {
				var intense = 1;
				if (intersect.object.material.emissiveIntensity) {
					intense = intersect.object.material.emissiveIntensity;
				}
				return intersect.object.material.color.clone().multiply(intersect.object.material.emissive.clone().multiplyScalar(intense));
			} else if (intersect.object.material.mirror || intersect.object.material.metalness == 1) { // Mirror
				eye.ray.origin.copy(intersect.point);
				eye.ray.direction.reflect(norm);
				return tracePath([pixelcast[0], intersect, pixelcast[2], pixelcast[3], pixelcast[4]], depth + 1);
			} else if (intersect.object.material.glass) { // Refractive
				if (rayIn == false) {
					eye.ray.origin.copy(intersect.point.addScaledVector(norm, -EPSILON));
					eye.ray.direction.lerp(norm.clone().negate(), intersect.object.material.refractionRatio);
					rayIn = true;
					return tracePath([pixelcast[0], intersect, pixelcast[2], pixelcast[3], pixelcast[4]], depth + 1);
				} else {
					eye.ray.origin.copy(intersect.point.addScaledVector(norm, EPSILON));
					eye.ray.direction.lerp(norm, intersect.object.material.refractionRatio);
					rayIn = false;
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
					sampleLight[1].sample(samplePos);
					samplePos.copy(sampleLight[0].localToWorld(samplePos));
					eye.set(intersect.point.addScaledVector(norm, 0.000000000001), new THREE.Vector3().normalize());
					eye.ray.lookAt(samplePos);
					if (parameters.advancedLighting) {
						if (Math.random() > 0.5) {
							var lightHit = tracePath([pixelcast[0], intersect, pixelcast[2], pixelcast[3], pixelcast[4]], depth + 1);
							var cos_theta = norm.dot(eye.ray.direction);
							lightSampling.add(intersect.object.material.color.clone().multiply(lightHit.clone().multiplyScalar(cos_theta)));
						} else {
							var lightHit = eye.intersectObjects(scene.children, true)[0];
							var cos_theta = norm.dot(eye.ray.direction);
							if (parameters.recursiveLighting) {





								if (lightHit != undefined) {
									var intense = 1;
									if (lightHit.object.material.emissiveIntensity) {
										intense = lightHit.object.material.emissiveIntensity;
									}
									lightSampling.add(lightHit.object.material.color.clone().multiply(lightHit.object.material.emissive.clone().multiplyScalar(intense)));
								} else if (lightHit.object.material.mirror || lightHit.object.material.metalness == 1) { // Mirror
									eye.ray.origin.copy(lightHit.point);
									eye.ray.direction.reflect(norm);
									lightSampling.add(tracePath([pixelcast[0], lightHit, pixelcast[2], pixelcast[3], pixelcast[4]], depth + 1));
								} else if (lightHit.object.material.glass) { // Refractive
									if (rayIn == false) {
										eye.ray.origin.copy(lightHit.point.addScaledVector(norm, -EPSILON));
										eye.ray.direction.lerp(norm.clone().negate(), lightHit.object.material.refractionRatio);
										rayIn = true;
										lightSampling.add(tracePath([pixelcast[0], lightHit, pixelcast[2], pixelcast[3], pixelcast[4]], depth + 1));
									} else {
										eye.ray.origin.copy(lightHit.point.addScaledVector(norm, EPSILON));
										eye.ray.direction.lerp(norm, lightHit.object.material.refractionRatio);
										rayIn = false;
										lightSampling.add(tracePath([pixelcast[0], lightHit, pixelcast[2], pixelcast[3], pixelcast[4]], depth));
									}
								} else {
									lightSampling.add(scene.background);
								}
								lightSampling.multiply(intersect.object.material.color);




							} else {
								if (lightHit != undefined) {
									var cos_theta = norm.dot(eye.ray.direction);
									var intense = 1;
									if (lightHit.object.material.emissiveIntensity) {
										intense = lightHit.object.material.emissiveIntensity;
									}
									lightSampling.add(intersect.object.material.color.clone().multiply(lightHit.object.material.color.clone().multiply(lightHit.object.material.emissive.clone().multiplyScalar(cos_theta).multiplyScalar(ll).multiplyScalar(intense))));
								}
							}
						}
					} else {
						var lightHit = eye.intersectObjects(scene.children, true)[0];
						var cos_theta = norm.dot(eye.ray.direction);
						if (parameters.recursiveLighting) {





							if (lightHit != undefined) {
								var intense = 1;
								if (lightHit.object.material.emissiveIntensity) {
									intense = lightHit.object.material.emissiveIntensity;
								}
								lightSampling.add(lightHit.object.material.color.clone().multiply(lightHit.object.material.emissive.clone().multiplyScalar(intense)));
							} else if (lightHit.object.material.mirror || lightHit.object.material.metalness == 1) { // Mirror
								eye.ray.origin.copy(lightHit.point);
								eye.ray.direction.reflect(norm);
								lightSampling.add(tracePath([pixelcast[0], lightHit, pixelcast[2], pixelcast[3], pixelcast[4]], depth + 1));
							} else if (lightHit.object.material.glass) { // Refractive
								if (rayIn == false) {
									eye.ray.origin.copy(lightHit.point.addScaledVector(norm, -EPSILON));
									eye.ray.direction.lerp(norm.clone().negate(), lightHit.object.material.refractionRatio);
									rayIn = true;
									lightSampling.add(tracePath([pixelcast[0], lightHit, pixelcast[2], pixelcast[3], pixelcast[4]], depth + 1));
								} else {
									eye.ray.origin.copy(lightHit.point.addScaledVector(norm, EPSILON));
									eye.ray.direction.lerp(norm, lightHit.object.material.refractionRatio);
									rayIn = false;
									lightSampling.add(tracePath([pixelcast[0], lightHit, pixelcast[2], pixelcast[3], pixelcast[4]], depth));
								}
							} else {
								lightSampling.add(scene.background);
							}
							lightSampling.multiply(intersect.object.material.color).multiplyScalar(norm.dot(eye.ray.direction));




						} else {
							if (lightHit != undefined) {
								var cos_theta = norm.dot(eye.ray.direction);
								var intense = 1;
								if (lightHit.object.material.emissiveIntensity) {
									intense = lightHit.object.material.emissiveIntensity;
								}
								lightSampling.add(intersect.object.material.color.clone().multiply(lightHit.object.material.color.clone().multiply(lightHit.object.material.emissive.clone().multiplyScalar(cos_theta).multiplyScalar(ll).multiplyScalar(intense))));
							}
						}
					}
					q++;
				}
				if (parameters.lightSamples) {
					lightSampling.multiplyScalar(1 / (q + 1));
				}

				hemisphere.lookAt(norm);
				var randnorma = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() * 0.5).applyQuaternion(hemisphere.quaternion);
				eye.set(intersect.point, randnorma);

				var p = 1 / (2 * Math.PI);
				var cos_theta = norm.dot(eye.ray.direction);
				var BRDF = 1 / Math.PI;

				var reflected = tracePath([pixelcast[0], intersect, pixelcast[2], pixelcast[3], pixelcast[4]], depth + 1);
				return lightSampling.multiplyScalar(1).add(intersect.object.material.color.clone().multiply(reflected).multiplyScalar(cos_theta * 2));
			}
		}
		var hemisphere = new THREE.Object3D();
		var crender = 0;
		if (!parameters.fps) {
			lngth = toRender.length;
			if (parameters.pixelBatchSize) {
				lngth = parameters.pixelBatchSize;
			}
		}
		var ts = 0;
		var self = this;
		//var ping = 0;
		function renderPixel() {
			try {
				for (var q = 0; q < lngth; q++) {
					var pixelcast = toRender[crender];
					var cf = toRender[crender][2] - 1;
					if (cf < 1) {
						cf = 1;
					}
					eye.setFromCamera(new THREE.Vector2(pixelcast[0].x + ((Math.random() - 0.5) * pixSize.x), pixelcast[0].y + ((Math.random() - 0.5) * pixSize.y)), camera);
					pixelcast[3].multiplyScalar(cf - 1);
					pixelcast[3].add(tracePath(pixelcast, 0));
					pixelcast[3].multiplyScalar(1 / cf);
					toRender[crender][2]++;
					crender++;
					renderedImage[pixelcast[4]] = pixelcast[3].r * 255;
					renderedImage[pixelcast[4] + 1] = pixelcast[3].g * 255;
					renderedImage[pixelcast[4] + 2] = pixelcast[3].b * 255;
					renderedImage[pixelcast[4] + 3] = 255;
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
								var imagedata2 = new ImageData(new Uint8ClampedArray(renderedImage), cw, ch);
								context.putImageData(imagedata2, 0, 0);
								self.download();
								if (spp >= parameters.maxSamples) {
									try { document.getElementById("sa").innerHTML = "Render Complete"; } catch (e) { }
									return;
								}
							}
						}
						spp++;
					}
				}
				var imagedata2 = new ImageData(new Uint8ClampedArray(renderedImage), cw, ch);
				context.putImageData(imagedata2, 0, 0);
				if (parameters.fps) {
					var tts = performance.now();
					if (tts - ts > (1000 / parameters.fps)) {
						lngth -= 10;
					} else if (tts - ts < (1000 / parameters.fps)) {
						lngth += 100;
					}
					if (lngth < 1) {
						lngth = 1;
					}
					try { document.getElementById("sa").innerHTML = cw + "x" + ch + "<br />" + spp + "spp " + lngth + "ppf " + Math.round(1 / ((tts - ts) / 1000)) + "fps"; } catch (e) { }
					ts = performance.now();
				}
			} catch (e) { console.log(e); }
			setTimeout(renderPixel, 0);
		}
		setTimeout(renderPixel, 0);
	}

};

//esm var PathtracingRenderer = MonteRay.PathtracingRenderer;
//esm export { PathtracingRenderer };